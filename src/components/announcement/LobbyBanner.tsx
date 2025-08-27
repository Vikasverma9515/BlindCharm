// // components/CompactAnnouncementBanner.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';

// const LobbyBanner: React.FC = () => {
//     const [isExpanded, setIsExpanded] = useState(false);
//     const [currentIndex, setCurrentIndex] = useState(0);

//     const announcements = [
//         {
//             id: 1,
//             title: "Match Time!",
//             description: "Next blind matches at 12:00 & 6:00 – don’t be late 😉"
//         },
//         {
//             id: 2,
//             title: "Your Lobby",
//             description: "Hang out, chat & vibe with Thapar students"
//         },
//         {
//             id: 3,
//             title: "Safety First",
//             description: "Report & block anytime. We’ve got your back."
//         },
//         {
//             id: 4,
//             title: "Pro Tip",
//             description: "The more you vibe, the better your matches get"
//         }
//     ];


//     const appRules = [
//         {
//             category: "How It Works",
//             rules: [
//                 "Auto-matching happens at 12:00 PM & 6:00 PM sharp ⏰",
//                 "You’ll be paired based on your vibes & prefs 💕",
//                 "After matching, you’ll get a private chat room 🗨️",
//                 "After chatting you can choose to reveal your identity 🔍",
                
//                 "Didn’t click? Don’t worry, another chance soon 😉"
//             ]
//         },
//         {
//             category: "Community Vibes",
//             rules: [
//                 "Be kind & respectful — good vibes only 🌸",
//                 "No spam, no creepy stuff 🚫",
//                 "Keep convos fun & positive 🎉",
//                 "Respect everyone’s space & privacy 🔒"
//             ]
//         },
//         {
//             category: "Safety First",
//             rules: [
//                 "Report/block if someone feels off 🚨",
//                 "Our system keeps things safe & secure ✅",
//                 "Emergency help is always available 💙"
//             ]
//         }
//     ];


//     useEffect(() => {
//         if (!isExpanded) {
//             const interval = setInterval(() => {
//                 setCurrentIndex((prev) => (prev + 1) % announcements.length);
//             }, 3000);
//             return () => clearInterval(interval);
//         }
//     }, [isExpanded]);

//     const handleToggle = () => {
//         setIsExpanded(!isExpanded);
//     };

//     const handleClose = (e?: React.MouseEvent | React.KeyboardEvent) => {
//         if (e) {
//             e.stopPropagation();
//         }
//         setIsExpanded(false);
//     };

//     const handleKeyboardClose = (e: React.KeyboardEvent) => {
//         if (e.key === 'Enter' || e.key === ' ') {
//             e.preventDefault();
//             handleClose();
//         }
//     };

//     const handleOverlayClick = (e: React.MouseEvent) => {
//         if (e.target === e.currentTarget) {
//             setIsExpanded(false);
//         }
//     };

//     const handleSupportClick = () => {
//         console.log('Contact support clicked');
//     };

//     const handleSupportKeyDown = (e: React.KeyboardEvent) => {
//         if (e.key === 'Enter' || e.key === ' ') {
//             e.preventDefault();
//             handleSupportClick();
//         }
//     };

