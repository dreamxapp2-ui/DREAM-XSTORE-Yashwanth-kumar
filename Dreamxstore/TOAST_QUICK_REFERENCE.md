# 🎯 Toast Notification Quick Reference

## Setup ✅ (Already Done)
The toast system is automatically available throughout your app. No setup needed!

## Basic Usage (Copy & Paste)

```typescript
import { useToast } from '@/src/contexts/ToastContext';

export default function MyComponent() {
  const { showToast } = useToast();
  
  return (
    <button onClick={() => showToast('Success!', 'success')}>
      Show Toast
    </button>
  );
}
```

## Common Patterns

### Add to Cart
```typescript
showToast(`${quantity} item(s) added to bag!`, 'success', 3000, {
  label: 'View Cart',
  onClick: () => router.push('/cart'),
});
```

### Form Submission
```typescript
try {
  await submitForm(data);
  showToast('Saved successfully!', 'success');
} catch (error) {
  showToast('Failed to save', 'error');
}
```

### Copy to Clipboard
```typescript
navigator.clipboard.writeText(text).then(() => {
  showToast('Copied to clipboard!', 'success', 3000);
}).catch(() => {
  showToast('Failed to copy', 'error');
});
```

### Validation Warning
```typescript
if (!email.includes('@')) {
  showToast('Please enter a valid email', 'warning');
}
```

### Loading Info
```typescript
showToast('Loading...', 'info', 0);  // No auto-dismiss
// ... do work ...
removeToast(toastId);
```

## API Reference

### showToast()
```typescript
showToast(
  message: string,           // Text to display
  type?: 'success'|'error'|'warning'|'info',  // Default: 'info'
  duration?: number,         // ms until auto-dismiss. Default: 4000. Use 0 for no dismiss
  action?: {                 // Optional
    label: string,           // Button text
    onClick: () => void      // Callback
  }
) => string                  // Returns toast ID
```

### removeToast()
```typescript
removeToast(toastId: string) => void
```

### clearAll()
```typescript
clearAll() => void  // Remove all active toasts
```

## Toast Types at a Glance

| Type | Icon | Color | Use |
|------|------|-------|-----|
| **success** | ✓ | Green | Operations completed |
| **error** | ✗ | Red | Errors & failures |
| **warning** | ⚠ | Amber | Warnings & cautions |
| **info** | ℹ | Blue | General information |

## Component Files

```
src/
  ├── contexts/
  │   └── ToastContext.tsx         ← Hook & state
  └── components/Toast/
      ├── ToastDisplay.tsx          ← UI component
      └── ToastDemo.tsx             ← Demo/examples
```

## Full Documentation

See `TOAST_SYSTEM_GUIDE.md` for detailed guide with all examples.

## Tips & Tricks

💡 **Multiple toasts**: Show multiple by calling showToast() multiple times
💡 **Stack them**: They auto-stack vertically in top-right
💡 **Auto-dismiss**: Default 4000ms, adjust per toast if needed
💡 **Action buttons**: Perfect for "Undo", "View", "Retry" actions
💡 **No dismiss**: Set duration: 0 for persistent notifications

## Demo Component

```typescript
import { ToastDemo } from '@/src/components/Toast/ToastDemo';

export default function Page() {
  return <ToastDemo />;  // Interactive demo
}
```

---

**Quick Links:**
- Implementation: `TOAST_IMPLEMENTATION_SUMMARY.md`
- Full Guide: `TOAST_SYSTEM_GUIDE.md`
- Demo: `src/components/Toast/ToastDemo.tsx`
