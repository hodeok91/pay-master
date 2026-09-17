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
