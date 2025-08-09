// components/VoiceMessage.tsx
import { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatDuration } from '@/utils/voice';

interface VoiceMessageProps {
  url: string;
  duration: number;
  isOwn: boolean;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({ url, duration, isOwn }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={togglePlay}
        className={`p-2 rounded-full ${
          isPlaying ? 'bg-red-600' : 'bg-red-500'
        } text-white`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        className="hidden"
      />
      <div className="flex-1">
        <div className="h-1 bg-gray-200 rounded-full">
          <div
            className="h-full bg-red-500 rounded-full transition-all"
            style={{ 
              width: `${(currentTime / duration) * 100}%` 
            }}
          />
        </div>
        <span className="text-xs text-gray-500 mt-1">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
};