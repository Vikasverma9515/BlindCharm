/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

import { useEffect, useState, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import React, { JSX } from "react";
import {	FiHeart,
	FiUser,
	FiMessageCircle,
	FiEye,
	FiSmile,
	
} from "react-icons/fi"; // You can also import icons from react-icons or any other icon library

// replace icons with your own if needed
import {
	FiCircle,
	FiCode,
	FiFileText,
	FiLayers,
	FiLayout,
} from "react-icons/fi";
export interface CarouselItem {
	title: string;
	description: string;
	id: number;
	icon: React.ReactNode;
}

export interface CarouselProps {
	items?: CarouselItem[];
	baseWidth?: number;
	autoplay?: boolean;
	autoplayDelay?: number;
	pauseOnHover?: boolean;
	loop?: boolean;
	round?: boolean;
}

const DEFAULT_ITEMS: CarouselItem[] = [
	{
		title: "Welcome to BlindCharm 💌",
		description: "A dating experience where personality comes first — no profile pictures until you choose to reveal them.",
		id: 1,
		icon: <FiHeart className="h-[16px] w-[16px] text-white" />,
	},
	{
		title: "Step 1: Create Your Profile",
		description: "Share your personality traits, interests, and fun facts so matches can get to know the real you.",
		id: 2,
		icon: <FiUser className="h-[16px] w-[16px] text-white" />,
	},
	{
		title: "Step 2: Join a Lobby",
		description: "Choose from various themed lobbies to meet like-minded people. Chat without seeing profile pictures — focus on real conversations.",
		id: 3,
		icon: <FiMessageCircle className="h-[16px] w-[16px] text-white" />,
	},
	{
		title: "Step 3: Matchmaking",
		description: "Inside the lobby, matchmaking happens at 6 PM daily. You can join anytime and wait for the next match session.",
		id: 4,
		icon: <FiUser className="h-[16px] w-[16px] text-white" />,
	},
	{
		title: "Step 4: Reveal Photos",
		description: "After being matched, move to a private chat room. When both of you feel ready, unlock profile pictures to see who you’ve been talking to.",
		id: 5,
		icon: <FiEye className="h-[16px] w-[16px] text-white" />,
	},
];

	// {
	// 	title: "Step 4: Build Real Connections",
	// 	description: "With trust and curiosity leading the way, discover matches who value the real you.",
	// 	id: 5,
	// 	icon: <FiSmile className="h-[16px] w-[16px] text-white" />,
	// },



const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
import { AnimationGeneratorType } from "motion";

const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

export default function Carousel({
	items = DEFAULT_ITEMS,
	baseWidth = 300,
	autoplay = false,
	autoplayDelay = 3000,
	pauseOnHover = false,
	loop = false,
	round = false,
}: CarouselProps): JSX.Element {
	const containerPadding = 16;
	const itemWidth = baseWidth - containerPadding * 2;
	const trackItemOffset = itemWidth + GAP;

	const carouselItems = loop ? [...items, items[0]] : items;
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const x = useMotionValue(0);
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [isResetting, setIsResetting] = useState<boolean>(false);

	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (pauseOnHover && containerRef.current) {
			const container = containerRef.current;
			const handleMouseEnter = () => setIsHovered(true);
			const handleMouseLeave = () => setIsHovered(false);
			container.addEventListener("mouseenter", handleMouseEnter);
			container.addEventListener("mouseleave", handleMouseLeave);
			return () => {
				container.removeEventListener("mouseenter", handleMouseEnter);
				container.removeEventListener("mouseleave", handleMouseLeave);
			};
		}
	}, [pauseOnHover]);

	useEffect(() => {
		if (autoplay && (!pauseOnHover || !isHovered)) {
			const timer = setInterval(() => {
				setCurrentIndex((prev) => {
					if (prev === items.length - 1 && loop) {
						return prev + 1;
					}
					if (prev === carouselItems.length - 1) {
						return loop ? 0 : prev;
					}
					return prev + 1;
				});
			}, autoplayDelay);
			return () => clearInterval(timer);
		}
	}, [
		autoplay,
		autoplayDelay,
		isHovered,
		loop,
		items.length,
		carouselItems.length,
		pauseOnHover,
	]);

	const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

	const handleAnimationComplete = () => {
		if (loop && currentIndex === carouselItems.length - 1) {
			setIsResetting(true);
			x.set(0);
			setCurrentIndex(0);
			setTimeout(() => setIsResetting(false), 50);
		}
	};

	const handleDragEnd = (
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	): void => {
		const offset = info.offset.x;
		const velocity = info.velocity.x;
		if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
			if (loop && currentIndex === items.length - 1) {
				setCurrentIndex(currentIndex + 1);
			} else {
				setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
			}
		} else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
			if (loop && currentIndex === 0) {
				setCurrentIndex(items.length - 1);
			} else {
				setCurrentIndex((prev) => Math.max(prev - 1, 0));
			}
		}
	};

	const dragProps = loop
		? {}
		: {
				dragConstraints: {
					left: -trackItemOffset * (carouselItems.length - 1),
					right: 0,
				},
			};

	return (
		<div
			ref={containerRef}
			className={`relative overflow-hidden p-4 ${
				round
					? "rounded-full border border-white "
					: "rounded-[24px] border dark:border-[#fff9f9] border-[#121212]"
			}`}
			style={{
				width: `${baseWidth}px`,
				...(round && { height: `${baseWidth}px` }),
			}}
		>
			<motion.div
				className="flex"
				drag="x"
				{...dragProps}
				style={{
					width: itemWidth,
					gap: `${GAP}px`,
					perspective: 1000,
					perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
					x,
				}}
				onDragEnd={handleDragEnd}
				animate={{ x: -(currentIndex * trackItemOffset) }}
				// transition={effectiveTransition}
				onAnimationComplete={handleAnimationComplete}
			>
				{carouselItems.map((item, index) => {
					const range = [
						-(index + 1) * trackItemOffset,
						-index * trackItemOffset,
						-(index - 1) * trackItemOffset,
					];
					const outputRange = [90, 0, -90];
					const rotateY = useTransform(x, range, outputRange, { clamp: false });
					return (
						<motion.div
							key={index}
							className={`relative shrink-0 flex flex-col ${
								round
									? "items-center justify-center text-center bg-[#060010] border-0"
									: "items-start justify-between bg-[#f00] border border-[#f90000] rounded-[20px]"
							} overflow-hidden cursor-grab active:cursor-grabbing`}
							style={{
								width: itemWidth,
								height: round ? itemWidth : "100%",
								rotateY: rotateY,
								...(round && { borderRadius: "50%" }),
							}}
							// transition={effectiveTransition}
						>
							{/* <div className={`${round ? "p-0 m-0" : "mb-1 p-2"}`}>
								<span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#060010]">
									{item.icon}
								</span>
							</div> */}
							<div className="p-4">
								<div className="mb-1 font-black text-lg text-white">
									{item.title}
								</div>
								<p className="text-sm text-white">{item.description}</p>
							</div>
						</motion.div>
					);
				})}
			</motion.div>
			<div
				className={`flex w-full justify-center ${
					round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : ""
				}`}
			>
				{/* <div className="mt-2 flex w-[150px] justify-between px-8">
					{items.map((_, index) => (
						<motion.div
							key={index}
							className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
								currentIndex % items.length === index
									? round
										? "bg-white"
										: "bg-[#333333]"
									: round
										? "bg-[#555]"
										: "bg-[rgba(51,51,51,0.4)]"
							}`}
							animate={{
								scale: currentIndex % items.length === index ? 1.2 : 1,
							}}
							onClick={() => setCurrentIndex(index)}
							transition={{ duration: 0.15 }}
						/>
					))}
				</div> */}
			</div>
		</div>
	);
}


