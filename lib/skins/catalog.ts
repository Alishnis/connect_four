export type SkinRarity = "common" | "rare" | "epic" | "legendary";

export interface SkinStyle {
  background: string;
  boxShadow: string;
  borderRadius?: string;
  animation?: string; // CSS class name
}

export interface SkinDefinition {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: SkinRarity;
  player1: SkinStyle;
  player2: SkinStyle;
}

export const SKINS: SkinDefinition[] = [
  {
    id: "classic",
    name: "Классика",
    description: "Стандартный неоновый стиль. Розовый против голубого.",
    price: 0,
    rarity: "common",
    player1: {
      background: "#FF2D78",
      boxShadow: "0 0 10px #FF00FF",
    },
    player2: {
      background: "#00CCFF",
      boxShadow: "0 0 10px #00FFFF",
    },
  },
  {
    id: "neon_pulse",
    name: "Неон Пульс",
    description: "Пульсирующее неоновое свечение. Гипнотический эффект.",
    price: 100,
    rarity: "rare",
    player1: {
      background: "#FF2D78",
      boxShadow: "0 0 10px #FF00FF",
      animation: "skin-neon-pulse",
    },
    player2: {
      background: "#00CCFF",
      boxShadow: "0 0 10px #00FFFF",
      animation: "skin-neon-pulse",
    },
  },
  {
    id: "pixel_art",
    name: "Пиксель",
    description: "Ретро-пиксельная эстетика. Квадратные фишки.",
    price: 150,
    rarity: "rare",
    player1: {
      background: "#FF6B9D",
      boxShadow: "0 0 10px #FF6B9D",
      borderRadius: "20%",
    },
    player2: {
      background: "#6BC5FF",
      boxShadow: "0 0 10px #6BC5FF",
      borderRadius: "20%",
    },
  },
  {
    id: "holographic",
    name: "Голограмма",
    description: "Радужный голографический эффект. Переливающиеся цвета.",
    price: 250,
    rarity: "epic",
    player1: {
      background: "linear-gradient(135deg, #FF00FF, #FF9900, #00FFFF, #FF00FF)",
      boxShadow: "0 0 15px #FF00FF, 0 0 30px #00FFFF",
      animation: "skin-holographic",
    },
    player2: {
      background: "linear-gradient(135deg, #00FFFF, #FF9900, #FF00FF, #00FFFF)",
      boxShadow: "0 0 15px #00FFFF, 0 0 30px #FF00FF",
      animation: "skin-holographic",
    },
  },
  {
    id: "fire_ice",
    name: "Огонь и Лёд",
    description: "Стихии сталкиваются. Огненный красный против ледяного голубого.",
    price: 300,
    rarity: "epic",
    player1: {
      background: "#FF4500",
      boxShadow: "0 0 15px #FF4500, 0 0 30px #FF6600",
    },
    player2: {
      background: "#00BFFF",
      boxShadow: "0 0 15px #00BFFF, 0 0 30px #87CEEB",
    },
  },
  {
    id: "glitch",
    name: "Глитч",
    description: "Сбой в матрице. Дрожащие артефакты из киберпространства.",
    price: 500,
    rarity: "legendary",
    player1: {
      background: "#FF00FF",
      boxShadow: "0 0 15px #FF00FF, 0 0 30px #FF00FF",
      animation: "skin-glitch",
    },
    player2: {
      background: "#00FF00",
      boxShadow: "0 0 15px #00FF00, 0 0 30px #00FF00",
      animation: "skin-glitch",
    },
  },
];

export function getSkinById(id: string): SkinDefinition {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}
