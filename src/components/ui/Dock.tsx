// "use client";
// import {
//   motion,
//   useMotionValue,
//   useSpring,
//   useTransform,
//   AnimatePresence,
// } from "framer-motion";
// import {
//   Children,
//   cloneElement,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// function DockItem({
//   children,
//   className = "",
//   onClick,
//   mouseX,
//   spring,
//   distance,
//   magnification,
//   baseItemSize,
// }: {
//   children: React.ReactNode;
//   className?: string;
//   onClick?: () => void;
//   mouseX: any;
//   spring: any;
//   distance: number;
//   magnification: number;
//   baseItemSize: number;
// }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const isHovered = useMotionValue(0);
//   const mouseDistance = useTransform(mouseX, (val) => {
//     const rect = ref.current?.getBoundingClientRect() ?? {
//       x: 0,
//       width: baseItemSize,
//     };
//     return val - rect.x - baseItemSize / 2;
//   });
//   const targetSize = useTransform(
//     mouseDistance,
//     [-distance, 0, distance],
//     [baseItemSize, magnification, baseItemSize]
//   );
//   const size = useSpring(targetSize, spring);
//   return (
//     <motion.div
//       ref={ref}
//       style={{
//         width: size,
//         height: size,
//       }}
//       onHoverStart={() => isHovered.set(1)}
//       onHoverEnd={() => isHovered.set(0)}
//       onFocus={() => isHovered.set(1)}
//       onBlur={() => isHovered.set(0)}
//       onClick={onClick}
//       className={`relative inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border-gray-200 border-2 shadow-lg hover:shadow-xl transition-shadow ${className}`}
//       tabIndex={0}
//       role="button"
//       aria-haspopup="true"
//     >
//       {Children.map(children, (child) =>
//         cloneElement(child as React.ReactElement, { isHovered })
//       )}
//     </motion.div>
//   );
// }

// function DockLabel({ children, className = "", ...rest }: { children: React.ReactNode; className?: string; isHovered?: any }) {
//   const { isHovered } = rest;
//   const [isVisible, setIsVisible] = useState(false);
//   useEffect(() => {
//     if (!isHovered) return;
//     const unsubscribe = isHovered.on("change", (latest: number) => {
//       setIsVisible(latest === 1);
//     });
//     return () => unsubscribe();
//   }, [isHovered]);
//   return (
//     <AnimatePresence>
//       {isVisible && (
//         <motion.div
//           initial={{ opacity: 0, y: 0 }}
//           animate={{ opacity: 1, y: -10 }}
//           exit={{ opacity: 0, y: 0 }}
//           transition={{ duration: 0.2 }}
//           className={`${className} absolute -top-8 left-1/2 w-fit whitespace-pre rounded-md border border-gray-200 bg-white/95 backdrop-blur-sm px-2 py-1 text-xs text-gray-800 shadow-lg`}
//           role="tooltip"
//           style={{ x: "-50%" }}
//         >
//           {children}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// function DockIcon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
//   return (
//     <div className={`flex items-center justify-center text-gray-700 ${className}`}>
//       {children}
//     </div>
//   );
// }

// export default function Dock({
//   items,
//   className = "",
//   spring = { mass: 0.1, stiffness: 150, damping: 12 },
//   magnification = 70,
//   distance = 200,
//   panelHeight = 64,
//   dockHeight = 256,
//   baseItemSize = 50,
// }: {
//   items: Array<{
//     icon: React.ReactNode;
//     label: string;
//     onClick: () => void;
//     className?: string;
//   }>;
//   className?: string;
//   spring?: any;
//   magnification?: number;
//   distance?: number;
//   panelHeight?: number;
//   dockHeight?: number;
//   baseItemSize?: number;
// }) {
//   const mouseX = useMotionValue(Infinity);
//   const isHovered = useMotionValue(0);
//   const maxHeight = useMemo(
//     () => Math.max(dockHeight, magnification + magnification / 2 + 4),
//     [magnification, dockHeight]
//   );
//   const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
//   const height = useSpring(heightRow, spring);
  
//   return (
//     <motion.div
//       style={{ height, scrollbarWidth: "none" }}
//       className="mx-2 flex max-w-full items-center fixed bottom-0 left-0 right-0 z-50"
//     >
//       <motion.div
//         onMouseMove={({ pageX }) => {
//           isHovered.set(1);
//           mouseX.set(pageX);
//         }}
//         onMouseLeave={() => {
//           isHovered.set(0);
//           mouseX.set(Infinity);
//         }}
//         className={`${className} absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-end w-fit gap-3 rounded-2xl border-gray-200/50 border-2 pb-2 px-4 bg-white/80 backdrop-blur-md shadow-2xl`}
//         style={{ height: panelHeight }}
//         role="toolbar"
//         aria-label="Application dock"
//       >
//         {items.map((item, index) => (
//           <DockItem
//             key={index}
//             onClick={item.onClick}
//             className={item.className}
//             mouseX={mouseX}
//             spring={spring}
//             distance={distance}
//             magnification={magnification}
//             baseItemSize={baseItemSize}
//           >
//             <DockIcon>{item.icon}</DockIcon>
//             <DockLabel>{item.label}</DockLabel>
//           </DockItem>
//         ))}
//       </motion.div>
//     </motion.div>
//   );
// }