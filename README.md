# 페이의 달인 — Modular v0.1.5

이 ZIP은 부분 패치가 아닌 전체 프로젝트 기준본이다.

## v0.1.5
- DALIN-PAY NFC Protocol v1 확정
- HostApduService 추가
- 교육용 AID `F044414C494E0101`
- NFC/HCE Manifest 등록
- PING / GET_STATUS / REQUEST_PAYMENT
- 지문/비밀번호 인증 후 50초 동안만 NFC 결제 허용
- 한 인증 세션에서 한 번의 결제만 승인
- NFC 꺼짐 / HCE 미지원 감지
- 실제 리더 승인 시 WebView 결제완료 콜백
- 50초 만료/화면 이탈 시 NFC 세션 해제

상세 규격: `docs/DALIN-PAY-NFC-PROTOCOL-v1.md`

실제 신용카드/EMV 결제가 아니라 교육용 달인카드와 향후 키오스크의 달인 사이의 전용 통신이다.

- versionName: 0.1.5
- versionCode: 15
