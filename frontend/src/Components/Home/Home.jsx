import React from "react";
import image from "../../assets/boy.png"
function Home(){
    return(
        <>
        <div className="bg-[#5C7EEC] min-h-screen">
        <div>
            <div className="flex justify-end mr-7">
            <ul className="flex space-x-12 mt-7 text-[24px] text-white">
                <li>Home</li>
                <li>Talk Coach </li>
                <li>Calm Assistant</li>
                <li>Easy Read</li>
                <li>Inclusive Job & Community Hub</li>
            </ul>
            </div>
        </div>
        <div className="flex justify-between mt-40 px-30">
            <div>
            <h1 className="text-[50px] text-white">Welcome to Embrace Spectrum</h1>
            <p className="text-lg mt-5 text-[24px] text-white">
                            A platform to support and empower neurodiverse individuals.
                        </p>
            </div>
            <div>
                <img className="height-[500px] w-[550px]" src={image}></img>
            </div>


        </div>
       
       
        </div>
        </>
    )
}
export default Home;