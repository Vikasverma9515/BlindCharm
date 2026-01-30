// OnboardingCards.tsx
import React from 'react';
import { FiHeart, FiUser, FiMessageCircle, FiEye } from "react-icons/fi";

interface CarouselItem {
  title: string;
  description: string;
  id: number;
  icon: React.ReactElement;
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
    description: "Inside the lobby, matchmaking happens at 12 PM and 6 PM daily. You can join anytime and wait for the next match session.",
    id: 4,
    icon: <FiUser className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Step 4: Reveal Photos",
    description: "After being matched, move to a private chat room. When both of you feel ready, unlock profile pictures to see who you've been talking to.",
    id: 5,
    icon: <FiEye className="h-[16px] w-[16px] text-white" />,
  },
];

// Desktop Card Component
const DesktopCard: React.FC<CarouselItem> = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col bg-[#f00] border border-[#f90000] rounded-[16px] p-3 h-[150px] w-[220px] 
      transition-all duration-300 ease-in-out
      hover:transform hover:scale-105
      hover:border-white
      hover:shadow-lg hover:shadow-red-500/20
      hover:bg-[#ff1111]
      cursor-pointer
      group">
      <div className="mb-2">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#060010]
          transition-transform duration-300 group-hover:scale-110">
          {React.cloneElement(icon as React.ReactElement, {
            // className: "h-[16px] w-[16px] text-white transition-all duration-300 group-hover:rotate-12"
          })}
        </span>
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1
          transition-all duration-300 group-hover:text-white/90">
          {title}
        </h3>
        <p className="text-white/80 text-xs leading-tight line-clamp-4
          transition-all duration-300 group-hover:text-white">
          {description}
        </p>
      </div>
    </div>
  );
};

const OnboardingCards: React.FC = () => {
  return (
    <div className="hidden lg:block">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex justify-center gap-3">
          {DEFAULT_ITEMS.map((item) => (
            <div key={item.id} className="transform transition-transform duration-300 hover:-translate-y-1">
              <DesktopCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



export default OnboardingCards;