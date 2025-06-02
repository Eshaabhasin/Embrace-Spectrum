import React from 'react';
import { CalmModeProvider } from './CalmModeContext';

const ReactProvider = ({ children }) => {
  if (!React.Children) {
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
  
  const safeChildren = React.Children.toArray(children);
  
  return (
    <CalmModeProvider>
      {safeChildren}
    </CalmModeProvider>
  );
};

export default ReactProvider;