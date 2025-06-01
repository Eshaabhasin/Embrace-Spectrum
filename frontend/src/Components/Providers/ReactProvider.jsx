import React from 'react';

/**
 * This component wraps React's Children functionality to prevent the 
 * "Cannot set properties of undefined (setting 'Children')" error
 * that occurs in production builds on Vercel
 */
const ReactProvider = ({ children }) => {
  // Ensure React.Children is available
  if (!React.Children) {
    // Create a minimal implementation if missing
    React.Children = {
      map: (children, fn) => {
        return Array.isArray(children) 
          ? children.map(fn) 
          : (children ? [fn(children)] : []);
      },
      forEach: (children, fn) => {
        if (Array.isArray(children)) {
          children.forEach(fn);
        } else if (children) {
          fn(children);
        }
      },
      count: (children) => {
        return Array.isArray(children) 
          ? children.length 
          : (children ? 1 : 0);
      },
      only: (children) => {
        if (!children) {
          throw new Error('React.Children.only expected to receive a single React element child.');
        }
        return Array.isArray(children) && children.length === 1 
          ? children[0] 
          : children;
      },
      toArray: (children) => {
        return Array.isArray(children) 
          ? children 
          : (children ? [children] : []);
      }
    };
  }
  
  // Safely handle children using our implementation
  const safeChildren = React.Children.toArray(children);
  
  return (
    <>
      {safeChildren}
    </>
  );
};

export default ReactProvider;