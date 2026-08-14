# دليل البناء المحلي لإصدار YemenBook Android

يوثّق هذا الملف إعداد الإصدار **1.1.0** من YemenBook الذي يُبنى محلياً عبر Gradle، بدلاً من الاعتماد على بناء سحابي. بيانات التعريف التي تم التحقق منها في حزمة الإصدار هي `com.yemenbook.app`، و`versionCode=2`، و`versionName=1.1.0`.

| العنصر | القيمة |
|---|---|
| اسم التطبيق الظاهر | `YemenBook - يمن بوك` |
| اسم الحزمة | `com.yemenbook.app` |
| الإصدار | `1.1.0` |
| رقم البناء | `2` |
| مسار مخرج Gradle | `android/app/build/outputs/apk/release/app-release.apk` |
| أداة التحقق | `apksigner verify` من Android Build Tools |

## ملف التسليم المتحقق منه

تم التحقق من ملف التسليم بواسطة `zipalign` و`apksigner`. يستخدم توقيع APK Signature Scheme v2 ويتضمن موقّعاً واحداً.

| الحقل | القيمة |
|---|---|
| اسم الملف | `YemenBook-1.1.0-com.yemenbook.app-release.apk` |
| الحجم | `70,780,500` بايت |
| SHA-256 | `a78e1d70c409926722c8c7a48931c0c7bfb0f0cafd48ba7aff207676789a5195` |

## الملفات المستثناة عمداً من GitHub

لا تُرفع شهادة التوقيع ولا الـAPK الناتج ولا إعداد المسار المحلي لـAndroid SDK إلى GitHub. هذه الملفات مُدرجة في `.gitignore`:

| الملف أو المجلد | السبب |
|---|---|
| `android/yemenbook-release.keystore` | مفتاح خاص يلزم استمرار تحديث التطبيق نفسه. |
| `android/local.properties` | يحتوي مسار Android SDK الخاص بالجهاز. |
| `android/app/build/` و`android/build/` | مخرجات بناء قابلة لإعادة الإنشاء. |
| `releases/` | نسخة التسليم الثنائية؛ تُسلَّم كملف مرفق بدلاً من تخزينها في المصدر. |

> **تنبيه مهم:** يجب حفظ شهادة التوقيع وكلمات مرورها في مكان خاص وآمن. لا يمكن نشر تحديث APK بنفس اسم الحزمة فوق إصدار سابق إذا فُقدت شهادة التوقيع.

## متطلبات إعادة البناء

يتطلب البناء Java حديثاً، وAndroid SDK مثبتاً محلياً، وNode.js وpnpm لتبعيات المشروع. ينبغي كذلك وضع ملف الشهادة في المسار `android/yemenbook-release.keystore` وإضافة خصائص التوقيع في الأمر؛ لا تضع كلمات المرور في ملفات مصدر عامة.

```bash
cd /home/ubuntu/yemen-book/android
export ANDROID_HOME=/مسار/android-sdk
export JAVA_HOME=/مسار/java
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > local.properties

./gradlew :app:assembleRelease --no-daemon \
  -PYEMENBOOK_RELEASE_STORE_FILE=../yemenbook-release.keystore \
  -PYEMENBOOK_RELEASE_STORE_PASSWORD='<STORE_PASSWORD>' \
  -PYEMENBOOK_RELEASE_KEY_ALIAS='yemenbook' \
  -PYEMENBOOK_RELEASE_KEY_PASSWORD='<KEY_PASSWORD>'
```

بعد اكتمال البناء، تحقّق من المحاذاة والتوقيع قبل الرفع:

```bash
APK=app/build/outputs/apk/release/app-release.apk
$ANDROID_HOME/build-tools/36.0.0/zipalign -c -v 4 "$APK"
$ANDROID_HOME/build-tools/36.0.0/apksigner verify --verbose --print-certs "$APK"
$ANDROID_HOME/build-tools/36.0.0/aapt dump badging "$APK" | head -n 1
```

يوضح دليل Android الرسمي أن توقيع الإصدار جزء أساسي من نشر التطبيق وتحديثه لاحقاً.[1]

## ملاحظة رفع APKPure

ملف APK المسلّم في هذه الحزمة موقّع وجاهز للرفع اليدوي. تفاصيل خطوات إعداد القائمة ورفع الملف موجودة في [`APKPURE_MANUAL_UPLOAD_AR.md`](./APKPURE_MANUAL_UPLOAD_AR.md). لا يتضمن هذا الدليل إجراء النشر داخل حساب المستخدم أو إدخال بيانات الحساب.

## المراجع

[1]: https://developer.android.com/studio/publish/app-signing "Android Developers — Sign your app"
