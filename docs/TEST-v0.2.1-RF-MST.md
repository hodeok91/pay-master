# 페이의 달인 v0.2.1 — RF / MST 테스트

## 목적

1. EP-705 `FB1120 / mode=212` 상태에서 Android HCE 서비스까지 실제 APDU가 들어오는지 확인
2. 네이버페이/카카오페이의 삼성페이 탭이 각 앱 내부의 독립 결제대기 화면으로 동작하는지 확인
3. 기기에서 Samsung Wallet 관련 패키지가 보이는지 확인
4. 일반 앱에서 직접 MST 송신 API가 제공되는지 진단 화면에서 명확히 구분

## RF 테스트

1. 키오스크의 달인에서 EP-705를 `FB1120 / mode=212`로 진입
2. EP-705 화면에서 `카드를 사용하세요` 상태 확인
3. 페이의 달인에서 아래 셋 중 하나 진입
   - Samsung Pay 인증 후 결제대기
   - Kakao Pay → 결제하기 → 삼성페이
   - N Pay → 삼성페이
4. `RF / MST 진단 보기`를 열기
5. 휴대폰 뒷면 NFC 안테나 부분을 EP-705 RF 영역에 2~3초 유지
6. 아래를 기록
   - APDU 수신 횟수
   - DALIN AID 선택 여부
   - 마지막 APDU
   - 마지막 이벤트
   - 비활성화 사유
7. `진단 로그 복사`를 눌러 결과를 복사

### 판독

- APDU 0회:
  Android의 우리 HCE 서비스까지 APDU가 라우팅되지 않은 상태.
  EP-705가 RF장을 만들지 않았다는 뜻과 동일하지 않음.
- APDU 1회 이상 + AID 미선택:
  HCE 서비스가 APDU는 받았으나 DALIN AID의 정상 SELECT가 아님.
- DALIN AID 선택됨:
  EP-705가 `F044414C494E0101`을 실제 SELECT한 직접 증거.

## MST capability 테스트

`RF / MST 진단 보기`에서 확인:

- 기기 제조사/모델
- NFC/HCE 상태
- Samsung Wallet 앱 패키지 감지 여부
- Samsung Pay Framework 감지 여부
- 직접 MST 송신 API 상태

현재 앱은 임의의 실제 카드 자기장/결제 자격증명을 생성하지 않는다.
`직접 MST 송신 API = 사용 불가/미공개`는 실패가 아니라
일반 앱에서 사용할 수 있는 공식 직접 송신 경로를 찾지 못했다는 뜻이다.

## PC ADB 로그

프로젝트 폴더:

`powershell -ExecutionPolicy Bypass -File .\tools\ep705-hce-diagnostics.ps1`

핵심 로그:

- `[HCE_DIAG] APDU_RX`
- `[HCE_DIAG] OUR_AID_SELECTED`
- `[HCE_DIAG] APDU_TX`
- `[HCE_DIAG] DEACTIVATED`
