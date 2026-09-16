plugins { id("com.android.application") }

android {
    namespace = "kr.dalin.paymaster"
    compileSdk = 35

    defaultConfig {
        applicationId = "kr.dalin.paymaster"
        minSdk = 26
        targetSdk = 35
        versionCode = 12
        versionName = "0.1.2"
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
