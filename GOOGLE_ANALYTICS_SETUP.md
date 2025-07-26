# Google Analytics 4 Setup Guide

## 🎯 What's Been Implemented

Google Analytics 4 (GA4) has been integrated into your True Bread Magazine app with comprehensive tracking capabilities.

## 📋 Setup Steps

### 1. Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for your website
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Update Environment Files

Replace the placeholder Measurement ID in both environment files:

**Development (`src/environments/environment.ts`):**
```typescript
googleAnalytics: {
  measurementId: 'G-YOUR-DEV-ID' // Replace with your actual GA4 Measurement ID
}
```

**Production (`src/environments/environment.prod.ts`):**
```typescript
googleAnalytics: {
  measurementId: 'G-YOUR-PROD-ID' // Replace with your actual GA4 Measurement ID
}
```

## 🔍 What's Being Tracked

### Automatic Tracking
- **Page Views**: All route changes are automatically tracked
- **User Sessions**: Standard GA4 session tracking

### Custom Events
- **PDF Downloads**: When users download magazine issues
- **PDF Views**: When users view PDFs in browser
- **Button Interactions**: Menu clicks, social media clicks
- **Subscription Events**: Newsletter signup attempts and successes

### Available Tracking Methods

The `GoogleAnalyticsService` provides these methods:

```typescript
// PDF tracking
trackPdfDownload(pdfName: string, issueId?: string)
trackPdfView(pdfName: string, issueId?: string)

// User interactions
trackSubscription(email: string, success: boolean)
trackMenuInteraction(menuItem: string)
trackSocialClick(platform: string)

// Engagement
trackScrollDepth(percentage: number)
trackTimeOnPage(seconds: number, page: string)

// Custom events
trackEvent(action: string, category: string, label?: string, value?: number)
```

## 🚀 Implementation Status

### ✅ Completed
- Google Analytics service created
- Environment configuration added
- PDF tracking in Latest Issue component
- PDF tracking in Publications component
- Automatic page view tracking
- Route change tracking

### 📝 Optional Enhancements

You can add more tracking by injecting `GoogleAnalyticsService` into other components:

```typescript
// Track menu interactions
this.googleAnalytics.trackMenuInteraction('Home');

// Track social media clicks
this.googleAnalytics.trackSocialClick('Facebook');

// Track subscription attempts
this.googleAnalytics.trackSubscription(email, success);

// Track custom events
this.googleAnalytics.trackEvent('click', 'Button', 'Header CTA', 1);
```

## 🔧 Testing

1. **Development**: Use browser dev tools to check if `gtag` events are firing
2. **Production**: Check GA4 Real-time reports to verify data collection
3. **Debug Mode**: Add `debug_mode: true` to gtag config for detailed logging

## 📊 GA4 Dashboard

Once set up, you'll see data in your GA4 dashboard:
- **Real-time**: Live user activity
- **Events**: Custom events like PDF downloads
- **Pages and screens**: Most viewed pages
- **User acquisition**: How users find your site

## 🔒 Privacy Compliance

The implementation respects user privacy:
- No personal data is collected without consent
- Uses standard GA4 privacy features
- Can be extended with cookie consent if needed

## 🎉 You're All Set!

Just replace the Measurement ID placeholders with your actual GA4 IDs and you'll have comprehensive analytics tracking for your True Bread Magazine app!
