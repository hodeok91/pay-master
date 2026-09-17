package kr.dalin.paymaster;

import android.annotation.SuppressLint;
import android.app.Activity;
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

public class MainActivity extends Activity {

    private static final String TAG = "PayMaster";
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);

        final WebViewAssetLoader assetLoader =
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
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // 이 앱은 단일 WebView SPA이므로 브라우저 방문기록을 뒤로가기에 사용하지 않는다.
                view.clearHistory();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(
                        TAG,
                        consoleMessage.message()
                                + " -- line "
                                + consoleMessage.lineNumber()
                                + " / "
                                + consoleMessage.sourceId()
                );
                return true;
            }
        });

        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");
        webView.loadUrl(
                "https://appassets.androidplatform.net/assets/www/index.html"
        );
    }

    private void handleAppBack() {
        if (webView == null) {
            finish();
            return;
        }

        webView.evaluateJavascript(
                "window.PayMaster && window.PayMaster.nativeBack ? window.PayMaster.nativeBack() : false",
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

    public class Bridge {
        @JavascriptInterface
        public void vibrate(long ms) {
            Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
            if (vibrator == null) return;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(
                        VibrationEffect.createOneShot(
                                ms,
                                VibrationEffect.DEFAULT_AMPLITUDE
                        )
                );
            } else {
                vibrator.vibrate(ms);
            }
        }
    }
}
