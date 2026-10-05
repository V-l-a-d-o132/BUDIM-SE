import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Icon from '@/components/base/Icon';
import { type GamePost, type AppId, type Challenge } from './game/types';
import { playViralSound } from './game/useSoundEffects';
import PublishForm from './game/PublishForm';
import CommentsSection from './game/CommentsSection';
import ChallengePanel from './game/ChallengePanel';
import PostHistory from './game/PostHistory';
import LikeButton from './game/LikeButton';
import RepostButton from './game/RepostButton';
import NotificationBell from './game/NotificationBell';
import { useNotifications } from './game/useNotifications';
import { usePostLimit } from './game/usePostLimit';

interface AppDef {
  id: AppId;
  name: string;
  icon: string;
  gradient: string;
  badge?: string;
}

const apps: AppDef[] = [
  { id: 'instagram', name: 'Instagram', icon: 'ri-instagram-line', gradient: 'from-purple-500 via-pink-500 to-orange-400', badge: '99+' },
  { id: 'tiktok', name: 'TikTok', icon: 'ri-music-2-fill', gradient: 'from-gray-900 to-gray-800', badge: '47' },
  { id: 'facebook', name: 'Facebook', icon: 'ri-facebook-fill', gradient: 'from-blue-600 to-blue-700', badge: '15' },
  { id: 'youtube', name: 'YouTube', icon: 'ri-youtube-fill', gradient: 'from-red-600 to-red-700', badge: '23' },
  { id: 'x', name: 'X', icon: 'ri-twitter-x-fill', gradient: 'from-gray-800 to-black' },
  { id: 'snapchat', name: 'Snapchat', icon: 'ri-snapchat-fill', gradient: 'from-yellow-400 to-yellow-500', badge: '8' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'ri-whatsapp-fill', gradient: 'from-green-500 to-green-600', badge: '12' },
  { id: 'gmail', name: 'Gmail', icon: 'ri-mail-fill', gradient: 'from-red-500 to-red-600', badge: '34' },
  { id: 'chrome', name: 'Chrome', icon: 'ri-chrome-fill', gradient: 'from-red-400 via-yellow-400 to-green-400' },
  { id: 'photos', name: 'Photos', icon: 'ri-image-fill', gradient: 'from-blue-400 to-blue-500' },
  { id: 'camera', name: 'Camera', icon: 'ri-camera-fill', gradient: 'from-gray-500 to-gray-600' },
  { id: 'settings', name: 'Settings', icon: 'ri-settings-3-fill', gradient: 'from-gray-400 to-gray-500' },
];

/* ══════════════════════════════════════════
   VIRAL TOAST
══════════════════════════════════════════ */
interface ViralToastData {
  id: string;
  username: string;
  platform: string;
  likes: number;
}

