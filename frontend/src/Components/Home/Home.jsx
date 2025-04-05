import React from "react";
import NavBar from "../NavBar/NavBar";
import ImageCollage from "./Collage";

function Home() {
    return (    
        <>
        <NavBar></NavBar>
            <div className="bg-[#5C7EEC] min-h-screen px-10">
               
                <div className="flex justify-end mr-7">
                </div>
 
                <div className="flex justify-between mt-50 ml-10">
                    <div className="">
                        <h1 className="text-5xl text-white font-bold leading-tight ">
                            Celebrating Neurodiversity,  
                            <br /> Empowering Every Mind!
                        </h1>
                        <p className="text-2xl text-white mt-5 leading-relaxed">
                            Unlock potential, foster inclusion, and embrace the strengths<br></br> of every neurodiverse individual.
                        </p>
                    </div>
                    <ImageCollage></ImageCollage>
                </div>
            </div>
        </>
    );
}

export default Home;
