# EP-705 HCE 진단 — 페이의 달인 v0.1.6

목적은 EP-705를 실제 결제카드처럼 속이는 것이 아니라,
`FB1120 / mode=212` 결제대기 상태에서 EP-705가
페이의 달인의 교육용 HCE 서비스까지 어떤 APDU를 전달하는지 확인하는 것이다.

## 테스트

1. EP-705를 `FB1120 / mode=212`로 진입
2. 단말기 화면이 `카드를 사용하세요`인지 확인
3. 페이의 달인에서 달인카드 인증
4. 50초 결제대기 화면 진입
5. `HCE 진단 보기` 열기
6. EP-705 RF 영역에 휴대폰 태그

## 판독

### APDU 수신 0회
우리 `HostApduService`까지 전달된 APDU가 없었다는 뜻이다.

이것만으로 EP-705가 RF장을 만들지 않았다고 단정할 수는 없다.
EP-705가 자체 결제 커널의 알려진 AID만 탐색하고
`DALIN-PAY` proprietary AID를 선택하지 않았다면
우리 앱에는 APDU가 전달되지 않을 수 있다.

### APDU 수신 1회 이상
Android HCE 서비스까지 실제 APDU가 전달된 것이다.
마지막 APDU와 logcat을 확인한다.

### DALIN AID 선택됨
EP-705가 `F044414C494E0101`을 실제로 SELECT했다는 직접 증거다.

## Logcat
프로젝트의:

`tools/ep705-hce-diagnostics.ps1`

또는 직접:

`adb logcat -v time DalinPayHCE:I PayMaster:D AndroidRuntime:E "*:S"`

확인할 로그:

- `[HCE_DIAG] APDU_RX`
- `[HCE_DIAG] OUR_AID_SELECTED`
- `[HCE_DIAG] APDU_TX`
- `[HCE_DIAG] DEACTIVATED`

## 안전 범위
- 실제 EMV 카드 자격증명 없음
- 실제 카드번호/CVC/금융 토큰 없음
- Samsung Pay 자격증명 모방 없음
- `DALIN-PAY NFC Protocol v1` AID/명령은 변경하지 않음
- v0.1.6은 진단 기능만 추가