function ViralToastNotification({ toast, onDismiss }: { toast: ViralToastData; onDismiss: () => void }) {
  useEffect(() => {
    playViralSound();
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const platformIconMap: Record<string, string> = {
    instagram: 'ri-instagram-line',
    tiktok: 'ri-music-2-fill',
    facebook: 'ri-facebook-fill',
  };

  return (
    <div
      className="absolute top-8 left-2 right-2 z-40 bg-gray-900/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2"
      style={{ animation: 'slideDown 0.3s ease-out' }}
    >
      <span className="text-sm flex-shrink-0">🔥</span>
      <div className="flex-1 min-w-0">
        <p className="text-[8px] font-bold text-white truncate">{toast.username} стана вирален!</p>
        <p className="text-[7px] text-gray-400 flex items-center gap-1">
          <Icon name={platformIconMap[toast.platform] || 'ri-global-line'} size={8} />
          {toast.likes.toLocaleString()} харесвания
        </p>
      </div>
      <button onClick={onDismiss} className="cursor-pointer flex-shrink-0">
        <Icon name="ri-close-line" size={14} className="text-gray-500" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   SHARE BUTTON (inline in post)
══════════════════════════════════════════ */
function ShareButton({ post }: { post: GamePost }) {
  const [shared, setShared] = useState(false);
  const [count, setCount] = useState(post.shares);

  const handleShare = async () => {
    const text = `"${post.content.slice(0, 80)}..." — ${post.likes.toLocaleString()} лайка на ${post.platform}! ${post.is_viral ? '🔥 ВИРАЛЕН!' : ''}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Алгоритъмът на истината', text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      const newCount = count + 1;
      setShared(true);
      setCount(newCount);
      setTimeout(() => setShared(false), 2000);
      // Update shares in DB
      supabase
        .from('social_game_posts')
        .update({ shares: newCount })
        .eq('id', post.id)
        .then(() => {});
    } catch {
      // ignore
    }
  };

  return (
    <button onClick={handleShare} className="cursor-pointer flex items-center gap-0.5">
      <i className={`${shared ? 'ri-check-line text-green-500' : 'ri-share-forward-line text-gray-800'} text-base`}></i>
      {count > 0 && <span className="text-[7px] text-gray-500">{count}</span>}
    </button>
  );
}

/* ══════════════════════════════════════════
   INSTAGRAM APP
══════════════════════════════════════════ */
interface AppProps {
  onBack: () => void;
  challenge?: Challenge | null;
  onMyPostAdded?: (post: GamePost) => void;
  remaining?: number;
  onPostPublished?: () => void;
}

function InstagramApp({ onBack, challenge, onMyPostAdded, remaining = 3, onPostPublished }: AppProps) {
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showPublish, setShowPublish] = useState(false);
  const [gamePosts, setGamePosts] = useState<GamePost[]>([]);
  const [commentOpen, setCommentOpen] = useState<string | null>(null);
  const [postUsername, setPostUsername] = useState('Ти');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    supabase
      .from('social_game_posts')
      .select('*')
      .eq('platform', 'instagram')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (mounted.current && data) setGamePosts(data); });

    const channel = supabase
      .channel('ig-game-' + Date.now())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'social_game_posts' }, (payload) => {
        const p = payload.new as GamePost;
        if (!mounted.current || p.platform !== 'instagram' || !p.approved) return;
        setGamePosts((prev) => [p, ...prev]);
      })
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const staticPosts = [
    { id: 's1', user: 'travel_vibes_bg', location: 'Рила, България', verified: true, img: 'https://readdy.ai/api/search-image?query=stunning%20mountain%20landscape%20Rila%20Bulgaria%20dramatic%20peaks%20green%20valleys%20misty%20morning%20golden%20light%20professional%20travel%20photography%20wide%20angle&width=320&height=320&seq=ig_p1&orientation=squarish', likes: 12847, caption: 'Планината те учи на търпение. Всяка стъпка нагоре е избор. 🏔️ #Рила #България', comments: 234, time: '2 часа', avatar: 'from-pink-500 to-orange-400' },
    { id: 's2', user: 'foodie_sofia', location: 'Ресторант Одеон, София', verified: false, img: 'https://readdy.ai/api/search-image?query=gourmet%20restaurant%20dish%20fine%20dining%20elegant%20plating%20colorful%20vegetables%20sauce%20artistic%20presentation%20michelin%20star%20style&width=320&height=320&seq=ig_p2&orientation=squarish', likes: 3241, caption: 'Когато храната е изкуство 🍽️ Невероятно вечерно меню! #sofia #food', comments: 89, time: '5 часа', avatar: 'from-yellow-400 to-orange-500' },
  ];

  const stories = [
    { user: 'Ти', color: 'from-gray-300 to-gray-400', hasNew: false },
    { user: 'alex_m', color: 'from-pink-500 to-orange-400', hasNew: true },
    { user: 'sara.k', color: 'from-purple-500 to-pink-400', hasNew: true },
    { user: 'petko99', color: 'from-yellow-400 to-orange-500', hasNew: true },
    { user: 'mila_d', color: 'from-green-400 to-teal-500', hasNew: true },
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {showPublish && (
        <PublishForm
          platform="instagram"
          challenge={challenge}
          remaining={remaining}
          onPostPublished={onPostPublished}
          onPublish={(post) => {
            setGamePosts((prev) => [post, ...prev]);
            setPostUsername(post.username);
            setShowPublish(false);
            onMyPostAdded?.(post);
          }}
          onClose={() => setShowPublish(false)}
        />
      )}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="w-6 h-6 flex items-center justify-center cursor-pointer"><Icon name="ri-arrow-left-s-line" size={18} className="text-gray-800" /></button>
        <span className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Instagram</span>
        <div className="flex gap-2"><Icon name="ri-heart-line" size={20} className="text-gray-800" /><Icon name="ri-send-plane-line" size={20} className="text-gray-800" /></div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Stories */}
        <div className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-gray-100">
          {stories.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className={`w-9 h-9 rounded-full p-[2px] ${s.hasNew ? 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400' : 'bg-gray-200'}`}>
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center border-2 border-white`}>
                  {i === 0 ? <Icon name="ri-add-line" size={10} className="text-white" /> : <Icon name="ri-user-fill" size={10} className="text-white" />}
                </div>
              </div>
              <span className="text-[7px] text-gray-600 truncate w-9 text-center">{s.user}</span>
            </div>
          ))}
        </div>

        {/* Game posts */}
        {gamePosts.map((p) => (
          <div key={p.id} className="border-b border-gray-100">
            {p.is_viral && <div className="bg-red-50 px-3 py-1 flex items-center gap-1.5"><span className="text-[8px]">🔥</span><span className="text-[8px] text-red-600 font-medium">ВИРАЛЕН — {p.ai_label}</span></div>}
              <div className="flex items-center gap-2 px-3 py-2">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.avatar_color} flex items-center justify-center flex-shrink-0`}><Icon name="ri-user-fill" size={10} className="text-white" /></div>
                <div className="flex-1"><span className="text-[9px] font-bold text-gray-900">{p.username}</span>{!p.is_viral && <span className="text-[7px] text-gray-400 ml-1">· {p.ai_label}</span>}</div>
                <Icon name="ri-more-2-fill" size={16} className="text-gray-500" />
              </div>
            <div className="px-3 pb-2">
              <p className="text-[8px] text-gray-800 leading-relaxed mb-1.5">{p.content}</p>
              <div className="flex items-center justify-between mb-1">
                <div className="flex gap-3 items-center">
                  <LikeButton post={p} iconSize="text-base" showCount={false} />
                  <button onClick={() => setCommentOpen(commentOpen === p.id ? null : p.id)} className="cursor-pointer">
                    <Icon name="ri-chat-1-line" size={20} className="text-gray-800" />
                  </button>
                  <ShareButton post={p} />
                  <RepostButton
                    post={p}
                    targetPlatform="instagram"
                    iconSize="text-base"
                    onReposted={(newPost) => {
                      setGamePosts((prev) => [newPost, ...prev]);
                      onMyPostAdded?.(newPost);
                    }}
                  />
                </div>
                <button onClick={() => setSaved((prev) => ({ ...prev, [p.id]: !prev[p.id] }))} className="cursor-pointer">
                  {saved[p.id] ? <Icon name="ri-bookmark-fill" size={20} className="text-gray-900" /> : <Icon name="ri-bookmark-line" size={20} className="text-gray-800" />}
                </button>
              </div>
              <p className="text-[9px] font-bold text-gray-900">{p.likes.toLocaleString()} харесвания</p>
              {commentOpen === p.id && (
                <CommentsSection postId={p.id} initialCount={p.comments} username={postUsername} />
              )}
              {commentOpen !== p.id && (
                <button onClick={() => setCommentOpen(p.id)} className="text-[7px] text-gray-400 mt-0.5 cursor-pointer">
                  Виж всички {p.comments} коментара
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Static posts */}
        {staticPosts.map((p) => (
          <div key={p.id} className="border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.avatar} flex items-center justify-center flex-shrink-0`}><i className="ri-user-fill text-white text-[9px]"></i></div>
              <div className="flex-1">
                <div className="flex items-center gap-1"><span className="text-[9px] font-bold text-gray-900">{p.user}</span>{p.verified && <i className="ri-verified-badge-fill text-blue-500 text-[9px]"></i>}</div>
                <span className="text-[7px] text-gray-400">{p.location}</span>
              </div>
              <i className="ri-more-2-fill text-gray-500 text-sm"></i>
            </div>
            <img src={p.img} alt="" className="w-full aspect-square object-cover object-top" />
            <div className="px-3 pt-2 pb-1">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex gap-3">
                    <button onClick={() => setLiked((prev) => ({ ...prev, [p.id]: !prev[p.id] }))} className="cursor-pointer">{liked[p.id] ? <Icon name="ri-heart-fill" size={24} className="text-red-500" /> : <Icon name="ri-heart-line" size={24} className="text-gray-800" />}</button>
                    <Icon name="ri-chat-1-line" size={24} className="text-gray-800" />
                    <Icon name="ri-send-plane-line" size={24} className="text-gray-800" />
                  </div>
                  <button onClick={() => setSaved((prev) => ({ ...prev, [p.id]: !prev[p.id] }))} className="cursor-pointer">{saved[p.id] ? <Icon name="ri-bookmark-fill" size={24} className="text-gray-900" /> : <Icon name="ri-bookmark-line" size={24} className="text-gray-800" />}</button>
                </div>
              <p className="text-[9px] font-bold text-gray-900">{(p.likes + (liked[p.id] ? 1 : 0)).toLocaleString()} харесвания</p>
              <p className="text-[8px] text-gray-800 leading-relaxed"><span className="font-bold">{p.user}</span> {p.caption}</p>
              <p className="text-[7px] text-gray-300 mt-0.5 uppercase tracking-wide">{p.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-around items-center px-4 py-2 border-t border-gray-100 bg-white">
        <Icon name="ri-home-fill" size={20} className="text-gray-900" />
        <Icon name="ri-search-line" size={20} className="text-gray-400" />
        <button onClick={() => setShowPublish(true)} className="cursor-pointer"><div className="w-6 h-6 rounded-md border-2 border-gray-800 flex items-center justify-center"><Icon name="ri-add-line" size={12} className="text-gray-800" /></div></button>
        <Icon name="ri-video-line" size={20} className="text-gray-400" />
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center"><Icon name="ri-user-fill" size={10} className="text-white" /></div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TIKTOK APP
══════════════════════════════════════════ */
function TikTokApp({ onBack, challenge, onMyPostAdded, remaining = 3, onPostPublished }: AppProps) {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<Record<number, boolean>>({});
  const [showPublish, setShowPublish] = useState(false);
  const [gamePosts, setGamePosts] = useState<GamePost[]>([]);
  const [commentOpen, setCommentOpen] = useState<string | null>(null);
  const [postUsername, setPostUsername] = useState('Ти');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    supabase
      .from('social_game_posts')
      .select('*')
      .eq('platform', 'tiktok')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => { if (mounted.current && data) setGamePosts(data); });

    const channel = supabase
      .channel('tt-game-' + Date.now())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'social_game_posts' }, (payload) => {
        const p = payload.new as GamePost;
        if (!mounted.current || p.platform !== 'tiktok' || !p.approved) return;
        setGamePosts((prev) => [p, ...prev]);
      })
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const staticVideos = [
    { id: 'sv1', user: 'dance_queen_bg', desc: 'Новата тенденция завладя България 🔥 Опитайте и вие! #fyp #dance #тренд', song: 'Оригинален звук - dance_queen_bg', likes: '234.5K', comments: '12.3K', shares: '45.2K', img: 'https://readdy.ai/api/search-image?query=young%20energetic%20woman%20dancing%20urban%20street%20colorful%20outfit%20vibrant%20background%20dynamic%20pose%20social%20media%20influencer%20style%20professional%20photography&width=240&height=420&seq=tt_v1&orientation=portrait', avatar: 'from-pink-500 to-red-500', isViral: false },
    { id: 'sv2', user: 'chef_mario_bg', desc: 'Баница за 5 минути — рецептата, която всички чакаха! 🥐 #food #cooking #баница', song: 'Cooking Vibes', likes: '89.1K', comments: '4.2K', shares: '23.7K', img: 'https://readdy.ai/api/search-image?query=chef%20cooking%20traditional%20Bulgarian%20banitsa%20pastry%20kitchen%20hands%20rolling%20dough%20flour%20professional%20food%20video%20style%20warm%20lighting&width=240&height=420&seq=tt_v2&orientation=portrait', avatar: 'from-yellow-400 to-orange-500', isViral: false },
  ];

  const allVideos = [
    ...gamePosts.map((p) => ({
      id: p.id,
      user: p.username,
      desc: p.content,
      song: 'Оригинален звук',
      likes: p.likes >= 1000 ? `${(p.likes / 1000).toFixed(1)}K` : String(p.likes),
      comments: String(p.comments),
      shares: String(p.shares),
      img: 'https://readdy.ai/api/search-image?query=social%20media%20video%20content%20creator%20smartphone%20filming%20urban%20background%20modern%20lifestyle&width=240&height=420&seq=tt_game&orientation=portrait',
      avatar: p.avatar_color,
      isViral: p.is_viral,
      rawPost: p,
    })),
    ...staticVideos.map((v) => ({ ...v, rawPost: null as GamePost | null })),
  ];

  const safeIdx = Math.min(currentVideo, Math.max(0, allVideos.length - 1));
  const v = allVideos[safeIdx];

  if (!v) return (
    <div className="flex flex-col h-full bg-black items-center justify-center">
      <button onClick={onBack} className="text-white cursor-pointer"><i className="ri-arrow-left-s-line text-xl"></i></button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      {showPublish && (
        <PublishForm
          platform="tiktok"
          challenge={challenge}
          remaining={remaining}
          onPostPublished={onPostPublished}
          onPublish={(post) => {
            setGamePosts((prev) => [post, ...prev]);
            setPostUsername(post.username);
            setShowPublish(false);
            setCurrentVideo(0);
            onMyPostAdded?.(post);
          }}
          onClose={() => setShowPublish(false)}
        />
      )}
      <img src={v.img} alt="" className="absolute inset-0 w-full h-full object-cover object-top" style={{ filter: 'brightness(0.75)' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
      {v.isViral && <div className="absolute top-12 left-3 z-20 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><span>🔥</span> ВИРАЛЕН</div>}
      <div className="relative z-10 flex items-center justify-between px-3 pt-3 pb-2">
        <button onClick={onBack} className="cursor-pointer"><Icon name="ri-arrow-left-s-line" size={20} className="text-white" /></button>
        <div className="flex gap-4"><span className="text-[10px] text-white/60 font-medium">Следвани</span><span className="text-[10px] text-white font-bold border-b-2 border-white pb-0.5">За теб</span></div>
        <Icon name="ri-search-line" size={20} className="text-white" />
      </div>
      <div className="absolute right-2 bottom-24 z-10 flex flex-col items-center gap-4">
        <div className="relative">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${v.avatar} flex items-center justify-center border-2 border-white`}><Icon name="ri-user-fill" size={14} className="text-white" /></div>
          <button onClick={() => setFollowing((prev) => ({ ...prev, [safeIdx]: !prev[safeIdx] }))} className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer ${following[safeIdx] ? 'bg-gray-500' : 'bg-red-500'}`}>
            <Icon name={following[safeIdx] ? 'ri-check-line' : 'ri-add-line'} size={8} className="text-white" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          {v.rawPost ? (
            <LikeButton post={v.rawPost} iconSize="text-2xl" showCount={false} className="text-white" />
          ) : (
            <button onClick={() => setLiked((prev) => ({ ...prev, [v.id]: !prev[v.id] }))} className="cursor-pointer">
              <Icon name={liked[v.id] ? 'ri-heart-fill' : 'ri-heart-fill'} size={28} className={liked[v.id] ? 'text-red-500' : 'text-white'} />
            </button>
          )}
          <span className="text-[8px] text-white font-medium">{v.likes}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <button onClick={() => v.rawPost && setCommentOpen(commentOpen === v.id ? null : v.id)} className="cursor-pointer">
            <Icon name="ri-chat-1-fill" size={28} className="text-white" />
          </button>
          <span className="text-[8px] text-white font-medium">{v.comments}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          {v.rawPost ? <ShareButton post={v.rawPost} /> : <Icon name="ri-share-forward-fill" size={28} className="text-white" />}
          <span className="text-[8px] text-white font-medium">{v.shares}</span>
        </div>
        {v.rawPost && (
          <div className="flex flex-col items-center gap-0.5">
            <RepostButton
              post={v.rawPost}
              targetPlatform="tiktok"
              iconSize="text-2xl"
              onReposted={(newPost) => {
                setGamePosts((prev) => [newPost, ...prev]);
                onMyPostAdded?.(newPost);
                setCurrentVideo(0);
              }}
            />
            <span className="text-[8px] text-white font-medium">Repost</span>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}><div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-600"></div></div>
      </div>
      <div className="absolute bottom-14 left-0 right-12 z-10 px-3">
        <p className="text-[10px] font-bold text-white mb-1">@{v.user}</p>
        <p className="text-[9px] text-white/90 leading-relaxed mb-2">{v.desc}</p>
        <div className="flex items-center gap-1.5"><Icon name="ri-music-fill" size={10} className="text-white" /><p className="text-[8px] text-white/70 truncate">{v.song}</p></div>
        {commentOpen === v.id && v.rawPost && (
          <div className="mt-2 bg-black/60 rounded-xl p-2">
            <CommentsSection postId={v.rawPost.id} initialCount={v.rawPost.comments} username={postUsername} />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 backdrop-blur-sm">
        <div className="flex justify-around items-center px-4 py-2">
          <Icon name="ri-home-fill" size={20} className="text-white" />
          <Icon name="ri-compass-line" size={20} className="text-white/50" />
          <button onClick={() => setShowPublish(true)} className="cursor-pointer flex">
            <div className="w-7 h-5 bg-red-500 rounded-l-md -mr-1"></div>
            <div className="w-7 h-5 bg-white rounded-md z-10 flex items-center justify-center"><Icon name="ri-add-line" size={12} className="text-black" /></div>
            <div className="w-7 h-5 bg-teal-400 rounded-r-md -ml-1"></div>
          </button>
          <Icon name="ri-group-line" size={20} className="text-white/50" />
          <Icon name="ri-user-line" size={20} className="text-white/50" />
        </div>
      </div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
        {allVideos.slice(0, 6).map((_, i) => (
          <button key={i} onClick={() => setCurrentVideo(i)} className={`w-0.5 rounded-full cursor-pointer transition-all ${i === safeIdx ? 'h-4 bg-white' : 'h-1.5 bg-white/30'}`}></button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   FACEBOOK APP
══════════════════════════════════════════ */
function FacebookApp({ onBack, challenge, onMyPostAdded, remaining = 3, onPostPublished }: AppProps) {
  const [showPublish, setShowPublish] = useState(false);
  const [gamePosts, setGamePosts] = useState<GamePost[]>([]);
  const [commentOpen, setCommentOpen] = useState<string | null>(null);
  const [postUsername, setPostUsername] = useState('Ти');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    supabase
      .from('social_game_posts')
      .select('*')
      .eq('platform', 'facebook')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (mounted.current && data) setGamePosts(data); });

    const channel = supabase
      .channel('fb-game-' + Date.now())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'social_game_posts' }, (payload) => {
        const p = payload.new as GamePost;
        if (!mounted.current || p.platform !== 'facebook' || !p.approved) return;
        setGamePosts((prev) => [p, ...prev]);
      })
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const staticPosts = [
    { id: 'fb-s1', user: 'Мария Иванова', time: '3 часа', content: 'Невероятна вечер с приятели в Пловдив! Старият град е магичен по залез слънце ❤️', img: 'https://readdy.ai/api/search-image?query=friends%20group%20happy%20evening%20old%20town%20Plovdiv%20Bulgaria%20sunset%20warm%20light%20smiling%20people%20outdoor%20cafe&width=320&height=200&seq=fb_p1&orientation=landscape', likes: 247, comments: 34, shares: 8, reactions: ['❤️', '😍', '👍'], avatar: 'from-pink-400 to-rose-500' },
    { id: 'fb-s2', user: 'Спортен клуб Левски', time: '5 часа', content: '🏆 ПОБЕДА! Нашите момчета спечелиха с 3:1! Невероятна игра, невероятни фенове! 💙🤍', img: 'https://readdy.ai/api/search-image?query=football%20stadium%20crowd%20celebration%20victory%20fans%20cheering%20blue%20white%20colors%20night%20game%20flares%20atmosphere&width=320&height=200&seq=fb_p2&orientation=landscape', likes: 4823, comments: 892, shares: 234, reactions: ['👍', '❤️', '🎉', '😮'], avatar: 'from-blue-500 to-blue-700' },
  ];

  const stories = [
    { name: 'Мария', img: 'https://readdy.ai/api/search-image?query=woman%20smiling%20portrait%20outdoor%20natural%20light%20warm%20colors&width=64&height=96&seq=fb_s1&orientation=portrait' },
    { name: 'Левски', img: 'https://readdy.ai/api/search-image?query=football%20stadium%20night%20lights%20crowd%20atmosphere&width=64&height=96&seq=fb_s2&orientation=portrait' },
    { name: 'Иван', img: 'https://readdy.ai/api/search-image?query=man%20coffee%20shop%20casual%20portrait%20urban%20style&width=64&height=96&seq=fb_s3&orientation=portrait' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-100 relative">
      {showPublish && (
        <PublishForm
          platform="facebook"
          challenge={challenge}
          remaining={remaining}
          onPostPublished={onPostPublished}
          onPublish={(post) => {
            setGamePosts((prev) => [post, ...prev]);
            setPostUsername(post.username);
            setShowPublish(false);
            onMyPostAdded?.(post);
          }}
          onClose={() => setShowPublish(false)}
        />
      )}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="cursor-pointer"><Icon name="ri-arrow-left-s-line" size={18} className="text-gray-800" /></button>
          <span className="text-base font-bold text-blue-600">facebook</span>
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><Icon name="ri-search-line" size={14} className="text-gray-700" /></div>
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><Icon name="ri-messenger-fill" size={14} className="text-gray-700" /></div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Stories */}
        <div className="bg-white mb-2 px-3 py-2">
          <div className="flex gap-2 overflow-x-auto">
            <div className="flex-shrink-0 w-16 h-24 rounded-xl bg-gray-100 relative overflow-hidden border border-gray-200">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300 flex items-end justify-center pb-2">
                <div className="flex flex-col items-center"><div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mb-1"><Icon name="ri-add-line" size={12} className="text-white" /></div><span className="text-[7px] text-gray-700 font-medium text-center leading-tight">Добави история</span></div>
              </div>
            </div>
            {stories.map((s, i) => (
              <div key={i} className="flex-shrink-0 w-16 h-24 rounded-xl overflow-hidden relative border-2 border-blue-500">
                <img src={s.img} alt="" className="w-full h-full object-cover object-top" />
                <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center"><Icon name="ri-user-fill" size={7} className="text-white" /></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1"><span className="text-[7px] text-white font-medium">{s.name}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Publish prompt */}
        <div className="bg-white mb-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0"><Icon name="ri-user-fill" size={9} className="text-white" /></div>
            <button onClick={() => setShowPublish(true)} className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-left cursor-pointer"><span className="text-[8px] text-gray-400">Какво мислиш?</span></button>
          </div>
        </div>

        {/* Game posts */}
        {gamePosts.map((p) => (
          <div key={p.id} className="bg-white mb-2">
            {p.is_viral && <div className="bg-red-50 px-3 py-1 flex items-center gap-1.5"><span className="text-[8px]">🔥</span><span className="text-[8px] text-red-600 font-medium">ВИРАЛЕН — {p.ai_label}</span></div>}
            <div className="flex items-center gap-2 px-3 py-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.avatar_color} flex items-center justify-center flex-shrink-0`}><Icon name="ri-user-fill" size={12} className="text-white" /></div>
              <div className="flex-1"><p className="text-[9px] font-bold text-gray-900">{p.username}</p><div className="flex items-center gap-1"><span className="text-[7px] text-gray-400">Сега · </span><Icon name="ri-earth-fill" size={7} className="text-gray-400" /></div></div>
              <Icon name="ri-more-2-fill" size={16} className="text-gray-400" />
            </div>
            <p className="text-[8px] text-gray-800 leading-relaxed px-3 pb-2">{p.content}</p>
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
              <div className="flex items-center gap-1"><span className="text-[10px]">👍❤️</span><span className="text-[7px] text-gray-500">{p.likes.toLocaleString()}</span></div>
              <div className="flex gap-2"><span className="text-[7px] text-gray-500">{p.comments} коментара</span><span className="text-[7px] text-gray-500">{p.shares} споделяния</span></div>
            </div>
            <div className="flex px-2 py-1">
              <div className="flex-1 flex items-center justify-center gap-1 py-1 rounded">
                <LikeButton post={p} iconSize="text-sm" showCount={false} className="flex items-center gap-1 text-gray-500" />
                <span className="text-[8px] font-medium text-gray-500">Харесай</span>
              </div>
              <button onClick={() => setCommentOpen(commentOpen === p.id ? null : p.id)} className="flex-1 flex items-center justify-center gap-1 py-1 rounded cursor-pointer text-gray-500"><Icon name="ri-chat-1-line" size={14} /><span className="text-[8px] font-medium">Коментирай</span></button>
              <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded cursor-pointer text-gray-500"><ShareButton post={p} /><span className="text-[8px] font-medium">Сподели</span></button>
              <div className="flex-1 flex items-center justify-center gap-1 py-1 rounded">
                <RepostButton
                  post={p}
                  targetPlatform="facebook"
                  iconSize="text-sm"
                  onReposted={(newPost) => {
                    setGamePosts((prev) => [newPost, ...prev]);
                    onMyPostAdded?.(newPost);
                  }}
                />
                <span className="text-[8px] font-medium text-gray-500">Repost</span>
              </div>
            </div>
            {commentOpen === p.id && (
              <div className="px-3 pb-2">
                <CommentsSection postId={p.id} initialCount={p.comments} username={postUsername} />
              </div>
            )}
          </div>
        ))}

        {/* Static posts */}
        {staticPosts.map((p) => (
          <div key={p.id} className="bg-white mb-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.avatar} flex items-center justify-center flex-shrink-0`}><Icon name="ri-user-fill" size={12} className="text-white" /></div>
              <div className="flex-1"><p className="text-[9px] font-bold text-gray-900">{p.user}</p><div className="flex items-center gap-1"><span className="text-[7px] text-gray-400">{p.time} · </span><Icon name="ri-earth-fill" size={7} className="text-gray-400" /></div></div>
              <Icon name="ri-more-2-fill" size={16} className="text-gray-400" />
            </div>
            <p className="text-[8px] text-gray-800 leading-relaxed px-3 pb-2">{p.content}</p>
            {p.img && <img src={p.img} alt="" className="w-full object-cover object-top" style={{ maxHeight: 140 }} />}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
              <div className="flex items-center gap-1"><div className="flex">{p.reactions.slice(0, 3).map((r, ri) => <span key={ri} className="text-[10px]">{r}</span>)}</div><span className="text-[7px] text-gray-500">{p.likes.toLocaleString()}</span></div>
              <div className="flex gap-2"><span className="text-[7px] text-gray-500">{p.comments} коментара</span><span className="text-[7px] text-gray-500">{p.shares} споделяния</span></div>
            </div>
            <div className="flex px-2 py-1">
              <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded cursor-pointer text-gray-500"><Icon name="ri-thumb-up-line" size={14} /><span className="text-[8px] font-medium">Харесай</span></button>
              <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded cursor-pointer text-gray-500"><Icon name="ri-chat-1-line" size={14} /><span className="text-[8px] font-medium">Коментирай</span></button>
              <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded cursor-pointer text-gray-500"><Icon name="ri-share-forward-line" size={14} /><span className="text-[8px] font-medium">Сподели</span></button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-around items-center px-2 py-1.5 bg-white border-t border-gray-200">
        <Icon name="ri-home-fill" size={20} className="text-blue-600" />
        <Icon name="ri-group-line" size={20} className="text-gray-400" />
        <Icon name="ri-store-2-line" size={20} className="text-gray-400" />
        <Icon name="ri-notification-line" size={20} className="text-gray-400" />
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"><Icon name="ri-user-fill" size={9} className="text-white" /></div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   OTHER APPS (YouTube, WhatsApp, X, Gmail, Snapchat, Chrome, Photos, Camera, Settings)
══════════════════════════════════════════ */
function YouTubeApp({ onBack }: { onBack: () => void }) {
  const videos = [
    { title: 'Как работи алгоритъмът на YouTube', channel: 'Tech Explained BG', views: '1.2M', time: '14:32', img: 'https://readdy.ai/api/search-image?query=youtube%20algorithm%20technology%20explanation%20digital%20screen%20data%20visualization%20modern%20tech%20background&width=280&height=160&seq=yt1&orientation=landscape' },
    { title: '10 навика на успешните хора', channel: 'Мотивация БГ', views: '890K', time: '22:15', img: 'https://readdy.ai/api/search-image?query=successful%20person%20morning%20routine%20productivity%20habits%20motivational%20lifestyle%20bright%20clean%20background&width=280&height=160&seq=yt2&orientation=landscape' },
    { title: 'Пътуване в Япония 2024', channel: 'Travel with Mila', views: '456K', time: '31:08', img: 'https://readdy.ai/api/search-image?query=japan%20travel%20tokyo%20streets%20cherry%20blossoms%20traditional%20temples%20beautiful%20scenery%20travel%20vlog&width=280&height=160&seq=yt3&orientation=landscape' },
  ];
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100"><button onClick={onBack} className="cursor-pointer"><i className="ri-arrow-left-s-line text-gray-800 text-lg"></i></button><span className="text-sm font-bold text-red-600">YouTube</span><div className="flex gap-2"><i className="ri-search-line text-gray-700 text-base"></i><i className="ri-notification-line text-gray-700 text-base"></i></div></div>
      <div className="flex gap-2 px-3 py-1.5 overflow-x-auto border-b border-gray-100">{['Всички', 'Технологии', 'Музика', 'Спорт', 'Новини'].map((c, i) => <span key={i} className={`text-[8px] px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 cursor-pointer ${i === 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{c}</span>)}</div>
      <div className="flex-1 overflow-y-auto">{videos.map((v, i) => (<div key={i} className="mb-3"><div className="relative"><img src={v.img} alt="" className="w-full object-cover object-top" style={{ height: 100 }} /><span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[7px] px-1 py-0.5 rounded font-medium">{v.time}</span></div><div className="flex gap-2 px-3 pt-2"><div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><i className="ri-user-fill text-white text-[8px]"></i></div><div><p className="text-[9px] font-semibold text-gray-900 leading-tight">{v.title}</p><p className="text-[7px] text-gray-500 mt-0.5">{v.channel} · {v.views} прегледа</p></div></div></div>))}</div>
      <div className="flex justify-around items-center px-4 py-2 border-t border-gray-100"><i className="ri-home-fill text-gray-900 text-lg"></i><i className="ri-compass-line text-gray-400 text-lg"></i><i className="ri-add-circle-line text-gray-400 text-lg"></i><i className="ri-video-line text-gray-400 text-lg"></i><i className="ri-user-line text-gray-400 text-lg"></i></div>
    </div>
  );
}

function WhatsAppApp({ onBack }: { onBack: () => void }) {
  const chats = [{ name: 'Семейство ❤️', msg: 'Мама: Ела на вечеря в събота!', time: '10:23', unread: 3, avatar: 'from-green-400 to-teal-500' }, { name: 'Работа 💼', msg: 'Иван: Срещата е преместена за 15ч', time: '09:45', unread: 1, avatar: 'from-blue-400 to-blue-600' }, { name: 'Приятели 🎉', msg: 'Петко: Кой идва тази вечер?', time: 'Вчера', unread: 7, avatar: 'from-purple-400 to-pink-500' }, { name: 'Мария', msg: 'Добре, ще се видим утре 😊', time: 'Вчера', unread: 0, avatar: 'from-pink-400 to-rose-500' }];
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-3 py-2 bg-green-600"><button onClick={onBack} className="cursor-pointer"><Icon name="ri-arrow-left-s-line" size={18} className="text-white" /></button><span className="text-sm font-bold text-white">WhatsApp</span><div className="flex gap-2"><Icon name="ri-search-line" size={16} className="text-white" /><Icon name="ri-more-2-fill" size={16} className="text-white" /></div></div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">{chats.map((c, i) => (<div key={i} className="flex items-center gap-3 px-3 py-2.5"><div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.avatar} flex items-center justify-center flex-shrink-0`}><Icon name="ri-user-fill" size={14} className="text-white" /></div><div className="flex-1 min-w-0"><div className="flex justify-between items-center"><span className="text-[10px] font-semibold text-gray-900">{c.name}</span><span className={`text-[7px] ${c.unread > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{c.time}</span></div><p className="text-[8px] text-gray-500 truncate mt-0.5">{c.msg}</p></div>{c.unread > 0 && <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><span className="text-[7px] text-white font-bold">{c.unread}</span></div>}</div>))}</div>
      <div className="flex justify-around items-center px-4 py-2 border-t border-gray-100"><div className="flex flex-col items-center gap-0.5"><Icon name="ri-chat-1-fill" size={20} className="text-green-600" /><span className="text-[6px] text-green-600">Чатове</span></div><div className="flex flex-col items-center gap-0.5"><Icon name="ri-refresh-line" size={20} className="text-gray-400" /><span className="text-[6px] text-gray-400">Актуализации</span></div><div className="flex flex-col items-center gap-0.5"><Icon name="ri-group-line" size={20} className="text-gray-400" /><span className="text-[6px] text-gray-400">Общности</span></div><div className="flex flex-col items-center gap-0.5"><Icon name="ri-phone-line" size={20} className="text-gray-400" /><span className="text-[6px] text-gray-400">Обаждания</span></div></div>
    </div>
  );
}

function XApp({ onBack }: { onBack: () => void }) {
  const tweets = [{ user: 'TechBG', handle: '@techbg', time: '2м', content: 'Изкуственият интелект ще промени всичко до 2030. Въпросът е дали сме готови. 🤖', likes: 234, rt: 89, verified: true }, { user: 'Новини БГ', handle: '@novinibg', time: '15м', content: 'BREAKING: Парламентът гласува нов закон за дигиталната сигурност. Подробности следват...', likes: 1203, rt: 567, verified: true }];
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800"><button onClick={onBack} className="cursor-pointer"><Icon name="ri-arrow-left-s-line" size={18} className="text-white" /></button><Icon name="ri-twitter-x-fill" size={16} className="text-white" /><Icon name="ri-search-line" size={16} className="text-white" /></div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800">{tweets.map((t, i) => (<div key={i} className="px-3 py-2.5"><div className="flex gap-2"><div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0"><Icon name="ri-user-fill" size={9} className="text-gray-400" /></div><div className="flex-1"><div className="flex items-center gap-1 flex-wrap"><span className="text-[9px] font-bold text-white">{t.user}</span>{t.verified && <Icon name="ri-verified-badge-fill" size={9} className="text-blue-400" />}<span className="text-[8px] text-gray-500">{t.handle} · {t.time}</span></div><p className="text-[8px] text-gray-200 leading-relaxed mt-0.5">{t.content}</p><div className="flex gap-4 mt-1.5"><span className="text-[7px] text-gray-500 flex items-center gap-0.5"><Icon name="ri-chat-1-line" size={9} />89</span><span className="text-[7px] text-gray-500 flex items-center gap-0.5"><Icon name="ri-repeat-line" size={9} />{t.rt}</span><span className="text-[7px] text-gray-500 flex items-center gap-0.5"><Icon name="ri-heart-line" size={9} />{t.likes}</span></div></div></div></div>))}</div>
      <div className="flex justify-around items-center px-4 py-2 border-t border-gray-800"><Icon name="ri-home-fill" size={20} className="text-white" /><Icon name="ri-search-line" size={20} className="text-gray-500" /><Icon name="ri-notification-line" size={20} className="text-gray-500" /><Icon name="ri-mail-line" size={20} className="text-gray-500" /></div>
    </div>
  );
}

function GmailApp({ onBack }: { onBack: () => void }) {
  const emails = [{ from: 'LinkedIn', subject: 'Имате 5 нови покани', preview: 'Петър Георгиев и още 4 души...', time: '10:15', unread: true }, { from: 'Netflix', subject: 'Нови сериали тази седмица', preview: 'Не пропускайте: Squid Game S3...', time: '08:30', unread: true }, { from: 'Банка ДСК', subject: 'Извлечение за месец Март', preview: 'Вашето месечно извлечение...', time: 'Вчера', unread: false }];
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100"><button onClick={onBack} className="cursor-pointer"><Icon name="ri-arrow-left-s-line" size={18} className="text-gray-800" /></button><span className="text-sm font-bold text-gray-900">Gmail</span><Icon name="ri-search-line" size={16} className="text-gray-700" /></div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">{emails.map((e, i) => (<div key={i} className={`px-3 py-2.5 ${e.unread ? 'bg-white' : 'bg-gray-50'}`}><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><Icon name="ri-mail-line" size={10} className="text-red-500" /></div><div className="flex-1 min-w-0"><div className="flex justify-between"><span className={`text-[9px] ${e.unread ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{e.from}</span><span className="text-[7px] text-gray-400">{e.time}</span></div><p className={`text-[8px] truncate ${e.unread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{e.subject}</p><p className="text-[7px] text-gray-400 truncate">{e.preview}</p></div></div></div>))}</div>
    </div>
  );
}

function SnapchatApp({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex items-center justify-between px-3 py-2"><button onClick={onBack} className="cursor-pointer"><Icon name="ri-arrow-left-s-line" size={18} className="text-white" /></button><Icon name="ri-snapchat-fill" size={20} className="text-yellow-400" /><Icon name="ri-chat-1-line" size={16} className="text-white" /></div>
      <div className="flex-1 overflow-y-auto px-3 space-y-2 pt-2">
        <p className="text-[8px] text-gray-400 uppercase tracking-widest font-medium">Нови снапове</p>
        {[{ user: 'sara_k', type: 'snap', time: '2м' }, { user: 'alex_m', type: 'story', time: '15м' }, { user: 'petko99', type: 'snap', time: '1ч' }].map((s, i) => (<div key={i} className="flex items-center gap-2 bg-gray-900 rounded-xl p-2.5"><div className={`w-9 h-9 rounded-full flex items-center justify-center ${s.type === 'snap' ? 'bg-yellow-400' : 'bg-purple-500'}`}><Icon name="ri-user-fill" size={14} className="text-white" /></div><div><p className="text-[9px] font-semibold text-white">{s.user}</p><p className="text-[7px] text-gray-400">{s.type === 'snap' ? '📸 Snap' : '📖 Story'} · {s.time}</p></div></div>))}
      </div>
    </div>
  );
}

function ChromeApp({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex items-center gap-2"><button onClick={onBack} className="cursor-pointer"><Icon name="ri-arrow-left-s-line" size={18} className="text-gray-800" /></button><div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5"><Icon name="ri-search-line" size={12} className="text-gray-400" /><span className="text-[8px] text-gray-400">Търси или въведи адрес</span></div></div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-4 gap-2 mb-4">{[{ name: 'Google', icon: 'ri-global-line' }, { name: 'YouTube', icon: 'ri-youtube-fill' }, { name: 'Gmail', icon: 'ri-mail-line' }, { name: 'Maps', icon: 'ri-map-pin-line' }].map((s, i) => (<div key={i} className="flex flex-col items-center gap-1"><div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center"><Icon name={s.icon} size={16} className="text-gray-600" /></div><span className="text-[7px] text-gray-500">{s.name}</span></div>))}</div>
        {['Как да подобрим концентрацията', 'Топ 10 дестинации за 2024', 'Новини от света на технологиите'].map((a, i) => (<div key={i} className="bg-white rounded-lg p-2.5 mb-2 border border-gray-100"><p className="text-[8px] font-medium text-gray-800">{a}</p><p className="text-[7px] text-gray-400 mt-0.5">news.bg · 5 мин четене</p></div>))}
      </div>
    </div>
  );
}

function PhotosApp({ onBack }: { onBack: () => void }) {
  const photos = ['https://readdy.ai/api/search-image?query=family%20vacation%20beach%20summer%20happy%20moments%20candid%20photography%20natural%20light&width=100&height=100&seq=ph1&orientation=squarish', 'https://readdy.ai/api/search-image?query=birthday%20party%20celebration%20friends%20colorful%20balloons%20indoor%20photography&width=100&height=100&seq=ph2&orientation=squarish', 'https://readdy.ai/api/search-image?query=mountain%20hiking%20nature%20landscape%20adventure%20outdoor%20photography&width=100&height=100&seq=ph3&orientation=squarish', 'https://readdy.ai/api/search-image?query=food%20restaurant%20dinner%20friends%20social%20gathering%20warm%20lighting&width=100&height=100&seq=ph4&orientation=squarish', 'https://readdy.ai/api/search-image?query=city%20street%20urban%20photography%20evening%20lights%20bokeh&width=100&height=100&seq=ph5&orientation=squarish', 'https://readdy.ai/api/search-image?query=pet%20dog%20cute%20home%20indoor%20natural%20light%20portrait&width=100&height=100&seq=ph6&orientation=squarish'];
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100"><button onClick={onBack} className="cursor-pointer"><i className="ri-arrow-left-s-line text-gray-800 text-lg"></i></button><span className="text-sm font-bold text-gray-900">Снимки</span><i className="ri-search-line text-gray-700 text-base"></i></div>
      <div className="flex-1 overflow-y-auto"><div className="grid grid-cols-3 gap-0.5">{photos.map((p, i) => <img key={i} src={p} alt="" className="w-full aspect-square object-cover object-top" />)}</div></div>
    </div>
  );
}

function CameraApp({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex-1 relative">
        <img src="https://readdy.ai/api/search-image?query=camera%20viewfinder%20view%20urban%20street%20scene%20natural%20photography%20perspective%20realistic&width=280&height=400&seq=cam1&orientation=portrait" alt="" className="w-full h-full object-cover object-top" />
        <button onClick={onBack} className="absolute top-3 left-3 cursor-pointer z-10"><i className="ri-arrow-left-s-line text-white text-xl"></i></button>
        <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 border-2 border-white/60 rounded-lg"></div></div>
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-4">{['Видео', 'Снимка', 'Портрет'].map((m, i) => <span key={i} className={`text-[8px] ${i === 1 ? 'text-yellow-400 font-bold' : 'text-white/60'}`}>{m}</span>)}</div>
      </div>
      <div className="bg-black px-4 py-3 flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-600"><img src="https://readdy.ai/api/search-image?query=last%20photo%20taken%20thumbnail%20small%20preview&width=36&height=36&seq=cam2&orientation=squarish" alt="" className="w-full h-full object-cover" /></div>
        <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center cursor-pointer"><div className="w-9 h-9 rounded-full bg-white"></div></div>
        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer"><i className="ri-refresh-line text-white text-sm"></i></div>
      </div>
    </div>
  );
}

function SettingsApp({ onBack }: { onBack: () => void }) {
  const items = [{ icon: 'ri-wifi-fill', label: 'Wi-Fi', value: 'Home_Network', color: 'bg-blue-500' }, { icon: 'ri-bluetooth-fill', label: 'Bluetooth', value: 'Включен', color: 'bg-blue-600' }, { icon: 'ri-notification-fill', label: 'Известия', value: '', color: 'bg-red-500' }, { icon: 'ri-contrast-2-line', label: 'Дисплей', value: '', color: 'bg-gray-600' }, { icon: 'ri-battery-fill', label: 'Батерия', value: '87%', color: 'bg-green-500' }, { icon: 'ri-lock-line', label: 'Заключване', value: '', color: 'bg-gray-700' }];
  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex items-center gap-2"><button onClick={onBack} className="cursor-pointer"><Icon name="ri-arrow-left-s-line" size={18} className="text-gray-800" /></button><span className="text-sm font-bold text-gray-900">Настройки</span></div>
      <div className="flex-1 overflow-y-auto"><div className="bg-white mx-2 mt-2 rounded-xl overflow-hidden divide-y divide-gray-100">{items.map((item, i) => (<div key={i} className="flex items-center gap-3 px-3 py-2.5"><div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}><Icon name={item.icon} size={12} className="text-white" /></div><span className="text-[9px] text-gray-800 flex-1">{item.label}</span>{item.value && <span className="text-[8px] text-gray-400">{item.value}</span>}<Icon name="ri-arrow-right-s-line" size={14} className="text-gray-300" /></div>))}</div></div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HOME SCREEN
══════════════════════════════════════════ */
function HomeScreen({ onAppOpen, phone }: { onAppOpen: (id: AppId) => void; phone: 'ios' | 'android' }) {
  const isAndroid = phone === 'android';

  const dockApps = isAndroid
    ? [
        { icon: 'ri-phone-fill', color: 'from-green-500 to-green-600' },
        { icon: 'ri-message-3-fill', color: 'from-sky-500 to-sky-600' },
        { icon: 'ri-chrome-fill', color: 'from-amber-400 to-red-500' },
        { icon: 'ri-apps-fill', color: 'from-gray-500 to-gray-700' },
      ]
    : [
        { icon: 'ri-phone-fill', color: 'from-green-500 to-green-600' },
        { icon: 'ri-message-3-fill', color: 'from-green-400 to-teal-500' },
        { icon: 'ri-safari-fill', color: 'from-sky-400 to-sky-600' },
        { icon: 'ri-music-fill', color: 'from-pink-500 to-rose-500' },
      ];

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{
        background: isAndroid
          ? 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
          : 'linear-gradient(160deg, #667eea 0%, #764ba2 40%, #f093fb 100%)',
      }}
    >
      {/* Date widget (Android) */}
      {isAndroid && (
        <div className="px-5 pt-3 pb-2 text-center">
          <p className="text-white/50 text-[9px] font-medium tracking-widest uppercase">Събота</p>
          <p className="text-white text-3xl font-thin leading-none mt-0.5">18</p>
          <p className="text-white/40 text-[8px] mt-0.5">Април 2026</p>
        </div>
      )}

      {/* iOS time widget */}
      {!isAndroid && (
        <div className="px-5 pt-4 pb-2 text-center">
          <p className="text-white/60 text-[9px] font-medium tracking-widest uppercase">Събота, 18 Април</p>
          <p className="text-white text-3xl font-thin leading-none mt-0.5">9:41</p>
        </div>
      )}

      {/* App grid */}
      <div className="flex-1 px-3 pt-1">
        <div className="grid grid-cols-4 gap-x-2 gap-y-3">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => onAppOpen(app.id)}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 ${isAndroid ? 'rounded-2xl' : 'rounded-[14px]'} bg-gradient-to-br ${app.gradient} flex items-center justify-center`}
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                >
                  <Icon name={app.icon} size={20} className="text-white" />
                </div>
                {app.badge && (
                  <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center px-1"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                    <span className="text-white font-bold leading-none" style={{ fontSize: '7px' }}>{app.badge}</span>
                  </div>
                )}
              </div>
              <span className="text-[8px] text-white/90 text-center leading-tight font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dock */}
      {isAndroid ? (
        <div className="px-3 pb-3">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl px-3 py-2.5 border border-white/15">
            <div className="flex justify-around items-center">
              {dockApps.map((item, i) => (
                <div key={i} className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  <Icon name={item.icon} size={20} className="text-white" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="w-24 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="px-3 pb-4">
          <div className="bg-white/20 backdrop-blur-md rounded-3xl px-3 py-2.5 border border-white/20">
            <div className="flex justify-around items-center">
              {dockApps.map((item, i) => (
                <div key={i} className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  <Icon name={item.icon} size={20} className="text-white" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="w-24 h-1 bg-white/40 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   PHONE SHELL
══════════════════════════════════════════ */
function PhoneShell({ phone, grayscaleOn, openApp, onAppOpen, onAppClose, activeChallenge, onMyPostAdded, remaining, onPostPublished, notifications, unreadCount, onMarkRead }: {
  phone: 'ios' | 'android';
  grayscaleOn: boolean;
  openApp: AppId | null;
  onAppOpen: (id: AppId) => void;
  onAppClose: () => void;
  activeChallenge?: Challenge | null;
  onMyPostAdded?: (post: GamePost) => void;
  remaining?: number;
  onPostPublished?: () => void;
  notifications: import('./game/useNotifications').GameNotification[];
  unreadCount: number;
  onMarkRead: () => void;
}) {
  const isAndroid = phone === 'android';
  const [slideIn, setSlideIn] = useState(false);
  const [renderedApp, setRenderedApp] = useState<AppId | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [viralToast, setViralToast] = useState<ViralToastData | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const channel = supabase
      .channel('viral-toast-' + Date.now())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'social_game_posts' }, (payload) => {
        if (!mounted.current) return;
        const p = payload.new as GamePost;
        if (p.is_viral) {
          setViralToast({ id: p.id, username: p.username, platform: p.platform, likes: p.likes });
        }
      })
      .subscribe();
    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (openApp) {
      setRenderedApp(openApp);
      setSlideIn(false);
      timerRef.current = setTimeout(() => { if (mounted.current) setSlideIn(true); }, 20);
    } else {
      setSlideIn(false);
      timerRef.current = setTimeout(() => { if (mounted.current) setRenderedApp(null); }, 320);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [openApp]);

  const renderApp = () => {
    if (!renderedApp) return null;
    const props = { onBack: onAppClose, challenge: activeChallenge, onMyPostAdded, remaining, onPostPublished };
    switch (renderedApp) {
      case 'instagram': return <InstagramApp {...props} />;
      case 'tiktok': return <TikTokApp {...props} />;
      case 'facebook': return <FacebookApp {...props} />;
      case 'youtube': return <YouTubeApp onBack={onAppClose} />;
      case 'x': return <XApp onBack={onAppClose} />;
      case 'snapchat': return <SnapchatApp onBack={onAppClose} />;
      case 'whatsapp': return <WhatsAppApp onBack={onAppClose} />;
      case 'gmail': return <GmailApp onBack={onAppClose} />;
      case 'chrome': return <ChromeApp onBack={onAppClose} />;
      case 'photos': return <PhotosApp onBack={onAppClose} />;
      case 'camera': return <CameraApp onBack={onAppClose} />;
      case 'settings': return <SettingsApp onBack={onAppClose} />;
      default: return null;
    }
  };

  // Status bar height
  const STATUS_H = 28;

  const screenContent = (
    <div className="w-full h-full overflow-hidden relative flex flex-col">
      {/* ── STATUS BAR ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 z-30 relative"
        style={{
          height: STATUS_H,
          background: isAndroid ? 'transparent' : 'rgba(0,0,0,0.85)',
        }}
      >
        {/* Left: time */}
        <span className="text-[10px] font-semibold text-white" style={{ letterSpacing: '-0.3px' }}>9:41</span>

        {/* Center: notch (iOS) or punch-hole (Android) */}
        {!isAndroid && (
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-24 h-6 bg-black rounded-b-2xl z-10 flex items-center justify-center gap-1.5 pt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
            <div className="w-8 h-1 rounded-full bg-gray-800"></div>
          </div>
        )}
        {isAndroid && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-2.5 h-2.5 rounded-full bg-black border border-gray-800 z-10"></div>
        )}

        {/* Right: notification bell + icons */}
        <div className="flex items-center gap-1.5 relative">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={onMarkRead}
          />
          <i className="ri-signal-wifi-fill text-white" style={{ fontSize: 10 }}></i>
          <i className="ri-battery-fill text-white" style={{ fontSize: 10 }}></i>
        </div>
      </div>

      {/* ── VIRAL TOAST ── */}
      {viralToast && (
        <div className="absolute left-2 right-2 z-40" style={{ top: STATUS_H + 4 }}>
          <ViralToastNotification toast={viralToast} onDismiss={() => setViralToast(null)} />
        </div>
      )}

      {/* ── HOME SCREEN ── */}
      <div className="flex-1 overflow-hidden relative">
        <HomeScreen onAppOpen={onAppOpen} phone={phone} />
      </div>

      {/* ── APP SLIDE-IN ── */}
      {renderedApp && (
        <div
          className="absolute z-20 left-0 right-0 bottom-0"
          style={{
            top: STATUS_H,
            transform: slideIn ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          {renderApp()}
        </div>
      )}
    </div>
  );

  if (isAndroid) {
    return (
      <div className="mx-auto relative" style={{ width: 260 }}>
        {/* Side buttons */}
        <div className="absolute -right-[3px] top-24 w-[3px] h-16 bg-gray-500 rounded-full z-10"></div>
        <div className="absolute -left-[3px] top-20 w-[3px] h-10 bg-gray-500 rounded-full z-10"></div>
        <div className="absolute -left-[3px] top-36 w-[3px] h-16 bg-gray-500 rounded-full z-10"></div>

        {/* Outer frame */}
        <div
          className="rounded-[3rem] p-[3px]"
          style={{ background: 'linear-gradient(160deg, #4a4a4a 0%, #2a2a2a 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}
        >
          {/* Inner bezel */}
          <div className="rounded-[2.8rem] p-[2px]" style={{ background: '#1a1a1a' }}>
            {/* Screen */}
            <div
              className={`rounded-[2.6rem] overflow-hidden transition-all duration-500 ${grayscaleOn ? 'grayscale' : ''}`}
              style={{ height: 520, background: '#000' }}
            >
              {screenContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iOS
  return (
    <div className="mx-auto relative" style={{ width: 260 }}>
      {/* Side button */}
      <div className="absolute -right-[3px] top-28 w-[3px] h-20 bg-gray-500 rounded-full z-10"></div>
      <div className="absolute -left-[3px] top-20 w-[3px] h-10 bg-gray-500 rounded-full z-10"></div>
      <div className="absolute -left-[3px] top-36 w-[3px] h-14 bg-gray-500 rounded-full z-10"></div>
      <div className="absolute -left-[3px] top-56 w-[3px] h-14 bg-gray-500 rounded-full z-10"></div>

      {/* Outer frame */}
      <div
        className="rounded-[3rem] p-[3px]"
        style={{ background: 'linear-gradient(160deg, #6a6a6a 0%, #2a2a2a 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)' }}
      >
        {/* Inner bezel */}
        <div className="rounded-[2.8rem] p-[2px]" style={{ background: '#111' }}>
          {/* Screen */}
          <div
            className={`rounded-[2.6rem] overflow-hidden transition-all duration-500 ${grayscaleOn ? 'grayscale' : ''}`}
            style={{ height: 520, background: '#000' }}
          >
            {screenContent}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   LEADERBOARD + STATS PANEL
══════════════════════════════════════════ */
function LeaderboardPanel() {
  const [posts, setPosts] = useState<GamePost[]>([]);
  const [stats, setStats] = useState({ total: 0, viral: 0, quality: 0 });
  const mounted = useRef(true);

  const loadData = useCallback(async () => {
    if (!mounted.current) return;
    const { data } = await supabase
      .from('social_game_posts')
      .select('*')
      .eq('approved', true)
      .order('likes', { ascending: false })
      .limit(50);

    if (!mounted.current || !data) return;
    setPosts(data.slice(0, 5));
    const total = data.length;
    const viral = data.filter((p) => p.is_viral).length;
    const quality = data.filter((p) => p.viral_score <= 30).length;
    setStats({ total, viral, quality });
  }, []);

  useEffect(() => {
    mounted.current = true;
    loadData();
    const channel = supabase
      .channel('leaderboard-' + Date.now())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_game_posts' }, () => { loadData(); })
      .subscribe();
    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const viralPct = stats.total > 0 ? Math.round((stats.viral / stats.total) * 100) : 0;
  const qualityPct = stats.total > 0 ? Math.round((stats.quality / stats.total) * 100) : 0;
  const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
  const platformIcons: Record<string, string> = { instagram: 'ri-instagram-line', tiktok: 'ri-music-2-fill', facebook: 'ri-facebook-fill' };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <h4 className="text-sm font-semibold text-gray-900">Статистика в реално време</h4>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl"><p className="text-2xl font-light text-gray-900">{stats.total}</p><p className="text-[10px] text-gray-500 mt-0.5">Общо постове</p></div>
          <div className="text-center p-3 bg-red-50 rounded-xl"><p className="text-2xl font-light text-red-600">{stats.viral}</p><p className="text-[10px] text-gray-500 mt-0.5">Вирални 🔥</p></div>
          <div className="text-center p-3 bg-green-50 rounded-xl"><p className="text-2xl font-light text-green-600">{stats.quality}</p><p className="text-[10px] text-gray-500 mt-0.5">Качествени ✨</p></div>
        </div>
        {stats.total > 0 && (
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1"><span className="text-[10px] text-gray-500">Вирален % (манипулативно)</span><span className="text-[10px] font-semibold text-red-600">{viralPct}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-red-500 transition-all duration-700" style={{ width: `${viralPct}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-[10px] text-gray-500">Качествено съдържание</span><span className="text-[10px] font-semibold text-green-600">{qualityPct}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-green-500 transition-all duration-700" style={{ width: `${qualityPct}%` }}></div></div>
            </div>
            <p className="text-[9px] text-gray-400 italic mt-2">
              {viralPct > 50 ? 'Повечето хора избират провокацията пред качеството. Точно това прави алгоритъмът опасен.' : viralPct > 30 ? 'Значителна част от съдържанието е манипулативно — алгоритъмът го усилва.' : 'Повечето хора публикуват качествено — но алгоритъмът ги прави невидими.'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">Лидърборд — Най-вирални постове</h4>
        <p className="text-[10px] text-gray-400 mb-4">Кой е направил най-&quot;успешния&quot; пост?</p>
        {posts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">🎮</p>
            <p className="text-xs text-gray-400">Все още няма постове. Бъди първи!</p>
            <p className="text-[10px] text-gray-300 mt-1">Отвори Instagram, TikTok или Facebook в телефона</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                <span className="text-base w-6 text-center flex-shrink-0">{medals[i]}</span>
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.avatar_color} flex items-center justify-center flex-shrink-0`}><i className="ri-user-fill text-white text-[9px]"></i></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-900 truncate">{p.username}</span>
                    <i className={`${platformIcons[p.platform] || 'ri-global-line'} text-gray-400 text-[9px] flex-shrink-0`}></i>
                    {p.is_viral && <span className="text-[8px]">🔥</span>}
                    {p.challenge_id && <span className="text-[8px]">🏆</span>}
                  </div>
                  <p className="text-[9px] text-gray-500 truncate">{p.content}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-gray-900">{p.likes >= 1000 ? `${(p.likes / 1000).toFixed(0)}K` : p.likes}</p>
                  <p className="text-[7px] text-gray-400">харесвания</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
export default function GrayscaleGuide() {
  const [selectedPhone, setSelectedPhone] = useState<'ios' | 'android'>('ios');
  const [grayscaleOn, setGrayscaleOn] = useState(false);
  const [openApp, setOpenApp] = useState<AppId | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [rightTab, setRightTab] = useState<'instructions' | 'challenge' | 'history'>('instructions');
  const [myPostIds, setMyPostIds] = useState<string[]>([]);
  const { notifications, unreadCount, markAllRead } = useNotifications(myPostIds);
  const { remaining, incrementCount } = usePostLimit();

  const handleMyPostAdded = useCallback((post: GamePost) => {
    setMyPostIds((prev) => [...prev, post.id]);
  }, []);

  const iosInstructions = [
    { step: '1', title: 'Настройки → Достъпност', detail: 'Намерете секцията в главното меню' },
    { step: '2', title: 'Дисплей и размер на текста', detail: 'Превъртете до "Цветни филтри"' },
    { step: '3', title: 'Активирайте "Grayscale"', detail: 'Изберете черно-бял режим' },
    { step: '4', title: 'Бърз достъп', detail: 'Тройно натискане на бутона за заключване' },
  ];

  const androidInstructions = [
    { step: '1', title: 'Настройки → Достъпност', detail: 'Samsung: Настройки → Достъпност → Подобрения на видимостта' },
    { step: '2', title: 'Корекция на цветовете', detail: 'Активирайте превключвателя' },
    { step: '3', title: 'Изберете "Монохромен"', detail: 'Черно-бял режим на дисплея' },
    { step: '4', title: 'Бърз достъп', detail: 'Добавете бутон в Quick Settings панела' },
  ];

  const instructions = selectedPhone === 'ios' ? iosInstructions : androidInstructions;

  const handleChallengeAccept = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setOpenApp(challenge.platform as AppId);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Режим на фокус</h3>
          <p className="text-sm text-gray-500">Цветовете са основният инструмент за привличане на внимание в социалните мрежи. Grayscale режимът намалява визуалната стимулация и ви помага да използвате телефона целенасочено.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">🎮</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-amber-800">Интерактивна игра — Алгоритъмът на истината</p>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${i < remaining ? 'bg-amber-500' : 'bg-amber-200'}`}
                      title={`${remaining} публикации оставащи`}
                    ></div>
                  ))}
                  <span className="text-[9px] text-amber-600 font-medium">{remaining}/3</span>
                </div>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">Отвори Instagram, TikTok или Facebook и публикувай нещо. AI анализира текста и показва колко лайкове получаваш. Лайквай, коментирай и repost-вай постовете на другите. Известията се появяват в горния ъгъл на телефона.</p>
            </div>
          </div>
        </div>

        <div className="flex mb-8">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button onClick={() => { setSelectedPhone('ios'); setOpenApp(null); }} className={`px-5 py-2 rounded-full text-sm transition-all cursor-pointer whitespace-nowrap ${selectedPhone === 'ios' ? 'bg-white text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon name="ri-apple-fill" size={14} className="inline mr-1.5" />iPhone
            </button>
            <button onClick={() => { setSelectedPhone('android'); setOpenApp(null); }} className={`px-5 py-2 rounded-full text-sm transition-all cursor-pointer whitespace-nowrap ${selectedPhone === 'android' ? 'bg-white text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon name="ri-android-fill" size={14} className="inline mr-1.5" />Samsung
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Phone */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">{selectedPhone === 'ios' ? 'iPhone' : 'Samsung Galaxy'}</h4>
              <div className="flex items-center gap-2">
                {openApp && (
                  <button onClick={() => { setOpenApp(null); setActiveChallenge(null); }} className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 cursor-pointer whitespace-nowrap">
                    <Icon name="ri-home-line" size={12} className="inline mr-1" />Начало
                  </button>
                )}
                <button onClick={() => setGrayscaleOn(!grayscaleOn)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${grayscaleOn ? 'bg-gray-200 text-gray-700' : 'bg-gray-900 text-white'}`}>
                  {grayscaleOn ? 'Цветен' : 'Сив режим'}
                </button>
              </div>
            </div>
            {activeChallenge && (
              <div className="mb-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Icon name="ri-trophy-line" size={12} className="text-amber-600" />
                <span className="text-[9px] text-amber-700 font-medium">Предизвикателство: {activeChallenge.title}</span>
                <button onClick={() => setActiveChallenge(null)} className="ml-auto cursor-pointer"><i className="ri-close-line text-amber-500 text-xs"></i></button>
              </div>
            )}
            <p className="text-[10px] text-gray-400 text-center mb-2">
              {openApp ? 'Натисни стрелката за да се върнеш · Натисни + за да публикуваш' : 'Натисни Instagram, TikTok или Facebook за да играеш'}
            </p>
            <PhoneShell
              phone={selectedPhone}
              grayscaleOn={grayscaleOn}
              openApp={openApp}
              onAppOpen={setOpenApp}
              onAppClose={() => { setOpenApp(null); setActiveChallenge(null); }}
              activeChallenge={activeChallenge}
              onMyPostAdded={handleMyPostAdded}
              remaining={remaining}
              onPostPublished={incrementCount}
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={markAllRead}
            />
            <p className="text-xs text-gray-400 text-center mt-3">
              {grayscaleOn ? 'Без цветова стимулация — телефонът се превръща в инструмент' : 'Натисни бутона за да видиш разликата'}
            </p>
          </div>

          {/* Right panel with tabs */}
          <div>
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
              {([
                { id: 'instructions', label: 'Инструкции', icon: 'ri-book-line' },
                { id: 'challenge', label: 'Предизвикателство', icon: 'ri-trophy-line' },
                { id: 'history', label: 'История', icon: 'ri-history-line' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium cursor-pointer transition-all whitespace-nowrap ${rightTab === tab.id ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <i className={`${tab.icon}`}></i>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {rightTab === 'instructions' && (
              <>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Как да активирате на {selectedPhone === 'ios' ? 'iPhone' : 'Samsung Android'}</h4>
                <div className="space-y-3 mb-6">
                  {instructions.map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><span className="text-xs font-medium text-gray-600">{item.step}</span></div>
                      <div><p className="text-sm font-medium text-gray-800">{item.title}</p><p className="text-xs text-gray-500 mt-0.5">{item.detail}</p></div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <i className="ri-information-line text-gray-400 mt-0.5 flex-shrink-0"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Защо работи?</p>
                      <p className="text-sm text-gray-500 leading-relaxed">Платформите използват наситени цветове за да задействат дофаминови цикли. Черно-белият режим премахва тази стимулация — вниманието остава ваше.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {rightTab === 'challenge' && (
              <ChallengePanel onAccept={handleChallengeAccept} />
            )}

            {rightTab === 'history' && (
              <PostHistory />
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <LeaderboardPanel />
        </div>
      </div>
    </div>
  );
}
