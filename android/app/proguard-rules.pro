# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html
# Add any project specific keep options here:
# React Native rules
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep your native methods
-keepclassmembers class com.yashclasses.counselling.** {
    native <methods>;
}

# Network related rules
-keepclassmembers class okhttp3.** { *; }
-keepclassmembers class okio.** { *; }
-keepclassmembers class retrofit2.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn retrofit2.**

# Keep classes used for network
-keep class * implements java.io.Serializable
-keep class * implements android.os.Parcelable

# Preserve network-related classes
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }