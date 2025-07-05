# App Store Configuration for BlindCharm PWA

## For Google Play Store (Android)

### Using PWA Builder or Bubblewrap:

1. **PWA Builder (Recommended)**:
   - Visit: https://www.pwabuilder.com/
   - Enter your website URL: https://your-domain.com
   - Download the Android package
   - Follow the signing and publishing instructions

2. **Bubblewrap (Google's official tool)**:
   ```bash
   npm install -g @bubblewrap/cli
   bubblewrap init --manifest https://your-domain.com/manifest.json
   bubblewrap build
   ```

### Requirements for Google Play Store:
- Domain verification
- HTTPS enabled
- Valid manifest.json
- Service worker
- App icons (provided)
- Screenshots (need to be created)
- Privacy policy
- Content rating

## For Apple App Store (iOS)

### Using PWA Builder or Capacitor:

1. **PWA Builder**:
   - Same process as Android
   - Download iOS package
   - Requires macOS and Xcode for final build

2. **Capacitor (Ionic)**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/ios
   npx cap init
   npx cap add ios
   npx cap sync
   npx cap open ios
   ```

### Requirements for Apple App Store:
- Apple Developer Account ($99/year)
- macOS with Xcode
- App icons in all required sizes
- Screenshots for all device sizes
- App Store Connect setup
- Privacy policy
- App review guidelines compliance

## Alternative: Trusted Web Activity (TWA) for Android

Create a native Android app wrapper:

```bash
# Using PWA Builder
npx @pwabuilder/cli create https://your-domain.com

# Or using Bubblewrap
npx @bubblewrap/cli init --manifest https://your-domain.com/manifest.json
```

## Required Assets for App Stores:

### Icons (Already created):
- ✅ 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Screenshots needed:
- Mobile: 390x844 (iPhone), 360x640 (Android)
- Tablet: 768x1024 (iPad), 800x1280 (Android tablet)
- Desktop: 1920x1080

### Store Listings:
- App name: "BlindCharm - Anonymous Dating"
- Short description: "Connect through personality, not photos"
- Long description: Full app description
- Keywords: dating, anonymous, personality, social, relationships
- Category: Social/Lifestyle
- Age rating: 17+ (dating app)

### Legal Requirements:
- Privacy Policy (required)
- Terms of Service
- Content Policy
- Data handling disclosure

## Domain Requirements:

1. **HTTPS**: ✅ Required for PWA
2. **Domain Verification**: Required for Play Store
3. **Apple App Site Association**: Required for iOS deep linking

## Testing Before Submission:

1. **Lighthouse PWA Audit**: Should score 100
2. **PWA Criteria**: 
   - ✅ Served over HTTPS
   - ✅ Has a web app manifest
   - ✅ Has a service worker
   - ✅ Is installable

3. **Cross-browser Testing**:
   - Chrome (Android)
   - Safari (iOS)
   - Edge
   - Firefox

## Deployment Checklist:

- [ ] Deploy to production domain
- [ ] Verify HTTPS certificate
- [ ] Test PWA installation on mobile devices
- [ ] Create actual screenshots
- [ ] Write privacy policy
- [ ] Set up analytics
- [ ] Configure push notifications (if needed)
- [ ] Test offline functionality
- [ ] Verify manifest.json accessibility
- [ ] Test service worker caching

## Next Steps:

1. Deploy your PWA to a production domain
2. Test installation on various devices
3. Create actual screenshots of your app
4. Write privacy policy and terms of service
5. Use PWA Builder to generate app packages
6. Submit to respective app stores

## Useful Tools:

- PWA Builder: https://www.pwabuilder.com/
- Lighthouse: Built into Chrome DevTools
- PWA Testing: https://web.dev/pwa-checklist/
- Manifest Generator: https://app-manifest.firebaseapp.com/