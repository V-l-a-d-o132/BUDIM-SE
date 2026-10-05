import { useState, useRef, useEffect } from 'react';
import { GameNotification } from './useNotifications';
import Icon from '@/components/base/Icon';

interface NotificationBellProps {
  notifications: GameNotification[];
  unreadCount: number;
  onMarkRead: () => void;
}

const typeIcon: Record<string, string> = {
  like: 'ri-heart-fill',
  comment: 'ri-chat-1-fill',
  share: 'ri-share-forward-fill',
};

const typeColor: Record<string, string> = {
  like: 'text-red-400',
  comment: 'text-sky-400',
  share: 'text-green-400',
};

const typeLabel: Record<string, string> = {
  like: 'харесаха поста ти',
  comment: 'коментира поста ти',
  share: 'сподели поста ти',
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'сега';
  if (diff < 3600) return `${Math.floor(diff / 60)}м`;
  return `${Math.floor(diff / 3600)}ч`;
}

export default function NotificationBell({ notifications, unreadCount, onMarkRead }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const prevCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setShake(true);
      setTimeout(() => setShake(false), 700);
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) onMarkRead();
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative cursor-pointer w-5 h-5 flex items-center justify-center"
        style={{ animation: shake ? 'bellShake 0.7s ease-in-out' : 'none' }}
      >
        <Icon name="ri-notification-3-fill" size={11} className="text-white" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[10px] h-2.5 bg-red-500 rounded-full flex items-center justify-center px-0.5"
            style={{ animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <span className="text-white font-bold leading-none" style={{ fontSize: '6px' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown — positioned INSIDE the phone screen */}
      {open && (
        <div
          className="absolute z-50 bg-gray-900/95 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
          style={{
            top: '100%',
            right: 0,
            width: 180,
            marginTop: 4,
            animation: 'slideDownNotif 0.2s ease-out',
            maxHeight: 220,
          }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[9px] font-bold text-white">Известия</span>
            <button onClick={() => setOpen(false)} className="cursor-pointer">
            <Icon name="ri-close-line" size={10} className="text-white/50" />
            </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 170 }}>
            {notifications.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <Icon name="ri-notification-off-line" size={18} className="text-white/20 block mb-1" />
                <p className="text-[8px] text-white/40">Все още няма известия</p>
                <p className="text-[7px] text-white/25 mt-0.5">Публикувай пост!</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div key={n.id} className="px-3 py-2 flex items-start gap-2">
                  <Icon name={typeIcon[n.type]} size={10} className={`${typeColor[n.type]} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-white/90 leading-relaxed">
                        <span className="font-semibold">{n.actor}</span>{' '}
                        {typeLabel[n.type]}
                      </p>
                      <p className="text-[7px] text-white/40 truncate mt-0.5">"{n.postContent}..."</p>
                      <p className="text-[6px] text-white/25 mt-0.5">{timeAgo(n.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bellShake {
          0%,100%{transform:rotate(0)}
          15%{transform:rotate(18deg)}
          30%{transform:rotate(-14deg)}
          45%{transform:rotate(10deg)}
          60%{transform:rotate(-7deg)}
          75%{transform:rotate(4deg)}
          90%{transform:rotate(-2deg)}
        }
        @keyframes popIn {
          from{transform:scale(0);opacity:0}
          to{transform:scale(1);opacity:1}
        }
        @keyframes slideDownNotif {
          from{transform:translateY(-6px);opacity:0}
          to{transform:translateY(0);opacity:1}
        }
      `}</style>
    </div>
  );
}
