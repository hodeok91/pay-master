# 페이의 달인 — Modular v0.1.2

이 ZIP은 부분 패치가 아니라 **현재 수정 사항을 모두 합친 전체 프로젝트**입니다.

## v0.1.2에 통합된 수정
- Android 진입점을 `MainActivity.java`로 고정
- `MainActivity.kt` 제거
- Manifest의 `.MainActivity`와 실제 Java 클래스 일치
- WebView의 `file://` 로딩 제거
- `WebViewAssetLoader` 기반 HTTPS 로컬 자산 로딩
- ES module(`import/export`) 로딩 대응
- 시작 실패 시 완전한 검은 화면 대신 오류/로딩 화면 표시
- GitHub Actions의 SDK 라이선스 대기 문제를 일으킨 setup-android 단계 제거
- 앱 버전 `0.1.2`, versionCode `12`
- 모듈 구조(core / pays/samsung / 화면별 module) 유지

## 교육용 원칙
실제 금융 카드 정보, 실제 생체 정보, 실제 금융 결제를 사용하지 않습니다.
달인카드와 3초 지문 시뮬레이션을 사용합니다.

## 빌드 결과 확인
휴대폰 설치 뒤 다음 명령으로 반드시 아래 버전이 보여야 합니다.

`adb shell dumpsys package kr.dalin.paymaster | Select-String "versionName|versionCode"`

정상:
- versionCode=12
- versionName=0.1.2
