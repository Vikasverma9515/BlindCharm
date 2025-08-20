# 🔥 Firebase Setup Checklist - Fix OTP Issues

## ❌ **Current Error: `auth/invalid-app-credential`**

This error means Firebase isn't properly configured. Follow these steps:

## 🔧 **Step 1: Firebase Console Setup**

### **1.1 Enable Phone Authentication**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `blindcharm-authentication`
3. Go to **Authentication** → **Sign-in method**
4. Find **Phone** provider
5. Click **Enable** toggle
6. Click **Save**

### **1.2 Add Authorized Domains**
1. In **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   ```
   localhost
   127.0.0.1
   your-production-domain.com
   ```

### **1.3 Configure reCAPTCHA**
1. Go to **Authentication** → **Settings** → **Advanced**
2. Enable **reCAPTCHA Enterprise** (recommended)
3. Or use **reCAPTCHA v2** for testing

## 🔧 **Step 2: Test Configuration**

### **2.1 Test Firebase Connection**
Add this test to your phone login page:

```javascript
// Add to PhoneAuth component for testing
useEffect(() => {
  console.log('🔥 Firebase Config Test:')
  console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...')
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
}, [])
```

### **2.2 Test Phone Number Format**
Try these formats:
- ✅ `+919876543210` (with country code)
- ❌ `9876543210` (without country code)
- ❌ `+91 9876543210` (with spaces)

## 🔧 **Step 3: Environment Variables**

Make sure your `.env.local` has:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBBKuPW2XWh-JR4gM3GKUPL9Oozk1ybVyo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=blindcharm-authentication.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=blindcharm-authentication
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=blindcharm-authentication.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=247465731192
NEXT_PUBLIC_FIREBASE_APP_ID=1:247465731192:web:1a452d760d49a01f31398d
```

## 🔧 **Step 4: Common Issues & Solutions**

### **Issue: reCAPTCHA not working**
**Solution**: Make sure the reCAPTCHA container exists:
```html
<div id="recaptcha-container"></div>
```

### **Issue: Invalid phone number**
**Solution**: Always use international format:
```javascript
const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
```

### **Issue: Too many requests**
**Solution**: Firebase has rate limits. Wait a few minutes and try again.

### **Issue: Domain not authorized**
**Solution**: Add your domain to Firebase authorized domains list.

## 🔧 **Step 5: Testing Steps**

1. **Open browser console** to see detailed logs
2. **Enter phone number**: `+919876543210`
3. **Check console logs** for Firebase initialization
4. **Look for reCAPTCHA** initialization messages
5. **Check network tab** for Firebase API calls

## 🔧 **Step 6: Production Deployment**

### **Before deploying:**
1. Add production domain to Firebase authorized domains
2. Test with real phone numbers
3. Monitor Firebase usage in console
4. Set up billing alerts (after free tier)

### **Security settings:**
1. Enable **App Check** for production
2. Set up **reCAPTCHA Enterprise**
3. Configure **rate limiting**
4. Monitor **suspicious activity**

## 🚨 **Quick Debug Commands**

Add these to your component for debugging:

```javascript
// Test Firebase initialization
console.log('Firebase app:', app)
console.log('Firebase auth:', auth)

// Test reCAPTCHA
console.log('reCAPTCHA verifier:', PhoneAuthService.recaptchaVerifier)

// Test phone format
console.log('Formatted phone:', formattedPhone)
```

## 📞 **Test Phone Numbers**

For testing, Firebase provides these test numbers:
- `+1 650-555-3434` (US)
- `+91 98765 43210` (India)

**Note**: These only work in development mode!

---

## 🎯 **Next Steps After Setup**

1. ✅ Enable phone auth in Firebase console
2. ✅ Add authorized domains
3. ✅ Test with real phone number
4. ✅ Check console logs for errors
5. ✅ Verify OTP delivery
6. ✅ Test NextAuth integration

**Once Firebase is properly configured, the OTP should work perfectly!** 🚀