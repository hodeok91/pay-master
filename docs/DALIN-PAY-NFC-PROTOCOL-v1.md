# DALIN-PAY NFC Protocol v1

상태: **FROZEN / v1**

이 문서는 `페이의 달인`과 향후 `키오스크의 달인`이 공통으로 사용하는 교육용 NFC/HCE 통신 규격의 기준 문서다. 실제 신용카드, EMV, Visa, Mastercard, Samsung Pay 금융 프로토콜이 아니다.

## 역할
- 페이의 달인: Android HCE 카드 역할
- 키오스크의 달인: NFC 리더 역할
- 전송: ISO-DEP / ISO 7816-4 APDU
- 인코딩: UTF-8
- 응답: UTF-8 JSON + ISO 7816 Status Word

## 고정 AID
`F044414C494E0101`

바이트: `F0 44 41 4C 49 4E 01 01`

## SELECT AID
키오스크 명령:
`00 A4 04 00 08 F0 44 41 4C 49 4E 01 01 00`

성공 데이터 예:
```json
{"protocol":"DALIN-PAY-NFC","version":1,"cardId":"DALIN-EDU-01","ready":true}
```
Status Word: `90 00`

## DALIN 전용 APDU
CLA=`80`, P1=`00`, P2=`00`

### PING
INS=`01`
명령: `80 01 00 00 00`

### GET_STATUS
INS=`10`
명령: `80 10 00 00 00`

응답 예:
```json
{"ok":true,"ready":true,"remainingMs":41234}
```

### REQUEST_PAYMENT
INS=`20`

형식:
`80 20 00 00 Lc <UTF-8 JSON> 00`

요청 예:
```json
{"v":1,"tx":"KIOSK-20260917-0001","amount":3500,"currency":"KRW"}
```

규칙:
- tx: 1~64자 거래 ID
- amount: 1~99,999,999 정수 원화
- currency: v1에서는 KRW만 허용
- short APDU 사용

승인 응답 예:
```json
{"ok":true,"status":"APPROVED","tx":"KIOSK-20260917-0001","amount":3500,"currency":"KRW","cardId":"DALIN-EDU-01"}
```
Status Word: `90 00`

## Status Word
- `90 00`: 성공
- `67 00`: APDU 길이 오류
- `69 85`: 결제 대기 아님 / 인증 시간 만료 / 이미 사용된 세션
- `6A 80`: 요청 데이터 오류
- `6A 82`: AID가 선택되지 않음
- `6D 00`: 지원하지 않는 INS
- `6E 00`: 지원하지 않는 CLA

## 결제 상태 계약
1. 달인카드 등록
2. 지문 1초 또는 등록 비밀번호 인증
3. 결제 대기 화면 진입
4. `NfcPaymentSession.arm(50000)` 실행
5. 50초 내 키오스크가 AID 선택 후 REQUEST_PAYMENT
6. 최초 정상 요청 1건만 승인
7. 승인 즉시 세션 소비
8. 50초 만료 또는 화면 이탈 시 세션 해제

## 중복 결제 방지
한 인증 세션은 REQUEST_PAYMENT를 한 번만 승인한다. 승인 후 재요청은 `69 85`.

## NFC로 보내지 않는 정보
실제 카드번호, CVC, 실제 금융 토큰, 실제 생체정보, 학생 이름, 전화번호, 계정 비밀번호.

교육용 식별자는 `DALIN-EDU-01`만 사용한다.

## 키오스크 구현 순서
1. NFC reader mode 시작
2. ISO-DEP 발견
3. SELECT AID
4. `90 00` 확인
5. GET_STATUS
6. ready=true 확인
7. REQUEST_PAYMENT
8. APPROVED + `90 00` 확인
9. 키오스크에서 "삐" 재생
10. 키오스크 결제 완료 처리
