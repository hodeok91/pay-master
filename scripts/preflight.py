from pathlib import Path
import sys

errors = []
root = Path(__file__).resolve().parents[1]

java = root / "app/src/main/java/kr/dalin/paymaster/MainActivity.java"
kotlin = root / "app/src/main/java/kr/dalin/paymaster/MainActivity.kt"
manifest = root / "app/src/main/AndroidManifest.xml"
index = root / "app/src/main/assets/www/index.html"
appjs = root / "app/src/main/assets/www/app.js"

for p in [java, manifest, index, appjs]:
    if not p.exists():
        errors.append(f"missing required file: {p.relative_to(root)}")

if kotlin.exists():
    errors.append("MainActivity.kt must not exist; Java is the fixed Android entry point.")

if java.exists():
    raw = java.read_bytes()
    if raw.startswith(b"\\"):
        errors.append("MainActivity.java starts with a stray backslash.")
    text = java.read_text(encoding="utf-8", errors="replace")
    if "public class MainActivity extends Activity" not in text:
        errors.append("MainActivity.java does not declare the expected Activity class.")
    if "package kr.dalin.paymaster;" not in text:
        errors.append("MainActivity.java package does not match kr.dalin.paymaster.")

if manifest.exists():
    m = manifest.read_text(encoding="utf-8", errors="replace")
    if 'android:name=".MainActivity"' not in m:
        errors.append('AndroidManifest.xml must reference android:name=".MainActivity".')

for base in [root / "app", root / ".github", root / "scripts"]:
    if not base.exists():
        continue
    for p in base.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".java",".kt",".js",".css",".html",".xml",".kts",".yml",".yaml",".py"}:
            raw = p.read_bytes()
            if raw.startswith(b"\\"):
                errors.append(f"stray leading backslash: {p.relative_to(root)}")

# v0.1.4 behavior-contract checks.
samsung_routes = root / "app/src/main/assets/www/pays/samsung/samsung.js"
wallet_js = root / "app/src/main/assets/www/pays/samsung/screens/wallet/wallet.js"
ready_js = root / "app/src/main/assets/www/pays/samsung/screens/payment-ready/payment-ready.js"
payment_pw = root / "app/src/main/assets/www/pays/samsung/screens/password/payment-password.js"

for p in [samsung_routes, wallet_js, ready_js, payment_pw]:
    if not p.exists():
        errors.append(f"missing behavior file: {p.relative_to(root)}")

if samsung_routes.exists():
    t = samsung_routes.read_text(encoding="utf-8", errors="replace")
    for route in ["samsung.passwordSetup", "samsung.paymentPassword", "samsung.paymentReady"]:
        if route not in t:
            errors.append(f"missing samsung route: {route}")

if wallet_js.exists():
    t = wallet_js.read_text(encoding="utf-8", errors="replace")
    if "1000" not in t:
        errors.append("wallet fingerprint hold is not configured for 1 second.")
    if 'router.go("samsung.paymentPassword")' not in t:
        errors.append("wallet password control is not wired to payment password auth.")

if ready_js.exists():
    t = ready_js.read_text(encoding="utf-8", errors="replace")
    if "교육용 리더기에 댔어요" in t:
        errors.append("manual payment-ready button still exists.")
    if 'router.reset("samsung.wallet")' not in t:
        errors.append("payment timeout does not return to registered wallet.")

# v0.1.5 NFC/HCE contract checks.
hce_service = root / "app/src/main/java/kr/dalin/paymaster/nfc/DalinHostApduService.java"
protocol_java = root / "app/src/main/java/kr/dalin/paymaster/nfc/DalinPayProtocol.java"
session_java = root / "app/src/main/java/kr/dalin/paymaster/nfc/NfcPaymentSession.java"
apdu_xml = root / "app/src/main/res/xml/dalin_apdu_service.xml"
protocol_doc = root / "docs/DALIN-PAY-NFC-PROTOCOL-v1.md"
for p2 in [hce_service, protocol_java, session_java, apdu_xml, protocol_doc]:
    if not p2.exists(): errors.append(f"missing NFC/HCE file: {p2.relative_to(root)}")
if manifest.exists():
    mt = manifest.read_text(encoding="utf-8", errors="replace")
    for req in ["android.permission.NFC","android.permission.BIND_NFC_SERVICE",".nfc.DalinHostApduService","android.nfc.cardemulation.action.HOST_APDU_SERVICE","@xml/dalin_apdu_service"]:
        if req not in mt: errors.append(f"manifest missing NFC/HCE contract: {req}")
if protocol_java.exists():
    pt = protocol_java.read_text(encoding="utf-8", errors="replace")
    if 'AID_HEX = "F044414C494E0101"' not in pt: errors.append("DALIN-PAY v1 AID mismatch")
if apdu_xml.exists() and "F044414C494E0101" not in apdu_xml.read_text(encoding="utf-8", errors="replace"):
    errors.append("HCE XML AID mismatch")

# v0.1.6 HCE diagnostic checks.
diag_java = root / "app/src/main/java/kr/dalin/paymaster/nfc/HceDiagnostics.java"
diag_doc = root / "docs/EP705-HCE-DIAGNOSTIC-v0.1.6.md"
diag_ps1 = root / "tools/ep705-hce-diagnostics.ps1"

