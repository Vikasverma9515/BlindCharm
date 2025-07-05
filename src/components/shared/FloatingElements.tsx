// // components/FloatingElements.tsx
// import { motion } from 'framer-motion';
// import { useEffect, useState } from 'react';

// const FloatingElements = () => {
//   const elements = [
//     { icon: '❤️', size: '30px' },
//     { icon: '✨', size: '20px' },
//     { icon: '🦋', size: '25px' },
//     { icon: '🌸', size: '22px' },
//     { icon: '✉️', size: '28px' }
//   ];

//   return (
//     <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
//       {elements.map((element, index) => (
//         <FloatingElement 
//           key={index}
//           icon={element.icon}
//           size={element.size}
//           delay={index * 2}
//         />
//       ))}
//     </div>
//   );
// };

// const FloatingElement = ({ icon, size, delay }: { icon: string; size: string; delay: number }) => {
//   const [position, setPosition] = useState({
//     x: Math.random() * window.innerWidth,
//     y: Math.random() * window.innerHeight,
//   });

//   const floatingAnimation = {
//     y: [position.y, position.y - 100, position.y],
//     x: [position.x, position.x + 50, position.x],
//     transition: {
//       duration: 10 + Math.random() * 5,
//       repeat: Infinity,
//       ease: "easeInOut",
//       delay: delay,
//     },
//   };

//   return (
//     <motion.div
//       className="absolute"
//       animate={floatingAnimation}
//       style={{
//         fontSize: size,
//         opacity: 0.6,
//       }}
//     >
//       {icon}
//     </motion.div>
//   );
// };

// export default FloatingElements;