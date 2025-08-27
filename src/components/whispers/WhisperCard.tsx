// // src/components/whispers/WhisperCard.tsx

// import React, { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { motion } from 'framer-motion';
// import { 
//   Heart, 
//   MessageCircle, 
//   Share2, 
//   Lock, 
//   Moon, 
//   Sun, 
//   CloudRain, 
//   Zap, 
//   Sparkles,
//   Shield,
//   Cloud,
//   Smile,
//   BookOpen,
//   Theater,
//   Star
// } from 'lucide-react';
// import { Whisper } from '@/types/whispers';
// import { WhisperService } from '@/lib/services/WhisperService';
// import { WhisperComments } from './WhisperComments';
// import { Card, CardContent } from '@/components/ui/card';


// interface WhisperCardProps {
//   whisper: Whisper;
//   onLike: (whisperId: string) => void;
//   onComment: (whisperId: string, comment: string) => void;
// }

// export function WhisperCard({ whisper, onLike, onComment }: WhisperCardProps) {
//   const [showComments, setShowComments] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const { data: session } = useSession();

//   useEffect(() => {
//     // Check if user has liked this whisper
//     const checkLikeStatus = async () => {
//       if (session?.user?.id) {
//         try {
//           const liked = await WhisperService.checkUserLike(whisper.id, session.user.id);
//           setIsLiked(liked);
//         } catch (error) {
//           console.error('Error checking like status:', error);
//         }
//       }
//     };

//     checkLikeStatus();
//   }, [whisper.id, session?.user?.id]);

//   // Update like state when whisper data changes (after like/unlike)
//   useEffect(() => {
//     if (session?.user?.id && !isLoading) {
//       const checkLikeStatus = async () => {
//         try {
//           const liked = await WhisperService.checkUserLike(whisper.id, session.user.id);
//           setIsLiked(liked);
//         } catch (error) {
//           console.error('Error checking like status:', error);
//         }
//       };
//       checkLikeStatus();
//     }
//   }, [whisper.likes_count, whisper.id, session?.user?.id, isLoading]);

//   const handleLike = async () => {
//     if (!session?.user?.id || isLoading) return;
    
//     setIsLoading(true);
    
//     try {
//       // Call the parent handler which will update the whisper data
//       await onLike(whisper.id);
      
//       // The real-time subscription will update the counts automatically
//       // and the useEffect will update the like state
//     } catch (error) {
//       console.error('Error liking whisper:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleShare = async () => {
//     const shareData = {
//       title: 'Check out this whisper',
//       text: whisper.content.length > 100 
//         ? whisper.content.substring(0, 100) + '...' 
//         : whisper.content,
//       url: window.location.href
//     };

//     try {
//       // Check if Web Share API is supported
//       if (navigator.share) {
//         await navigator.share(shareData);
//       } else {
//         // Fallback: Copy to clipboard
//         await navigator.clipboard.writeText(
//           `${shareData.text}\n\n${shareData.url}`
//         );
        
//         // Show success notification using a simple approach
//         showNotification('Whisper copied to clipboard!', 'success');
//       }
//     } catch (error) {
//       console.error('Error sharing:', error);
//       showNotification('Failed to share whisper', 'error');
//     }
//   };

//   const showNotification = (message: string, type: 'success' | 'error') => {
//     const notification = document.createElement('div');
//     notification.textContent = message;
//     notification.className = `fixed top-4 right-4 ${
//       type === 'success' ? 'bg-green-500' : 'bg-red-500'
//     } text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`;
    
//     document.body.appendChild(notification);
    
//     // Animate in
//     setTimeout(() => {
//       notification.style.transform = 'translateY(0)';
//       notification.style.opacity = '1';
//     }, 10);
    
//     // Remove after 3 seconds
//     setTimeout(() => {
//       notification.style.transform = 'translateY(-20px)';
//       notification.style.opacity = '0';
//       setTimeout(() => {
//         if (document.body.contains(notification)) {
//           document.body.removeChild(notification);
//         }
//       }, 300);
//     }, 3000);
//   };

//   const getMoodIcon = (mood: string) => {
//     const iconProps = "w-4 h-4";
//     const moodIcons: Record<string, React.ReactElement> = {
//       mysterious: <Moon className={iconProps} />,
//       happy: <Sun className={iconProps} />,
//       sad: <CloudRain className={iconProps} />,
//       exciting: <Zap className={iconProps} />,
//       love: <Heart className={iconProps} />,
//       funny: <Smile className={iconProps} />,
//     };
//     return moodIcons[mood] || <Sparkles className={iconProps} />;
//   };

