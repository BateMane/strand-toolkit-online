import { SelectOption, ItemType, EquipmentSlot, ConsumableType, Attribute, SkillDefinition } from './types';

export const RACES: SelectOption[] = [
  { value: 'Humain', label: 'Humain' },
  { value: 'Subhasard', label: 'Subhasard (Hybride)' },
  { value: 'Squolt', label: 'Squolt (Synthétique)' },
  { value: 'Paria', label: 'Paria (Humain rejeté)' },
  { value: 'Grausl', label: 'Grausl (Géant des cavernes)' }
];

export const ORIGINS: SelectOption[] = [
  { value: 'Dunudac', label: 'Dunudac' },
  { value: 'Canijo', label: 'Canijo' },
  { value: 'Rix', label: 'Rix' },
  { value: 'Rabatru', label: 'Rabatru' },
  { value: 'Siege', label: "Le Siège" },
  { value: 'Envole', label: 'Envole' },
  { value: 'Traversee', label: 'La Traversée' },
  { value: 'Inconnue', label: 'Inconnue' }
];

// --- CLASSES LORE-ACCURATE ---
export const CLASSES: SelectOption[] = [
  { value: 'Pacteux', label: 'Pacteux (Soldat de l\'Ordre)' },
  { value: 'Fanatique', label: 'Fanatique (Chapelle de l\'Atome)' },
  { value: 'Navidson', label: 'Enfant de Navidson (Scientifique)' },
  { value: 'Moisson', label: 'La Moisson (Cannibale/Guerrier)' },
  { value: 'Sangsue', label: 'Sangsue (Espion/Logisticien)' },
  { value: 'Ruche', label: 'Ruche (Squolt Connecté)' },
  { value: 'Pestifere', label: 'Pestiféré (Squolt Gore-Tech)' },
  { value: 'Canijo', label: 'Canijo (Subhasard Citadin)' },
  { value: 'Paria', label: 'Paria (Survivant Indépendant)' }
];

export const CLASS_BONUSES: Record<string, Partial<Record<Attribute, number>>> = {
  'Pacteux': { VIGUEUR: 2, TECH: 1, SILENCE: -1 },
  'Fanatique': { ESPRIT: 3, VIGUEUR: 1, TECH: -2 },
  'Navidson': { TECH: 3, ESPRIT: 1, VIGUEUR: -1 },
  'Moisson': { VIGUEUR: 3, SILENCE: 1, ESPRIT: -2 },
  'Sangsue': { SILENCE: 2, ESPRIT: 2, VIGUEUR: -1 },
  'Ruche': { TECH: 2, ESPRIT: 2, SILENCE: -2 },
  'Pestifere': { VIGUEUR: 2, TECH: 2, ESPRIT: -2 },
  'Canijo': { SILENCE: 2, TECH: 1 },
  'Paria': { VIGUEUR: 1, SILENCE: 1, ESPRIT: 1, TECH: 1 }
};

// --- STRUCTURE ARBRE "SABLIER" (14 Noeuds) ---
// Structure IDs: 
// 1. root
// 2. L1, L2 (Branche Gauche Haute)
// 3. R1, R2 (Branche Droite Haute)
// 4. mid (Convergence)
// 5. LL1, LL2, UltL (Branche Gauche Basse + Ultime)
// 6. LR1, LR2, UltR (Branche Droite Basse + Ultime)