for p3 in [diag_java, diag_doc, diag_ps1]:
    if not p3.exists():
        errors.append(f"missing v0.1.6 diagnostic file: {p3.relative_to(root)}")

if hce_service.exists():
    hce_text = hce_service.read_text(encoding="utf-8", errors="replace")
    for required_text in [
        "HceDiagnostics.recordApdu",
        "HceDiagnostics.recordOurAidSelected",
        "HceDiagnostics.recordResponse",
        "HceDiagnostics.recordDeactivated",
        "[HCE_DIAG] APDU_RX",
        "[HCE_DIAG] OUR_AID_SELECTED"
    ]:
        if required_text not in hce_text:
            errors.append(f"HCE diagnostic hook missing: {required_text}")

if ready_js.exists():
    ready_text = ready_js.read_text(encoding="utf-8", errors="replace")
    for required_text in [
        "HCE 진단 보기",
        "getHceDiagnostics",
        "resetHceDiagnostics",
        "PayMasterHceDiagnostic"
    ]:
        if required_text not in ready_text:
            errors.append(f"payment-ready diagnostic UI missing: {required_text}")

if protocol_java.exists():
    protocol_text = protocol_java.read_text(encoding="utf-8", errors="replace")
    if 'AID_HEX = "F044414C494E0101"' not in protocol_text:
        errors.append("v0.1.6 must not change DALIN-PAY v1 AID.")

# v0.2.0 multi-pay / classroom currency checks.
required_v020 = [
    root / "app/src/main/assets/www/core/wallet/wallet-store.js",
    root / "app/src/main/assets/www/core/payment/scan-payment.js",
    root / "app/src/main/assets/www/home/teacher-wallet.js",
    root / "app/src/main/assets/www/pays/kakao/kakao.js",
    root / "app/src/main/assets/www/pays/naver/naver.js",
    root / "app/src/main/assets/www/pays/payco/payco.js",
]

for p4 in required_v020:
    if not p4.exists():
        errors.append(f"missing v0.2.0 file: {p4.relative_to(root)}")

build_gradle = root / "app/build.gradle.kts"
if build_gradle.exists():
    t = build_gradle.read_text(encoding="utf-8", errors="replace")
    if 'zxing-android-embedded:4.3.0' not in t:
        errors.append("ZXing dependency missing.")

main_activity = root / "app/src/main/java/kr/dalin/paymaster/MainActivity.java"
if main_activity.exists():
    t = main_activity.read_text(encoding="utf-8", errors="replace")
    for token in ["generateCode(", "scanQr()", "IntentIntegrator", "CODE_128", "QR_CODE"]:
        if token not in t:
            errors.append(f"native QR/barcode support missing: {token}")

wallet_store = root / "app/src/main/assets/www/core/wallet/wallet-store.js"
if wallet_store.exists():
    t = wallet_store.read_text(encoding="utf-8", errors="replace")
    for token in ["addBalance", "debitBalance", "INSUFFICIENT_BALANCE", "merchantQrPayload"]:
        if token not in t:
            errors.append(f"classroom wallet contract missing: {token}")

app_js = root / "app/src/main/assets/www/app.js"
if app_js.exists():
    t = app_js.read_text(encoding="utf-8", errors="replace")
    for route_token in ["kakaoPay", "naverPay", "paycoPay", "teacher.wallet"]:
        if route_token not in t:
            errors.append(f"app registration missing: {route_token}")

# v0.2.1 RF/MST diagnostic checks
required_v021 = [
    root / "app/src/main/assets/www/core/payment/contactless-screen.js",
    root / "app/src/main/assets/www/pays/kakao/screens/contactless.js",
    root / "app/src/main/assets/www/pays/naver/screens/contactless.js",
    root / "docs/TEST-v0.2.1-RF-MST.md",
]
for p5 in required_v021:
    if not p5.exists():
        errors.append(f"missing v0.2.1 file: {p5.relative_to(root)}")

main_activity = root / "app/src/main/java/kr/dalin/paymaster/MainActivity.java"
if main_activity.exists():
    text = main_activity.read_text(encoding="utf-8", errors="replace")
    for token in ["getDeviceCapabilities", "getHceTraceText", "copyText", "com.samsung.android.spay"]:
        if token not in text:
            errors.append(f"v0.2.1 capability diagnostic missing: {token}")

hce_diag = root / "app/src/main/java/kr/dalin/paymaster/nfc/HceDiagnostics.java"
if hce_diag.exists():
    text = hce_diag.read_text(encoding="utf-8", errors="replace")
    for token in ["MAX_TRACE", "traceJson", "traceText", "appendTrace"]:
        if token not in text:
            errors.append(f"v0.2.1 HCE trace missing: {token}")

for rel in [
    "app/src/main/assets/www/pays/kakao/screens/pay.js",
    "app/src/main/assets/www/pays/naver/screens/scan.js",
]:
    p = root / rel
    if p.exists():
        text = p.read_text(encoding="utf-8", errors="replace")
        if 'router.go("samsung.wallet")' in text:
            errors.append(f"old cross-provider Samsung route remains: {rel}")

if errors:
    print("PRECHECK FAILED")
    for e in errors:
        print(" -", e)
    sys.exit(1)

print("PRECHECK OK")
print(" - Java MainActivity present")
print(" - Kotlin MainActivity absent")
print(" - Manifest entry point matches")
print(" - Web assets present")
print(" - No stray leading backslashes found")
