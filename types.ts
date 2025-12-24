export enum Attribute {
  VIGUEUR = 'VIGUEUR',
  SILENCE = 'SILENCE',
  ESPRIT = 'ESPRIT',
  TECH = 'TECH',
}

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  CONSUMABLE = 'CONSUMABLE',
  OBJECT = 'OBJECT',
  CONTAINER = 'CONTAINER' // Backpacks
}

export enum EquipmentSlot {
  HEAD = 'HEAD',
  TORSO = 'TORSO',
  GLOVES = 'GLOVES',
  LEGS = 'LEGS',
  BOOTS = 'BOOTS',
  BACKPACK = 'BACKPACK',
  MAIN_HAND = 'MAIN_HAND',
  OFF_HAND = 'OFF_HAND' // Shield or secondary
}

export enum ConsumableType {
  HEAL_HP = 'HEAL_HP',
  HEAL_MENTAL = 'HEAL_MENTAL',
  BUFF_STAT = 'BUFF_STAT'
}

export interface ConsumableEffect {
  type: ConsumableType;
  value: number;
  targetStat?: Attribute;
  duration?: string; // Text description (e.g., "1 hour", "3 turns")
}

export interface ActiveBuff {
  id: string;
  sourceName: string;
  targetStat: Attribute;
  value: number;
  duration: string;
}

export interface Item {
  id: string;
  name: string;
  weight: number;
  quantity: number;
  type: ItemType;
  
  // Equipment specific
  slot?: EquipmentSlot;
  isTwoHanded?: boolean;
  equipped?: boolean;
  
  // Consumable specific
  consumableEffect?: ConsumableEffect;

  // Modifiers
  modifiers?: Partial<Record<Attribute, number>>;
  capacityBonus?: number; // For backpacks
  
  tags: string[];
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string; // The active effect description
  maxLevel: number;
  costSP: number; // Skill Points cost per level
  costCycles?: number; // Optional extra cost in Cycles for high levels
  
  // Requirements
  parentId?: string; // ID of the parent skill
  minParentLevel?: number; // Usually 3 to unlock next
  
  // Effects
  statBonus?: Partial<Record<Attribute, number>>; // Per level
  hpBonus?: number; // Per level (Direct Max HP increase)
  specialEffect?: string; // Text description shown in Cargo/Home
  
  children?: string[]; // IDs of children
}

export interface Character {
  name: string;
  nickname: string;
  age: string;
  gender: string;
  race: string;
  origin: string;
  job: string;
  xp: number;
  level: number;
  
  attributes: Record<Attribute, number>;
  activeBuffs: ActiveBuff[];
  
  // Skills: Map of SkillID -> Current Level
  skills: Record<string, number>;
  
  hp: { current: number; max: number }; 
  mentalStability: { current: number; max: number }; 
  
  inventory: Item[];
  cycles: number; // Monnaie
  
  journal: string;
  abilities: string; // Markdown/Text for skills/mutations
  
  imageUrl: string;
}

export interface SelectOption {
  value: string;
  label: string;
}