$ErrorActionPreference = "Stop"

Write-Host "=== 페이의 달인 v0.1.6 EP-705 HCE 진단 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1) EP-705를 FB1120 / mode=212 / '카드를 사용하세요' 상태로 만드세요."
Write-Host "2) 휴대폰에서 페이의 달인 결제 대기(50초) 화면으로 들어가세요."
Write-Host "3) 이 창이 로그 수집 중일 때 EP-705 RF 영역에 휴대폰을 태그하세요."
Write-Host "4) 태그 후 Ctrl+C로 종료하고 로그를 복사해 주세요."
Write-Host ""

adb devices
adb logcat -c

Write-Host ""
Write-Host "HCE 로그 수집 시작..." -ForegroundColor Yellow

adb logcat -v time DalinPayHCE:I PayMaster:D AndroidRuntime:E "*:S"