export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  
  // --- PACTEUX (Défenseur de Dunudac) ---
  'pac_root': { id: 'pac_root', name: 'Discipline de Fer', description: 'PV Max +0.4/niv. Le socle de l\'armée.', maxLevel: 5, costSP: 1, hpBonus: 0.4 },
  // Spé 1 : Sentinelle (Défense)
  'pac_L1': { id: 'pac_L1', name: 'Phalange', description: 'Bonus d\'armure si immobile.', maxLevel: 3, costSP: 1, parentId: 'pac_root', minParentLevel: 1, specialEffect: 'Armure +2 (Immobile)' },
  'pac_L2': { id: 'pac_L2', name: 'Bouclier Blanc', description: 'Résistance aux tempêtes de cristaux.', maxLevel: 3, costSP: 1, parentId: 'pac_L1', minParentLevel: 2, specialEffect: 'Résist. Env.' },
  // Spé 2 : Brise-Coque (Offense Lourde)
  'pac_R1': { id: 'pac_R1', name: 'Marteau Hydraulique', description: 'Utilisation d\'armes de siège au CaC.', maxLevel: 3, costSP: 1, parentId: 'pac_root', minParentLevel: 1, statBonus: { VIGUEUR: 0.2 } },
  'pac_R2': { id: 'pac_R2', name: 'Charge Piston', description: 'Renverse les ennemis lourds (Grausl).', maxLevel: 3, costSP: 2, parentId: 'pac_R1', minParentLevel: 2, specialEffect: 'Renversement' },
  // Convergence
  'pac_mid': { id: 'pac_mid', name: 'Vétéran de l\'Acier', description: 'Débloque l\'usage du Fer à Mémoire militaire.', maxLevel: 1, costSP: 3, parentId: 'pac_root', minParentLevel: 5, specialEffect: 'Maîtrise Fer Pur' },
  // Final 1 : Gardien (Tank Ultime)
  'pac_LL1': { id: 'pac_LL1', name: 'Mur Vivant', description: 'Encaisse les dégâts des alliés proches.', maxLevel: 3, costSP: 2, parentId: 'pac_mid', minParentLevel: 1, specialEffect: 'Protection Zone' },
  'pac_LL2': { id: 'pac_LL2', name: 'Inébranlable', description: 'Immunité à la peur et aux chocs.', maxLevel: 3, costSP: 2, parentId: 'pac_LL1', minParentLevel: 2, hpBonus: 1.0 },
  'pac_UltL': { id: 'pac_UltL', name: 'LA CITADELLE', description: 'ULTIME : Invulnérabilité totale 1 tour.', maxLevel: 1, costSP: 5, parentId: 'pac_LL2', minParentLevel: 3, specialEffect: 'INVINCIBLE' },
  // Final 2 : Exécuteur (DPS Lourd)
  'pac_LR1': { id: 'pac_LR1', name: 'Surcharge Carminite', description: 'Booste les dégâts, blesse l\'utilisateur.', maxLevel: 3, costSP: 2, parentId: 'pac_mid', minParentLevel: 1, specialEffect: 'Dégâts x2 / PV -2' },
  'pac_LR2': { id: 'pac_LR2', name: 'Tueur de Coques', description: 'Ignore l\'armure naturelle.', maxLevel: 3, costSP: 2, parentId: 'pac_LR1', minParentLevel: 2, specialEffect: 'Perce-Armure' },
  'pac_UltR': { id: 'pac_UltR', name: 'LE JUGEMENT', description: 'ULTIME : Coup unique mortel sur cible large.', maxLevel: 1, costSP: 5, parentId: 'pac_LR2', minParentLevel: 3, specialEffect: 'INSTAKILL (Non-Boss)' },

  // --- FANATIQUE (Chapelle de l'Atome) ---
  'fan_root': { id: 'fan_root', name: 'Baptême du Rad', description: 'Résistance aux radiations + Immunité nausée.', maxLevel: 5, costSP: 1, statBonus: { VIGUEUR: 0.2 } },
  // Spé 1 : Prêcheur (Support/Mental)
  'fan_L1': { id: 'fan_L1', name: 'Voix de Jacob', description: 'Intimidation par la foi.', maxLevel: 3, costSP: 1, parentId: 'fan_root', minParentLevel: 1, statBonus: { ESPRIT: 0.2 } },
  'fan_L2': { id: 'fan_L2', name: 'Conversion', description: 'Peut rallier des PNJ faibles.', maxLevel: 3, costSP: 1, parentId: 'fan_L1', minParentLevel: 2, specialEffect: 'Charisme Forcé' },
  // Spé 2 : Mutant (Combat/Physique)
  'fan_R1': { id: 'fan_R1', name: 'Chair Tuméfiée', description: 'La peau devient une armure naturelle.', maxLevel: 3, costSP: 1, parentId: 'fan_root', minParentLevel: 1, hpBonus: 0.5 },
  'fan_R2': { id: 'fan_R2', name: 'Griffes d\'Os', description: 'Fait pousser des armes naturelles.', maxLevel: 3, costSP: 2, parentId: 'fan_R1', minParentLevel: 2, specialEffect: 'Arme Intégrée' },
  // Convergence
  'fan_mid': { id: 'fan_mid', name: 'Communion', description: 'Régénère de l\'Esprit près des sources radioactives.', maxLevel: 1, costSP: 3, parentId: 'fan_root', minParentLevel: 5, specialEffect: 'Regen Zone Rad' },
  // Final 1 : Prophète (Mage Rad)
  'fan_LL1': { id: 'fan_LL1', name: 'Aura Verte', description: 'Irradie les ennemis proches.', maxLevel: 3, costSP: 2, parentId: 'fan_mid', minParentLevel: 1, specialEffect: 'Dégâts Zone Passif' },
  'fan_LL2': { id: 'fan_LL2', name: 'Vision de Koval', description: 'Voit à travers la matière.', maxLevel: 3, costSP: 2, parentId: 'fan_LL1', minParentLevel: 2, statBonus: { ESPRIT: 0.5 } },
  'fan_UltL': { id: 'fan_UltL', name: 'SUPERCRITIQUE', description: 'ULTIME : Explosion atomique corporelle.', maxLevel: 1, costSP: 5, parentId: 'fan_LL2', minParentLevel: 3, specialEffect: 'Suicide Explosif (Survivable)' },
  // Final 2 : Abomination (Tank Monstre)
  'fan_LR1': { id: 'fan_LR1', name: 'Croissance Rapide', description: 'Soins massifs, perte d\'humanité.', maxLevel: 3, costSP: 2, parentId: 'fan_mid', minParentLevel: 1, hpBonus: 1.0 },
  'fan_LR2': { id: 'fan_LR2', name: 'Troisième Bras', description: 'Peut tenir une arme supplémentaire.', maxLevel: 3, costSP: 2, parentId: 'fan_LR1', minParentLevel: 2, specialEffect: 'Main +1' },
  'fan_UltR': { id: 'fan_UltR', name: 'GRAUSL SACRÉ', description: 'ULTIME : Transformation temporaire en Grausl.', maxLevel: 1, costSP: 5, parentId: 'fan_LR2', minParentLevel: 3, statBonus: { VIGUEUR: 2.0 } },

  // --- NAVIDSON (Scientifique) ---
  'sci_root': { id: 'sci_root', name: 'Esprit Analytique', description: 'Compréhension des artefacts. Tech +.', maxLevel: 5, costSP: 1, statBonus: { TECH: 0.2 } },
  // Spé 1 : Biologiste (Machine de Chair)
  'sci_L1': { id: 'sci_L1', name: 'Médecine de Guerre', description: 'Soins efficaces sans magie.', maxLevel: 3, costSP: 1, parentId: 'sci_root', minParentLevel: 1, specialEffect: 'Soin +50%' },
  'sci_L2': { id: 'sci_L2', name: 'Étude des Hybrides', description: 'Bonus de dégâts contre Mutants.', maxLevel: 3, costSP: 1, parentId: 'sci_L1', minParentLevel: 2, specialEffect: 'Savoir Anatomique' },
  // Spé 2 : Physicien (Noyau Ovoïde)
  'sci_R1': { id: 'sci_R1', name: 'Ingénieur du Son', description: 'Utilise des leurres acoustiques.', maxLevel: 3, costSP: 1, parentId: 'sci_root', minParentLevel: 1, statBonus: { SILENCE: 0.2 } },
  'sci_R2': { id: 'sci_R2', name: 'Arme à Énergie', description: 'Entretien des armes lasers rares.', maxLevel: 3, costSP: 2, parentId: 'sci_R1', minParentLevel: 2, specialEffect: 'Usage Laser' },
  // Convergence
  'sci_mid': { id: 'sci_mid', name: 'Codex Partiel', description: 'Débloque des recettes de craft avancées.', maxLevel: 1, costSP: 3, parentId: 'sci_root', minParentLevel: 5, specialEffect: 'Craft T3' },
  // Final 1 : Généticien
  'sci_LL1': { id: 'sci_LL1', name: 'Sérum de Stase', description: 'Stoppe le poison et le saignement.', maxLevel: 3, costSP: 2, parentId: 'sci_mid', minParentLevel: 1, specialEffect: 'Cure Totale' },
  'sci_LL2': { id: 'sci_LL2', name: 'Greffe Navidson', description: 'Implant cybernétique propre.', maxLevel: 3, costSP: 2, parentId: 'sci_LL1', minParentLevel: 2, statBonus: { VIGUEUR: 0.5 } },
  'sci_UltL': { id: 'sci_UltL', name: 'LAZARE', description: 'ULTIME : Réanimation d\'un mort récent.', maxLevel: 1, costSP: 5, parentId: 'sci_LL2', minParentLevel: 3, specialEffect: 'Résurrection (Instable)' },
  // Final 2 : Quantique
  'sci_LR1': { id: 'sci_LR1', name: 'Surcharge Réacteur', description: 'Transforme la Carminite en grenade.', maxLevel: 3, costSP: 2, parentId: 'sci_mid', minParentLevel: 1, specialEffect: 'Grenade Plasma' },
  'sci_LR2': { id: 'sci_LR2', name: 'Champ de Force', description: 'Bouclier personnel temporaire.', maxLevel: 3, costSP: 2, parentId: 'sci_LR1', minParentLevel: 2, hpBonus: 1.0 },
  'sci_UltR': { id: 'sci_UltR', name: 'MICRO-FISSURE', description: 'ULTIME : Crée une zone de néant locale.', maxLevel: 1, costSP: 5, parentId: 'sci_LR2', minParentLevel: 3, specialEffect: 'Trou Noir' },

  // --- MOISSON (Barbare) ---
  'moi_root': { id: 'moi_root', name: 'Faim Insatiable', description: 'Peut manger n\'importe quoi. Immunité poison.', maxLevel: 5, costSP: 1, hpBonus: 0.4 },
  // Spé 1 : Chasseur (Traque)
  'moi_L1': { id: 'moi_L1', name: 'Pistage Sanglant', description: 'Suit les blessés automatiquement.', maxLevel: 3, costSP: 1, parentId: 'moi_root', minParentLevel: 1, specialEffect: 'Vision Sang' },
  'moi_L2': { id: 'moi_L2', name: 'Embuscade', description: 'Premier coup critique.', maxLevel: 3, costSP: 1, parentId: 'moi_L1', minParentLevel: 2, statBonus: { SILENCE: 0.3 } },
  // Spé 2 : Maître de Meute (Grausls)
  'moi_R1': { id: 'moi_R1', name: 'Dompteur', description: 'Les Grausls ne vous attaquent pas.', maxLevel: 3, costSP: 1, parentId: 'moi_root', minParentLevel: 1, specialEffect: 'Paix Grausl' },
  'moi_R2': { id: 'moi_R2', name: 'Cri de Guerre', description: 'Effraie les ennemis humains.', maxLevel: 3, costSP: 2, parentId: 'moi_R1', minParentLevel: 2, specialEffect: 'Peur Zone' },
  // Convergence
  'moi_mid': { id: 'moi_mid', name: 'Rituel Anthropophage', description: 'Manger de l\'humain rend des PV.', maxLevel: 1, costSP: 3, parentId: 'moi_root', minParentLevel: 5, specialEffect: 'Cannibalisme Soin' },
  // Final 1 : Prédateur Alpha
  'moi_LL1': { id: 'moi_LL1', name: 'Trophées', description: 'Gagne de la force par ennemi tué.', maxLevel: 3, costSP: 2, parentId: 'moi_mid', minParentLevel: 1, statBonus: { VIGUEUR: 0.5 } },
  'moi_LL2': { id: 'moi_LL2', name: 'Berserk', description: 'Ne tombe pas inconscient à 0 PV.', maxLevel: 3, costSP: 2, parentId: 'moi_LL1', minParentLevel: 2, specialEffect: 'Refus Mort 1 tour' },
  'moi_UltL': { id: 'moi_UltL', name: 'LA GRANDE CHASSE', description: 'ULTIME : Vitesse et Dégâts doublés.', maxLevel: 1, costSP: 5, parentId: 'moi_LL2', minParentLevel: 3, specialEffect: 'Mode Rage' },
  // Final 2 : Seigneur de Guerre
  'moi_LR1': { id: 'moi_LR1', name: 'Chaînes de Grausl', description: 'Possède un familier Grausl.', maxLevel: 3, costSP: 2, parentId: 'moi_mid', minParentLevel: 1, specialEffect: 'Pet: Grausl' },
  'moi_LR2': { id: 'moi_LR2', name: 'Armure d\'Os', description: 'Craft d\'armures lourdes organiques.', maxLevel: 3, costSP: 2, parentId: 'moi_LR1', minParentLevel: 2, hpBonus: 1.5 },
  'moi_UltR': { id: 'moi_UltR', name: 'LE FESTIN', description: 'ULTIME : Dévore un ennemi vivant pour full heal.', maxLevel: 1, costSP: 5, parentId: 'moi_LR2', minParentLevel: 3, specialEffect: 'One-Shot + Heal' },

  // --- SANGSUE (Espion/Info) ---
  'san_root': { id: 'san_root', name: 'Réseau de l\'Ombre', description: 'Accès aux rumeurs et prix du marché.', maxLevel: 5, costSP: 1, statBonus: { ESPRIT: 0.2 } },
  'san_L1': { id: 'san_L1', name: 'Oreille Indiscrète', description: 'Détecte les mensonges.', maxLevel: 3, costSP: 1, parentId: 'san_root', minParentLevel: 1, specialEffect: 'Détection Mensonge' },
  'san_L2': { id: 'san_L2', name: 'Visage Anonyme', description: 'Passe inaperçu dans la foule.', maxLevel: 3, costSP: 1, parentId: 'san_L1', minParentLevel: 2, statBonus: { SILENCE: 0.3 } },
  'san_R1': { id: 'san_R1', name: 'Contrebande', description: 'Cache des objets sur soi.', maxLevel: 3, costSP: 1, parentId: 'san_root', minParentLevel: 1, specialEffect: 'Inv Caché' },
  'san_R2': { id: 'san_R2', name: 'Blanchiment', description: 'Meilleurs prix de vente.', maxLevel: 3, costSP: 2, parentId: 'san_R1', minParentLevel: 2, specialEffect: 'Vente +20%' },
  'san_mid': { id: 'san_mid', name: 'Dague de Verre', description: 'Accès aux armes invisibles.', maxLevel: 1, costSP: 3, parentId: 'san_root', minParentLevel: 5, specialEffect: 'Arme Invisible' },
  'san_LL1': { id: 'san_LL1', name: 'Chantage', description: 'Peut éviter un combat par la parole.', maxLevel: 3, costSP: 2, parentId: 'san_mid', minParentLevel: 1, specialEffect: 'Diplomatie Forcée' },
  'san_LL2': { id: 'san_LL2', name: 'Sabotage', description: 'Désactive les alarmes.', maxLevel: 3, costSP: 2, parentId: 'san_LL1', minParentLevel: 2, statBonus: { TECH: 0.5 } },
  'san_UltL': { id: 'san_UltL', name: 'L\'OEIL QUI VOIT TOUT', description: 'ULTIME : Révèle toute la carte/ennemis.', maxLevel: 1, costSP: 5, parentId: 'san_LL2', minParentLevel: 3, specialEffect: 'Omniscience' },
  'san_LR1': { id: 'san_LR1', name: 'Poison Neuro', description: 'Enduit les armes de toxines.', maxLevel: 3, costSP: 2, parentId: 'san_mid', minParentLevel: 1, specialEffect: 'Poison' },
  'san_LR2': { id: 'san_LR2', name: 'Assassinat', description: 'Dégâts critiques dans le dos.', maxLevel: 3, costSP: 2, parentId: 'san_LR1', minParentLevel: 2, specialEffect: 'Backstab x3' },
  'san_UltR': { id: 'san_UltR', name: 'LA MAIN INVISIBLE', description: 'ULTIME : Voler un objet équipé.', maxLevel: 1, costSP: 5, parentId: 'san_LR2', minParentLevel: 3, specialEffect: 'Vol Majeur' },

  // --- RUCHE (Squolt Connecté) ---
  'ruc_root': { id: 'ruc_root', name: 'Lien Source', description: 'Énergie infinie, mais pas de soin naturel.', maxLevel: 5, costSP: 1, statBonus: { TECH: 0.2 } },
  'ruc_L1': { id: 'ruc_L1', name: 'Calcul Balistique', description: 'Visée parfaite.', maxLevel: 3, costSP: 1, parentId: 'ruc_root', minParentLevel: 1, specialEffect: 'Précision 100%' },
  'ruc_L2': { id: 'ruc_L2', name: 'Protocoles de Guerre', description: 'Maîtrise de toutes les armes.', maxLevel: 3, costSP: 1, parentId: 'ruc_L1', minParentLevel: 2, specialEffect: 'Maîtrise Totale' },
  'ruc_R1': { id: 'ruc_R1', name: 'Logique Froide', description: 'Immunité totale à la Peur et Psychose.', maxLevel: 3, costSP: 1, parentId: 'ruc_root', minParentLevel: 1, statBonus: { ESPRIT: 0.4 } },
  'ruc_R2': { id: 'ruc_R2', name: 'Interface', description: 'Hack instantané des terminaux.', maxLevel: 3, costSP: 2, parentId: 'ruc_R1', minParentLevel: 2, specialEffect: 'Hack Auto' },
  'ruc_mid': { id: 'ruc_mid', name: 'Châssis Fer-Mémoire', description: 'Réduit le SDA (Syndrome Dégradation).', maxLevel: 1, costSP: 3, parentId: 'ruc_root', minParentLevel: 5, hpBonus: 1.0 },
  'ruc_LL1': { id: 'ruc_LL1', name: 'Arme Intégrée', description: 'Arme à feu dans le bras.', maxLevel: 3, costSP: 2, parentId: 'ruc_mid', minParentLevel: 1, specialEffect: 'Arme Cachée' },
  'ruc_LL2': { id: 'ruc_LL2', name: 'Vision Thermique', description: 'Voir dans le noir et les murs.', maxLevel: 3, costSP: 2, parentId: 'ruc_LL1', minParentLevel: 2, specialEffect: 'Vision X' },
  'ruc_UltL': { id: 'ruc_UltL', name: 'MODE SIEGE', description: 'ULTIME : Devient une tourelle immobile dévastatrice.', maxLevel: 1, costSP: 5, parentId: 'ruc_LL2', minParentLevel: 3, specialEffect: 'Dégâts x4 / Immobile' },
  'ruc_LR1': { id: 'ruc_LR1', name: 'Relais Drone', description: 'Contrôle des petits drones.', maxLevel: 3, costSP: 2, parentId: 'ruc_mid', minParentLevel: 1, specialEffect: 'Drones' },
  'ruc_LR2': { id: 'ruc_LR2', name: 'Upload Conscience', description: 'Sauvegarde l\'esprit si le corps meurt.', maxLevel: 3, costSP: 2, parentId: 'ruc_LR1', minParentLevel: 2, specialEffect: 'Respawn (Cher)' },
  'ruc_UltR': { id: 'ruc_UltR', name: 'NEXUS LOCAL', description: 'ULTIME : Contrôle les machines ennemies proches.', maxLevel: 1, costSP: 5, parentId: 'ruc_LR2', minParentLevel: 3, specialEffect: 'Contrôle Zone' },

  // --- PESTIFÉRÉ (Gore-Tech) ---
  'pes_root': { id: 'pes_root', name: 'Moteur à Sang', description: 'Utilise la Carminite et le sang comme carburant.', maxLevel: 5, costSP: 1, hpBonus: 0.4 },
  'pes_L1': { id: 'pes_L1', name: 'Greffe Sauvage', description: 'Peut s\'équiper de membres organiques.', maxLevel: 3, costSP: 1, parentId: 'pes_root', minParentLevel: 1, specialEffect: 'Slots Organiques' },
  'pes_L2': { id: 'pes_L2', name: 'Récupérateur', description: 'Loot des pièces sur les cadavres.', maxLevel: 3, costSP: 1, parentId: 'pes_L1', minParentLevel: 2, specialEffect: 'Loot Corps' },
  'pes_R1': { id: 'pes_R1', name: 'Pollution', description: 'Dégage une fumée toxique.', maxLevel: 3, costSP: 1, parentId: 'pes_root', minParentLevel: 1, specialEffect: 'Aura Poison' },
  'pes_R2': { id: 'pes_R2', name: 'Douleur Fantôme', description: 'Convertit la douleur en force.', maxLevel: 3, costSP: 2, parentId: 'pes_R1', minParentLevel: 2, statBonus: { VIGUEUR: 0.3 } },
  'pes_mid': { id: 'pes_mid', name: 'Bricoleur Gore', description: 'Réparation avec de la viande.', maxLevel: 1, costSP: 3, parentId: 'pes_root', minParentLevel: 5, specialEffect: 'Soin par Viande' },
  'pes_LL1': { id: 'pes_LL1', name: 'Bras de Grausl', description: 'Force démesurée, précision faible.', maxLevel: 3, costSP: 2, parentId: 'pes_mid', minParentLevel: 1, statBonus: { VIGUEUR: 0.5 } },
  'pes_LL2': { id: 'pes_LL2', name: 'Scie Circulaire', description: 'Outil industriel comme arme.', maxLevel: 3, costSP: 2, parentId: 'pes_LL1', minParentLevel: 2, specialEffect: 'Saignement' },
  'pes_UltL': { id: 'pes_UltL', name: 'FRANKENSTEIN', description: 'ULTIME : Revient à la vie une fois par combat.', maxLevel: 1, costSP: 5, parentId: 'pes_LL2', minParentLevel: 3, specialEffect: 'Auto-Rez' },
  'pes_LR1': { id: 'pes_LR1', name: 'Injecteur Carminite', description: 'Boost temporaire explosif.', maxLevel: 3, costSP: 2, parentId: 'pes_mid', minParentLevel: 1, specialEffect: 'Vitesse x2 / Dégâts' },
  'pes_LR2': { id: 'pes_LR2', name: 'Huile Brûlante', description: 'Crache du liquide inflammable.', maxLevel: 3, costSP: 2, parentId: 'pes_LR1', minParentLevel: 2, specialEffect: 'Lance-Flamme' },
  'pes_UltR': { id: 'pes_UltR', name: 'SURCHARGE DU COEUR', description: 'ULTIME : Kamikaze nucléaire.', maxLevel: 1, costSP: 5, parentId: 'pes_LR2', minParentLevel: 3, specialEffect: 'Explosion Finale' },

  // --- CANIJO (Subhasard) ---
  'can_root': { id: 'can_root', name: 'Lois de Hadji', description: 'Respect du silence. Discrétion naturelle.', maxLevel: 5, costSP: 1, statBonus: { SILENCE: 0.2 } },
  'can_L1': { id: 'can_L1', name: 'Négociant', description: 'Meilleurs prix à l\'achat.', maxLevel: 3, costSP: 1, parentId: 'can_root', minParentLevel: 1, specialEffect: 'Achat -10%' },
  'can_L2': { id: 'can_L2', name: 'Réseau Marchand', description: 'Accès aux boutiques rares.', maxLevel: 3, costSP: 1, parentId: 'can_L1', minParentLevel: 2, specialEffect: 'Shop Rare' },
  'can_R1': { id: 'can_R1', name: 'Agilité Animale', description: 'Esquive augmentée.', maxLevel: 3, costSP: 1, parentId: 'can_root', minParentLevel: 1, specialEffect: 'Esquive +10%' },
  'can_R2': { id: 'can_R2', name: 'Sens Aiguisés', description: 'Détecte les embuscades.', maxLevel: 3, costSP: 2, parentId: 'can_R1', minParentLevel: 2, specialEffect: 'Anti-Surprise' },
  'can_mid': { id: 'can_mid', name: 'Citoyen des Arbres', description: 'Déplacement rapide dans les Broussailles.', maxLevel: 1, costSP: 3, parentId: 'can_root', minParentLevel: 5, specialEffect: 'Parkour' },
  'can_LL1': { id: 'can_LL1', name: 'Caravane', description: 'Capacité de port augmentée.', maxLevel: 3, costSP: 2, parentId: 'can_mid', minParentLevel: 1, specialEffect: 'Poids +10kg' },
  'can_LL2': { id: 'can_LL2', name: 'Garde du Corps', description: 'Peut engager un mercenaire.', maxLevel: 3, costSP: 2, parentId: 'can_LL1', minParentLevel: 2, specialEffect: 'Mercenaire' },
  'can_UltL': { id: 'can_UltL', name: 'MONOPOLE', description: 'ULTIME : Génère des Cycles passivement.', maxLevel: 1, costSP: 5, parentId: 'can_LL2', minParentLevel: 3, specialEffect: 'Revenu Passif' },
  'can_LR1': { id: 'can_LR1', name: 'Lame de Fer', description: 'Maîtrise des armes nobles.', maxLevel: 3, costSP: 2, parentId: 'can_mid', minParentLevel: 1, specialEffect: 'Dégâts Fer +1' },
  'can_LR2': { id: 'can_LR2', name: 'Silence Mortel', description: 'Attaque furtive dévastatrice.', maxLevel: 3, costSP: 2, parentId: 'can_LR1', minParentLevel: 2, specialEffect: 'Critique Furtif' },
  'can_UltR': { id: 'can_UltR', name: 'HÉRITAGE DE HADJI', description: 'ULTIME : Immunité aux Échos sonores.', maxLevel: 1, costSP: 5, parentId: 'can_LR2', minParentLevel: 3, specialEffect: 'Immunité Son' },

  // --- PARIA (Survivant) ---
  'par_root': { id: 'par_root', name: 'Système D', description: 'Polyvalence. +0.1 partout.', maxLevel: 5, costSP: 1, statBonus: { VIGUEUR:0.1, TECH:0.1, ESPRIT:0.1, SILENCE:0.1 } },
  'par_L1': { id: 'par_L1', name: 'Fouilleur', description: 'Trouve plus d\'objets.', maxLevel: 3, costSP: 1, parentId: 'par_root', minParentLevel: 1, specialEffect: 'Loot +1' },
  'par_L2': { id: 'par_L2', name: 'Recyclage', description: 'Démonte les objets pour composants.', maxLevel: 3, costSP: 1, parentId: 'par_L1', minParentLevel: 2, specialEffect: 'Scrap' },
  'par_R1': { id: 'par_R1', name: 'Fuite', description: 'Course rapide.', maxLevel: 3, costSP: 1, parentId: 'par_root', minParentLevel: 1, statBonus: { VIGUEUR: 0.2 } },
  'par_R2': { id: 'par_R2', name: 'Sixième Sens', description: 'Sent le danger.', maxLevel: 3, costSP: 2, parentId: 'par_R1', minParentLevel: 2, statBonus: { ESPRIT: 0.2 } },
  'par_mid': { id: 'par_mid', name: 'Adaptation', description: 'Résistance aux maladies et faim.', maxLevel: 1, costSP: 3, parentId: 'par_root', minParentLevel: 5, hpBonus: 1.0 },
  'par_LL1': { id: 'par_LL1', name: 'Bricolage', description: 'Fabrique des pièges.', maxLevel: 3, costSP: 2, parentId: 'par_mid', minParentLevel: 1, specialEffect: 'Craft Pièges' },
  'par_LL2': { id: 'par_LL2', name: 'Arme de Fortune', description: 'Bonus avec armes improvisées.', maxLevel: 3, costSP: 2, parentId: 'par_LL1', minParentLevel: 2, specialEffect: 'Dégâts Impro' },
  'par_UltL': { id: 'par_UltL', name: 'ROI DES RATS', description: 'ULTIME : Les nuisibles vous aident.', maxLevel: 1, costSP: 5, parentId: 'par_LL2', minParentLevel: 3, specialEffect: 'Armée de Rats' },
  'par_LR1': { id: 'par_LR1', name: 'Tireur Embusqué', description: 'Bonus fusil longue distance.', maxLevel: 3, costSP: 2, parentId: 'par_mid', minParentLevel: 1, specialEffect: 'Sniper' },
  'par_LR2': { id: 'par_LR2', name: 'Camouflage', description: 'Invisible si immobile.', maxLevel: 3, costSP: 2, parentId: 'par_LR1', minParentLevel: 2, specialEffect: 'Invisibilité' },
  'par_UltR': { id: 'par_UltR', name: 'LÉGENDE URBAINE', description: 'ULTIME : Votre réputation vous précède (Peur).', maxLevel: 1, costSP: 5, parentId: 'par_LR2', minParentLevel: 3, specialEffect: 'Peur Passive' },
};

