// Sticker definitions
export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  category: "fun" | "love" | "party" | "nature" | "food" | "text";
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
}

export const STICKER_CATEGORIES = [
  { id: "fun", name: "Fun" },
  { id: "love", name: "Love" },
  { id: "party", name: "Party" },
  { id: "nature", name: "Nature" },
  { id: "food", name: "Food" },
  { id: "text", name: "Text" },
] as const;

export const STICKERS: Sticker[] = [
  // Fun
  { id: "s1", name: "Sunglasses", emoji: "😎", category: "fun" },
  { id: "s2", name: "Laugh", emoji: "😂", category: "fun" },
  { id: "s3", name: "Cool", emoji: "🤩", category: "fun" },
  { id: "s4", name: "Tongue", emoji: "😜", category: "fun" },
  { id: "s5", name: "Clown", emoji: "🤡", category: "fun" },
  { id: "s6", name: "Ghost", emoji: "👻", category: "fun" },
  { id: "s7", name: "Alien", emoji: "👽", category: "fun" },
  { id: "s8", name: "Robot", emoji: "🤖", category: "fun" },
  { id: "s9", name: "Fire", emoji: "🔥", category: "fun" },
  { id: "s10", name: "Thunder", emoji: "⚡", category: "fun" },

  // Love
  { id: "l1", name: "Heart", emoji: "❤️", category: "love" },
  { id: "l2", name: "Pink Heart", emoji: "💖", category: "love" },
  { id: "l3", name: "Kiss", emoji: "💋", category: "love" },
  { id: "l4", name: "Cupid", emoji: "💘", category: "love" },
  { id: "l5", name: "Two Hearts", emoji: "💕", category: "love" },
  { id: "l6", name: "Sparkling Heart", emoji: "💖", category: "love" },
  { id: "l7", name: "Ring", emoji: "💍", category: "love" },
  { id: "l8", name: "Rose", emoji: "🌹", category: "love" },
  { id: "l9", name: "Love Letter", emoji: "💌", category: "love" },
  { id: "l10", name: "Couple", emoji: "👫", category: "love" },

  // Party
  { id: "p1", name: "Party Popper", emoji: "🎉", category: "party" },
  { id: "p2", name: "Confetti", emoji: "🎊", category: "party" },
  { id: "p3", name: "Balloon", emoji: "🎈", category: "party" },
  { id: "p4", name: "Crown", emoji: "👑", category: "party" },
  { id: "p5", name: "Trophy", emoji: "🏆", category: "party" },
  { id: "p6", name: "Star", emoji: "⭐", category: "party" },
  { id: "p7", name: "Sparkles", emoji: "✨", category: "party" },
  { id: "p8", name: "Cake", emoji: "🎂", category: "party" },
  { id: "p9", name: "Gift", emoji: "🎁", category: "party" },
  { id: "p10", name: "Party Hat", emoji: "🥳", category: "party" },

  // Nature
  { id: "n1", name: "Flower", emoji: "🌸", category: "nature" },
  { id: "n2", name: "Sunflower", emoji: "🌻", category: "nature" },
  { id: "n3", name: "Rainbow", emoji: "🌈", category: "nature" },
  { id: "n4", name: "Sun", emoji: "☀️", category: "nature" },
  { id: "n5", name: "Moon", emoji: "🌙", category: "nature" },
  { id: "n6", name: "Cloud", emoji: "☁️", category: "nature" },
  { id: "n7", name: "Butterfly", emoji: "🦋", category: "nature" },
  { id: "n8", name: "Leaf", emoji: "🍃", category: "nature" },
  { id: "n9", name: "Tree", emoji: "🌳", category: "nature" },
  { id: "n10", name: "Wave", emoji: "🌊", category: "nature" },

  // Food
  { id: "f1", name: "Pizza", emoji: "🍕", category: "food" },
  { id: "f2", name: "Coffee", emoji: "☕", category: "food" },
  { id: "f3", name: "Ice Cream", emoji: "🍦", category: "food" },
  { id: "f4", name: "Donut", emoji: "🍩", category: "food" },
  { id: "f5", name: "Burger", emoji: "🍔", category: "food" },
  { id: "f6", name: "Sushi", emoji: "🍣", category: "food" },
  { id: "f7", name: "Cocktail", emoji: "🍸", category: "food" },
  { id: "f8", name: "Wine", emoji: "🍷", category: "food" },
  { id: "f9", name: "Cupcake", emoji: "🧁", category: "food" },
  { id: "f10", name: "Popcorn", emoji: "🍿", category: "food" },

  // Text
  { id: "t1", name: "100", emoji: "💯", category: "text" },
  { id: "t2", name: "OK", emoji: "👌", category: "text" },
  { id: "t3", name: "Peace", emoji: "✌️", category: "text" },
  { id: "t4", name: "Thumbs Up", emoji: "👍", category: "text" },
  { id: "t5", name: "Clap", emoji: "👏", category: "text" },
  { id: "t6", name: "Pray", emoji: "🙏", category: "text" },
  { id: "t7", name: "Muscle", emoji: "💪", category: "text" },
  { id: "t8", name: "Eyes", emoji: "👀", category: "text" },
  { id: "t9", name: "Boom", emoji: "💥", category: "text" },
  { id: "t10", name: "Diamond", emoji: "💎", category: "text" },
];
