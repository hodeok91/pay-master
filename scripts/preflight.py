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
