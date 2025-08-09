// components/AnnouncementBar.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Announcement {
    id: number;
    message: string;
    icon?: string;
    link?: string;
}

// const announcements: Announcement[] = [
//     {
//         id: 1,
//         message: "Welcome to BlindCharm! Find your perfect match today.",
//         icon: "❤️"
//     },
//     {
//         id: 2,
//         message: "New matches are waiting for you! Check your profile.",
//         icon: "🔔",
//     },
//     {
//         id: 3,
//         message: "Join our Valentine's Day special event! Limited spots available.",
//         icon: "💘",
//     }
// ];
const announcements: Announcement[] = [
    {
        id: 1,
        message: "🚀 BlindCharm is here! Launching EXCLUSIVELY in Thapar University 🎉",
        icon: "🔥"
    },
    {
        id: 2,
        message: "💌 Find your vibe, not just a glance. Your campus love story starts NOW.",
        icon: "✨",
    },
    {
        id: 3,
        message: "🎯 Limited launch spots! Be among the FIRST to match before everyone else 😉",
        icon: "⚡",
    },
    {
        id: 4,
        message: "🥂 Campus romance, mystery chats & zero fake flex — only on BlindCharm.",
        icon: "💖",
    }
];

const AnnouncementBar = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change announcement every 5 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <div className=" py-0 pb-2 rounded-lg ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative h-8">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="absolute w-full"
                        >
                            <div className="flex items-center justify-center font-blindcharm-logo text-black dark:text-white">
                                <span className="text-2xl mr-2">
                                    {announcements[currentIndex].icon}
                                </span>
                                <p className="text-sm sm:text-base font-medium">
                                    {announcements[currentIndex].message}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Optional Navigation Dots */}
            {/* <div className="flex justify-center mt-2">
                {announcements.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 w-2 rounded-full mx-1 transition-all duration-300 ${
                            currentIndex === index ? 'bg-white' : 'bg-white/50'
                        }`}
                    />
                ))}
            </div> */}
        </div>
    );
};

export default AnnouncementBar;