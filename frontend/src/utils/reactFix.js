/**
 * This file contains utility functions to fix React-related issues
 * particularly the "Cannot set properties of undefined (setting 'Children')" error
 * that occurs in production builds on Vercel
 */

// Monkey patch React.Children if needed
export const fixReactChildrenIssue = () => {
  try {
    // Only apply in production environment
    if (process.env.NODE_ENV === 'production') {
      const React = require('react');
      
      // Check if Children is undefined and fix it
      if (!React.Children || typeof React.Children !== 'object') {
        console.log('Applying React.Children fix');
        
        // Create a minimal implementation of React.Children
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
    }
  } catch (error) {
    console.error('Failed to apply React.Children fix:', error);
  }
};

export default fixReactChildrenIssue;