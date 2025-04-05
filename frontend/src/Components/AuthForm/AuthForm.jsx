import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword, dosignInWithEmailAndPassword, dosignInWithGoogle } from "../Firebase/auth";

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isSignUp) {
                await doCreateUserWithEmailAndPassword(email, password);
            } else {
                await dosignInWithEmailAndPassword(email, password);
            }
            alert("Authentication successful!");
            navigate("/home"); // ✅ Redirect to Home after successful login/signup
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await dosignInWithGoogle();
            alert("Signed in with Google!");
            navigate("/home");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#5C7EEC]">
            <div className="w-[1050px] h-[600px] bg-[#5C7EEC] rounded-lg flex">
                {/* Left Side: Branding */}
                <div className="w-2/5 flex flex-col items-center justify-center bg-[#5C7EEC] rounded-l-lg px-8">
                <img src="/Embrace_Spectrum_Logo_Navbar.png" className="h-30" alt="Embrace Spectrum Logo" />
                </div>

                {/* Right Side: Authentication Form */}
                <div className="w-3/5 ml-5 p-10 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-white text-center mb-6">
                        {isSignUp ? "Sign Up" : "Sign In to start a new journey"}
                    </h2>
                    {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 text-lg"
                        >
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </button>
                    </form>

                    <div className="text-center mt-5">
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition duration-300 text-lg"
                        >
                            Sign in with Google
                        </button>
                    </div>

                    <p className="text-center text-md text-white mt-5">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <span
                            className="text-yellow-300 cursor-pointer hover:underline"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
