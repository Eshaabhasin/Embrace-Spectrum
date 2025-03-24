import React from "react";
import image from "../../assets/boy.png";

function Home() {
    return (
        <>
            <div className="bg-[#5C7EEC] min-h-screen px-10">
               
                <div className="flex justify-end mr-7">
                    <ul className="flex space-x-12 mt-7 text-[24px] text-white font-semibold">
                        <li>Home</li>
                        <li>Talk Coach</li>
                        <li>Calm Assistant</li>
                        <li>Easy Read</li>
                        <li>Inclusive Job & Community Hub</li>
                    </ul>
                </div>
 
                <div className="flex justify-between mt-40 px-30">
                    
                    <div className="">
                        <h1 className="text-[50px] text-white font-bold leading-tight ">
                            Celebrating Neurodiversity,  
                            <br /> Empowering Every Mind!
                        </h1>
                        <p className="text-[24px] text-white mt-5 leading-relaxed">
                            Unlock potential, foster inclusion, and embrace the strengths<br></br> of every neurodiverse individual.
                        </p>
                    </div>

                  
                    <div>
                        <img className="h-[500px] w-[550px]" src={image} alt="Neurodiverse Support" />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
