import React, { useState } from 'react';
import { Link } from "react-router-dom";

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className=" w-[97vw] ml-4 rounded-[1.3vw] fixed top-5 z-[999]">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="" className="flex items-center space-x-3 rtl:space-x-reverse">
                </a>
                <button 
                    onClick={toggleMenu}
                    type="button" 
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden focus:outline-none"
                    aria-controls="navbar-default" 
                    aria-expanded={isMenuOpen}
                >
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                    </svg>
                </button>
                <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
                    <ul className="font-bold lg:text-lg text-2xl flex flex-col p-4 md:p-0 mt-4 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 d dark:border-gray-700">
                        <li>
                            <Link to='/Home'><span className="block py-2 px-3 text-white rounded md:bg-transparent md:p-0 dark:text-white  md:dark:text-blue-900" aria-current="page">Home</span></Link>
                        </li>
                        <li>
                            <Link to='/chatbot'><span className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0  md:p-0 dark:text-white md:dark:hover:text-blue-900 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Talk Coach</span></Link>
                        </li>
                        <li>
                            <Link to='/Investimate'><span className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0  md:p-0 dark:text-white md:dark:hover:text-blue-900 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Calm Assistant</span></Link>
                        </li>
                        <li>
                            <Link to='/FeelReader'><span className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0  md:p-0 dark:text-white md:dark:hover:text-blue-900 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Feel Reader</span></Link>
                        </li>
                        <li>
                            <Link to='/Paths'><span className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0  md:p-0 dark:text-white md:dark:hover:text-blue-900 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Job & Community Hub</span></Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NavBar;