// import { useEffect, useState, useRef } from "react";
// import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
// import {
//   FiHeart,
//   FiUser,
//   FiMessageCircle,
//   FiEye
// } from "react-icons/fi";

// export interface CarouselItem {
//   title: string;
//   description: string;
//   id: number;
//   icon: React.ReactNode;
//   gradient: string; // new field for gradient
// }

// export interface CarouselProps {
//   items?: CarouselItem[];
//   baseWidth?: number;
//   autoplay?: boolean;
//   autoplayDelay?: number;
//   pauseOnHover?: boolean;
//   loop?: boolean;
//   round?: boolean;
// }

// const DEFAULT_ITEMS: CarouselItem[] = [
//   {
//     title: "Welcome to BlindCharm 💌",
//     description:
//       "A dating experience where personality comes first — no profile pictures until you choose to reveal them.",
//     id: 1,
//     icon: <FiHeart className="h-6 w-6 text-white" />,
//     gradient: "from-pink-500 via-red-400 to-yellow-400"
//   },
//   {
//     title: "Step 1: Create Your Profile",
//     description:
//       "Share your personality traits, interests, and fun facts so matches can get to know the real you.",
//     id: 2,
//     icon: <FiUser className="h-6 w-6 text-white" />,
//     gradient: "from-blue-500 via-indigo-500 to-purple-500"
//   },
//   {
//     title: "Step 2: Join a Lobby",
//     description:
//       "Choose from various themed lobbies to meet like-minded people. Chat without seeing profile pictures — focus on real conversations.",
//     id: 3,
//     icon: <FiMessageCircle className="h-6 w-6 text-white" />,
//     gradient: "from-green-400 via-emerald-500 to-teal-500"
//   },
//   {
//     title: "Step 3: Matchmaking",
//     description:
//       "Inside the lobby, matchmaking happens at 12 PM and 6 PM daily. You can join anytime and wait for the next match session.",
//     id: 4,
//     icon: <FiUser className="h-6 w-6 text-white" />,
//     gradient: "from-orange-400 via-pink-500 to-red-500"
//   },
//   {
//     title: "Step 4: Reveal Photos",
//     description:
//       "After being matched, move to a private chat room. When both of you feel ready, unlock profile pictures to see who you’ve been talking to.",
//     id: 5,
//     icon: <FiEye className="h-6 w-6 text-white" />,
//     gradient: "from-yellow-400 via-amber-500 to-orange-500"
//   }
// ];