//   const getCategoryIcon = (category: string) => {
//     const iconProps = "w-3 h-3";
//     const categoryIcons: Record<string, React.ReactElement> = {
//       confession: <Theater className={iconProps} />,
//       secret: <Shield className={iconProps} />,
//       dream: <Cloud className={iconProps} />,
//       crush: <Heart className={iconProps} />,
//       funny: <Smile className={iconProps} />,
//       'life-story': <BookOpen className={iconProps} />,
//     };
//     return categoryIcons[category] || <MessageCircle className={iconProps} />;
//   };

//   const formatTimeAgo = (dateString: string) => {
//     const now = new Date();
//     const date = new Date(dateString);
//     const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
//     if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
//     return date.toLocaleDateString();
//   };

//   // Get mood-based accent color (minimal approach)
//   const getMoodAccent = (mood: string) => {
//     const accents: Record<string, string> = {
//       mysterious: 'border-l-purple-500',
//       happy: 'border-l-amber-500',
//       sad: 'border-l-blue-500',
//       exciting: 'border-l-pink-500',
//       love: 'border-l-rose-500',
//       funny: 'border-l-green-500',
//     };
//     return accents[mood] || 'border-l-gray-400';
//   };

//   // Get mood-based category background
//   const getMoodCategoryBg = (mood: string) => {
//     const backgrounds: Record<string, string> = {
//       mysterious: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
//       happy: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
//       sad: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
//       exciting: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
//       love: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
//       funny: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
//     };
//     return backgrounds[mood] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
//   };

//   // Get mood-based content highlight
//   const getMoodContentBg = (mood: string) => {
//     const backgrounds: Record<string, string> = {
//       mysterious: 'bg-purple-50 dark:bg-purple-900/10 border-l-purple-300 dark:border-l-purple-600',
//       happy: 'bg-amber-50 dark:bg-amber-900/10 border-l-amber-300 dark:border-l-amber-600',
//       sad: 'bg-blue-50 dark:bg-blue-900/10 border-l-blue-300 dark:border-l-blue-600',
//       exciting: 'bg-pink-50 dark:bg-pink-900/10 border-l-pink-300 dark:border-l-pink-600',
//       love: 'bg-rose-50 dark:bg-rose-900/10 border-l-rose-300 dark:border-l-rose-600',
//       funny: 'bg-green-50 dark:bg-green-900/10 border-l-green-300 dark:border-l-green-600',
//     };
//     return backgrounds[mood] || 'bg-gray-50 dark:bg-gray-800/50 border-l-gray-300 dark:border-l-gray-600';
//   };

//   const moodAccent = getMoodAccent(whisper.mood);
//   const categoryBg = getMoodCategoryBg(whisper.mood);
//   const contentBg = getMoodContentBg(whisper.mood);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       whileHover={{ scale: 1.025, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)' }}
//       className="transition-transform duration-200"
//     >
//       <Card
//         className="relative rounded-4xl bg-[#181A20] border-3 border-[#ee0000] shadow-indigo-400 overflow-hidden px-6 py-7 flex flex-col min-h-[220px]"
//         style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
//       >
//         {/* Subtle geometric background overlay */}
//         <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{background: 'repeating-linear-gradient(135deg, #23262F 0 8px, transparent 8px 16px)'}} />
//         {/* Small badge/logo in corner */}
//         <div className="absolute bottom-5 right-6 z-20">
          
//           <div className="bg-white text-black font-bold rounded-md px-2 py-1 text-xs shadow">
            
//               <img 
//                 src="/logo2.png" 
//                 alt="BlindCharm Logo" 
//                 className="h-3 w-auto"
//                 />
//           </div>
//         </div>
//         <CardContent className="relative z-20 flex flex-col h-full p-0">
//           {/* Main text */}
//           <div className="flex-1 flex flex-col justify-center">
//             <p className="text-white text-l font-extrabold leading-tight mb-2 font-blindcharm-brand bg-[#ee0000] px-2 py-4 rounded-2xl  ">
//               {whisper.content}
//             </p>
//           <div>
//             <div className={`flex items-center gap-2 ${categoryBg} px-3 py-0.5 rounded-full text-xs font-blindcharm-tech ${moodAccent}`}>
//               {getMoodIcon(whisper.mood)}
//               {whisper.mood.charAt(0).toUpperCase() + whisper.mood.slice(1)}
//             </div>
//           </div>
           
