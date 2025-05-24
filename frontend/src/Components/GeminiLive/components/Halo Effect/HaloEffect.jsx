import React from 'react';

const HaloEffect = () => {
  return (
    <div className="absolute flex flex-col w-screen h-screen justify-center items-center space-y-4">
      <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 opacity-70 blur-3xl animate-flow rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-transparent to-blue-600 opacity-60 blur-2xl rounded-full" />
      </div>
    </div>
  );
};

export default HaloEffect;
