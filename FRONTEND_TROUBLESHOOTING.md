# Frontend Troubleshooting Guide

## Issue: Timers causing errors on unmounted components

### The Problematic Code
```javascript
// Slow, deliberate transitions for users in distress
setTimeout(() => {
    setIsExiting(true);
}, 2000);

setTimeout(() => {
    onComplete();
}, 3000);
```

### Why it breaks
This code often causes issues in React applications (and by extension, Streamlit custom components) for two main reasons:

1.  **Race Conditions & Unmounting:** `setTimeout` is asynchronous. If the component unmounts before the timer fires (e.g., the user navigates away), the callback will still try to run.
2.  **State Updates on Unmounted Components:** The first timeout calls `setIsExiting(true)`. If this state change causes the component to unmount (or if the parent unmounts it), the second timeout (scheduled for 3000ms) will still fire 1 second later. If `onComplete()` attempts to update state or interact with the DOM, it will fail or cause a memory leak warning because the component no longer exists.

### The Solution: `useEffect` with Cleanup

In React, side effects like timers should be handled inside `useEffect`. You must return a "cleanup function" to clear the timeouts if the component unmounts before they fire.

#### Corrected Code Pattern

```javascript
import { useEffect, useState } from 'react';

const MyComponent = ({ onComplete }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // defined timers references
        let exitTimer;
        let completeTimer;

        // Schedule the transition
        exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 2000);

        // Schedule the completion
        completeTimer = setTimeout(() => {
            onComplete();
        }, 3000);

        // CLEANUP FUNCTION
        // This runs automatically if the component unmounts
        // or if the effect re-runs.
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]); // Add dependencies as needed

    return (
        <div className={isExiting ? 'fade-out' : ''}>
            {/* Component content */}
        </div>
    );
};
```

### Key Takeaways
*   **Always clean up:** Whenever you use `setTimeout` or `setInterval` in a component, ensure you use `clearTimeout` or `clearInterval` in the `useEffect` cleanup function.
*   **Dependency Management:** Ensure external functions like `onComplete` are stable (wrapped in `useCallback`) or included in the dependency array to avoid stale closures.
