// src/app/(protected)/whispers/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { WhisperService } from '@/lib/services/WhisperService';
import { WhisperCard } from '@/components/whispers/WhisperCard';
import { CreateWhisperForm } from '@/components/whispers/CreateWhisperForm';
import { Whisper } from '@/types/whispers';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default function WhisperDetailPage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    loadWhispers();
  }, [session]);

  const loadWhispers = async () => {
    try {
      const data = await WhisperService.getWhispers();
      setWhispers(data);
    } catch (error) {
      console.error('Error loading whispers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWhisper = async (whisper: Partial<Whisper>) => {
    try {
      await WhisperService.createWhisper({
        ...whisper,
        user_id: session?.user?.id
      });
      loadWhispers();
    } catch (error) {
      console.error('Error creating whisper:', error);
    }
  };

  const handleLike = async (whisperId: string) => {
    if (!session?.user?.id) return;

    try {
      await WhisperService.addReaction({
        whisper_id: whisperId,
        user_id: session.user.id,
        reaction_type: 'like'
      });
      loadWhispers();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleComment = async (whisperId: string, comment: string) => {
    loadWhispers(); // Refresh whispers to update comment count
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <CreateWhisperForm onSubmit={handleCreateWhisper} />

        <div className="mt-8 space-y-6">
          {whispers.map((whisper) => (
            <WhisperCard
              key={whisper.id}
              whisper={whisper}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
        </div>
      </div>
    </div>
  );
}