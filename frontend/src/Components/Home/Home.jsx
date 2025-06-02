import React from "react";
import RotatingText from "./HeroText/HerotextLogic";
import SpotlightCard from "./FeatureCard/FeatureCardLogic";
import { Sparkles } from "lucide-react";
import CircularGallery from "./Gallery/GalleryLogic";
import GeminiAgent from "../GeminiAgent/GeminiAgent";
import IconsCards from './Icons/IconsLogic';
import withCalmMode from '../CalmMode/withCalmMode';
import Img1 from '../../assets/ChatBot Icon.png'
import Img2 from '../../assets/FeelReader Icon.png'
import Img3 from '../../assets/Journal Icon.png'
import Img4 from '../../assets/Sketch Tales Icon.png'
import Img5 from '../../assets/TalkCoach Icon.png'
import Img6 from '../../assets/Jobs Icon.png'
import Img7 from '../../assets/Life Tracker Icon.png'

const images = [Img1, Img2, Img3, Img4, Img5, Img6, Img7];

const transformStyles = [
  "translateX(-180px) translateY(0)",
  "translateX(-120px) translateY(0)",
  "translateX(-60px) translateY(0)",
  "translateX(0) translateY(0)",
  "translateX(60px) translateY(0)",
  "translateX(120px) translateY(0)",
  "translateX(180px) translateY(0)"
];  

const titles = [
  "Solace Chatbot",
  "Feel Reader",
  "Journal",
  "Sketch Tales",
  "Talk Coach",
  "Jobs",
  "Life Tracker",
];

const links = [
  "/chatbot",
  "/FeelReader",
  "/JournalBoard",
  "/SketchTales",
  "/GeminiLive",
  "/Jobs",
  "/tracker",
  "/SpeechCoach",
];

const Home = ({ isCalmMode }) => {
    return (
        <div className="px-10">
            <div className="flex justify-center text-center mt-40 ml-10">
              <div className="">
                <div className="flex">
                    
                    <h1 className="text-7xl text-white font-bold leading-tight mr-3 ">
                        Embrace Spectrum
                    </h1>

                    <RotatingText
                    texts={['Inclusive', 'Empowering', 'Supportive']}
                    mainClassName={`px-2 sm:px-2 md:px-3 text-6xl font-extrabold bg-[#FFFDD0] text-3xl text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg ${isCalmMode ? 'animate-none' : ''}`}
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={isCalmMode ? 0 : 0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={isCalmMode ? 0 : 2000}
                    />

                    </div>

                    <h1 className="text-3xl mt-1 text-white font-bold leading-tight mr-3 ">
                        Celebrating Neurodiversity,Empowering Every Mind!
                    </h1>

                    <p className="text-2xl text-white leading-relaxed">
                        Unlock potential, foster inclusion, and embrace the strengths.
                    </p>
                </div>
                </div>
            <div className="px-95 justify-center items-center">
            <IconsCards
                className="custom-bounceCards mt-10"
                images={images}
                titles={titles}
                links={links}
                containerWidth={500}
                containerHeight={250}
                animationDelay={isCalmMode ? 0 : 1}
                animationStagger={isCalmMode ? 0 : 0.08}
                easeType={isCalmMode ? "none" : "elastic.out(1, 0.5)"}
                transformStyles={isCalmMode ? Array(7).fill("translateX(0) translateY(0)") : transformStyles}
                enableHover={!isCalmMode}
                />
            </div>

            <div className="mt-60">
            <div style={{ height: '600px', position: 'relative' }}>
            <CircularGallery bend={isCalmMode ? 1 : 3} textColor="#ffffff" borderRadius={0.05} />
            </div>
            </div>
            <h1 className="mt-30 mb-4 text-3xl text-white font-extrabold">What Embrace Specturm Beholds</h1>
            <div className="grid grid-cols-4 mb-10">
                <SpotlightCard className="custom-spotlight-card" spotlightColor={isCalmMode ? "rgba(218, 165, 32, 0.3)" : "rgba(218, 165, 32, 0.9)"}>
                <div className="mt-2">
                    <Sparkles className="w-10 h-10 mb-1" />
                </div>

                <h2 className="text-xl font-semibold mt-3">Empower Your Spectrum</h2>

                <p className="text-sm font-normal mt-2">
                    Unlock full access to emotional tools and safe spaces crafted for every journey.
                </p>

                <button className={`mt-4 w-fit px-4 py-1.5 bg-[#6488e9] text-white rounded-lg text-sm font-medium ${isCalmMode ? '' : 'hover:opacity-90'} transition`}>
                    Join now
                </button>
                </SpotlightCard>

                <SpotlightCard className="custom-spotlight-card" spotlightColor={isCalmMode ? "rgba(218, 165, 32, 0.3)" : "rgba(218, 165, 32, 0.9)"}>
                <div className="mt-2">
                    <Sparkles className="w-10 h-10 mb-1" />
                </div>

                <h2 className="text-xl font-semibold mt-3">Personalized Journey</h2>

                <p className="text-sm font-normal mt-2">
                    Enjoy AI-powered support tools tailored to your mood, preferences, and goals.
                </p>

                <button className={`mt-4 w-fit px-4 py-1.5 bg-[#6488e9] text-white rounded-lg text-sm font-medium ${isCalmMode ? '' : 'hover:opacity-90'} transition`}>
                    Get started
                </button>
                </SpotlightCard>

                <SpotlightCard className="custom-spotlight-card" spotlightColor={isCalmMode ? "rgba(218, 165, 32, 0.3)" : "rgba(218, 165, 32, 0.9)"}>
                <div className="mt-2">
                    <Sparkles className="w-10 h-10 mb-1" />
                </div>

                <h2 className="text-xl font-semibold mt-3">Community Hub Access</h2>

                <p className="text-sm font-normal mt-2">
                    Connect with like-minded individuals, mentors, and supportive communities.
                </p>

                <button className={`mt-4 w-fit px-4 py-1.5 bg-[#6488e9] text-white rounded-lg text-sm font-medium ${isCalmMode ? '' : 'hover:opacity-90'} transition`}>
                    Explore now
                </button>
                </SpotlightCard>

                <SpotlightCard className="custom-spotlight-card" spotlightColor={isCalmMode ? "rgba(218, 165, 32, 0.3)" : "rgba(218, 165, 32, 0.9)"}>
                <div className="mt-2">
                    <Sparkles className="w-10 h-10 mb-1" />
                </div>

                <h2 className="text-xl font-semibold mt-3">Creative Expression Zone</h2>

                <p className="text-sm font-normal mt-2">
                    Unlock SketchTales & Journal Board to express, draw, and reflect freely.
                </p>

                <button className={`mt-4 w-fit px-4 py-1.5 bg-[#6488e9] text-white rounded-lg text-sm font-medium ${isCalmMode ? '' : 'hover:opacity-90'} transition`}>
                    Join now
                </button>
                </SpotlightCard>
            </div>
            <GeminiAgent></GeminiAgent>
        </div>
    );
};

export default withCalmMode(Home);