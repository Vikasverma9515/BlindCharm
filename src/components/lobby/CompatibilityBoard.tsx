import { useEffect, useState } from 'react';
import { MindMatchService } from '@/lib/services/MindMatchService';
import type { LobbyParticipant } from '@/types/lobby';
import type { MindMatchAnswer } from '@/types/mindmatch';

interface CompatibilityBoardProps {
  lobbyId: string;
  roundId: string;
  participants: LobbyParticipant[];
}

export default function CompatibilityBoard({ lobbyId, roundId, participants }: CompatibilityBoardProps) {
  const [answers, setAnswers] = useState<MindMatchAnswer[]>([]);
  const [compatibility, setCompatibility] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchAnswers = async () => {
      const allAnswers = await MindMatchService.getAllRoundAnswers(lobbyId, roundId);
      setAnswers(allAnswers);
      const comp: { [key: string]: number } = {};
      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          const userA = participants[i].user_id;
          const userB = participants[j].user_id;
          const aAnswers = allAnswers.filter(a => a.user_id === userA);
          const bAnswers = allAnswers.filter(a => a.user_id === userB);
          let matches = 0;
          let total = 0;
          aAnswers.forEach(a => {
            const b = bAnswers.find(b => b.prompt_id === a.prompt_id);
            if (b) {
              total++;
              if (a.answer_option_index === b.answer_option_index && a.answer_option_index !== undefined) matches++;
              else if (a.answer_text && b.answer_text && a.answer_text === b.answer_text) matches++;
            }
          });
          const percent = total > 0 ? Math.round((matches / total) * 100) : 0;
          comp[`${userA}_${userB}`] = percent;
        }
      }
      setCompatibility(comp);
    };
    fetchAnswers();
  }, [lobbyId, roundId, participants]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-purple-100">
      <h2 className="text-2xl font-bold mb-4">Compatibility Board</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th>User</th>
            {participants.map(p => (
              <th key={p.user_id}>{p.user?.username || p.user_id}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {participants.map((p1, i) => (
            <tr key={p1.user_id}>
              <td className="font-bold">{p1.user?.username || p1.user_id}</td>
              {participants.map((p2, j) => (
                <td key={p2.user_id} className="text-center">
                  {i === j
                    ? '--'
                    : compatibility[`${p1.user_id}_${p2.user_id}`] !== undefined
                    ? `${compatibility[`${p1.user_id}_${p2.user_id}`]}%`
                    : compatibility[`${p2.user_id}_${p1.user_id}`] !== undefined
                    ? `${compatibility[`${p2.user_id}_${p1.user_id}`]}%`
                    : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 