//           </div>
//           {/* Details row */}
//           <div className="flex items-center justify-between mt-4">
//             <div className="flex items-center gap-3">
//               {whisper.is_anonymous ? (
//                 <div className="flex items-center gap-2">
//                   <div className="w-8 h-8 bg-[#23262F] rounded-full flex items-center justify-center border border-[#353945]">
//                     <Lock className="w-4 h-4 text-gray-400" />
//                   </div>
//                   <span className="text-sm font-medium text-gray-300">Anonymous</span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <img
//                     src={whisper.user?.profile_picture || '/default-avatar.png'}
//                     alt={whisper.user?.username}
//                     className="w-8 h-8 rounded-full object-cover border border-[#353945]"
//                   />
//                   <span className="text-sm font-medium text-gray-300">{whisper.user?.username}</span>
//                 </div>
//               )}
//               <span className="text-xs text-gray-500">{formatTimeAgo(whisper.created_at)}</span>
//             </div>
//             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#23262F] text-yellow-400 text-xs font-semibold rounded-full">
//               {getCategoryIcon(whisper.category)}
//               {whisper.category.replace('-', ' ')}
//             </span>
//           </div>
//           {/* Action buttons */}
//           <div className="flex items-center gap-6 pt-5 mt-4 border-t border-[#23262F]">
//             <button
//               onClick={handleLike}
//               disabled={isLoading}
//               className={`flex items-center gap-1.5 text-base font-semibold transition-colors ${
//                 isLiked 
//                   ? 'text-yellow-400' 
//                   : 'text-gray-400 hover:text-yellow-400'
//               } ${isLoading ? 'opacity-50' : ''}`}
//             >
//               <Heart 
//                 className="w-5 h-5" 
//                 fill={isLiked ? 'currentColor' : 'none'} 
//               />
//               <span>{whisper.likes_count}</span>
//             </button>
//             <button
//               onClick={() => setShowComments(!showComments)}
//               className="flex items-center gap-1.5 text-base text-gray-400 hover:text-yellow-400 transition-colors font-semibold"
//             >
//               <MessageCircle className="w-5 h-5" />
//               <span>{whisper.comments_count}</span>
//             </button>
//             <button 
//               onClick={handleShare}
//               className="flex items-center gap-1.5 text-base text-gray-400 hover:text-yellow-400 transition-colors font-semibold"
//             >
//               <Share2 className="w-5 h-5" />
//               <span>Share</span>
//             </button>
//           </div>
//         </CardContent>
//         {/* Comments section */}
//         {showComments && (
//           <div className="border-t border-[#23262F] bg-[#1A1C23]">
//             <WhisperComments
//               whisperId={whisper.id}
//               onComment={onComment}
//             />
//           </div>
//         )}
//       </Card>
//     </motion.div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Lock, 
  Moon, 
  Sun, 
  CloudRain, 
  Zap, 
  Sparkles,
  Shield,
  Cloud,
  Smile,
  BookOpen,
  Theater,
  User
} from 'lucide-react';
import { Whisper } from '@/types/whispers';
import { WhisperService } from '@/lib/services/WhisperService';
import { CommentsDrawer } from './CommentsDrawer';
import { Card, CardContent } from '@/components/ui/card';

interface WhisperCardProps {
  whisper: Whisper;
  onLike: (whisperId: string) => void;
  onComment: (whisperId: string, comment: string) => void;
}