// Tree Mapping Definition:
// Each class uses the SAME topology (The "Hourglass").
// We map generic positions (root, L1, etc) to the specific skill IDs for that class.
// The constants above use a naming convention: {class}_{pos}.
// So we can dynamically generate the tree based on the class prefix.

export const CLASS_TREES: Record<string, string[]> = {
  // This object is less relevant now as the renderer will assume the fixed topology
  // But we keep it for reference or legacy logic if needed.
  'Pacteux': ['pac_root'],
  'Fanatique': ['fan_root'],
  'Navidson': ['sci_root'],
  'Moisson': ['moi_root'],
  'Sangsue': ['san_root'],
  'Ruche': ['ruc_root'],
  'Pestifere': ['pes_root'],
  'Canijo': ['can_root'],
  'Paria': ['par_root']
};

export const ITEM_TYPES: SelectOption[] = [
  { value: ItemType.WEAPON, label: 'Arme' },
  { value: ItemType.ARMOR, label: 'Armure/Vêtement' },
  { value: ItemType.CONTAINER, label: 'Sac à Dos' },
  { value: ItemType.CONSUMABLE, label: 'Consommable' },
  { value: ItemType.OBJECT, label: 'Objet Divers' },
];

export const CONSUMABLE_TYPES: SelectOption[] = [
  { value: ConsumableType.HEAL_HP, label: 'Soin (PV)' },
  { value: ConsumableType.HEAL_MENTAL, label: 'Soin (Mental)' },
  { value: ConsumableType.BUFF_STAT, label: 'Boost de Stat' },
];

