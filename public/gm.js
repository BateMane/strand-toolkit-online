// gm.js
import { db, collection, onSnapshot, query, orderBy, limit } from "/firebase-init.js";

// Nom de la "Room" (Tu peux rendre ça dynamique plus tard)
const ROOM_ID = "strand"; 

window.startGMTools = function() {
    console.log("Démarrage des outils MJ...");
    listenToPlayers();
    listenToLogs();
};

// 1. Écouter les fiches des joueurs en temps réel
function listenToPlayers() {
    const playersRef = collection(db, "rooms", ROOM_ID, "players");

    onSnapshot(playersRef, (snapshot) => {
        const container = document.getElementById("players-container");
        container.innerHTML = ""; // On nettoie pour re-afficher

        snapshot.forEach((doc) => {
            const data = doc.data();
            const playerCard = createPlayerCard(data, doc.id);
            container.appendChild(playerCard);
        });
    });
}

// Création HTML d'une fiche joueur (adapte les champs selon ton jeu)
function createPlayerCard(data, id) {
    const div = document.createElement("div");
    div.className = "player-card";
    
    // Calcul pourcentage PV (Exemple)
    const hpPercent = (data.hp / data.maxHp) * 100;

    div.innerHTML = `
        <h3>${data.name || "Inconnu"}</h3>
        <div><strong>PV:</strong> ${data.hp} / ${data.maxHp}</div>
        <div class="stat-bar"><div class="stat-fill" style="width: ${hpPercent}%"></div></div>
        <div><strong>Stress:</strong> ${data.stress || 0}</div>
        <div><strong>État:</strong> ${data.status || "Normal"}</div>
        <hr>
        <small>Dernière action: ${data.lastAction || "Aucune"}</small>
    `;
    return div;
}

// 2. Écouter les logs et gérer les alertes sonores
function listenToLogs() {
    const logsRef = collection(db, "rooms", ROOM_ID, "logs");
    // On prend les 50 derniers logs triés par date
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(50));

    onSnapshot(q, (snapshot) => {
        const list = document.getElementById("logs-list");
        list.innerHTML = "";

        // Snapshot contient les logs. S'il y a un changement ajouté récemment (type 'added'), on check l'alerte
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const logData = change.doc.data();
                
                // ALERTE SONORE si action importante et récente (moins de 2 sec)
                const now = Date.now();
                if (logData.isHeavy && (now - logData.timestamp) < 5000) {
                    playAlert();
                }
            }
        });

        snapshot.forEach((doc) => {
            const data = doc.data();
            const logItem = document.createElement("div");
            logItem.className = `log-entry ${data.isHeavy ? 'log-heavy' : ''}`;
            
            const time = new Date(data.timestamp).toLocaleTimeString();
            logItem.innerHTML = `<span class="timestamp">[${time}]</span> <strong>${data.playerName}:</strong> ${data.message}`;
            list.appendChild(logItem);
        });
    });
}

function playAlert() {
    const audio = document.getElementById("alert-sound");
    if(audio) audio.play().catch(e => console.log("Audio bloqué par le navigateur:", e));
}