export function WhisperCard({ whisper, onLike, onComment }: WhisperCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Check if user has liked this whisper
    const checkLikeStatus = async () => {
      if (session?.user?.id) {
        try {
          const liked = await WhisperService.checkUserLike(whisper.id, session.user.id);
          setIsLiked(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };

    checkLikeStatus();
  }, [whisper.id, session?.user?.id]);

  // Update like state when whisper data changes (after like/unlike)
  useEffect(() => {
    if (session?.user?.id && !isLoading) {
      const checkLikeStatus = async () => {
        try {
          const liked = await WhisperService.checkUserLike(whisper.id, session.user.id);
          setIsLiked(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      };
      checkLikeStatus();
    }
  }, [whisper.likes_count, whisper.id, session?.user?.id, isLoading]);

  const handleLike = async () => {
    if (!session?.user?.id || isLoading) return;
    
    setIsLoading(true);
    
    try {
      await onLike(whisper.id);
    } catch (error) {
      console.error('Error liking whisper:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Check out this whisper',
      text: whisper.content.length > 100 
        ? whisper.content.substring(0, 100) + '...' 
        : whisper.content,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n\n${shareData.url}`
        );
        showNotification('Whisper copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showNotification('Failed to share whisper', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
      notification.style.transform = 'translateY(-20px)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const getMoodIcon = (mood: string) => {
    const iconProps = "w-4 h-4";
    const moodIcons: Record<string, React.ReactElement> = {
      mysterious: <Moon className={iconProps} />,
      happy: <Sun className={iconProps} />,
      sad: <CloudRain className={iconProps} />,
      exciting: <Zap className={iconProps} />,
      love: <Heart className={iconProps} />,
      funny: <Smile className={iconProps} />,
    };
    return moodIcons[mood] || <Sparkles className={iconProps} />;
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = "w-3 h-3";
    const categoryIcons: Record<string, React.ReactElement> = {
      confession: <Theater className={iconProps} />,
      secret: <Shield className={iconProps} />,
      dream: <Cloud className={iconProps} />,
      crush: <Heart className={iconProps} />,
      funny: <Smile className={iconProps} />,
      'life-story': <BookOpen className={iconProps} />,
    };
    return categoryIcons[category] || <MessageCircle className={iconProps} />;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getMoodCategoryBg = (mood: string) => {
    const backgrounds: Record<string, string> = {
      mysterious: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      happy: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      sad: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      exciting: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
      love: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
      funny: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    };
    return backgrounds[mood] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  // Helper function to get user avatar
  const getUserAvatar = (user: any) => {
    return user?.image || user?.profile_picture || '/default-avatar.png';
  };

  const categoryBg = getMoodCategoryBg(whisper.mood);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.025, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)' }}
      className="transition-transform duration-200"
    >
      <Card
        className="relative rounded-4xl bg-[#181A20] border-3 border-[#ee0000] shadow-indigo-400 overflow-hidden px-6 py-7 flex flex-col min-h-[220px]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Subtle geometric background overlay */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{background: 'repeating-linear-gradient(135deg, #23262F 0 8px, transparent 8px 16px)'}} />
        
        {/* Small badge/logo in corner */}
        <div className="absolute bottom-5 right-6 z-20">
          <div className="bg-white text-black font-bold rounded-md px-2 py-1 text-xs shadow">
            <img 
              src="/logo2.png" 
              alt="BlindCharm Logo" 
              className="h-3 w-auto"
            />
          </div>
        </div>
        
        <CardContent className="relative z-20 flex flex-col h-full p-0">
          {/* Main text */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-white text-l font-extrabold leading-tight mb-2 font-blindcharm-brand bg-[#ee0000] px-2 py-4 rounded-2xl">
              {whisper.content}
            </p>
            <div>
              <div className={`flex items-center gap-2 ${categoryBg} px-3 py-0.5 rounded-full text-xs font-blindcharm-tech`}>
                {getMoodIcon(whisper.mood)}
                {whisper.mood.charAt(0).toUpperCase() + whisper.mood.slice(1)}
              </div>
            </div>
          </div>

          {/* Details row */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {whisper.is_anonymous ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#23262F] rounded-full flex items-center justify-center border border-[#353945]">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">Anonymous</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <img
                    src={getUserAvatar(whisper.user)}
                    alt={whisper.user?.username || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-[#353945]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                  />
                  <span className="text-sm font-medium text-gray-300">{whisper.user?.username}</span>
                </div>
              )}
              <span className="text-xs text-gray-500">{formatTimeAgo(whisper.created_at)}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#23262F] text-yellow-400 text-xs font-semibold rounded-full">
              {getCategoryIcon(whisper.category)}
              {whisper.category.replace('-', ' ')}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-6 pt-5 mt-4 border-t border-[#23262F]">
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center gap-1.5 text-base font-semibold transition-colors ${
                isLiked 
                  ? 'text-yellow-400' 
                  : 'text-gray-400 hover:text-yellow-400'
              } ${isLoading ? 'opacity-50' : ''}`}
            >
              <Heart 
                className="w-5 h-5" 
                fill={isLiked ? 'currentColor' : 'none'} 
              />
              <span>{whisper.likes_count}</span>
            </button>

            {/* Comments button wrapped with CommentsDrawer */}
            <CommentsDrawer
              whisperId={whisper.id}
              commentsCount={whisper.comments_count}
              onComment={onComment}
            >
              <button className="flex items-center gap-1.5 text-base text-gray-400 hover:text-yellow-400 transition-colors font-semibold">
                <MessageCircle className="w-5 h-5" />
                <span>{whisper.comments_count}</span>
              </button>
            </CommentsDrawer>

            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-base text-gray-400 hover:text-yellow-400 transition-colors font-semibold"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}