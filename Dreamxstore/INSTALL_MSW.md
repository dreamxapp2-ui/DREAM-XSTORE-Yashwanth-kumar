# Installing MSW - Quick Guide

## ⚠️ Important Note

The TypeScript errors you're seeing for MSW are **expected** and will be resolved after installation.

## 📦 Installation Steps

### Step 1: Install MSW

```bash
npm install msw@latest --save-dev
```

Or with Yarn:

```bash
yarn add msw@latest --dev
```

### Step 2: Initialize MSW

```bash
npx msw init public/ --save
```

This creates a `mockServiceWorker.js` file in your `public/` directory.

### Step 3: Verify Installation

Check that the following files exist:

- ✅ `node_modules/msw/` - MSW package installed
- ✅ `public/mockServiceWorker.js` - Service worker file

### Step 4: Enable MSW in Your App

Update your main entry file (choose one based on your setup):

#### For Next.js App Router (`app/layout.tsx`)

```typescript
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass',
        });
      });
    }
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

#### For Next.js Pages Router (`pages/_app.tsx`)

```typescript
import { useEffect } from 'react';
import type { AppProps } from 'next/app';

if (process.env.NODE_ENV === 'development') {
  import('@/mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass',
    });
  });
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

#### For React with Vite (`src/main.tsx`)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

async function enableMocking() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

### Step 5: Test MSW

Start your development server:

```bash
npm run dev
```

Open your browser console. You should see:

```
[MSW] Mocking enabled.
```

### Step 6: Make Your First Mock API Call

```typescript
import { AdminService } from '@/lib/api/admin';

// This will be intercepted by MSW
const stats = await AdminService.getDashboardStats();
console.log('Dashboard stats:', stats);
```

Check the Network tab in DevTools - you'll see requests being made to your API URL, but they're actually intercepted by MSW and returning mock data!

## 🔍 Troubleshooting

### Issue: MSW not intercepting requests

**Solution 1:** Clear browser cache and reload

**Solution 2:** Re-run initialization
```bash
npx msw init public/ --save
```

**Solution 3:** Check browser console for MSW logs
- Should see `[MSW] Mocking enabled.`
- If not, check that worker.start() is being called

### Issue: Service worker registration failed

**Solution:** Make sure `mockServiceWorker.js` is in the `public/` directory and accessible at `/mockServiceWorker.js`

### Issue: Requests still going to real backend

**Solution:** Verify MSW handlers are set up correctly. Add logging:

```typescript
worker.start({
  onUnhandledRequest: 'warn', // Change from 'bypass' to 'warn'
}).then(() => {
  console.log('✅ MSW started successfully');
});
```

### Issue: TypeScript errors persist

**Solution:** Restart your TypeScript server:
- VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- Or restart your IDE

## 🎯 Verify It's Working

### Test 1: Check Console

Open browser console, you should see:
```
[MSW] Mocking enabled.
[MSW] 15:30:45 GET /admin/dashboard/stats (200 OK)
```

### Test 2: Make API Call

```typescript
import { AdminService } from '@/lib/api/admin';

async function test() {
  try {
    const stats = await AdminService.getDashboardStats();
    console.log('✅ Stats loaded:', stats);
    // Should show: { totalUsers: 1247, totalBrands: 35, ... }
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

test();
```

### Test 3: Check Network Tab

1. Open Chrome DevTools → Network tab
2. Make an API call
3. You should see requests to your API URL
4. Click on a request - Response tab shows mock data

## 📝 Environment Variables

Add to your `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Control MSW
NEXT_PUBLIC_USE_MSW=true
```

## 🚀 You're All Set!

Once installed:
- ✅ All TypeScript errors will disappear
- ✅ MSW will intercept API requests
- ✅ Mock data will be returned
- ✅ You can develop without a backend

## 🔄 Disabling MSW

To use real backend instead of MSW:

### Option 1: Environment Variable

```typescript
// In your MSW setup
if (process.env.NEXT_PUBLIC_USE_MSW === 'true') {
  const { worker } = await import('./mocks/browser');
  return worker.start();
}
```

Then set in `.env.local`:
```env
NEXT_PUBLIC_USE_MSW=false
```

### Option 2: Remove MSW Initialization

Simply comment out or remove the MSW initialization code. The API client will make real HTTP requests.

## 📚 Next Steps

1. ✅ Install MSW (you are here)
2. ⏭️ Test admin services
3. ⏭️ Build admin UI components
4. ⏭️ Add real backend endpoints
5. ⏭️ Switch from MSW to real APIs

---

**Installation typically takes less than 2 minutes!** 🚀
