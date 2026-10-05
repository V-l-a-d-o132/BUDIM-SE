import { useState } from 'react';
import { CHALLENGES, type Challenge } from './types';
import Icon from '@/components/base/Icon';

interface ChallengePanelProps {
  onAccept: (challenge: Challenge) => void;
}

const platformIcons: Record<string, string> = {
  instagram: 'ri-instagram-line',
  tiktok: 'ri-music-2-fill',
  facebook: 'ri-facebook-fill',
};

const platformColors: Record<string, string> = {
  instagram: 'from-purple-500 via-pink-500 to-orange-400',
  tiktok: 'from-gray-800 to-gray-900',
  facebook: 'from-blue-600 to-blue-700',
};

export default function ChallengePanel({ onAccept }: ChallengePanelProps) {
  const [current, setCurrent] = useState<Challenge | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  const randomChallenge = () => {
    const available = CHALLENGES.filter((c) => !completed.includes(c.id));
    if (available.length === 0) {
      setCompleted([]);
      setCurrent(CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
      return;
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    setCurrent(pick);
  };

  const handleAccept = () => {
    if (!current) return;
    setCompleted((prev) => [...prev, current.id]);
    onAccept(current);
    setCurrent(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 flex items-center justify-center bg-amber-100 rounded-lg">
          <Icon name="ri-trophy-line" size={14} className="text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Предизвикателство</h4>
          <p className="text-[10px] text-gray-400">Получи конкретна тема и виж дали можеш да я направиш вирална</p>
        </div>
      </div>

      {!current ? (
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 mb-4">
            {completed.length > 0
              ? `Завърши ${completed.length} предизвикателства! Хайде за още?`
              : 'Получи случайна тема и публикувай в правилната платформа'}
          </p>
          <button
            onClick={randomChallenge}
            className="px-5 py-2.5 bg-gray-900 text-white text-xs font-medium rounded-xl cursor-pointer hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Icon name="ri-shuffle-line" size={12} className="inline mr-1.5" />
            {completed.length === 0 ? 'Вземи предизвикателство' : 'Следващо предизвикателство'}
          </button>
          {completed.length > 0 && (
            <div className="flex justify-center gap-1 mt-3">
              {CHALLENGES.map((c) => (
                <div
                  key={c.id}
                  className={`w-2 h-2 rounded-full ${completed.includes(c.id) ? 'bg-amber-400' : 'bg-gray-200'}`}
                ></div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`bg-gradient-to-br ${platformColors[current.platform]} rounded-xl p-4 text-white`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={platformIcons[current.platform]} size={14} className="text-white/80" />
              <span className="text-[10px] text-white/70 uppercase tracking-wide font-medium">{current.platform}</span>
              <span className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full ${current.goal === 'viral' ? 'bg-red-500/30 text-red-100' : 'bg-green-500/30 text-green-100'}`}>
                {current.goal === 'viral' ? '🔥 Цел: Вирален' : '✨ Цел: Качествен'}
              </span>
            </div>
            <h5 className="text-sm font-bold mb-1">{current.title}</h5>
            <p className="text-[10px] text-white/80 leading-relaxed">{current.description}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-[9px] text-amber-700 flex items-start gap-1.5">
              <Icon name="ri-lightbulb-line" size={10} className="flex-shrink-0 mt-0.5" />
              <span><strong>Подсказка:</strong> {current.hint}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 py-2 bg-gray-900 text-white text-xs font-medium rounded-xl cursor-pointer hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              <Icon name="ri-check-line" size={12} className="inline mr-1" />Приемам — отвори {current.platform}
            </button>
            <button
              onClick={() => setCurrent(null)}
              className="px-3 py-2 bg-gray-100 text-gray-600 text-xs rounded-xl cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Откажи
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
