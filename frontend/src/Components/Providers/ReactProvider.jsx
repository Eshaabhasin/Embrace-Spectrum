import React from 'react';
import { CalmModeProvider } from './CalmModeContext';

const ReactProvider = ({ children }) => {
  const safeChildren = React.Children ? React.Children.toArray(children) : [children];
  return (
    <CalmModeProvider>
      {safeChildren}
    </CalmModeProvider>
  );
};

export default ReactProvider;