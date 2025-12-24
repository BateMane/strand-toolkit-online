import { db, collection, doc, deleteDoc, onSnapshot, query, orderBy, limit } from "/firebase-init.js";

const ROOM_ID = "strand"; 

let unsubscribePlayers = null;
let unsubscribeLogs = null;

// --- BASE DE DONNÉES COMPÉTENCES ---
// (Remets ici ta grande liste const SKILL_DB = { ... })
const SKILL_DB = {
  'pac_root': { name: 'Discipline de Fer', desc: 'PV Max +0.4/niv. Le socle de l\'armée.' },
  'pac_L1': { name: 'Phalange', desc: 'Bonus d\'armure si immobile.\nEffet: Armure +2 (Immobile)' },
  'pac_L2': { name: 'Bouclier Blanc', desc: 'Résistance aux tempêtes de cristaux.\nEffet: Résist. Env.' },
  'pac_R1': { name: 'Marteau Hydraulique', desc: 'Utilisation d\'armes de siège au CaC.\nBonus: VIGUEUR +0.2' },
  'pac_R2': { name: 'Charge Piston', desc: 'Renverse les ennemis lourds (Grausl).\nEffet: Renversement' },
  'pac_mid': { name: 'Vétéran de l\'Acier', desc: 'Débloque l\'usage du Fer à Mémoire militaire.\nEffet: Maîtrise Fer Pur' },
  'pac_LL1': { name: 'Mur Vivant', desc: 'Encaisse les dégâts des alliés proches.\nEffet: Protection Zone' },
  'pac_LL2': { name: 'Inébranlable', desc: 'Immunité à la peur et aux chocs.\nBonus HP: +1.0' },
  'pac_UltL': { name: 'LA CITADELLE', desc: 'ULTIME : Invulnérabilité totale 1 tour.\nEffet: INVINCIBLE' },
  'pac_LR1': { name: 'Surcharge Carminite', desc: 'Booste les dégâts, blesse l\'utilisateur.\nEffet: Dégâts x2 / PV -2' },
  'pac_LR2': { name: 'Tueur de Coques', desc: 'Ignore l\'armure naturelle.\nEffet: Perce-Armure' },
  'pac_UltR': { name: 'LE JUGEMENT', desc: 'ULTIME : Coup unique mortel sur cible large.\nEffet: INSTAKILL (Non-Boss)' },
  'fan_root': { name: 'Baptême du Rad', desc: 'Résistance aux radiations + Immunité nausée.\nBonus: VIGUEUR +0.2' },
  'fan_L1': { name: 'Voix de Jacob', desc: 'Intimidation par la foi.\nBonus: ESPRIT +0.2' },
  'fan_L2': { name: 'Conversion', desc: 'Peut rallier des PNJ faibles.\nEffet: Charisme Forcé' },
  'fan_R1': { name: 'Chair Tuméfiée', desc: 'La peau devient une armure naturelle.\nBonus HP: +0.5' },
  'fan_R2': { name: 'Griffes d\'Os', desc: 'Fait pousser des armes naturelles.\nEffet: Arme Intégrée' },
  'fan_mid': { name: 'Communion', desc: 'Régénère de l\'Esprit près des sources radioactives.\nEffet: Regen Zone Rad' },
  'fan_LL1': { name: 'Aura Verte', desc: 'Irradie les ennemis proches.\nEffet: Dégâts Zone Passif' },
  'fan_LL2': { name: 'Vision de Koval', desc: 'Voit à travers la matière.\nBonus: ESPRIT +0.5' },
  'fan_UltL': { name: 'SUPERCRITIQUE', desc: 'ULTIME : Explosion atomique corporelle.\nEffet: Suicide Explosif (Survivable)' },
  'fan_LR1': { name: 'Croissance Rapide', desc: 'Soins massifs, perte d\'humanité.\nBonus HP: +1.0' },
  'fan_LR2': { name: 'Troisième Bras', desc: 'Peut tenir une arme supplémentaire.\nEffet: Main +1' },
  'fan_UltR': { name: 'GRAUSL SACRÉ', desc: 'ULTIME : Transformation temporaire en Grausl.\nBonus: VIGUEUR +2.0' },
  'sci_root': { name: 'Esprit Analytique', desc: 'Compréhension des artefacts. Tech +.\nBonus: TECH +0.2' },
  'sci_L1': { name: 'Médecine de Guerre', desc: 'Soins efficaces sans magie.\nEffet: Soin +50%' },
  'sci_L2': { name: 'Étude des Hybrides', desc: 'Bonus de dégâts contre Mutants.\nEffet: Savoir Anatomique' },
  'sci_R1': { name: 'Ingénieur du Son', desc: 'Utilise des leurres acoustiques.\nBonus: SILENCE +0.2' },
  'sci_R2': { name: 'Arme à Énergie', desc: 'Entretien des armes lasers rares.\nEffet: Usage Laser' },
  'sci_mid': { name: 'Codex Partiel', desc: 'Débloque des recettes de craft avancées.\nEffet: Craft T3' },
  'sci_LL1': { name: 'Sérum de Stase', desc: 'Stoppe le poison et le saignement.\nEffet: Cure Totale' },
  'sci_LL2': { name: 'Greffe Navidson', desc: 'Implant cybernétique propre.\nBonus: VIGUEUR +0.5' },
  'sci_UltL': { name: 'LAZARE', desc: 'ULTIME : Réanimation d\'un mort récent.\nEffet: Résurrection (Instable)' },
  'sci_LR1': { name: 'Surcharge Réacteur', desc: 'Transforme la Carminite en grenade.\nEffet: Grenade Plasma' },
  'sci_LR2': { name: 'Champ de Force', desc: 'Bouclier personnel temporaire.\nBonus HP: +1.0' },
  'sci_UltR': { name: 'MICRO-FISSURE', desc: 'ULTIME : Crée une zone de néant locale.\nEffet: Trou Noir' },
  'moi_root': { name: 'Faim Insatiable', desc: 'Peut manger n\'importe quoi. Immunité poison.\nBonus HP: +0.4' },
  'moi_L1': { name: 'Pistage Sanglant', desc: 'Suit les blessés automatiquement.\nEffet: Vision Sang' },
  'moi_L2': { name: 'Embuscade', desc: 'Premier coup critique.\nBonus: SILENCE +0.3' },
  'moi_R1': { name: 'Dompteur', desc: 'Les Grausls ne vous attaquent pas.\nEffet: Paix Grausl' },
  'moi_R2': { name: 'Cri de Guerre', desc: 'Effraie les ennemis humains.\nEffet: Peur Zone' },
  'moi_mid': { name: 'Rituel Anthropophage', desc: 'Manger de l\'humain rend des PV.\nEffet: Cannibalisme Soin' },
  'moi_LL1': { name: 'Trophées', desc: 'Gagne de la force par ennemi tué.\nBonus: VIGUEUR +0.5' },
  'moi_LL2': { name: 'Berserk', desc: 'Ne tombe pas inconscient à 0 PV.\nEffet: Refus Mort 1 tour' },
  'moi_UltL': { name: 'LA GRANDE CHASSE', desc: 'ULTIME : Vitesse et Dégâts doublés.\nEffet: Mode Rage' },
  'moi_LR1': { name: 'Chaînes de Grausl', desc: 'Possède un familier Grausl.\nEffet: Pet: Grausl' },
  'moi_LR2': { name: 'Armure d\'Os', desc: 'Craft d\'armures lourdes organiques.\nBonus HP: +1.5' },
  'moi_UltR': { name: 'LE FESTIN', desc: 'ULTIME : Dévore un ennemi vivant pour full heal.\nEffet: One-Shot + Heal' },
  'san_root': { name: 'Réseau de l\'Ombre', desc: 'Accès aux rumeurs et prix du marché.\nBonus: ESPRIT +0.2' },
  'san_L1': { name: 'Oreille Indiscrète', desc: 'Détecte les mensonges.\nEffet: Détection Mensonge' },
  'san_L2': { name: 'Visage Anonyme', desc: 'Passe inaperçu dans la foule.\nBonus: SILENCE +0.3' },
  'san_R1': { name: 'Contrebande', desc: 'Cache des objets sur soi.\nEffet: Inv Caché' },
  'san_R2': { name: 'Blanchiment', desc: 'Meilleurs prix de vente.\nEffet: Vente +20%' },
  'san_mid': { name: 'Dague de Verre', desc: 'Accès aux armes invisibles.\nEffet: Arme Invisible' },
  'san_LL1': { name: 'Chantage', desc: 'Peut éviter un combat par la parole.\nEffet: Diplomatie Forcée' },
  'san_LL2': { name: 'Sabotage', desc: 'Désactive les alarmes.\nBonus: TECH +0.5' },
  'san_UltL': { name: 'L\'OEIL QUI VOIT TOUT', desc: 'ULTIME : Révèle toute la carte/ennemis.\nEffet: Omniscience' },
  'san_LR1': { name: 'Poison Neuro', desc: 'Enduit les armes de toxines.\nEffet: Poison' },
  'san_LR2': { name: 'Assassinat', desc: 'Dégâts critiques dans le dos.\nEffet: Backstab x3' },
  'san_UltR': { name: 'LA MAIN INVISIBLE', desc: 'ULTIME : Voler un objet équipé.\nEffet: Vol Majeur' },
  'ruc_root': { name: 'Lien Source', desc: 'Énergie infinie, mais pas de soin naturel.\nBonus: TECH +0.2' },
  'ruc_L1': { name: 'Calcul Balistique', desc: 'Visée parfaite.\nEffet: Précision 100%' },
  'ruc_L2': { name: 'Protocoles de Guerre', desc: 'Maîtrise de toutes les armes.\nEffet: Maîtrise Totale' },
  'ruc_R1': { name: 'Logique Froide', desc: 'Immunité totale à la Peur et Psychose.\nBonus: ESPRIT +0.4' },
  'ruc_R2': { name: 'Interface', desc: 'Hack instantané des terminaux.\nEffet: Hack Auto' },
  'ruc_mid': { name: 'Châssis Fer-Mémoire', desc: 'Réduit le SDA (Syndrome Dégradation).\nBonus HP: +1.0' },
  'ruc_LL1': { name: 'Arme Intégrée', desc: 'Arme à feu dans le bras.\nEffet: Arme Cachée' },
  'ruc_LL2': { name: 'Vision Thermique', desc: 'Voir dans le noir et les murs.\nEffet: Vision X' },
  'ruc_UltL': { name: 'MODE SIEGE', desc: 'ULTIME : Devient une tourelle immobile dévastatrice.\nEffet: Dégâts x4 / Immobile' },
  'ruc_LR1': { name: 'Relais Drone', desc: 'Contrôle des petits drones.\nEffet: Drones' },
  'ruc_LR2': { name: 'Upload Conscience', desc: 'Sauvegarde l\'esprit si le corps meurt.\nEffet: Respawn (Cher)' },
  'ruc_UltR': { name: 'NEXUS LOCAL', desc: 'ULTIME : Contrôle les machines ennemies proches.\nEffet: Contrôle Zone' },
  'pes_root': { name: 'Moteur à Sang', desc: 'Utilise la Carminite et le sang comme carburant.\nBonus HP: +0.4' },
  'pes_L1': { name: 'Greffe Sauvage', desc: 'Peut s\'équiper de membres organiques.\nEffet: Slots Organiques' },
  'pes_L2': { name: 'Récupérateur', desc: 'Loot des pièces sur les cadavres.\nEffet: Loot Corps' },
  'pes_R1': { name: 'Pollution', desc: 'Dégage une fumée toxique.\nEffet: Aura Poison' },
  'pes_R2': { name: 'Douleur Fantôme', desc: 'Convertit la douleur en force.\nBonus: VIGUEUR +0.3' },
  'pes_mid': { name: 'Bricoleur Gore', desc: 'Réparation avec de la viande.\nEffet: Soin par Viande' },
  'pes_LL1': { name: 'Bras de Grausl', desc: 'Force démesurée, précision faible.\nBonus: VIGUEUR +0.5' },
  'pes_LL2': { name: 'Scie Circulaire', desc: 'Outil industriel comme arme.\nEffet: Saignement' },
  'pes_UltL': { name: 'FRANKENSTEIN', desc: 'ULTIME : Revient à la vie une fois par combat.\nEffet: Auto-Rez' },
  'pes_LR1': { name: 'Injecteur Carminite', desc: 'Boost temporaire explosif.\nEffet: Vitesse x2 / Dégâts' },
  'pes_LR2': { name: 'Huile Brûlante', desc: 'Crache du liquide inflammable.\nEffet: Lance-Flamme' },
  'pes_UltR': { name: 'SURCHARGE DU COEUR', desc: 'ULTIME : Kamikaze nucléaire.\nEffet: Explosion Finale' },
  'can_root': { name: 'Lois de Hadji', desc: 'Respect du silence. Discrétion naturelle.\nBonus: SILENCE +0.2' },
  'can_L1': { name: 'Négociant', desc: 'Meilleurs prix à l\'achat.\nEffet: Achat -10%' },
  'can_L2': { name: 'Réseau Marchand', desc: 'Accès aux boutiques rares.\nEffet: Shop Rare' },
  'can_R1': { name: 'Agilité Animale', desc: 'Esquive augmentée.\nEffet: Esquive +10%' },
  'can_R2': { name: 'Sens Aiguisés', desc: 'Détecte les embuscades.\nEffet: Anti-Surprise' },
  'can_mid': { name: 'Citoyen des Arbres', desc: 'Déplacement rapide dans les Broussailles.\nEffet: Parkour' },
  'can_LL1': { name: 'Caravane', desc: 'Capacité de port augmentée.\nEffet: Poids +10kg' },
  'can_LL2': { name: 'Garde du Corps', desc: 'Peut engager un mercenaire.\nEffet: Mercenaire' },
  'can_UltL': { name: 'MONOPOLE', desc: 'ULTIME : Génère des Cycles passivement.\nEffet: Revenu Passif' },
  'can_LR1': { name: 'Lame de Fer', desc: 'Maîtrise des armes nobles.\nEffet: Dégâts Fer +1' },
  'can_LR2': { name: 'Silence Mortel', desc: 'Attaque furtive dévastatrice.\nEffet: Critique Furtif' },
  'can_UltR': { name: 'HÉRITAGE DE HADJI', desc: 'ULTIME : Immunité aux Échos sonores.\nEffet: Immunité Son' },
  'par_root': { name: 'Système D', desc: 'Polyvalence. +0.1 partout.\nBonus: All Stats +0.1' },
  'par_L1': { name: 'Fouilleur', desc: 'Trouve plus d\'objets.\nEffet: Loot +1' },
  'par_L2': { name: 'Recyclage', desc: 'Démonte les objets pour composants.\nEffet: Scrap' },
  'par_R1': { name: 'Fuite', desc: 'Course rapide.\nBonus: VIGUEUR +0.2' },
  'par_R2': { name: 'Sixième Sens', desc: 'Sent le danger.\nBonus: ESPRIT +0.2' },
  'par_mid': { name: 'Adaptation', desc: 'Résistance aux maladies et faim.\nBonus HP: +1.0' },
  'par_LL1': { name: 'Bricolage', desc: 'Fabrique des pièges.\nEffet: Craft Pièges' },
  'par_LL2': { name: 'Arme de Fortune', desc: 'Bonus avec armes improvisées.\nEffet: Dégâts Impro' },
  'par_UltL': { name: 'ROI DES RATS', desc: 'ULTIME : Les nuisibles vous aident.\nEffet: Armée de Rats' },
  'par_LR1': { name: 'Tireur Embusqué', desc: 'Bonus fusil longue distance.\nEffet: Sniper' },
  'par_LR2': { name: 'Camouflage', desc: 'Invisible si immobile.\nEffet: Invisibilité' },
  'par_UltR': { name: 'LÉGENDE URBAINE', desc: 'ULTIME : Votre réputation vous précède (Peur).\nEffet: Peur Passive' },
};

