import { useCalmMode } from '../Providers/CalmModeContext';
import React from "react"

const withCalmMode = (WrappedComponent) => {
  const WithCalmMode = (props) => {
    const { isCalmMode } = useCalmMode();
    
    return (
      <WrappedComponent {...props} isCalmMode={isCalmMode} />
    );
  };
  
  WithCalmMode.displayName = `WithCalmMode(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithCalmMode;
};

export default withCalmMode;