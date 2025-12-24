import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Attribute, Character, Item, ItemType, EquipmentSlot, ConsumableType, ActiveBuff, SkillDefinition } from './types';
import { RACES, ORIGINS, CLASSES, CLASS_BONUSES, INITIAL_CHARACTER, ITEM_TYPES, EQUIPMENT_SLOTS, CONSUMABLE_TYPES, SKILL_DEFINITIONS, CLASS_TREES } from './constants';
import { audioManager } from './audioService';

// --- Icons & SVG ---

const ItemIcon: React.FC<{ type: ItemType; className?: string }> = ({ type, className = "w-6 h-6" }) => {
  switch (type) {
    case ItemType.WEAPON:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>;
    case ItemType.ARMOR:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M9 3h6l3 7-6 11-6-11z"/><circle cx="12" cy="9" r="2"/></svg>;
    case ItemType.CONSUMABLE:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>; 
    case ItemType.CONTAINER:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 4v16"/><path d="M15 4v16"/><path d="M9 12h6"/></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>;
  }
};

// --- Utility Components ---

const Button: React.FC<{ onClick?: () => void; children: React.ReactNode; className?: string; variant?: 'primary' | 'danger' | 'ghost' | 'upgrade' }> = ({ onClick, children, className = '', variant = 'primary' }) => {
  let variantClasses = 'border-theme text-theme hover:bg-theme hover:text-black';
  if (variant === 'danger') variantClasses = 'border-red-800 text-red-500 hover:bg-red-900 hover:text-red-100';
  if (variant === 'ghost') variantClasses = 'border-transparent text-gray-400 hover:text-theme hover:border-theme/50';
  if (variant === 'upgrade') variantClasses = 'border-green-600 text-green-500 hover:bg-green-900 hover:text-white';

  return (
    <button
      onClick={(e) => { 
        e.stopPropagation(); 
        try { audioManager.playClick(); } catch(err){} 
        onClick && onClick(); 
      }}
      onMouseEnter={() => { try { audioManager.playHover(); } catch(err){} }}
      className={`
        px-3 py-1 font-bold uppercase tracking-widest text-xs md:text-sm transition-all duration-100 border
        ${variantClasses}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const ProgressBar: React.FC<{ value: number; max: number; colorClass: string; label: string; shake?: boolean }> = ({ value, max, colorClass, label, shake }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`mb-4 ${shake ? 'animate-pulse' : ''}`}>
      <div className="flex justify-between text-xs uppercase mb-1 tracking-wider text-theme opacity-80">
        <span>{label}</span>
        <span>{Number.isInteger(value) ? value : value.toFixed(1)} / {Number.isInteger(max) ? max : max.toFixed(1)}</span>
      </div>
      <div className="h-4 bg-gray-900 border border-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=')] opacity-50 z-10"></div>
        <div 
          className={`h-full transition-all duration-300 ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const StatKnob: React.FC<{ label: string; baseValue: number; bonusValue: number; onChange: (val: number) => void }> = ({ label, baseValue, bonusValue, onChange }) => {
  const total = baseValue + bonusValue;
  
  return (
    <div className="flex flex-col items-center p-2 border border-gray-800 bg-black/40 relative group hover:border-theme/50 transition-colors">
      <span className="text-xs uppercase text-gray-500 mb-2">{label}</span>
      <div className="flex items-center space-x-2">
        <button 
          className="w-6 h-6 flex items-center justify-center border border-gray-600 hover:bg-gray-800 text-theme"
          onClick={() => { if(baseValue > 0) { onChange(baseValue - 1); audioManager.playClick(); } }}
        >-</button>
        <div className="flex flex-col items-center w-14">
           <span className="text-xl font-bold text-theme leading-none">
             {Number.isInteger(total) ? total : total.toFixed(1)}
           </span>
           {bonusValue !== 0 && (
             <span className={`text-[10px] absolute -bottom-1 ${bonusValue > 0 ? 'text-green-500' : 'text-red-500'}`}>
               {bonusValue > 0 ? '+' : ''}{Number.isInteger(bonusValue) ? bonusValue : bonusValue.toFixed(1)}
             </span>
           )}
        </div>
        <button 
          className="w-6 h-6 flex items-center justify-center border border-gray-600 hover:bg-gray-800 text-theme"
          onClick={() => { onChange(baseValue + 1); audioManager.playClick(); }}
        >+</button>
      </div>
    </div>
  );
};

// --- Skill Tree Components (SVG Approach) ---

const NODE_COORDS: Record<string, { x: number, y: number }> = {
  root: { x: 50, y: 5 },
  L1:   { x: 20, y: 22 },
  R1:   { x: 80, y: 22 },
  L2:   { x: 20, y: 39 },
  R2:   { x: 80, y: 39 },
  mid:  { x: 50, y: 56 },
  LL1:  { x: 20, y: 73 },
  LR1:  { x: 80, y: 73 },
  LL2:  { x: 20, y: 90 },
  LR2:  { x: 80, y: 90 },
  UltL: { x: 20, y: 107 },
  UltR: { x: 80, y: 107 },
};

const CONNECTIONS = [
  ['root', 'L1'], ['root', 'R1'],
  ['L1', 'L2'], ['R1', 'R2'],
  ['L2', 'mid'], ['R2', 'mid'],
  ['mid', 'LL1'], ['mid', 'LR1'],
  ['LL1', 'LL2'], ['LR1', 'LR2'],
  ['LL2', 'UltL'], ['LR2', 'UltR']
];

const SkillNode: React.FC<{ 
  skillId: string; 
  character: Character; 
  onUpgrade: (id: string, costSP: number, costCycles: number) => void;
  onHover: (id: string | null) => void;
  availSP: number;
  x: number;
  y: number;
}> = ({ skillId, character, onUpgrade, onHover, availSP, x, y }) => {
  const def = SKILL_DEFINITIONS[skillId];
  if (!def) return null;

  const currentLevel = character.skills[skillId] || 0;
  const parentLevel = def.parentId ? (character.skills[def.parentId] || 0) : 5;
  const isLocked = parentLevel < (def.minParentLevel || 0);
  const isMaxed = currentLevel >= def.maxLevel;
  const canAfford = availSP >= def.costSP && character.cycles >= (def.costCycles || 0);
  const canUpgrade = !isLocked && !isMaxed && canAfford;

  let ringColor = 'border-gray-800 text-gray-700';
  let bgColor = 'bg-black';
  let iconContent = <span className="text-[10px]">{currentLevel}/{def.maxLevel}</span>;

  if (isLocked) {
     iconContent = <span className="text-gray-800 text-xs">LOC</span>;
  } else if (isMaxed) {
     ringColor = 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] text-yellow-500';
     bgColor = 'bg-yellow-900/50';
     iconContent = <span className="font-bold text-xs">MAX</span>;
  } else if (currentLevel > 0) {
     ringColor = 'border-theme text-theme shadow-[0_0_5px_var(--theme-primary)]';
     bgColor = 'bg-theme/20';
     iconContent = <span className="font-bold text-lg">{currentLevel}</span>;
  } else if (canUpgrade) {
     ringColor = 'border-white text-white animate-pulse';
     iconContent = <span className="text-[10px]">{currentLevel}/{def.maxLevel}</span>;
  }

  return (
    <div 
        className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center"
        style={{ left: `${x}%`, top: `${y}%` }}
        onMouseEnter={() => onHover(skillId)}
        onMouseLeave={() => onHover(null)}
    >
        <button 
            onClick={() => canUpgrade && onUpgrade(skillId, def.costSP, def.costCycles || 0)}
            disabled={!canUpgrade && !currentLevel} 
            className={`
            w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300
            ${ringColor} ${bgColor} hover:scale-110
            `}
        >
            {iconContent}
        </button>
        {canUpgrade && (
            <div className="absolute -bottom-4 text-[9px] text-theme font-mono animate-bounce">+UP</div>
        )}
    </div>
  );
};

const SkillTreeLayout: React.FC<{ 
  job: string; 
  character: Character; 
  onUpgrade: (id: string, costSP: number, costCycles: number) => void;
  availSP: number;
  setHoveredSkill: (id: string | null) => void;
}> = ({ job, character, onUpgrade, availSP, setHoveredSkill }) => {
  const prefixes: Record<string, string> = {
    'Pacteux': 'pac', 'Fanatique': 'fan', 'Navidson': 'sci', 'Moisson': 'moi',
    'Sangsue': 'san', 'Ruche': 'ruc', 'Pestifere': 'pes', 'Canijo': 'can', 'Paria': 'par'
  };
  const p = prefixes[job] || 'par';
  const getNodeID = (suffix: string) => `${p}_${suffix}`;

  const drawLine = (startSuffix: string, endSuffix: string) => {
    const s = NODE_COORDS[startSuffix];
    const e = NODE_COORDS[endSuffix];
    if (!s || !e) return null;
    const midY = (s.y + e.y) / 2;
    const path = `M ${s.x} ${s.y} V ${midY} H ${e.x} V ${e.y}`;
    return <path key={`${startSuffix}-${endSuffix}`} d={path} fill="none" stroke="currentColor" strokeWidth="2" className="text-theme opacity-30" vectorEffect="non-scaling-stroke" />;
  };

  return (
    <div className="relative w-full h-[600px] md:h-[500px] max-w-lg mx-auto select-none mt-4">
       <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 120" preserveAspectRatio="none">
         {CONNECTIONS.map(([start, end]) => drawLine(start, end))}
       </svg>
       {Object.entries(NODE_COORDS).map(([suffix, coords]) => (
         <SkillNode key={suffix} skillId={getNodeID(suffix)} character={character} onUpgrade={onUpgrade} onHover={setHoveredSkill} availSP={availSP} x={coords.x} y={coords.y} />
       ))}
       <div className="absolute top-[120%] w-full h-10"></div>
    </div>
  );
};

const SkillDetailPanel: React.FC<{ skillId: string | null; character: Character; availSP: number }> = ({ skillId, character, availSP }) => {
  if (!skillId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center border-l border-theme/30 bg-black/40">
        <div className="text-4xl text-theme/20 mb-4 animate-pulse">?</div>
        <p className="text-gray-500 text-sm">SÉLECTIONNEZ UN MODULE</p>
        <p className="text-xs text-gray-600">Survolez un nœud pour afficher les détails.</p>
      </div>
    );
  }

  const def = SKILL_DEFINITIONS[skillId];
  if (!def) return <div>Erreur de Données</div>;

  const currentLevel = character.skills[skillId] || 0;
  const parentLevel = def.parentId ? (character.skills[def.parentId] || 0) : 5;
  const isLocked = parentLevel < (def.minParentLevel || 0);
  const isMaxed = currentLevel >= def.maxLevel;
  const canAfford = availSP >= def.costSP;

  return (
    <div className="h-full p-6 border-l-2 border-theme bg-black/90 flex flex-col animate-fadeIn relative overflow-hidden">
       <div className="absolute bottom-0 right-0 p-4 text-6xl text-theme/5 font-bold leading-none pointer-events-none select-none z-0">
         {skillId.split('_')[1]}
       </div>

       <div className="flex justify-between items-start border-b border-theme/50 pb-2 mb-4 relative z-10">
          <h2 className="text-lg font-bold text-theme uppercase tracking-tighter leading-tight max-w-[80%]">{def.name}</h2>
          <div className="text-xs border border-gray-700 px-2 py-1 bg-gray-900 shrink-0 ml-2">
             NIV <span className="text-white font-bold">{currentLevel}</span> / {def.maxLevel}
          </div>
       </div>

       <div className="flex-grow space-y-6 relative z-10 overflow-y-auto pr-2">
          <div className="bg-gray-900/50 p-3 border border-gray-700">
             <p className="text-sm text-gray-300 italic leading-relaxed">{def.description}</p>
          </div>

          <div className="space-y-2">
             <h3 className="text-xs font-bold text-gray-500 uppercase border-b border-gray-800 pb-1">Bonus Actifs</h3>
             {def.hpBonus && (
                <div className="flex items-center text-sm">
                   <span className="w-4 h-4 bg-green-900 border border-green-500 mr-2"></span>
                   <span className="text-green-400">Santé Max: +{def.hpBonus} / niveau</span>
                </div>
             )}
             {def.statBonus && Object.entries(def.statBonus).map(([k,v]) => (
                <div key={k} className="flex items-center text-sm">
                   <span className="w-4 h-4 bg-blue-900 border border-blue-500 mr-2"></span>
                   <span className="text-blue-400">{k}: +{v} / niveau</span>
                </div>
             ))}
             {def.specialEffect && (
                <div className="flex items-start text-sm mt-2">
                   <span className="w-4 h-4 bg-yellow-900 border border-yellow-500 mr-2 mt-1 shrink-0"></span>
                   <span className="text-yellow-500 font-bold">{def.specialEffect}</span>
                </div>
             )}
          </div>
       </div>

       <div className="mt-auto pt-4 border-t border-theme/30 relative z-10">
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs text-gray-500">COÛT D'ACTIVATION</span>
             <span className={`text-lg font-mono font-bold ${canAfford ? 'text-theme' : 'text-red-500'}`}>
                {def.costSP} PTS
             </span>
          </div>
          
          <div className="w-full text-center py-2 bg-gray-900 border border-gray-700">
             {isLocked ? (
                <span className="text-red-500 font-bold uppercase animate-pulse">
                   SYSTÈME VERROUILLÉ (Niv {def.minParentLevel} Requis)
                </span>
             ) : isMaxed ? (
                <span className="text-yellow-500 font-bold uppercase">
                   OPTIMISATION MAXIMALE
                </span>
             ) : (
                <span className="text-theme font-bold uppercase">
                   {canAfford ? 'DISPONIBLE' : 'RESSOURCES INSUFFISANTES'}
                </span>
             )}
          </div>
          
          {!isMaxed && !isLocked && canAfford && (
             <div className="text-[10px] text-center text-gray-500 mt-2">
                CLIQUEZ SUR LE NOEUD POUR VALIDER
             </div>
          )}
       </div>
    </div>
  );
}

// --- Equipment Grid & Item Creator ---

const EquipmentGrid: React.FC<{ 
  inventory: Item[]; 
  onUnequip: (item: Item) => void;
  slots: Record<string, string> 
}> = ({ inventory, onUnequip }) => {
  const getEquippedInSlot = (slot: EquipmentSlot) => inventory.find(i => i.equipped && i.slot === slot);

  const SlotBox = ({ slot, label }: { slot: EquipmentSlot, label: string }) => {
    const item = getEquippedInSlot(slot);
    const mainHandItem = getEquippedInSlot(EquipmentSlot.MAIN_HAND);
    const isOffHandBlocked = slot === EquipmentSlot.OFF_HAND && mainHandItem?.isTwoHanded;

    return (
      <div className={`
        border border-gray-700 bg-black/40 p-2 min-h-[80px] flex flex-col items-center justify-center relative group
        ${isOffHandBlocked ? 'opacity-50 cursor-not-allowed bg-red-900/10' : 'hover:border-theme/50'}
      `}>
        <span className="absolute top-1 left-1 text-[9px] uppercase text-gray-500">{label}</span>
        {isOffHandBlocked ? (
           <span className="text-xs text-red-500/50 rotate-45 font-mono">2 MAINS</span>
        ) : item ? (
          <>
            <ItemIcon type={item.type} className="w-8 h-8 text-theme mb-1" />
            <span className="text-xs text-center leading-tight truncate w-full px-1">{item.name}</span>
            <button 
              onClick={() => onUnequip(item)}
              className="absolute inset-0 bg-black/80 text-red-500 opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-xs"
            >
              RETIRER
            </button>
          </>
        ) : (
          <div className="w-8 h-8 rounded-full border border-gray-800 border-dashed flex items-center justify-center opacity-20">
            <div className="w-1 h-1 bg-gray-500"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2 mb-6 max-w-md mx-auto">
       <div className="col-start-2"><SlotBox slot={EquipmentSlot.HEAD} label="TÊTE" /></div>
       <div className="col-start-1 row-start-2"><SlotBox slot={EquipmentSlot.MAIN_HAND} label="MAIN P." /></div>
       <div className="col-start-2 row-start-2"><SlotBox slot={EquipmentSlot.TORSO} label="TORSE" /></div>
       <div className="col-start-3 row-start-2"><SlotBox slot={EquipmentSlot.OFF_HAND} label="MAIN S." /></div>
       <div className="col-start-1 row-start-3"><SlotBox slot={EquipmentSlot.GLOVES} label="GANTS" /></div>
       <div className="col-start-2 row-start-3"><SlotBox slot={EquipmentSlot.LEGS} label="JAMBES" /></div>
       <div className="col-start-3 row-start-3"><SlotBox slot={EquipmentSlot.BACKPACK} label="DOS" /></div>
       <div className="col-start-2 row-start-4"><SlotBox slot={EquipmentSlot.BOOTS} label="BOTTES" /></div>
    </div>
  );
};

const ItemCreator: React.FC<{ onSave: (item: Item) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: 'Nouvel Objet',
    type: ItemType.OBJECT,
    weight: 1,
    quantity: 1,
    modifiers: { VIGUEUR: 0, SILENCE: 0, ESPRIT: 0, TECH: 0 },
    capacityBonus: 0,
    tags: [],
    consumableEffect: { type: ConsumableType.HEAL_HP, value: 5 }
  });

  const handleModChange = (attr: Attribute, val: string) => {
    const num = parseInt(val) || 0;
    setNewItem(prev => ({ ...prev, modifiers: { ...prev.modifiers, [attr]: num } }));
  };

  const handleSave = () => {
    const item: Item = {
      id: Date.now().toString(),
      name: newItem.name || 'Unknown',
      weight: newItem.weight || 0,
      quantity: newItem.quantity || 1,
      type: newItem.type || ItemType.OBJECT,
      slot: newItem.slot,
      isTwoHanded: newItem.isTwoHanded,
      modifiers: newItem.modifiers,
      capacityBonus: newItem.capacityBonus,
      consumableEffect: newItem.consumableEffect,
      tags: newItem.tags || [],
      equipped: false
    };
    onSave(item);
  };

  return (
    <div className="border border-theme bg-black p-4 space-y-4 animate-fadeIn">
      <div className="flex justify-between border-b border-gray-800 pb-2">
        <h3 className="font-bold text-theme">ENCODAGE OBJET</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="text-[10px] uppercase text-gray-500">Nom</label>
           <input className="input-base" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
        </div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="text-[10px] uppercase text-gray-500">Poids (kg)</label>
            <input type="number" className="input-base" value={newItem.weight} onChange={e => setNewItem({...newItem, weight: parseFloat(e.target.value)})} />
          </div>
          <div className="w-1/2">
            <label className="text-[10px] uppercase text-gray-500">Qté</label>
            <input type="number" className="input-base" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="text-[10px] uppercase text-gray-500">Type</label>
            <select className="input-base" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as ItemType})}>
               {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
         </div>
         {(newItem.type === ItemType.WEAPON || newItem.type === ItemType.ARMOR || newItem.type === ItemType.CONTAINER) && (
            <div>
              <label className="text-[10px] uppercase text-gray-500">Emplacement</label>
              <select className="input-base" value={newItem.slot || ''} onChange={e => setNewItem({...newItem, slot: e.target.value as EquipmentSlot})}>
                <option value="">-- Aucun --</option>
                {EQUIPMENT_SLOTS.filter(s => {
                  if (newItem.type === ItemType.CONTAINER) return s.value === EquipmentSlot.BACKPACK;
                  if (newItem.type === ItemType.WEAPON) return s.value === EquipmentSlot.MAIN_HAND || s.value === EquipmentSlot.OFF_HAND;
                  return s.value !== EquipmentSlot.MAIN_HAND && s.value !== EquipmentSlot.OFF_HAND && s.value !== EquipmentSlot.BACKPACK;
                }).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
         )}
      </div>
      {newItem.type === ItemType.WEAPON && (
         <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newItem.isTwoHanded || false} onChange={e => setNewItem({...newItem, isTwoHanded: e.target.checked})} />
            <span className="text-xs">Arme à deux mains</span>
         </label>
      )}
      {newItem.type === ItemType.CONSUMABLE && (
         <div className="bg-gray-900/50 p-2 border border-gray-700">
            <label className="text-[10px] uppercase text-theme font-bold mb-2 block">Effet à l'utilisation</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select 
                className="input-base text-xs"
                value={newItem.consumableEffect?.type} 
                onChange={e => setNewItem({...newItem, consumableEffect: { ...newItem.consumableEffect!, type: e.target.value as ConsumableType }})}
              >
                 {CONSUMABLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input 
                type="number" className="input-base text-xs" placeholder="Valeur" 
                value={newItem.consumableEffect?.value} 
                onChange={e => setNewItem({...newItem, consumableEffect: { ...newItem.consumableEffect!, value: parseInt(e.target.value) || 0 }})} 
              />
            </div>
            {newItem.consumableEffect?.type === ConsumableType.BUFF_STAT && (
              <div className="grid grid-cols-2 gap-2">
                 <select 
                   className="input-base text-xs"
                   value={newItem.consumableEffect?.targetStat || Attribute.VIGUEUR}
                   onChange={e => setNewItem({...newItem, consumableEffect: { ...newItem.consumableEffect!, targetStat: e.target.value as Attribute }})}
                 >
                   {Object.values(Attribute).map(a => <option key={a} value={a}>{a}</option>)}
                 </select>
                 <input 
                   type="text" className="input-base text-xs" placeholder="Durée (ex: 1 heure)"
                   value={newItem.consumableEffect?.duration || ''}
                   onChange={e => setNewItem({...newItem, consumableEffect: { ...newItem.consumableEffect!, duration: e.target.value }})}
                 />
              </div>
            )}
         </div>
      )}
      {newItem.type === ItemType.CONTAINER && (
         <div>
            <label className="text-[10px] uppercase text-gray-500">Bonus Capacité (kg)</label>
            <input type="number" className="input-base" value={newItem.capacityBonus} onChange={e => setNewItem({...newItem, capacityBonus: parseInt(e.target.value)})} />
         </div>
      )}
      {(newItem.type === ItemType.WEAPON || newItem.type === ItemType.ARMOR) && (
      <div className="border-t border-gray-800 pt-2">
         <label className="text-[10px] uppercase text-gray-500 mb-2 block">Modificateurs Stats (Équipé)</label>
         <div className="grid grid-cols-4 gap-2">
            {Object.values(Attribute).map(attr => (
               <div key={attr}>
                  <span className="text-[9px] block text-center text-gray-500">{attr.substr(0,3)}</span>
                  <input 
                    type="number" 
                    className="input-base text-center p-1 text-xs" 
                    placeholder="0"
                    value={newItem.modifiers?.[attr] || 0}
                    onChange={(e) => handleModChange(attr, e.target.value)}
                  />
               </div>
            ))}
         </div>
      </div>
      )}
      <div className="flex gap-2 pt-2">
         <Button onClick={handleSave} className="flex-grow">ENREGISTRER</Button>
         <Button onClick={onCancel} variant="danger">ANNULER</Button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [booting, setBooting] = useState(true);
  const [showStartButton, setShowStartButton] = useState(false);
  const [bootLog, setBootLog] = useState<string[]>([]);
  
  const [char, setChar] = useState<Character>(() => JSON.parse(JSON.stringify(INITIAL_CHARACTER)));
  const [activeTab, setActiveTab] = useState<'id' | 'inv' | 'skills' | 'notes'>('id');
  const [theme, setTheme] = useState<'rust' | 'rad' | 'salt'>('rust');
  const [isMuted, setIsMuted] = useState(false);
  const [musicVol, setMusicVol] = useState(0.3);
  
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  // Helper: Calculate Spent Points
  const calculateSpentPoints = () => {
    let spent = 0;
    Object.entries(char.skills).forEach(([skillId, level]) => {
      const def = SKILL_DEFINITIONS[skillId];
      if (def) {
          spent += level * def.costSP;
      }
    });
    return spent;
  };

  const availableSkillPoints = Math.max(0, (char.level - 1) - calculateSpentPoints());

  // Derived Stats Logic
  const getEffectiveStats = () => {
    const stats = { ...char.attributes };
    
    // Class Bonuses (Natural)
    const classBonus = CLASS_BONUSES[char.job];
    if (classBonus) {
      Object.entries(classBonus).forEach(([attr, val]) => {
          if (val) stats[attr as Attribute] += val;
      });
    }

    // Skill Passive Bonuses (Stats)
    Object.entries(char.skills).forEach(([skillId, level]) => {
       const def = SKILL_DEFINITIONS[skillId];
       if (def && def.statBonus && level > 0) {
          Object.entries(def.statBonus).forEach(([attr, val]) => {
              stats[attr as Attribute] += val * level;
          });
       }
    });

    // Equipment Modifiers
    char.inventory.forEach(item => {
      if (item.equipped && item.modifiers) {
        Object.entries(item.modifiers).forEach(([attr, val]) => {
          if (val) stats[attr as Attribute] += val;
        });
      }
    });

    // Active Buffs
    if (char.activeBuffs) {
       char.activeBuffs.forEach(buff => {
         stats[buff.targetStat] += buff.value;
       });
    }

    return stats;
  };

  const effectiveStats = getEffectiveStats();

  // Dynamic Max HP Calculation
  const getMaxHP = () => {
    let base = 20;
    base += (effectiveStats.VIGUEUR * 2); // Base Vigor scaling

    // Skill HP Bonuses
    Object.entries(char.skills).forEach(([skillId, level]) => {
       const def = SKILL_DEFINITIONS[skillId];
       if (def && def.hpBonus && level > 0) {
          base += def.hpBonus * level;
       }
    });
    return Math.floor(base);
  };
  const maxHP = getMaxHP();

  const getMaxWeight = () => {
    const baseWeight = 20;
    const vigorBonus = effectiveStats.VIGUEUR * 1.5; // Vigueur impact
    const backpackBonus = char.inventory
      .filter(i => i.equipped && i.type === ItemType.CONTAINER)
      .reduce((acc, i) => acc + (i.capacityBonus || 0), 0);
    return baseWeight + vigorBonus + backpackBonus;
  };

  const totalWeight = char.inventory.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
  const maxWeight = getMaxWeight();

  // Theme Logic based on Class
  useEffect(() => {
    const job = char.job;
    if (job === 'Fanatique' || job === 'Ruche' || job === 'Pestifere') {
      setTheme('rad');
    } else if (job === 'Pacteux' || job === 'Navidson') {
      setTheme('salt');
    } else {
      setTheme('rust'); 
    }
  }, [char.job]);

  // Synchronise le volume audio avec le service d'ambiance
  useEffect(() => {
    audioManager.setMusicVolume(musicVol);
  }, [musicVol]);

  // Boot Sequence Logic - reactive to booting state
  useEffect(() => {
    if (!booting) return; // Only run when booting is true

    setBootLog([]); // Clear previous logs
    setShowStartButton(false);

    const logs = [
      "INITIATING KERNEL...",
      "LOADING STRAND PROTOCOLS...",
      "CHECKING MEMORY INTEGRITY... [FAIL]",
      "BYPASSING SECURITY...",
      "ESTABLISHING CONNECTION TO NULVA TERRA...",
      "SUCCESS.",
      "SYSTEM READY."
    ];
    
    const timeouts: any[] = [];
    let accumDelay = 0;

    logs.forEach((log) => {
      const delay = Math.random() * 500 + 200;
      accumDelay += delay;
      const t = setTimeout(() => {
        setBootLog(prev => [...prev, log]);
        try { audioManager.playStaticBurst(); } catch(e){}
      }, accumDelay);
      timeouts.push(t);
    });
    
    // Show start button after logs
    const tBtn = setTimeout(() => {
      setShowStartButton(true);
    }, accumDelay + 800);
    timeouts.push(tBtn);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [booting]); // Dependency on booting triggers re-run on Reset

  // Initial Load (Only on Mount)
  useEffect(() => {
    const saved = localStorage.getItem('strand_char_sheet');
    if (saved) {
      try {
        setChar(JSON.parse(saved));
      } catch (e) {
        console.error("Save corrupted");
      }
    }
  }, []);

  const handleStartSystem = () => {
      try {
        audioManager.playBootSequence();
        audioManager.startAmbience(); 
      } catch (e) {}
      setBooting(false);
  };

  // Update Max HP state only if different (avoids loops, but keeps state valid for consumption)
  useEffect(() => {
    // Only update if current stored max does not match calculated max
    if (char.hp.max !== maxHP) {
       setChar(prev => ({...prev, hp: {...prev.hp, max: maxHP}}));
    }
  }, [maxHP]);

  // Auto Save
  useEffect(() => {
    if (!booting) {
      localStorage.setItem('strand_char_sheet', JSON.stringify(char));
    }
  }, [char, booting]);

  // --- Handlers ---

  const handleClassChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newJob = e.target.value;
    if (newJob === char.job) return;

    setChar(prev => ({
        ...prev,
        job: newJob,
        skills: {},
        level: 1,
        xp: 0
    }));
  };

  const handleGenericChange = (field: keyof Character) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
     setChar(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleLevelUp = () => {
    try { audioManager.playLevelUp(); } catch(e){}
    setChar(prev => ({ ...prev, level: prev.level + 1 }));
  };

  const handleSkillUpgrade = (skillId: string, costSP: number, costCycles: number) => {
    setChar(prev => {
      const currentLevel = prev.skills[skillId] || 0;
      return {
        ...prev,
        cycles: prev.cycles - costCycles,
        skills: {
           ...prev.skills,
           [skillId]: currentLevel + 1
        }
      };
    });
  };

  const handleBaseStatChange = (stat: Attribute, val: number) => {
    setChar(prev => ({ ...prev, attributes: { ...prev.attributes, [stat]: val } }));
  };

  const handleBarChange = (bar: 'hp' | 'mentalStability', type: 'current' | 'max', val: string) => {
    const num = parseInt(val) || 0;
    setChar(prev => ({ ...prev, [bar]: { ...prev[bar], [type]: num } }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChar(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- HARD RESET LOGIC ---
  const handleReset = () => {
    if (window.confirm("CONFIRMATION REQUISE : REFORMATAGE COMPLET DU SYSTÈME ?")) {
      try { audioManager.playStaticBurst(); } catch (e) {}

      const resetState: Character = {
        name: '',
        nickname: '',
        age: '',
        gender: '',
        race: 'Humain',
        origin: 'Rix',
        job: 'Pacteux',
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
        hp: { current: 44, max: 44 }, 
        mentalStability: { current: 20, max: 20 },
        inventory: [],
        cycles: 0,
        journal: '',
        abilities: '',
        imageUrl: ''
      };

      localStorage.setItem('strand_char_sheet', JSON.stringify(resetState));
      window.location.reload();
    }
  };

  // Item Logic
  const handleSaveNewItem = (item: Item) => {
    setChar(prev => ({ ...prev, inventory: [...prev.inventory, item] }));
    setIsCreatingItem(false);
  };

  const deleteItem = (id: string) => {
    setChar(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== id) }));
  };

  const consumeItem = (item: Item) => {
    const effect = item.consumableEffect;
    
    if (effect) {
       if (effect.type === ConsumableType.HEAL_HP) {
          setChar(prev => ({
              ...prev,
              hp: { ...prev.hp, current: Math.min(maxHP, prev.hp.current + effect.value) }
          }));
       } else if (effect.type === ConsumableType.HEAL_MENTAL) {
          setChar(prev => ({
              ...prev,
              mentalStability: { ...prev.mentalStability, current: Math.min(prev.mentalStability.max, prev.mentalStability.current + effect.value) }
          }));
       } else if (effect.type === ConsumableType.BUFF_STAT && effect.targetStat) {
          const newBuff: ActiveBuff = {
              id: Date.now().toString(),
              sourceName: item.name,
              targetStat: effect.targetStat,
              value: effect.value,
              duration: effect.duration || 'Temporaire'
          };
          setChar(prev => ({ ...prev, activeBuffs: [...(prev.activeBuffs || []), newBuff] }));
       }
    }

    setChar(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => {
        if (i.id === item.id) {
            return { ...i, quantity: Math.max(0, i.quantity - 1) };
        }
        return i;
      }).filter(i => i.quantity > 0)
    }));
  };

  const removeBuff = (buffId: string) => {
      setChar(prev => ({ ...prev, activeBuffs: prev.activeBuffs.filter(b => b.id !== buffId) }));
  };

  /**
   * CORRECTED TOGGLE EQUIP (IMMUTABLE)
   */
  const toggleEquip = (item: Item) => {
    if (!item.slot) return;
    
    setChar(prev => {
      const isEquipping = !prev.inventory.find(i => i.id === item.id)?.equipped;

      const updatedInventory = prev.inventory.map(i => {
        if (i.id === item.id) {
          return { ...i, equipped: isEquipping };
        }

        if (isEquipping) {
          if (i.equipped && i.slot === item.slot) {
            return { ...i, equipped: false };
          }

          if (item.slot === EquipmentSlot.MAIN_HAND && item.isTwoHanded && i.slot === EquipmentSlot.OFF_HAND) {
            return { ...i, equipped: false };
          }
          if (item.slot === EquipmentSlot.OFF_HAND && i.slot === EquipmentSlot.MAIN_HAND && i.isTwoHanded) {
            return { ...i, equipped: false };
          }
        }

        return i;
      });

      return { ...prev, inventory: updatedInventory };
    });
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(char));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `strand_${char.name || 'char'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loaded = JSON.parse(event.target?.result as string);
          setChar(loaded);
        } catch (e) {
          alert("Fichier corrompu.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Render Boot Screen
  if (booting) {
    return (
      <div className="h-screen w-screen bg-black text-green-500 font-mono p-10 flex flex-col justify-end pb-20 items-start">
        {bootLog.map((log, i) => <div key={i} className="mb-2">{log}</div>)}
        {!showStartButton && <div className="animate-pulse">_</div>}
        
        {showStartButton && (
            <button 
                onClick={handleStartSystem}
                className="mt-8 px-6 py-2 border-2 border-green-500 text-green-500 font-bold hover:bg-green-500 hover:text-black transition-colors animate-pulse tracking-widest"
            >
                [ INITIALISER LE SYSTÈME ]
            </button>
        )}
      </div>
    );
  }

  // Render Main App
  return (
    <div className={`min-h-screen p-2 md:p-6 text-base theme-${theme} relative`}>
      <div className="fixed inset-0 pointer-events-none z-50 crt-overlay"></div>
      <div className="fixed inset-0 pointer-events-none z-40 scanline"></div>
      
      {/* Sticky Header Controls */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur border-b border-theme border-opacity-50 p-2 mb-6 flex flex-col md:flex-row justify-between items-center shadow-[0_0_15px_rgba(0,0,0,0.8)] gap-2">
        <h1 className="text-xl font-bold tracking-tighter text-theme text-shadow-glow">TERMINAL STRAND v4.1</h1>
        
        <div className="flex items-center gap-4">
           {/* Slider Audio Diégétique */}
           <div className="flex items-center gap-2 border border-theme/30 px-3 py-1 bg-black/40">
              <span className="text-[10px] text-theme/60 font-bold uppercase tracking-tighter">AUDIO</span>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={musicVol} 
                onChange={(e) => setMusicVol(parseFloat(e.target.value))}
                className="w-24 strand-slider cursor-pointer"
              />
              <span className="text-[10px] text-theme font-mono w-6 text-right">{(musicVol * 100).toFixed(0)}%</span>
           </div>

           <div className="flex gap-2">
             <Button onClick={() => setIsMuted(audioManager.toggleMute())}>
               {isMuted ? 'UNMUTE' : 'MUTE'}
             </Button>
             <Button onClick={handleReset} variant="danger" className="border-red-600 text-red-600 hover:bg-red-900 cursor-pointer">RESET</Button>
             <Button onClick={exportData}>SAVE</Button>
             <label className="cursor-pointer">
               <span className="px-4 py-1 font-bold uppercase tracking-widest text-sm transition-all duration-100 border border-theme text-theme hover:bg-theme hover:text-black inline-block">LOAD</span>
               <input type="file" className="hidden" onChange={importData} accept=".json" />
             </label>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Identity & Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="border-2 border-theme p-1 relative bg-black/50">
            <div className="absolute -top-3 left-4 bg-black px-2 text-theme font-bold text-lg">IDENTITÉ</div>
            <div className="p-4 border border-theme/30 space-y-4">
              
              <div className="flex gap-4">
                <div className="w-24 h-24 shrink-0 border border-theme/50 relative overflow-hidden bg-gray-900 group">
                  {char.imageUrl ? (
                    <img src={char.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale contrast-125 sepia hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-center text-gray-600">NO SIGNAL</div>
                  )}
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Photo" />
                </div>
                <div className="grow space-y-2">
                  <div>
                    <input 
                      type="text" placeholder="NOM" value={char.name} 
                      onChange={handleGenericChange('name')} 
                      className="input-base text-lg font-bold uppercase" 
                    />
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" placeholder="SURNOM" value={char.nickname} 
                      onChange={handleGenericChange('nickname')} 
                      className="input-base text-sm italic w-2/3" 
                    />
                    <div className="flex items-center justify-center border border-theme/30 px-2 w-1/3 bg-black/40">
                       <span className="text-xs mr-2 text-gray-500">NIV</span>
                       <span className="text-xl font-bold text-theme">{char.level}</span>
                       <button onClick={handleLevelUp} className="ml-2 text-xs border border-theme px-1 hover:bg-theme hover:text-black">+1</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                       <label className="text-[10px] uppercase text-gray-500 block mb-1">Race</label>
                       <select value={char.race} onChange={handleGenericChange('race')} className="input-base text-sm">
                        {RACES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div>
                       <label className="text-[10px] uppercase text-gray-500 block mb-1">Ville d'Origine</label>
                       <select value={char.origin} onChange={handleGenericChange('origin')} className="input-base text-sm">
                        {ORIGINS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                       <label className="text-[10px] uppercase text-gray-500 block mb-1">Classe</label>
                       <select value={char.job} onChange={handleClassChange} className="input-base text-sm font-bold text-theme">
                        {CLASSES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                    <div>
                       <label className="text-[10px] uppercase text-gray-500 block mb-1">Age</label>
                       <input type="text" value={char.age} onChange={handleGenericChange('age')} className="input-base text-sm" />
                    </div>
                    <div>
                       <label className="text-[10px] uppercase text-gray-500 block mb-1">Genre</label>
                       <input type="text" value={char.gender} onChange={handleGenericChange('gender')} className="input-base text-sm" />
                    </div>
                 </div>
              </div>

            </div>
          </div>

          <div className="border-2 border-theme p-1 relative bg-black/50">
            <div className="absolute -top-3 left-4 bg-black px-2 text-theme font-bold text-lg">CONSTANTES VITALES</div>
            <div className="p-4 border border-theme/30 space-y-6">
              
              <div className="group">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-red-500 font-bold">POINTS DE VIE</label>
                  <div className="flex gap-1 text-xs">
                    <input type="number" value={char.hp.current} onChange={(e) => handleBarChange('hp', 'current', e.target.value)} className="w-10 bg-transparent text-right border-b border-gray-600 focus:border-red-500 outline-none text-red-500" />
                    <span>/</span>
                    <span className="w-10 text-center text-red-500">{Number.isInteger(maxHP) ? maxHP : maxHP.toFixed(1)}</span>
                  </div>
                </div>
                <ProgressBar value={char.hp.current} max={maxHP} colorClass="bg-red-600" label="" shake={char.hp.current < maxHP * 0.3} />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-blue-400 font-bold">STABILITÉ MENTALE</label>
                  <div className="flex gap-1 text-xs">
                    <input type="number" value={char.mentalStability.current} onChange={(e) => handleBarChange('mentalStability', 'current', e.target.value)} className="w-10 bg-transparent text-right border-b border-gray-600 focus:border-blue-500 outline-none text-blue-400" />
                    <span>/</span>
                    <input type="number" value={char.mentalStability.max} onChange={(e) => handleBarChange('mentalStability', 'max', e.target.value)} className="w-10 bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none text-blue-400" />
                  </div>
                </div>
                <ProgressBar value={char.mentalStability.current} max={char.mentalStability.max} colorClass="bg-blue-500" label="" shake={char.mentalStability.current < 5} />
              </div>

            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {Object.keys(Attribute).map((key) => {
               const attr = key as Attribute;
               return (
                 <StatKnob 
                    key={attr}
                    label={attr} 
                    baseValue={char.attributes[attr]} 
                    bonusValue={effectiveStats[attr] - char.attributes[attr]}
                    onChange={(v) => handleBaseStatChange(attr, v)} 
                 />
               );
             })}
          </div>
          
          {char.activeBuffs && char.activeBuffs.length > 0 && (
            <div className="border border-green-900 bg-green-900/10 p-2">
              <h4 className="text-xs font-bold text-green-500 mb-2 uppercase">Effets Actifs</h4>
              <div className="space-y-2">
                {char.activeBuffs.map(buff => (
                  <div key={buff.id} className="flex justify-between items-center text-xs bg-black/60 p-1 border-l-2 border-green-500">
                    <div>
                      <span className="font-bold text-green-400">{buff.sourceName}</span>
                      <span className="text-gray-400 ml-1">({buff.duration})</span>
                      <div className="text-theme">+{buff.value} {buff.targetStat}</div>
                    </div>
                    <button onClick={() => removeBuff(buff.id)} className="text-red-500 hover:text-red-300 font-bold px-2">X</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Tabs */}
        <div className="lg:col-span-8 flex flex-col h-full border-2 border-theme bg-black/80 relative">
          
          <div className="flex border-b-2 border-theme bg-black/50">
            <button 
              onClick={() => setActiveTab('inv')}
              className={`flex-1 py-3 text-center font-bold tracking-widest hover:bg-theme/20 transition-colors ${activeTab === 'inv' ? 'bg-theme text-black' : 'text-theme'}`}
            >
              ÉQUIPEMENT
            </button>
            <button 
              onClick={() => setActiveTab('skills')}
              className={`flex-1 py-3 text-center font-bold tracking-widest hover:bg-theme/20 transition-colors ${activeTab === 'skills' ? 'bg-theme text-black' : 'text-theme'}`}
            >
              COMPÉTENCES
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-center font-bold tracking-widest hover:bg-theme/20 transition-colors ${activeTab === 'notes' ? 'bg-theme text-black' : 'text-theme'}`}
            >
              JOURNAL
            </button>
          </div>

          <div className="flex-grow overflow-hidden relative">
            
            {activeTab === 'inv' && (
              <div className="space-y-6 animate-fadeIn overflow-auto h-full p-6">
                
                <div className="border-b border-theme/30 pb-4">
                   <h3 className="text-lg font-bold mb-4 text-center">GRILLE D'ÉQUIPEMENT</h3>
                   <EquipmentGrid inventory={char.inventory} onUnequip={toggleEquip} slots={{}} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <div className="bg-gray-900 border border-theme/30 p-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Capacités Actives</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(char.skills).map(([skillId, level]) => {
                           const def = SKILL_DEFINITIONS[skillId];
                           if (level > 0 && def && (def.specialEffect || def.description)) {
                             return (
                               <div key={skillId} className="group relative cursor-help">
                                  <span className="bg-theme/20 text-theme px-2 py-1 text-xs border border-theme/50 hover:bg-theme hover:text-black transition-colors">
                                     {def.name}
                                  </span>
                                  <div className="absolute bottom-full left-0 w-48 bg-black border border-theme p-2 text-[10px] text-gray-300 hidden group-hover:block z-50 mb-1 pointer-events-none">
                                     <div className="font-bold text-theme mb-1">{def.specialEffect || "Effet Passif"}</div>
                                     {def.description}
                                  </div>
                               </div>
                             );
                           }
                           return null;
                        })}
                        {Object.keys(char.skills).length === 0 && <span className="text-xs text-gray-600 italic">Aucune compétence apprise.</span>}
                      </div>
                   </div>
                   
                   <div className="flex flex-col justify-center gap-2 bg-gray-900 border border-theme/30 p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-400">CYCLES</span>
                        <input type="number" value={char.cycles} onChange={(e) => setChar({...char, cycles: parseInt(e.target.value)})} className="bg-transparent text-right text-xl font-mono text-theme w-1/2 outline-none" />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="uppercase text-gray-500">Poids</span>
                        <span className={totalWeight > maxWeight ? 'text-red-500 animate-pulse font-bold' : 'text-theme'}>
                          {totalWeight.toFixed(1)} / {maxWeight.toFixed(1)} KG
                        </span>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2 border-b border-theme/30 pb-1">
                    <h3 className="text-lg font-bold">MANIFESTE DE CHARGEMENT</h3>
                  </div>

                  {isCreatingItem ? (
                     <ItemCreator onSave={handleSaveNewItem} onCancel={() => setIsCreatingItem(false)} />
                  ) : (
                    <div className="space-y-2">
                      {char.inventory.length === 0 && <div className="text-center text-gray-600 py-4 italic">Inventaire vide.</div>}
                      
                      {char.inventory.map((item) => (
                        <div key={item.id} className={`flex flex-col md:flex-row items-start md:items-center gap-2 bg-gray-900/50 p-2 border ${item.equipped ? 'border-theme bg-theme/10' : 'border-gray-800'} hover:border-theme transition-colors group relative`}>
                          
                          <div className="flex items-center gap-3 flex-grow w-full">
                            <ItemIcon type={item.type} className={`w-6 h-6 flex-shrink-0 ${item.equipped ? 'text-theme' : 'text-gray-500'}`} />
                            
                            <div className="flex flex-col flex-grow">
                              <span className={`font-bold ${item.equipped ? 'text-theme' : 'text-gray-300'}`}>{item.name}</span>
                              <div className="text-[10px] text-gray-500 flex flex-wrap gap-2">
                                 <span>{item.type}</span>
                                 {item.slot && <span>[{item.slot}]</span>}
                                 {item.consumableEffect && <span className="text-green-600">EFFECT: {item.consumableEffect.type}</span>}
                                 {item.modifiers && Object.entries(item.modifiers).map(([k, v]) => v !== 0 && <span key={k} className={v > 0 ? 'text-green-700' : 'text-red-700'}>{k.substring(0,3)}:{v > 0 ? '+' : ''}{v}</span>)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full md:w-auto justify-end mt-2 md:mt-0">
                            <span className="text-xs text-gray-500">x{item.quantity}</span>
                            <span className="text-xs text-gray-500 w-12 text-right">{item.weight}kg</span>
                            
                            <div className="flex gap-1 ml-2">
                              {item.type === ItemType.CONSUMABLE && (
                                <Button variant="ghost" onClick={() => consumeItem(item)}>UTILISER</Button>
                              )}
                              
                              {item.slot && (
                                <Button variant={item.equipped ? 'primary' : 'ghost'} onClick={() => toggleEquip(item)}>
                                  {item.equipped ? 'DÉSÉQUIPER' : 'ÉQUIPER'}
                                </Button>
                              )}

                              <Button variant="danger" onClick={() => deleteItem(item.id)} className="px-2">X</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button onClick={() => setIsCreatingItem(true)} className="w-full mt-4 border-dashed opacity-50 hover:opacity-100">+ ENCODER NOUVEL OBJET</Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="h-full animate-fadeIn flex flex-col">
                <div className="flex justify-between items-center border-b border-theme/30 px-6 py-4 bg-black/80 z-20">
                   <h3 className="text-lg font-bold">ARBRE DE COMPÉTENCES: {char.job.toUpperCase()}</h3>
                   <div className="bg-gray-900 border border-theme px-3 py-1 text-sm font-mono">
                      PTS DISPO: <span className="text-xl font-bold text-theme ml-1">{availableSkillPoints}</span>
                   </div>
                </div>

                <div className="flex-grow flex overflow-hidden">
                   <div className="flex-grow overflow-auto p-4 flex justify-center items-start">
                      <SkillTreeLayout 
                        job={char.job} 
                        character={char} 
                        onUpgrade={handleSkillUpgrade} 
                        availSP={availableSkillPoints}
                        setHoveredSkill={setHoveredSkillId}
                      />
                   </div>

                   <div className="w-1/3 min-w-[300px] border-l border-theme/30 bg-black/60 shadow-[-10px_0_20px_rgba(0,0,0,0.5)] z-20">
                      <SkillDetailPanel skillId={hoveredSkillId} character={char} availSP={availableSkillPoints} />
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full p-6">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-bold border-b border-theme/30 mb-2">JOURNAL DE BORD</h3>
                  <textarea 
                    value={char.journal}
                    onChange={(e) => setChar({...char, journal: e.target.value})}
                    className="flex-grow bg-black/30 border border-gray-800 p-4 text-theme font-mono resize-none focus:border-theme outline-none text-sm leading-relaxed"
                    placeholder="Entrez vos observations ici..."
                  />
                </div>
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-bold border-b border-theme/30 mb-2">NOTES DIVERSES</h3>
                  <textarea 
                    value={char.abilities}
                    onChange={(e) => setChar({...char, abilities: e.target.value})}
                    className="flex-grow bg-black/30 border border-gray-800 p-4 text-theme font-mono resize-none focus:border-theme outline-none text-sm leading-relaxed"
                    placeholder="Notes sur les factions, lieux, ou codes..."
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-theme"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-theme"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-theme"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-theme"></div>
        </div>

      </div>
    </div>
  );
}