function getSkillInfo(skillId) {
    if(SKILL_DB[skillId]) return SKILL_DB[skillId];
    const readable = skillId.replace(/_/g, ' ').toUpperCase();
    return { name: readable, desc: "Description non disponible." };
}

window.startGMTools = function() {
    console.log("GM Tools Active. Room:", ROOM_ID);
    refreshInterface();
    setupTooltips();
};

window.refreshGM = function() { refreshInterface(); };
window.clearLogs = function() { document.getElementById("logs-list").innerHTML = ""; };

function refreshInterface() {
    if (unsubscribePlayers) unsubscribePlayers();
    if (unsubscribeLogs) unsubscribeLogs();
    
    document.getElementById("players-zone").innerHTML = ""; 
    
    listenToPlayers();
    listenToLogs();
}

window.deletePlayerCharacter = async function(id, name) {
    if(confirm(`SUPPRIMER DÉFINITIVEMENT ${name} ?`)) {
        try { await deleteDoc(doc(db, "rooms", ROOM_ID, "players", id)); } catch(e) { alert(e); }
    }
};

function listenToPlayers() {
    const playersRef = collection(db, "rooms", ROOM_ID, "players");

    unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
        const zoneOnline = document.getElementById("players-zone");
        const zoneOffline = document.getElementById("offline-zone");
        const now = Date.now();
        const currentIds = [];

        if (snapshot.empty) {
            zoneOnline.innerHTML = "<div style='color:#555; text-align:center; width:100%'>AUCUN SIGNAL ACTIF.</div>";
            return;
        }

        snapshot.forEach((doc) => {
            currentIds.push(doc.id);
            const data = doc.data();
            const lastUpdate = data.lastUpdate || 0;
            const isOnline = (now - lastUpdate) < 15000; 

            let card = document.getElementById(`card-${doc.id}`);
            if (!card) {
                card = createCardElement(doc.id);
                zoneOnline.appendChild(card);
            }

            const detailsInv = card.querySelector('.details-inv');
            const detailsSkill = card.querySelector('.details-skill');
            const wasInvOpen = detailsInv ? detailsInv.hasAttribute('open') : false;
            const wasSkillOpen = detailsSkill ? detailsSkill.hasAttribute('open') : false;

            updateCardContent(card, data, doc.id, wasInvOpen, wasSkillOpen);

            if(isOnline) {
                if(card.parentElement !== zoneOnline) zoneOnline.appendChild(card);
                card.classList.remove("offline");
                card.classList.remove("updated");
                void card.offsetWidth; 
                card.classList.add("updated");
            } else {
                if(card.parentElement !== zoneOffline) zoneOffline.appendChild(card);
                card.classList.add("offline");
            }
        });

        document.querySelectorAll('.player-card').forEach(card => {
            const id = card.id.replace('card-', '');
            if (!currentIds.includes(id)) card.remove();
        });
        
        if (zoneOnline.children.length === 0) zoneOnline.innerHTML = "<div style='color:#555; text-align:center; width:100%'>AUCUN SIGNAL ACTIF.</div>";
    });
}

