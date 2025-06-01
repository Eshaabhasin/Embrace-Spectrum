/**
 * This file provides a fix for the "Cannot set properties of undefined (setting 'Children')" error
 * by ensuring React.Children is properly defined before any component rendering.
 */

// Define a safe implementation of React.Children
const safeChildrenImplementation = {
  map: function(children, fn) {
    return Array.isArray(children) ? children.map(fn) : (children ? [fn(children)] : []);
  },
  forEach: function(children, fn) {
    if (Array.isArray(children)) children.forEach(fn);
    else if (children) fn(children);
  },
  count: function(children) {
    return Array.isArray(children) ? children.length : (children ? 1 : 0);
  },
  only: function(children) {
    if (!children) throw new Error('React.Children.only expected to receive a single React element child.');
    return Array.isArray(children) ? children[0] : children;
  },
  toArray: function(children) {
    return Array.isArray(children) ? children : (children ? [children] : []);
  }
};

// Apply the fix to window.React if in browser environment
if (typeof window !== 'undefined') {
  // Check if React is already defined
  if (window.React) {
    // If React exists but Children is undefined, add our implementation
    if (!window.React.Children) {
      window.React.Children = safeChildrenImplementation;
    }
  } else {
    // If React isn't defined yet, set up a getter to intercept when it is
    let originalReact = null;
    Object.defineProperty(window, 'React', {
      configurable: true,
      get: function() {
        return originalReact;
      },
      set: function(newReact) {
        originalReact = newReact;
        // Ensure Children exists on the new React object
        if (originalReact && !originalReact.Children) {
          originalReact.Children = safeChildrenImplementation;
        }
      }
    });
  }
}

// Export the safe implementation for direct use
export const Children = safeChildrenImplementation;

export default {
  Children: safeChildrenImplementation
};