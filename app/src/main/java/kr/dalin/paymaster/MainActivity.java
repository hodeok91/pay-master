package kr.dalin.paymaster;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.nfc.NfcAdapter;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
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

import org.json.JSONObject;

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
            public boolean onConsoleMessage(ConsoleMessage m) {
                Log.d(
                        TAG,
                        m.message() +
                        " -- line " +
                        m.lineNumber() +
                        " / " +
                        m.sourceId()
                );
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
                            DalinHostApduService.EXTRA_TRANSACTION_ID
                    );
                    long amount = intent.getLongExtra(
                            DalinHostApduService.EXTRA_AMOUNT,
                            0L
                    );
                    String currency = intent.getStringExtra(
                            DalinHostApduService.EXTRA_CURRENCY
                    );

                    try {
                        JSONObject payload = new JSONObject();
                        payload.put("tx", tx == null ? "" : tx);
                        payload.put("amount", amount);
                        payload.put(
                                "currency",
                                currency == null ? "KRW" : currency
                        );

                        final String quoted =
                                JSONObject.quote(payload.toString());

                        runOnUiThread(() -> {
                            if (webView != null) {
                                webView.evaluateJavascript(
                                        "window.PayMasterNfcSuccess && " +
                                        "window.PayMasterNfcSuccess(" +
                                        quoted +
                                        ");",
                                        null
                                );
                            }
                        });

                    } catch (Exception e) {
                        Log.e(
                                TAG,
                                "Failed to deliver NFC payment callback",
                                e
                        );
                    }

                    return;
                }

                if (HceDiagnostics.ACTION_DIAGNOSTIC.equals(action)) {
                    String eventJson = intent.getStringExtra(
                            HceDiagnostics.EXTRA_EVENT_JSON
                    );

                    final String quoted = JSONObject.quote(
                            eventJson == null ? "{}" : eventJson
                    );

                    runOnUiThread(() -> {
                        if (webView != null) {
                            webView.evaluateJavascript(
                                    "window.PayMasterHceDiagnostic && " +
                                    "window.PayMasterHceDiagnostic(" +
                                    quoted +
                                    ");",
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
    protected void onDestroy() {
        NfcPaymentSession.disarm();

        if (paymentReceiver != null) {
            try {
                unregisterReceiver(paymentReceiver);
            } catch (Exception ignored) {
            }
        }

        if (webView != null) {
            webView.destroy();
            webView = null;
        }

        super.onDestroy();
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
    }
}
