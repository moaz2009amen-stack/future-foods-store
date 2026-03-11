# 🚀 دليل رفع المشروع على Firebase — خطوة بخطوة

---

## الخطوة 1: إنشاء مشروع Firebase

1. روح على: https://console.firebase.google.com
2. اضغط "Add project"
3. اسم المشروع: future-foods-store
4. اضغط Continue → Continue → Create project

---

## الخطوة 2: تفعيل الخدمات المطلوبة

### Firestore Database
- من القائمة الجانبية → Firestore Database
- اضغط "Create database"
- اختار "Start in test mode"
- اختار أقرب منطقة جغرافية → Enable

### Authentication
- من القائمة → Authentication → Get started
- اختار "Email/Password" → Enable → Save
- اضغط "Add user"
  - Email: admin@futurefoods.com
  - Password: admin123 (غيّرها لكلمة سر قوية!)

### Storage
- من القائمة → Storage → Get started
- Start in test mode → Next → Done

---

## الخطوة 3: جيب بيانات الاتصال

1. اضغط ⚙️ Project Settings
2. من تبويب "General"، انزل لـ "Your apps"
3. اضغط </> (Web app)
4. اسم التطبيق: future-foods-web → Register app
5. هتلاقي firebaseConfig — انسخه

---

## الخطوة 4: حط بيانات Firebase في الملفات

افتح ملف client/index.html وعدّل:
```javascript
const firebaseConfig = {
  apiKey:            "الكود بتاعك",
  authDomain:        "مشروعك.firebaseapp.com",
  projectId:         "مشروعك",
  storageBucket:     "مشروعك.appspot.com",
  messagingSenderId: "الرقم بتاعك",
  appId:             "الـ App ID بتاعك"
};
```

افعل نفس الشيء في ملف admin/index.html

---

## الخطوة 5: رفع الموقع على Firebase Hosting

افتح CMD أو Terminal وشغّل:

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# روح على مجلد المشروع
cd webapp

# ربط المشروع
firebase use --add
# اختار مشروعك من القائمة

# إضافة hosting targets
firebase target:apply hosting client future-foods-client
firebase target:apply hosting admin  future-foods-admin

# رفع!
firebase deploy
```

---

## الخطوة 6: بعد الرفع

هتاخد رابطين:
- موقع العميل:  https://future-foods-client.web.app
- لوحة المالك:  https://future-foods-admin.web.app

---

## الخطوة 7: إضافة منتجات تجريبية

1. افتح لوحة المالك
2. سجّل بـ: admin@futurefoods.com / admin123
3. اضغط "المنتجات" → "➕ منتج جديد"
4. أضف منتجاتك

---

## ملاحظات مهمة

✅ الموقعين مجانيين تماماً على Firebase
✅ يشتغل على أي موبايل أو كمبيوتر
✅ لا يحتاج تثبيت من أي متجر
✅ التحديثات تظهر فوراً عند العملاء

⚠️ الكمبيوتر اللي فيه برنامج Python لازم يكون
   متصل بالنت عشان يستقبل الطلبات من التطبيق