function createCardElement(id) {
    const div = document.createElement("div");
    div.id = `card-${id}`;
    div.className = "player-card";
    return div;
}

function updateCardContent(card, data, docId, openInv, openSkill) {
    const curHP = data.hp?.current ?? 0;
    const maxHP = data.hp?.max ?? 10;
    const hpPct = Math.min(100, Math.max(0, (curHP / maxHP) * 100));

    const curMen = data.mentalStability?.current ?? 0;
    const maxMen = data.mentalStability?.max ?? 20;
    const menPct = Math.min(100, Math.max(0, (curMen / maxMen) * 100));

    const baseStats = data.attributes || { VIGUEUR:0, SILENCE:0, ESPRIT:0, TECH:0 };
    const finalStats = data.effectiveStats || baseStats;

    const infoAge = data.age ? `${data.age} ans` : "Âge inc.";
    const infoGender = data.gender || "Genre inc.";

    const renderStat = (key) => {
        const base = parseFloat((baseStats[key] || 0).toFixed(1));
        const total = parseFloat((finalStats[key] || 0).toFixed(1));
        const rawBonus = total - base;
        const bonus = parseFloat(rawBonus.toFixed(1));
        const color = bonus > 0 ? '#4f4' : (bonus < 0 ? '#f44' : '#eee');
        
        return `
            <div class="stat-box">
                <span class="stat-name">${key.substring(0,3)}</span>
                <span class="stat-value" style="color:${color}">${total}</span>
                ${bonus !== 0 ? `<span class="stat-bonus">${bonus>0?'+':''}${bonus}</span>` : ''}
            </div>
        `;
    };

    card.innerHTML = `
    <div class="card-inner">
        <div class="card-header">
            <div class="char-identity">
                <span class="char-name">${data.name}</span>
                <span class="char-class">${data.job || "Inconnu"}</span>
            </div>
            <div class="char-meta">
                <div>NIV <span class="level-box">${data.level || 1}</span></div>
                <div style="margin-top:2px;">${data.origin || "Origine ?"}</div>
                <div style="color:#777; font-size:0.9em; margin-top:2px;">${infoAge} | ${infoGender}</div>
            </div>
            <button class="delete-btn" onclick="window.deletePlayerCharacter('${docId}', '${data.name}')">X</button>
        </div>

        <div class="bars-section">
            <div class="bar-group">
                <div class="bar-label"><span>Intégrité</span> <span>${curHP}/${maxHP}</span></div>
                <div class="bar-track"><div class="bar-fill hp-fill" style="width:${hpPct}%"></div></div>
            </div>
            <div class="bar-group">
                <div class="bar-label"><span>Stabilité</span> <span>${curMen}/${maxMen}</span></div>
                <div class="bar-track"><div class="bar-fill mental-fill" style="width:${menPct}%"></div></div>
            </div>
        </div>

        <div class="stats-grid">
            ${renderStat('VIGUEUR')}
            ${renderStat('SILENCE')}
            ${renderStat('ESPRIT')}
            ${renderStat('TECH')}
        </div>

        ${(data.activeBuffs && data.activeBuffs.length > 0) ? 
            `<div style="font-size:0.65em; color:#4f4; border:1px solid #030; background:#010; padding:4px;">
                ${data.activeBuffs.map(b => `[+${b.value} ${b.targetStat.substr(0,3)}] `).join('')}
             </div>` : ''
        }

        <details class="details-inv" ${openInv ? 'open' : ''}>
            <summary>MATÉRIEL <span>${data.inventory ? data.inventory.length : 0}</span></summary>
            <div class="details-content">${renderInventory(data.inventory)}</div>
        </details>

        <details class="details-skill" ${openSkill ? 'open' : ''}>
            <summary>COMPÉTENCES <span>${data.skills ? Object.keys(data.skills).length : 0}</span></summary>
            <div class="details-content">${renderSkills(data.skills)}</div>
        </details>
    </div>
    `;
}

