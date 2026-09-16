# 페이의 달인 v0.0.3

실제 Logcat에서 확인된 `ClassNotFoundException: kr.dalin.paymaster.MainActivity`를 수정한 버전입니다.

v0.0.2는 Kotlin 플러그인 없이 `MainActivity.kt`를 사용해 APK 빌드는 성공했지만 Activity 클래스가 DEX에 포함되지 않았습니다.
v0.0.3은 Activity를 Java로 전환하여 현재 Gradle 구성만으로 컴파일되도록 수정했습니다.
