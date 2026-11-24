export type ItemCategory = "nameAnim" | "avatarFrame" | "title";

export interface StoreItem {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  price: number;
  cssClass: string;
  emoji: string;
  previewText?: string;
}

export const STORE_ITEMS: StoreItem[] = [
  // ── Name Animations ──────────────────────────────
  {
    id: "neon-pulse",
    name: "Neon Pulse",
    category: "nameAnim",
    description: "Yorqin ko'k-yashil miltillovchi soya",
    price: 20,
    cssClass: "anim-neon-pulse",
    emoji: "💙",
    previewText: "Neon Pulse",
  },
  {
    id: "golden-shine",
    name: "Golden Shine",
    category: "nameAnim",
    description: "Oltin rangda tovlanuvchi gradient oqimi",
    price: 40,
    cssClass: "anim-golden-shine",
    emoji: "✨",
    previewText: "Golden Shine",
  },
  {
    id: "cyberpunk-glitch",
    name: "Cyberpunk Glitch",
    category: "nameAnim",
    description: "Kiberpank uslubidagi rangli siljish effekti",
    price: 60,
    cssClass: "anim-cyberpunk-glitch",
    emoji: "⚡",
    previewText: "Cyberpunk",
  },
  // ── Avatar Frames ─────────────────────────────────
  {
    id: "emerald-glow",
    name: "Emerald Glow",
    category: "avatarFrame",
    description: "Yashil aylanuvchi nurli halqa",
    price: 30,
    cssClass: "frame-emerald-glow",
    emoji: "💚",
  },
  {
    id: "fire-ring",
    name: "Fire Ring",
    category: "avatarFrame",
    description: "Olovrang yonib turuvchi dinamik ramka",
    price: 50,
    cssClass: "frame-fire-ring",
    emoji: "🔥",
  },
  {
    id: "royal-rgb",
    name: "Royal RGB",
    category: "avatarFrame",
    description: "Kamalaksimon RGB ranglar aylanadigan premium ramka",
    price: 80,
    cssClass: "frame-royal-rgb",
    emoji: "👑",
  },
  // ── Titles / Badges ───────────────────────────────
  {
    id: "junior-coder",
    name: "Junior Coder",
    category: "title",
    description: "Yangi boshlovchi uchun sharafli unvon",
    price: 15,
    cssClass: "title-junior",
    emoji: "🌱",
  },
  {
    id: "algorithm-master",
    name: "Algorithm Master",
    category: "title",
    description: "Murakkab masalalarni yechuvchi uchun unvon",
    price: 50,
    cssClass: "title-algo",
    emoji: "🧠",
  },
  {
    id: "ndtu-legend",
    name: "NDTU Legend",
    category: "title",
    description: "Platformaning afsonaviy foydalanuvchisi",
    price: 100,
    cssClass: "title-legend",
    emoji: "🏆",
  },
];