export const EQUIPMENT_SLOTS: SelectOption[] = [
  { value: EquipmentSlot.HEAD, label: 'Tête' },
  { value: EquipmentSlot.TORSO, label: 'Torse' },
  { value: EquipmentSlot.GLOVES, label: 'Gants' },
  { value: EquipmentSlot.LEGS, label: 'Jambes' },
  { value: EquipmentSlot.BOOTS, label: 'Bottes' },
  { value: EquipmentSlot.BACKPACK, label: 'Dos' },
  { value: EquipmentSlot.MAIN_HAND, label: 'Main Principale' },
  { value: EquipmentSlot.OFF_HAND, label: 'Main Secondaire' },
];

export const INITIAL_CHARACTER = {
  name: '',
  nickname: '',
  age: '',
  gender: '',
  race: 'Humain',
  origin: 'Rix',
  job: 'Paria', 
  xp: 0,
  level: 1,
  attributes: {
    VIGUEUR: 10,
    SILENCE: 10,
    ESPRIT: 10,
    TECH: 10,
  },
  skills: {}, 
  activeBuffs: [],
  hp: { current: 20, max: 20 },
  mentalStability: { current: 20, max: 20 },
  inventory: [],
  cycles: 0,
  journal: '',
  abilities: '',
  imageUrl: ''
};