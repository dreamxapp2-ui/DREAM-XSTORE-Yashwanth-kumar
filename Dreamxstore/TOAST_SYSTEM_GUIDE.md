# Toast Notification System Guide

## Overview

The application now includes a professional, animated toast notification system using Framer Motion. It provides user-friendly feedback for success, error, warning, and info messages.

## Features

✨ **Smooth Animations** - Spring-based pop-out animations with smooth entrance/exit
🎨 **Multiple Styles** - Success (green), Error (red), Warning (amber), Info (blue)
⏱️ **Auto-dismiss** - Notifications automatically disappear after configurable duration
🎯 **Progress Bar** - Visual progress indicator shows remaining time
❌ **Manual Close** - Users can close notifications immediately
⚡ **Action Buttons** - Optional action buttons for user interactions
📱 **Responsive** - Works perfectly on all screen sizes

## Installation

The toast system is already integrated into the app through:

1. **ToastContext** (`src/contexts/ToastContext.tsx`) - State management
2. **ToastDisplay** (`src/components/Toast/ToastDisplay.tsx`) - UI component
3. **Providers** (`app/providers.tsx`) - Already wrapped in root layout

No additional installation needed!

## Usage

### Basic Usage

```typescript
import { useToast } from '@/src/contexts/ToastContext';

export default function MyComponent() {
  const { showToast } = useToast();

  const handleClick = () => {
    // Show a success message
    showToast('Operation completed!', 'success');
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Parameters

```typescript
showToast(
  message: string,        // The message to display
  type?: ToastType,       // 'success' | 'error' | 'info' | 'warning' (default: 'info')
  duration?: number,      // Time in ms before auto-dismiss (default: 4000, 0 = no auto-dismiss)
  action?: {              // Optional action button
    label: string;        // Button text
    onClick: () => void;  // Callback function
  }
)
```

## Examples

### Success Message
```typescript
showToast('Product added to cart!', 'success', 3000);
```

### Error Message
```typescript
showToast('Failed to update profile', 'error');
```

### Warning Message
```typescript
showToast('This action cannot be undone', 'warning', 5000);
```

### Info with Action Button
```typescript
showToast('New items in your wishlist', 'info', 4000, {
  label: 'View Now',
  onClick: () => router.push('/wishlist')
});
```

### No Auto-dismiss
```typescript
showToast('Important: Please review your order', 'warning', 0);
// Must be manually dismissed by user
```

## Toast Types & Colors

| Type | Background | Border | Icon | Use Case |
|------|-----------|--------|------|----------|
| **success** | bg-green-50 | border-green-200 | CheckCircle | Successful operations |
| **error** | bg-red-50 | border-red-200 | AlertCircle | Errors & failures |
| **warning** | bg-amber-50 | border-amber-200 | AlertTriangle | Warnings & alerts |
| **info** | bg-blue-50 | border-blue-200 | Info | General information |

## Advanced Usage

### Return Toast ID
```typescript
const { showToast, removeToast } = useToast();

const toastId = showToast('Loading...', 'info', 0);

// Later, manually remove it
removeToast(toastId);
```

### Clear All Toasts
```typescript
const { clearAll } = useToast();

// Remove all active toasts
clearAll();
```

### Full Hook API
```typescript
const {
  toasts,          // Array of active toast objects
  showToast,       // Function to show a new toast
  removeToast,     // Function to remove a specific toast by ID
  clearAll         // Function to clear all toasts
} = useToast();
```

## Best Practices

✅ **Do:**
- Use clear, concise messages (max 1-2 sentences)
- Use appropriate types for the situation
- Include action buttons for important notifications
- Set appropriate durations based on message importance
- Use success/error/warning for user actions

❌ **Don't:**
- Show multiple simultaneous toasts for same event
- Use overly long messages
- Use toasts for critical errors (use modals instead)
- Show toasts without user context
- Set duration to 0 for non-critical messages

## Examples in Codebase

### Product Page
```typescript
// Success with action
showToast(`${quantity} item(s) added to bag!`, 'success', 3000, {
  label: 'View Cart',
  onClick: () => router.push('/cart'),
});

// Simple error
showToast('Failed to add to cart', 'error');

// Copy to clipboard feedback
navigator.clipboard.writeText(url).then(() => {
  showToast('Product link copied!', 'success', 3000);
});
```

### Form Submission
```typescript
try {
  await submitForm(data);
  showToast('Form submitted successfully!', 'success');
} catch (error) {
  showToast('Failed to submit form', 'error');
}
```

## Styling & Customization

The toast components use Tailwind CSS with predefined color schemes. To customize:

1. Edit colors in `ToastDisplay.tsx` in the `getColors()` function
2. Modify animation values in the `motion.div` props
3. Adjust positioning in the container `div` class

## Accessibility

- Toast messages are semantic and descriptive
- Icons help users quickly identify message type
- Progress bar provides visual feedback on duration
- Close button with clear aria-label for screen readers
- Messages dismissed after duration for non-critical alerts

## Browser Support

Works on all modern browsers that support:
- CSS Flexbox
- CSS Grid
- Framer Motion animations
- LocalStorage (for persistence if needed)

## Migration Guide

**Old way (alerts):**
```typescript
alert('Item added to cart!');
```

**New way (toasts):**
```typescript
showToast('Item added to cart!', 'success');
```

The toast system is now integrated throughout the application. Check these files for examples:
- `app/products/[productId]/page.tsx` - Product page notifications
- `src/screens/ProductPage/ProductPage.tsx` - Product page copy link