// Fonction améliorée avec détection TYPE
function renderInventory(inv) {
    if (!inv || inv.length === 0) return "<div style='color:#555'>Vide</div>";
    
    const sorted = [...inv].sort((a, b) => (b.equipped === true) - (a.equipped === true));

    return sorted.map(item => {
        // --- LOGIQUE DE DETECTION DES TYPES ---
        let typeLabel = "AUTRE";
        const rawType = (item.type || "").toLowerCase();
        const rawSlot = (item.slot || "").toLowerCase();

        if (rawType === 'weapon') {
            typeLabel = "ARME";
        } else if (rawType === 'consumable') {
            typeLabel = "CONSO";
        } else if (rawType === 'container') {
            typeLabel = "SAC";
        } else if (rawType === 'object') {
            typeLabel = "OBJET";
        } else if (rawType === 'armor') {
            const slotMap = {
                'head': 'TÊTE',
                'torso': 'TORSE',
                'legs': 'JAMBES',
                'boots': 'PIEDS',
                'gloves': 'GANTS',
                'backpack': 'DOS',
                'main_hand': 'MAIN P.',
                'off_hand': 'MAIN S.'
            };
            typeLabel = slotMap[rawSlot] || "ARMURE";
        }

        let modsHtml = '';
        if (item.modifiers) {
            const mods = Object.entries(item.modifiers)
                .filter(([_, val]) => val !== 0) 
                .map(([key, val]) => `${key.substring(0,3)}:${val>0?'+':''}${val}`)
                .join(' ');
            if(mods) modsHtml = `<span class="item-mods">[${mods}]</span>`;
        }

        return `
        <div class="item-row">
            <div style="display:flex; align-items:center;">
                <span class="item-tag">${typeLabel}</span>
                <span class="item-name ${item.equipped ? 'item-equipped' : ''}">
                    ${item.equipped ? '★' : ''} ${item.name}
                </span>
                ${modsHtml}
            </div>
            <span class="item-qty">x${item.quantity}</span>
        </div>
        `;
    }).join('');
}

