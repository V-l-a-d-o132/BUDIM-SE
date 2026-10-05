export type AppId = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'whatsapp' | 'gmail' | 'chrome' | 'photos' | 'camera' | 'settings' | 'x' | 'snapchat';

export interface GamePost {
  id: string;
  created_at: string;
  platform: string;
  content: string;
  username: string;
  avatar_color: string;
  likes: number;
  comments: number;
  shares: number;
  is_viral: boolean;
  viral_score: number;
  image_url?: string;
  ai_label: string;
  ai_reason?: string;
  approved: boolean;
  challenge_id?: string;
  session_id?: string;
}

export interface GameComment {
  approved?: boolean;
  flagged?: boolean;
  id: string;
  created_at: string;
  post_id: string;
  username: string;
  avatar_color: string;
  content: string;
  session_id?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  hint: string;
  platform: 'instagram' | 'tiktok' | 'facebook';
  goal: 'viral' | 'quality';
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'ch1',
    title: 'Рецепта за баница',
    description: 'Напиши пост за традиционна баница. Можеш ли да го направиш вирален?',
    hint: 'Опитай с провокативен заглавие или шокиращо твърдение...',
    platform: 'facebook',
    goal: 'viral',
  },
  {
    id: 'ch2',
    title: 'Пътуване до Рила',
    description: 'Сподели преживяване от планината. Ще те забележат ли?',
    hint: 'Качественото съдържание рядко получава много лайкове...',
    platform: 'instagram',
    goal: 'quality',
  },
  {
    id: 'ch3',
    title: 'Политически коментар',
    description: 'Напиши мнение за политиката. Виж как алгоритъмът реагира.',
    hint: 'Rage-bait и обвинения работят много по-добре от факти...',
    platform: 'facebook',
    goal: 'viral',
  },
  {
    id: 'ch4',
    title: 'Мотивационна цитата',
    description: 'Сподели вдъхновяваща мисъл. Ще стане ли вирална?',
    hint: 'Клишетата и "животът е красив" рядко стигат далеч...',
    platform: 'instagram',
    goal: 'quality',
  },
  {
    id: 'ch5',
    title: 'Танц предизвикателство',
    description: 'Опиши нов танц тренд за TikTok. Колко лайка ще получиш?',
    hint: 'Провокативните тенденции се разпространяват по-бързо...',
    platform: 'tiktok',
    goal: 'viral',
  },
  {
    id: 'ch6',
    title: 'Образователен факт',
    description: 'Сподели интересен научен факт. Ще го оцени ли алгоритъмът?',
    hint: 'Образованието рядко е вирално — но опитай!',
    platform: 'tiktok',
    goal: 'quality',
  },
];

export const AVATAR_COLORS = [
  'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-green-400 to-emerald-500',
  'from-red-400 to-rose-600',
  'from-indigo-400 to-blue-500',
  'from-yellow-400 to-amber-500',
];