//     return (
//         <>
//             {/* Compact Banner - No outer padding */}
//             <div className="mx-4 mb-1">
//                 <div
//                     className="bg-purple-500 dark:bg-gray-800 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
//                     onClick={handleToggle}
//                     role="button"
//                     tabIndex={0}
//                     onKeyDown={(e) => {
//                         if (e.key === 'Enter' || e.key === ' ') {
//                             e.preventDefault();
//                             handleToggle();
//                         }
//                     }}
//                 >
//                     <div className="flex items-center justify-between text-white dark:text-white">
//                         <div className="flex-1 min-w-0">
//                             <p className="font-medium text-sm truncate">
//                                 {announcements[currentIndex].title}
//                             </p>
//                             <p className="text-amber-100 dark:text-white text-xs truncate">
//                                 {announcements[currentIndex].description}
//                             </p>
//                         </div>
//                         <div className="flex items-center space-x-2 ml-3">
//                             <span className="text-white text-sm opacity-80">ℹ</span>
//                             <span
//                                 className={`text-white text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
//                                     }`}
//                                 style={{ display: 'inline-block' }}
//                             >
//                                 {isExpanded ? '↑' : '↓'}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Modal Overlay with blurred background */}
//             {isExpanded && (
//                 <div
//                     className="fixed inset-0 flex items-end justify-center z-50"
//                     onClick={handleOverlayClick}
//                     style={{
//                         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//                         backdropFilter: 'blur(10px)',
//                         WebkitBackdropFilter: 'blur(10px)'
//                     }}
//                 >
//                     <div
//                         className="bg-white w-full max-w-2xl mx-auto rounded-t-3xl max-h-[85vh] overflow-hidden transform transition-transform duration-300 ease-out shadow-2xl"
//                         onClick={(e) => e.stopPropagation()}
//                         style={{
//                             animation: 'slideUpModal 0.3s ease-out forwards'
//                         }}
//                     >
//                         {/* Header with close button */}
                        
//                         <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-700/30 p-6 z-10 backdrop-blur-xl">
//     <div className="flex items-center justify-between">
//         <div className="flex-1">
//             <h2 className="text-xl font-bold text-white tracking-tight">
//                 Lobby Guide & Rules
//             </h2>
//             <p className="text-gray-400 text-sm mt-1">Everything you need to know</p>
//             {/* Modern drag handle */}
//             <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-600 rounded-full"></div>
//         </div>
//         <button
//             onClick={handleClose}
//             className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-sm border border-white/10 hover:border-white/20"
//             role="button"
//             tabIndex={0}
//             onKeyDown={handleKeyboardClose}
//         >
//             <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//         </button>
//     </div>
// </div>

// {/* Scrollable Content */}
// <div className="overflow-y-auto bg-gradient-to-b from-gray-900 to-black text-white" style={{ maxHeight: 'calc(85vh - 120px)' }}>
//     <div className="p-6 space-y-8">
//         {appRules.map((section, index) => (
//             <div key={index} className="group">
//                 <div className="flex items-center mb-6">
//                     <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-4"></div>
//                     <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
//                         {section.category}
//                     </h3>
//                 </div>
                
//                 <div className="space-y-4 ml-6">
//                     {section.rules.map((rule, ruleIndex) => (
//                         <div
//                             key={ruleIndex}
//                             className="relative bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 hover:border-purple-500/30 hover:transform hover:translate-x-1 transition-all duration-300"
//                         >
//                             <div className="flex items-start">
//                                 <div className="w-2 h-2 bg-purple-400 rounded-full mr-4 mt-2 flex-shrink-0"></div>
//                                 <p className="text-gray-300 text-sm leading-relaxed">{rule}</p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         ))}

//         {/* Modern Stats Section */}
//         <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-red-900/30 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20">
//             <h4 className="font-bold text-white text-lg mb-6 flex items-center">
//                 <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
//                 Platform Insights
//             </h4>
//             <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-4 bg-black/30 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
//                     <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
//                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                         </svg>
//                     </div>
//                     <div className="text-gray-300 text-sm">Someone's already crushing on you</div>
//                 </div>

//                 <div className="text-center p-4 bg-black/30 rounded-2xl border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300">
//                     <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mx-auto mb-3 flex items-center justify-center">
//                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                         </svg>
//                     </div>
//                     <div className="text-gray-300 text-sm">Your next connection is one click away</div>
//                 </div>

//                 <div className="text-center p-4 bg-black/30 rounded-2xl border border-gray-700/50 hover:border-red-500/30 transition-all duration-300">
//                     <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center">
//                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
//                         </svg>
//                     </div>
//                     <div className="text-gray-300 text-sm">Warning: BlindCharm causes late-night chats</div>
//                 </div>

//                 <div className="text-center p-4 bg-black/30 rounded-2xl border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300">
//                     <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
//                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                         </svg>
//                     </div>
//                     <div className="text-gray-300 text-sm">Fall for vibes, not just faces</div>
//                 </div>
//             </div>
//         </div>

