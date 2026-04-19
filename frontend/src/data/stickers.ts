export interface Sticker {
  id: string;
  emoji: string;
  category: string;
  tags: string[];
}

export const STICKER_CATEGORIES = [
  { id: 'faces', label: 'Лица', emoji: '😊' },
  { id: 'animals', label: 'Животные', emoji: '🐱' },
  { id: 'food', label: 'Еда', emoji: '🍕' },
  { id: 'activities', label: 'Спорт', emoji: '⚽' },
  { id: 'travel', label: 'Путешествия', emoji: '✈️' },
  { id: 'objects', label: 'Предметы', emoji: '💡' },
  { id: 'symbols', label: 'Символы', emoji: '❤️' },
];

export const stickers: Sticker[] = [
  { id: 'smile', emoji: '😊', category: 'faces', tags: ['happy', 'smile', 'joy'] },
  { id: 'sad', emoji: '😢', category: 'faces', tags: ['sad', 'cry', 'tear'] },
  { id: 'laugh', emoji: '😂', category: 'faces', tags: ['laugh', 'lol', 'funny'] },
  { id: 'wow', emoji: '😮', category: 'faces', tags: ['wow', 'surprise', 'shock'] },
  { id: 'love', emoji: '😍', category: 'faces', tags: ['love', 'heart', 'crush'] },
  { id: 'cool', emoji: '😎', category: 'faces', tags: ['cool', 'sunglasses', 'swag'] },
  { id: 'angry', emoji: '😠', category: 'faces', tags: ['angry', 'mad', 'rage'] },
  { id: 'think', emoji: '🤔', category: 'faces', tags: ['think', 'hmm', 'ponder'] },
  { id: 'sleepy', emoji: '😴', category: 'faces', tags: ['sleep', 'tired', 'zzz'] },
  { id: 'sick', emoji: '🤢', category: 'faces', tags: ['sick', 'vomit', 'gross'] },
  { id: 'cat', emoji: '🐱', category: 'animals', tags: ['cat', 'kitten', 'meow'] },
  { id: 'dog', emoji: '🐶', category: 'animals', tags: ['dog', 'puppy', 'woof'] },
  { id: 'rabbit', emoji: '🐰', category: 'animals', tags: ['rabbit', 'bunny', 'hop'] },
  { id: 'bear', emoji: '🐻', category: 'animals', tags: ['bear', 'teddy', 'cute'] },
  { id: 'panda', emoji: '🐼', category: 'animals', tags: ['panda', 'cute', 'china'] },
  { id: 'koala', emoji: '🐨', category: 'animals', tags: ['koala', 'australia', 'cute'] },
  { id: 'lion', emoji: '🦁', category: 'animals', tags: ['lion', 'king', 'roar'] },
  { id: 'unicorn', emoji: '🦄', category: 'animals', tags: ['unicorn', 'magic', 'fantasy'] },
  { id: 'dragon', emoji: '🐉', category: 'animals', tags: ['dragon', 'fire', 'fantasy'] },
  { id: 'butterfly', emoji: '🦋', category: 'animals', tags: ['butterfly', 'nature', 'beauty'] },
  { id: 'pizza', emoji: '🍕', category: 'food', tags: ['pizza', 'italian', 'food'] },
  { id: 'burger', emoji: '🍔', category: 'food', tags: ['burger', 'fast food', 'yummy'] },
  { id: 'sushi', emoji: '🍣', category: 'food', tags: ['sushi', 'japanese', 'fish'] },
  { id: 'taco', emoji: '🌮', category: 'food', tags: ['taco', 'mexican', 'yummy'] },
  { id: 'cake', emoji: '🎂', category: 'food', tags: ['cake', 'birthday', 'sweet'] },
  { id: 'donut', emoji: '🍩', category: 'food', tags: ['donut', 'sweet', ' doughnut'] },
  { id: 'cookie', emoji: '🍪', category: 'food', tags: ['cookie', 'sweet', 'snack'] },
  { id: 'coffee', emoji: '☕', category: 'food', tags: ['coffee', 'caffeine', 'morning'] },
  { id: 'beer', emoji: '🍺', category: 'food', tags: ['beer', 'drink', 'alcohol'] },
  { id: 'wine', emoji: '🍷', category: 'food', tags: ['wine', 'drink', 'alcohol'] },
  { id: 'soccer', emoji: '⚽', category: 'activities', tags: ['soccer', 'football', 'sport'] },
  { id: 'basketball', emoji: '🏀', category: 'activities', tags: ['basketball', 'sport', 'ball'] },
  { id: 'tennis', emoji: '🎾', category: 'activities', tags: ['tennis', 'sport', 'ball'] },
  { id: 'football', emoji: '🏈', category: 'activities', tags: ['football', 'sport', 'usa'] },
  { id: 'baseball', emoji: '⚾', category: 'activities', tags: ['baseball', 'sport', 'ball'] },
  { id: 'golF', emoji: '⛳', category: 'activities', tags: ['golf', 'sport', 'club'] },
  { id: 'skateboard', emoji: '🛹', category: 'activities', tags: ['skateboard', 'sport', 'cool'] },
  { id: 'surf', emoji: '🏄', category: 'activities', tags: ['surf', 'wave', 'beach'] },
  { id: 'swim', emoji: '🏊', category: 'activities', tags: ['swim', 'pool', 'sport'] },
  { id: 'plane', emoji: '✈️', category: 'travel', tags: ['plane', 'travel', 'fly'] },
  { id: 'car', emoji: '🚗', category: 'travel', tags: ['car', 'vehicle', 'drive'] },
  { id: 'train', emoji: '🚂', category: 'travel', tags: ['train', 'railway', 'travel'] },
  { id: 'ship', emoji: '🚢', category: 'travel', tags: ['ship', 'sea', 'boat'] },
  { id: 'bike', emoji: '🚲', category: 'travel', tags: ['bike', 'cycling', 'eco'] },
  { id: 'rocket', emoji: '🚀', category: 'travel', tags: ['rocket', 'space', 'fast'] },
  { id: 'island', emoji: '🏝️', category: 'travel', tags: ['island', 'beach', 'vacation'] },
  { id: 'house', emoji: '🏠', category: 'objects', tags: ['house', 'home', 'building'] },
  { id: 'gift', emoji: '🎁', category: 'objects', tags: ['gift', 'present', 'birthday'] },
  { id: 'star', emoji: '⭐', category: 'symbols', tags: ['star', 'favorite', 'gold'] },
  { id: 'heart', emoji: '❤️', category: 'symbols', tags: ['heart', 'love', 'red'] },
  { id: 'fire', emoji: '🔥', category: 'symbols', tags: ['fire', 'hot', 'lit'] },
  { id: 'check', emoji: '✅', category: 'symbols', tags: ['check', 'done', 'success'] },
  { id: 'sparkle', emoji: '✨', category: 'symbols', tags: ['sparkle', 'magic', 'shine'] },
  { id: 'rainbow', emoji: '🌈', category: 'symbols', tags: ['rainbow', 'color', 'pride'] },
  { id: 'crown', emoji: '👑', category: 'symbols', tags: ['crown', 'king', 'queen'] },
  { id: 'money', emoji: '💰', category: 'objects', tags: ['money', 'rich', 'dollar'] },
  { id: 'diamond', emoji: '💎', category: 'objects', tags: ['diamond', 'gem', 'valuable'] },
  { id: 'lightning', emoji: '⚡', category: 'symbols', tags: ['lightning', 'power', 'fast'] },
  { id: 'thunder', emoji: '🌩️', category: 'symbols', tags: ['thunder', 'storm', 'weather'] },
  { id: 'moon', emoji: '🌙', category: 'symbols', tags: ['moon', 'night', 'sleep'] },
  { id: 'sun', emoji: '☀️', category: 'symbols', tags: ['sun', 'bright', 'day'] },
];

export const getStickersByCategory = (categoryId: string): Sticker[] => {
  if (categoryId === 'all') return stickers;
  return stickers.filter((s) => s.category === categoryId);
};

export const searchStickers = (query: string): Sticker[] => {
  const q = query.toLowerCase();
  return stickers.filter(
    (s) =>
      s.emoji.includes(q) ||
      s.tags.some((t) => t.includes(q)) ||
      s.id.includes(q)
  );
};