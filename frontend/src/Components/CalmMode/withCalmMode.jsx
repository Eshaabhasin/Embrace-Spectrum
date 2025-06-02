import React from 'react';
import { useCalmMode } from '../Providers/CalmModeContext';
import NavBar from '../NavBar/NavBar';

const withCalmMode = (WrappedComponent) => {
  return (props) => {
    const { isCalmMode } = useCalmMode();
    
    return (
      <>
        <NavBar />
        <div className="content-area">
          <WrappedComponent {...props} isCalmMode={isCalmMode} />
        </div>
      </>
    );
  };
};

export default withCalmMode;