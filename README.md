_____ _______ _____         _   _ _____  
 / ____|__   __|  __ \    /\  | \ | |  __ \ 
| (___    | |  | |__) |  /  \ |  \| | |  | |
 \___ \   | |  |  _  /  / /\ \| . ` | |  | |
 ____) |  | |  | | \ \ / ____ \ |\  | |__| |
|_____/   |_|  |_|  \_/_/    \_\_| \_|_____/ 
             [ O N L I N E _ U P L I N K ]
                                            
> SYSTEM_STATUS: CONNECTED
> PROTOCOL: FIREBASE_REALTIME_SYNC
> LATENCY: < 15ms
> ENCRYPTION: STANDARD

--------------------------------------------------------------------------------

Bienvenue sur le réseau, Opérateur. Cette version du Strand Toolkit intègre 
une couche de synchronisation quantique (Firebase) permettant le monitoring 
en temps réel de toutes les unités déployées sur le terrain.

Le système est désormais divisé en deux terminaux distincts : 
le Client (Joueur) et la Tour de Contrôle (MJ).

📡 NOUVELLES FONCTIONNALITÉS RÉSEAU :
- SYNCHRONISATION LIVE : Les modifications de fiche (PV, Inventaire, Stats) sont transmises instantanément.
- TERMINAL DE SURVEILLANCE (MJ) : Interface dédiée permettant de voir toutes les fiches connectées.
- SIGNAL VITAL (HEARTBEAT) : Détection automatique de présence. Si un agent coupe son flux (ferme l'onglet), il passe OFFLINE après 15s.
- JOURNAL TACTIQUE : Log automatique des actions critiques (Level Up, Mort, Jets de dés implicites).
- CALCULATEUR EFFECTIF : Le MJ visualise les statistiques réelles (Base + Bonus équipement).

--------------------------------------------------------------------------------

STRUCTURE DU SYSTÈME :

📂 /src
   Contient l'application React pour les Joueurs.
   [App.tsx] : Cerveau du client, gestion de l'envoi de données.
   [firebase.ts] : Configuration de l'uplink pour le client.

📂 /public
   Contient les outils statiques pour le Maître du Jeu.
   [gm.html] : Interface visuelle de surveillance.
   [gm.js] : Logique de réception et d'affichage des données.
   [firebase-init.js] : Configuration de l'uplink pour le MJ.
   [_redirects] : Protocole de routage pour le déploiement Netlify.

--------------------------------------------------------------------------------

INITIALISATION LOCALE :

1. Installer les modules :
   > npm install

2. Ouvrir le canal de fréquence (Lancer le serveur) :
   > npm run dev

3. Accès aux Terminaux :
   > JOUEUR : http://localhost:5173/
   > ADMIN (MJ) : http://localhost:5173/gm.html

--------------------------------------------------------------------------------

PROTOCOLE DE DÉPLOIEMENT (NETLIFY) :

Pour mettre ce système en orbite sur le Net :

1. Assurez-vous que le fichier [_redirects] est présent dans le dossier /public.
2. Connectez votre repo à Netlify.
3. Build command : "npm run build"
4. Publish directory : "dist"

Une fois en ligne, l'URL de base sert aux joueurs. Ajoutez /gm.html à la fin 
de l'URL pour accéder à la console de surveillance.

--------------------------------------------------------------------------------

⚠️ AVERTISSEMENT CLASSIFIÉ :
L'interface de surveillance (GM Tool) est protégée par une identification 
sommaire. Ne diffusez pas l'URL /gm.html à vos joueurs, sous peine de 
compromettre le brouillard de guerre.

NOTE DE L'ADMINISTRATEUR :
Le système de suppression de fiche est définitif. Pas de retour en arrière.
La mort dans la Matrice est une mort réelle.

[FIN DE TRANSMISSION_]
