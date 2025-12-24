// types.ts

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
  CONTAINER = 'CONTAINER' // Sacs à dos / Conteneurs
}

export enum EquipmentSlot {
  HEAD = 'HEAD',
  TORSO = 'TORSO',
  GLOVES = 'GLOVES',
  LEGS = 'LEGS',
  BOOTS = 'BOOTS',
  BACKPACK = 'BACKPACK',
  MAIN_HAND = 'MAIN_HAND',
  OFF_HAND = 'OFF_HAND' // Bouclier ou arme secondaire
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
  duration?: string; // Description textuelle (ex: "1 heure", "3 tours")
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
  
  // Spécificités d'équipement
  slot?: EquipmentSlot;
  isTwoHanded?: boolean;
  equipped?: boolean;
  
  // Spécificités de consommable
  consumableEffect?: ConsumableEffect;

  // Modificateurs
  modifiers?: Partial<Record<Attribute, number>>;
  capacityBonus?: number; // Pour les sacs à dos
  
  tags: string[];
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  costSP: number; 
  costCycles?: number; 
  
  // Prérequis
  parentId?: string; 
  minParentLevel?: number; 
  
  // Effets
  statBonus?: Partial<Record<Attribute, number>>; 
  hpBonus?: number; 
  specialEffect?: string; 
  
  children?: string[]; 
}

/**
 * Interface pour les logs d'actions (Vue MJ)
 */
export interface GameLog {
  id?: string;
  timestamp: number;
  playerName: string;
  action: string;
  tableId: string;
}

/**
 * Interface Character mise à jour pour le mode en ligne
 */
export interface Character {
  id: string;          // ID unique du joueur (crypto.randomUUID())
  tableId: string;    // Code de la room (ex: ZONE-01)
  lastUpdate: number; // Timestamp de la dernière modification
  lastActiveTab: string; // Tracking de l'onglet consulté (ex: 'inv', 'skills')

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
  
  // Skills: Map de SkillID -> Niveau Actuel
  skills: Record<string, number>;
  
  hp: { current: number; max: number }; 
  mentalStability: { current: number; max: number }; 
  
  inventory: Item[];
  cycles: number; // Monnaie (Cycles)
  
  journal: string;
  abilities: string; 
  
  imageUrl: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface GameLog {
  id?: string;
  timestamp: number;
  playerName: string;
  action: string;
  tableId: string;
}