// const GAP = 16;
// const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

// export default function Carousel({
//   items = DEFAULT_ITEMS,
//   baseWidth = 300,
//   autoplay = false,
//   autoplayDelay = 3000,
//   pauseOnHover = false,
//   loop = false
// }: CarouselProps) {
//   const containerPadding = 16;
//   const itemWidth = baseWidth - containerPadding * 2;
//   const trackItemOffset = itemWidth + GAP;
//   const carouselItems = loop ? [...items, items[0]] : items;

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const x = useMotionValue(0);
//   const [isHovered, setIsHovered] = useState(false);
//   const [isResetting, setIsResetting] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Pause on hover
//   useEffect(() => {
//     if (pauseOnHover && containerRef.current) {
//       const container = containerRef.current;
//       const handleMouseEnter = () => setIsHovered(true);
//       const handleMouseLeave = () => setIsHovered(false);
//       container.addEventListener("mouseenter", handleMouseEnter);
//       container.addEventListener("mouseleave", handleMouseLeave);
//       return () => {
//         container.removeEventListener("mouseenter", handleMouseEnter);
//         container.removeEventListener("mouseleave", handleMouseLeave);
//       };
//     }
//   }, [pauseOnHover]);

//   // Autoplay
//   useEffect(() => {
//     if (autoplay && (!pauseOnHover || !isHovered)) {
//       const timer = setInterval(() => {
//         setCurrentIndex(prev =>
//           prev === carouselItems.length - 1 ? 0 : prev + 1
//         );
//       }, autoplayDelay);
//       return () => clearInterval(timer);
//     }
//   }, [autoplay, autoplayDelay, isHovered, carouselItems.length, pauseOnHover]);

//   const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
//     const offset = info.offset.x;
//     if (offset < -50) {
//       setCurrentIndex(prev =>
//         Math.min(prev + 1, carouselItems.length - 1)
//       );
//     } else if (offset > 50) {
//       setCurrentIndex(prev => Math.max(prev - 1, 0));
//     }
//   };

//   return (
//     <div
//       ref={containerRef}
//       className="relative overflow-hidden p-4 rounded-3xl shadow-lg bg-gradient-to-b from-gray-900 to-black"
//       style={{ width: `${baseWidth}px` }}
//     >
//       <motion.div
//         className="flex"
//         drag="x"
//         dragConstraints={{ left: -trackItemOffset * (carouselItems.length - 1), right: 0 }}
//         style={{ gap: `${GAP}px`, x }}
//         animate={{ x: -(currentIndex * trackItemOffset) }}
//         // transition={SPRING_OPTIONS}
//         onDragEnd={handleDragEnd}
//       >
//         {carouselItems.map((item, index) => {
//           const rotateY = useTransform(x, [
//             -(index + 1) * trackItemOffset,
//             -index * trackItemOffset,
//             -(index - 1) * trackItemOffset
//           ], [20, 0, -20]);

//           return (
//             <motion.div
//               key={index}
//               className={`shrink-0 rounded-2xl shadow-xl p-5 text-white flex flex-col justify-between cursor-grab active:cursor-grabbing hover:scale-[1.03] transition-transform duration-300`}
//               style={{
//                 width: itemWidth,
//                 rotateY,
//                 background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
//               }}
//             >
//               <div className={`bg-gradient-to-r ${item.gradient} p-3 rounded-full shadow-md w-fit`}>
//                 {item.icon}
//               </div>
//               <div className="mt-4">
//                 <h3 className="text-lg font-bold">{item.title}</h3>
//                 <p className="text-sm opacity-90 mt-1">{item.description}</p>
//               </div>
//             </motion.div>
//           );
//         })}
//       </motion.div>

//       {/* Indicators */}
//       <div className="flex justify-center mt-4 space-x-2">
//         {items.map((_, index) => (
//           <motion.div
//             key={index}
//             className={`h-2 w-2 rounded-full ${currentIndex % items.length === index ? "bg-white" : "bg-gray-500"}`}
//             animate={{
//               scale: currentIndex % items.length === index ? 1.3 : 1
//             }}
//             transition={{ duration: 0.2 }}
//             onClick={() => setCurrentIndex(index)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
