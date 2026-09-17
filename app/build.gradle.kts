plugins { id("com.android.application") }

android {
    namespace = "kr.dalin.paymaster"
    compileSdk = 35

    defaultConfig {
        applicationId = "kr.dalin.paymaster"
        minSdk = 26
        targetSdk = 35
        versionCode = 22
        versionName = "0.2.2"
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")
}
