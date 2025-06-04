import React from "react"

const SubmitButtonInvestiMate = ({ onClick, disabled }) => {
    return (
        <>
        <button
            className={`relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-gray-700 transition-all duration-300 ease-out bg-gradient-to-r from-green-200 to-teal-200 rounded-lg group shadow-lg hover:shadow-xl ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-[1.02]'}`}
            onClick={disabled ? (e) => e.preventDefault() : onClick}
            disabled={disabled}
        >
            {/* Animated background overlay */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-300 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out rounded-lg"></span>
            
            {/* Shimmer effect */}
            <span className="absolute inset-0 w-full h-full">
                <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-[100%] transition-all duration-700 ease-out"></span>
            </span>
            
            {/* Decorative corner elements */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
            <span className="absolute bottom-1 left-1 w-2 h-2 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-300 delay-100"></span>
            
            {/* Button text */}
            <span className="relative z-10 flex items-center space-x-2 text-base font-medium">
                <span>Get Your Plan</span>
                <svg 
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </span>
        </button>
        </>
    );
}

export default SubmitButtonInvestiMate;