function renderSkills(skills) {
    if (!skills || Object.keys(skills).length === 0) return "<div style='color:#555'>Aucune</div>";
    return Object.entries(skills).map(([key, level]) => {
        const info = getSkillInfo(key);
        const safeDesc = info.desc.replace(/"/g, '&quot;');
        const safeName = info.name.replace(/"/g, '&quot;');
        return `
            <div class="skill-item" 
                 data-skill-name="${safeName} (Niv ${level})" 
                 data-skill-desc="${safeDesc}">
                <span style="font-weight:bold; color:#ccc;">${info.name}</span>
                <span class="skill-level">${level}</span>
            </div>
        `;
    }).join('');
}

function setupTooltips() {
    const tooltip = document.getElementById("global-tooltip");
    document.addEventListener("mousemove", (e) => {
        const target = e.target.closest(".skill-item");
        if (target) {
            const name = target.getAttribute("data-skill-name");
            const desc = target.getAttribute("data-skill-desc");
            tooltip.innerHTML = `<strong>${name}</strong>${desc}`;
            tooltip.style.display = "block";
            let top = e.clientY + 15;
            let left = e.clientX + 15;
            if (left + 300 > window.innerWidth) left = e.clientX - 315;
            if (top + tooltip.offsetHeight > window.innerHeight) top = e.clientY - tooltip.offsetHeight - 15;
            tooltip.style.top = top + "px";
            tooltip.style.left = left + "px";
        } else {
            tooltip.style.display = "none";
        }
    });
}

function listenToLogs() {
    const logsRef = collection(db, "rooms", ROOM_ID, "logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(50));
    unsubscribeLogs = onSnapshot(q, (snapshot) => {
        const list = document.getElementById("logs-list");
        list.innerHTML = "";
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const d = change.doc.data();
                if (d.isHeavy && (Date.now() - d.timestamp) < 5000) playSound();
            }
        });
        snapshot.forEach((doc) => {
            const data = doc.data();
            const div = document.createElement("div");
            div.className = `log-entry ${data.isHeavy ? 'log-heavy' : ''}`;
            const time = new Date(data.timestamp).toLocaleTimeString().split(' ')[0];
            div.innerHTML = `<span class="timestamp">[${time}]</span> <span class="log-player">${data.playerName}</span>: ${data.message}`;
            list.appendChild(div);
        });
    });
}

function playSound() {
    const audio = document.getElementById("alert-sound");
    if(audio) audio.play().catch(e=>{});
}