//         {/* Modern Support Section */}
//         <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-xl rounded-3xl p-6 border border-blue-500/20">
//             <h4 className="font-bold text-white text-lg mb-3 flex items-center">
//                 <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3"></div>
//                 Need Help?
//             </h4>
//             <p className="text-gray-300 text-sm mb-4 leading-relaxed">
//                 Our team is just one tap away. We're here for you!
//             </p>

//             <button
//                 className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-[1.02]"
//                 onClick={handleSupportClick}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={handleSupportKeyDown}
//             >
//                 Contact Support
//             </button>
//         </div>
//     </div>

//     {/* Bottom padding for better scrolling */}
//     <div className="h-8"></div>
// </div>
//                     </div>
//                 </div>
//             )}

//             <style jsx>{`
//         @keyframes slideUpModal {
//           from {
//             transform: translateY(100%);
//           }
//           to {
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//         </>
//     );
// };

// export default LobbyBanner;

'use client';

import React, { useState, useEffect } from 'react';
import ContactForm from '../contact/ContactForm';
import QuickContactButtons from '../contact/QuickContactButtons';

const LobbyBanner: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // const announcements = [
    //     {
    //         id: 1,
    //         title: "Match Time!",
    //         description: "Next blind matches at 6:00 pm – don't be late"
    //     },
    //     {
    //         id: 2,
    //         title: "Your Lobby",
    //         description: "Hang out, chat & vibe with students"
    //     },
    //     {
    //         id: 3,
    //         title: "Safety First",
    //         description: "Report anytime. We've got your back."
    //     },
    //     {
    //         id: 4,
    //         title: "Pro Tip",
    //         description: "The more you vibe, the better your matches get"
    //     }
    // ];
    const announcements = [
  {
    id: 1,
    title: "Match Time!",
    description: "Next blind matches at 6:00 PM sharp ⏰ – don’t miss out!"
  },
  {
    id: 2,
    title: "Your Lobby",
    description: "Hang out, chat & vibe with fellow students 🎉"
  },
  {
    id: 3,
    title: "Safety First",
    description: "Report/block anytime — we’ve got your back 💙"
  },
  {
    id: 4,
    title: "Pro Tip",
    description: "The more you vibe, the better your matches 🔥"
  }
];


    // const appRules = [
    //     {
    //         category: "How It Works",
    //         rules: [
    //             "Auto-matching happens at 6:00 PM sharp",
    //             "Answer to females questions and get points and leaderboard to get matched first",
    //             "You'll be paired based on your vibes & preferences",
    //             "After matching, you'll get a private chat room",
    //             "After chatting you can choose to reveal your identity",
                
    //         ]
    //     },
    //     {
    //         category: "Community Vibes",
    //         rules: [
    //             "Be kind & respectful — good vibes only",
    //             "No spam, no inappropriate content",
    //             "Keep conversations fun & positive",
    //             "Respect everyone's space & privacy"
    //         ]
    //     },
    //     {
    //         category: "Safety First",
    //         rules: [
    //             "Report us if someone feels off",
    //             "Our system keeps things safe & secure",
    //             "Emergency help is always available"
    //         ]
    //     }
    // ];
    const appRules = [
  {
    category: "How It Works",
    rules: [
      "Auto-matching happens daily at 6:00 PM ⏰",
      "Play fun Q&A to earn points & rise on the leaderboard 🏆",
      "You’ll be paired based on vibes + preferences 💕",
      "After matching, you get your own private chat room 🗨️",
      "When you’re ready, you can choose to reveal identities 👀"
    ]
  },
  {
    category: "Community Vibes",
    rules: [
      "Be kind & respectful — good vibes only 🌸",
      "No spam, no creepy stuff 🚫",
      "Keep convos fun, light & positive ✨",
      "Respect everyone’s privacy & space 🔒"
    ]
  },
  {
    category: "Safety First",
    rules: [
      "Report/block instantly if something feels off 🚨",
      "Our system is built to keep you safe & secure ✅",
      "Emergency support is always available 💙"
    ]
  }
];


    useEffect(() => {
        if (!isExpanded) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % announcements.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isExpanded, announcements.length]);

    const handleToggle = () => {
        if (isExpanded) {
            handleClose();
        } else {
            setIsExpanded(true);
        }
    };

    const handleClose = (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setIsClosing(true);
        setTimeout(() => {
            setIsExpanded(false);
            setIsClosing(false);
        }, 300);
    };

    const handleKeyboardClose = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleSupportClick = () => {
        console.log('Contact support clicked');
    };

    const handleSupportKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSupportClick();
        }
    };

    return (
        <>
            {/* Compact Banner */}
            <div className="mx-4 mb-1">
                <div
                    className="bg-purple-600 dark:bg-gray-800 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:bg-purple-700 dark:hover:bg-gray-700 hover:shadow-lg active:scale-95"
                    onClick={handleToggle}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggle();
                        }
                    }}
                >
                    <div className="flex items-center justify-between text-white">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                                {announcements[currentIndex].title}
                            </p>
                            <p className="text-purple-100 dark:text-gray-300 text-xs truncate mt-0.5">
                                {announcements[currentIndex].description}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                            <svg className="w-4 h-4 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <svg 
                                className={`w-4 h-4 text-white transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {isExpanded && (
                <div
                    className="fixed inset-0 flex items-end justify-center z-50 bg-black/50 backdrop-blur-sm"
                    onClick={handleOverlayClick}
                >
                    <div
                        className={`bg-white dark:bg-gray-900 w-full max-w-2xl mx-auto rounded-t-3xl max-h-[85vh] overflow-hidden shadow-2xl ${
                            isClosing ? 'modal-slide-down' : 'modal-slide-up'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        Lobby Guide & Rules
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Everything you need to know</p>
                                    {/* Drag handle */}
                                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={handleKeyboardClose}
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto bg-gray-50 pb-6 dark:bg-gray-900" style={{ maxHeight: 'calc(85vh - 120px)' }}>
                            <div className="p-6 space-y-8">
                                {appRules.map((section, index) => (
                                    <div key={index} className="group">
                                        <div className="flex items-center mb-6">
                                            <div className="w-1 h-6 bg-purple-600 dark:bg-purple-500 rounded-full mr-4"></div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                                                {section.category}
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-3 ml-5">
                                            {section.rules.map((rule, ruleIndex) => (
                                                <div
                                                    key={ruleIndex}
                                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md dark:hover:shadow-lg hover:transform hover:translate-x-1 transition-all duration-300"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{rule}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Platform Insights */}
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-3xl p-6 border border-purple-200 dark:border-purple-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-6 flex items-center">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                        Platform Insights
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all duration-300">
                                            <div className="w-10 h-10 bg-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>
                                            <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">Get Verified to boost your match chances 🚀</div>
                                        </div>

                                        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-md transition-all duration-300">
                                            <div className="w-10 h-10 bg-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">Your next connection is just one click away 💌 </div>
                                        </div>

                                        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">Warning: BlindCharm may cause late-night chats 🌙</div>
                                        </div>

                                        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-md transition-all duration-300">
                                            <div className="w-10 h-10 bg-red-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </div>
                                            <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">Fall for vibes, not just faces 💜</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Support Section */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-3 flex items-center">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                        Need Help?
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                                        Our team is just one tap away. We're here for you!
                                    </p>

                                    {/* <button
                                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:transform hover:scale-[1.01]"
                                        onClick={handleSupportClick}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={handleSupportKeyDown}
                                    >
                                        Contact Support
                                    </button> */}
                                    <ContactForm />
                                    {/* <QuickContactButtons /> */}
                                </div>
                            </div>

                            {/* Bottom padding */}
                            <div className="h-8"></div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .modal-slide-up {
                    animation: slideUpModal 0.3s ease-out forwards;
                }
                
                .modal-slide-down {
                    animation: slideDownModal 0.3s ease-in forwards;
                }
                
                @keyframes slideUpModal {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideDownModal {
                    from {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
};

export default LobbyBanner;