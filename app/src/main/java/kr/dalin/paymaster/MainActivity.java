package kr.dalin.paymaster;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.ClipboardManager;
import android.content.ClipData;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.nfc.NfcAdapter;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Base64;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.Result;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;

import kr.dalin.paymaster.nfc.DalinHostApduService;
import kr.dalin.paymaster.nfc.HceDiagnostics;
import kr.dalin.paymaster.nfc.NfcPaymentSession;

public class MainActivity extends Activity {
    private static final String TAG = "PayMaster";

    private WebView webView;
    private BroadcastReceiver paymentReceiver;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);

        final WebViewAssetLoader loader =
                new WebViewAssetLoader.Builder()
                        .addPathHandler(
                                "/assets/",
                                new WebViewAssetLoader.AssetsPathHandler(this)
                        )
                        .build();

        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    @NonNull WebView view,
                    @NonNull WebResourceRequest request
            ) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                view.clearHistory();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage msg) {
                Log.d(TAG, msg.message() + " -- line " +
                        msg.lineNumber() + " / " + msg.sourceId());
                return true;
            }
        });

        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");
        registerPaymentReceiver();

        webView.loadUrl(
                "https://appassets.androidplatform.net/assets/www/index.html"
        );
    }

    private void registerPaymentReceiver() {
        paymentReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();

                if (DalinHostApduService.ACTION_PAYMENT_SUCCESS.equals(action)) {
                    String tx = intent.getStringExtra(
                            DalinHostApduService.EXTRA_TRANSACTION_ID);
                    long amount = intent.getLongExtra(
                            DalinHostApduService.EXTRA_AMOUNT, 0L);
                    String currency = intent.getStringExtra(
                            DalinHostApduService.EXTRA_CURRENCY);

                    try {
                        JSONObject payload = new JSONObject();
                        payload.put("tx", tx == null ? "" : tx);
                        payload.put("amount", amount);
                        payload.put("currency",
                                currency == null ? "KRW" : currency);

                        final String quoted =
                                JSONObject.quote(payload.toString());

                        runOnUiThread(() -> {
                            if (webView != null) {
                                webView.evaluateJavascript(
                                        "window.PayMasterNfcSuccess && " +
                                        "window.PayMasterNfcSuccess(" +
                                        quoted + ");",
                                        null
                                );
                            }
                        });
                    } catch (Exception e) {
                        Log.e(TAG, "NFC callback failed", e);
                    }
                    return;
                }

                if (HceDiagnostics.ACTION_DIAGNOSTIC.equals(action)) {
                    String eventJson = intent.getStringExtra(
                            HceDiagnostics.EXTRA_EVENT_JSON);

                    final String quoted = JSONObject.quote(
                            eventJson == null ? "{}" : eventJson
                    );

                    runOnUiThread(() -> {
                        if (webView != null) {
                            webView.evaluateJavascript(
                                    "window.PayMasterHceDiagnostic && " +
                                    "window.PayMasterHceDiagnostic(" +
                                    quoted + ");",
                                    null
                            );
                        }
                    });
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(DalinHostApduService.ACTION_PAYMENT_SUCCESS);
        filter.addAction(HceDiagnostics.ACTION_DIAGNOSTIC);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(
                    paymentReceiver,
                    filter,
                    Context.RECEIVER_NOT_EXPORTED
            );
        } else {
            registerReceiver(paymentReceiver, filter);
        }
    }

    private void handleAppBack() {
        if (webView == null) {
            finish();
            return;
        }

        webView.evaluateJavascript(
                "window.PayMaster && window.PayMaster.nativeBack ? " +
                "window.PayMaster.nativeBack() : false",
                result -> {
                    if ("false".equals(result) || "null".equals(result)) {
                        finish();
                    }
                }
        );
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleAppBack();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            handleAppBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onActivityResult(
            int requestCode,
            int resultCode,
            Intent data
    ) {
        IntentResult result =
                IntentIntegrator.parseActivityResult(
                        requestCode,
                        resultCode,
                        data
                );

        if (result != null) {
            String contents = result.getContents();

            final String quoted =
                    JSONObject.quote(contents == null ? "" : contents);

            if (webView != null) {
                webView.evaluateJavascript(
                        "window.PayMasterQrScanResult && " +
                        "window.PayMasterQrScanResult(" + quoted + ");",
                        null
                );
            }
            return;
        }

        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onDestroy() {
        NfcPaymentSession.disarm();

        if (paymentReceiver != null) {
            try {
                unregisterReceiver(paymentReceiver);
            } catch (Exception ignored) {}
        }

        if (webView != null) {
            webView.destroy();
            webView = null;
        }

        super.onDestroy();
    }

    private String bitmapToDataUrl(Bitmap bitmap) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
        return "data:image/png;base64," +
                Base64.encodeToString(
                        out.toByteArray(),
                        Base64.NO_WRAP
                );
    }

    private Bitmap createCode(
            String payload,
            String type,
            int width,
            int height
    ) throws Exception {
        BarcodeFormat format =
                "BARCODE".equalsIgnoreCase(type)
                        ? BarcodeFormat.CODE_128
                        : BarcodeFormat.QR_CODE;

        BitMatrix matrix =
                new MultiFormatWriter().encode(
                        payload,
                        format,
                        Math.max(120, width),
                        Math.max(120, height)
                );

        Bitmap bitmap = Bitmap.createBitmap(
                matrix.getWidth(),
                matrix.getHeight(),
                Bitmap.Config.ARGB_8888
        );

        for (int y = 0; y < matrix.getHeight(); y++) {
            for (int x = 0; x < matrix.getWidth(); x++) {
                bitmap.setPixel(
                        x,
                        y,
                        matrix.get(x, y)
                                ? Color.BLACK
                                : Color.WHITE
                );
            }
        }

        return bitmap;
    }


    private boolean isPackageInstalled(String packageName) {
        try {
            getPackageManager().getPackageInfo(packageName, 0);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String getDeviceCapabilityJson() {
        try {
            JSONObject o = new JSONObject();
            o.put("manufacturer", Build.MANUFACTURER);
            o.put("brand", Build.BRAND);
            o.put("model", Build.MODEL);
            o.put("device", Build.DEVICE);
            o.put("android", Build.VERSION.RELEASE);
            o.put("sdk", Build.VERSION.SDK_INT);
            o.put("nfcState", new Bridge().getNfcState());
            o.put("samsungPayInstalled", isPackageInstalled("com.samsung.android.spay"));
            o.put("samsungPayFrameworkInstalled", isPackageInstalled("com.samsung.android.spayfw"));
            o.put("directMstApiAvailable", false);
            o.put("directMstApiNote",
                    "일반 앱에 공개된 직접 MST 송신 API는 확인되지 않음. " +
                    "이 테스트는 기기/Wallet 존재 여부만 진단함.");
            return o.toString();
        } catch (Exception e) {
            return "{\"error\":\"capability_failed\"}";
        }
    }

    public class Bridge {
        @JavascriptInterface
        public void vibrate(long ms) {
            Vibrator v =
                    (Vibrator) getSystemService(VIBRATOR_SERVICE);

            if (v == null) return;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(
                        VibrationEffect.createOneShot(
                                ms,
                                VibrationEffect.DEFAULT_AMPLITUDE
                        )
                );
            } else {
                v.vibrate(ms);
            }
        }

        @JavascriptInterface
        public String getNfcState() {
            PackageManager pm = getPackageManager();

            if (!pm.hasSystemFeature(PackageManager.FEATURE_NFC) ||
                    !pm.hasSystemFeature(
                            PackageManager.FEATURE_NFC_HOST_CARD_EMULATION
                    )) {
                return "UNSUPPORTED";
            }

            NfcAdapter adapter =
                    NfcAdapter.getDefaultAdapter(MainActivity.this);

            if (adapter == null) return "UNSUPPORTED";

            return adapter.isEnabled() ? "READY" : "OFF";
        }

        @JavascriptInterface
        public boolean startNfcPaymentWindow(long durationMs) {
            if (!"READY".equals(getNfcState())) {
                NfcPaymentSession.disarm();
                return false;
            }

            NfcPaymentSession.arm(durationMs);
            return true;
        }

        @JavascriptInterface
        public void stopNfcPaymentWindow() {
            NfcPaymentSession.disarm();
        }

        @JavascriptInterface
        public String getHceDiagnostics() {
            return HceDiagnostics.snapshotJson(MainActivity.this);
        }

        @JavascriptInterface
        public void resetHceDiagnostics() {
            HceDiagnostics.reset(MainActivity.this);
        }


        @JavascriptInterface
        public String getDeviceCapabilities() {
            return getDeviceCapabilityJson();
        }

        @JavascriptInterface
        public String getHceTraceText() {
            return HceDiagnostics.traceText(MainActivity.this);
        }

        @JavascriptInterface
        public boolean copyText(String label, String text) {
            try {
                ClipboardManager cm =
                        (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                if (cm == null) return false;
                cm.setPrimaryClip(
                        ClipData.newPlainText(
                                label == null ? "PayMaster" : label,
                                text == null ? "" : text
                        )
                );
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public String generateCode(
                String type,
                String payload,
                int width,
                int height
        ) {
            try {
                return bitmapToDataUrl(
                        createCode(payload, type, width, height)
                );
            } catch (Exception e) {
                Log.e(TAG, "Code generation failed", e);
                return "";
            }
        }

        @JavascriptInterface
        public void scanQr() {
            runOnUiThread(() -> {
                IntentIntegrator integrator =
                        new IntentIntegrator(MainActivity.this);

                integrator.setDesiredBarcodeFormats(
                        IntentIntegrator.QR_CODE
                );
                integrator.setPrompt(
                        "교육용 결제 QR을 사각형 안에 맞춰 주세요."
                );
                integrator.setBeepEnabled(true);
                integrator.setOrientationLocked(false);
                integrator.initiateScan();
            });
        }
    }
}
