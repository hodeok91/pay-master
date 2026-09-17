# 페이의 달인 — Modular v0.1.6 HCE Diagnostic

이 ZIP은 **부분 패치가 아닌 전체 프로젝트 기준본**이다.

## v0.1.6 목적

EP-705 `FB1120 / mode=212` 결제대기 상태에서
페이의 달인 HCE 서비스까지 실제 APDU가 전달되는지 확인한다.

`DALIN-PAY NFC Protocol v1`의 AID와 명령 규격은
v0.1.5와 동일하게 유지한다.

## 추가 기능

- HCE APDU 수신 횟수
- 마지막 APDU HEX
- DALIN-PAY AID SELECT 여부
- HCE deactivation 사유
- APDU RX/TX logcat
- 결제 대기 화면의 `HCE 진단 보기`
- PC용 `tools/ep705-hce-diagnostics.ps1`

## 버전

- versionName: `0.1.6`
- versionCode: `16`
- DALIN-PAY NFC Protocol: `v1`
- AID: `F044414C494E0101`

상세:
`docs/EP705-HCE-DIAGNOSTIC-v0.1.6.md`
