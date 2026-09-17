# 페이의 달인 v0.2.2

v0.2.0 기반 RF/HCE + MST capability 테스트 버전.

## 변경
- Kakao Pay의 `삼성페이` 탭이 더 이상 Samsung Pay 모듈로 이동하지 않음
- N Pay의 `삼성페이` 탭이 더 이상 Samsung Pay 모듈로 이동하지 않음
- 각 앱 내부에서 별도의 RF/HCE 결제대기 화면으로 즉시 진입
- 별도 인증 없이 바로 50초 RF/HCE 대기
- HCE 상세 trace 최대 40개 이벤트 저장
- APDU RX / TX / DALIN AID SELECT / deactivation 기록
- 진단 로그 클립보드 복사
- 기기 모델 / Android / NFC / Samsung Wallet 패키지 감지
- 직접 MST 송신 API 여부를 별도 표시
- QR / 바코드 / 학급화폐 기능 유지
- Samsung Pay 기존 HCE 및 EP-705 진단 유지

## 버전
- versionName: 0.2.2
- versionCode: 22

## 테스트
`docs/TEST-v0.2.1-RF-MST.md`


## v0.2.2 Hotfix
- Kakao/Naver/PAYCO screen module relative import paths corrected.
- Startup freeze at `앱을 불러오는 중...` fixed.
- Preflight now validates local ES module import targets.
