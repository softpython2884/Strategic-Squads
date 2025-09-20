
import type { Hero } from './types';

export const HEROES_DATA: Hero[] = [
  // ========== ATTAQUE ==========
  {
    id: "hero_001",
    name: "Rokgar",
    class: "Blindé",
    composition: "attaque",
    skills: [
      { id: 1, name: "Frappe Puissante", description: "Un coup puissant qui inflige 150 dégâts.", damage: 150, cooldown: 5, level: 1 },
      { id: 2, name: "Charge Bestiale", description: "Fonce sur l'ennemi, l'étourdissant pendant 1 seconde.", damage: 80, cooldown: 10, level: 1 },
      { id: 3, name: "Cri de Fureur", description: "Augmente sa propre attaque de 30% pendant 5 secondes.", damage: 0, cooldown: 12, level: 2 },
      { id: 4, name: "Impact Dévastateur", description: "Frappe le sol, infligeant 200 dégâts de zone.", damage: 200, cooldown: 18, level: 4 }
    ],
    stats: { hp: 2200, maxHp: 2200, resource: 100, maxResource: 100, atk: 160, def: 120, spd: 1.0 },
    rarity: "Epique"
  },
  {
    id: "hero_002",
    name: "Kaelith",
    class: "Assassin",
    composition: "attaque",
    skills: [
      { id: 1, name: "Lames de l'Ombre", description: "Frappe rapidement, infligeant 2x80 dégâts.", damage: 160, cooldown: 6, level: 1 },
      { id: 2, name: "Pas de l'Ombre", description: "Se téléporte derrière une cible ennemie.", damage: 0, cooldown: 12, level: 1 },
      { id: 3, name: "Poison Mortel", description: "Empoisonne la cible, infligeant 30 dégâts par seconde pendant 5s.", damage: 150, cooldown: 10, level: 2 },
      { id: 4, name: "Exécution", description: "Inflige 300 dégâts aux cibles ayant moins de 25% de PV.", damage: 300, cooldown: 20, level: 4 }
    ],
    stats: { hp: 1800, maxHp: 1800, resource: 100, maxResource: 100, atk: 180, def: 80, spd: 1.3 },
    rarity: "Légendaire"
  },
  {
    id: "hero_003",
    name: "Solthar",
    class: "Mage",
    composition: "attaque",
    skills: [
        { id: 1, name: "Éclair de Feu", description: "Lance un projectile de feu infligeant 140 dégâts.", damage: 140, cooldown: 5, level: 1 },
        { id: 2, name: "Mur de Flammes", description: "Crée un mur de feu qui inflige 50 dégâts par seconde.", damage: 50, cooldown: 12, level: 1 },
        { id: 3, name: "Combustion", description: "Enflamme une zone, infligeant 180 dégâts de zone.", damage: 180, cooldown: 10, level: 2 },
        { id: 4, name: "Météore", description: "Fait tomber un météore infligeant 350 dégâts de zone.", damage: 350, cooldown: 25, level: 4 }
    ],
    stats: { hp: 1700, maxHp: 1700, resource: 150, maxResource: 150, atk: 200, def: 70, spd: 1.0 },
    rarity: "Epique"
  },
  {
    id: "hero_004",
    name: "Valmira",
    class: "Valkyrie",
    composition: "attaque",
    skills: [
        { id: 1, name: "Frappe Ascendante", description: "Un coup d'épée qui projette l'ennemi en l'air.", damage: 130, cooldown: 7, level: 1 },
        { id: 2, name: "Plongeon Céleste", description: "S'envole et retombe sur une zone, infligeant 180 dégâts.", damage: 180, cooldown: 12, level: 1 },
        { id: 3, name: "Ailes Protectrices", description: "Bloque la prochaine compétence ennemie.", damage: 0, cooldown: 15, level: 2 },
        { id: 4, name: "Fureur de Valhalla", description: "Augmente sa vitesse d'attaque de 50% pendant 8s.", damage: 0, cooldown: 20, level: 4 }
    ],
    stats: { hp: 2000, maxHp: 2000, resource: 100, maxResource: 100, atk: 170, def: 100, spd: 1.2 },
    rarity: "Epique"
  },
  {
    id: "hero_005",
    name: "Thaloren",
    class: "Archer",
    composition: "attaque",
    skills: [
        { id: 1, name: "Tir Précis", description: "Un tir qui ignore 30% de l'armure de l'ennemi.", damage: 150, cooldown: 6, level: 1 },
        { id: 2, name: "Pluie de Flèches", description: "Tire une volée de flèches dans une zone.", damage: 120, cooldown: 10, level: 1 },
        { id: 3, name: "Flèche Ralentissante", description: "Ralentit la cible de 40% pendant 3 secondes.", damage: 50, cooldown: 8, level: 2 },
        { id: 4, name: "Tir Mortel", description: "Un tir puissant à longue portée infligeant 400 dégâts.", damage: 400, cooldown: 30, level: 4 }
    ],
    stats: { hp: 1750, maxHp: 1750, resource: 100, maxResource: 100, atk: 190, def: 75, spd: 1.1 },
    rarity: "Légendaire"
  },

  // ========== DÉFENSE ==========
  {
    id: "hero_006",
    name: "Korrvak",
    class: "Blindé",
    composition: "défense",
    skills: [
      { id: 1, name: "Provocation", description: "Force les ennemis proches à l'attaquer pendant 3s.", damage: 0, cooldown: 10, level: 1 },
      { id: 2, name: "Posture Défensive", description: "Réduit les dégâts subis de 50% pendant 4s.", damage: 0, cooldown: 12, level: 1 },
      { id: 3, name: "Coup de Bouclier", description: "Étourdit la cible pendant 1.5 seconde.", damage: 50, cooldown: 8, level: 2 },
      { id: 4, name: "Rempart Inébranlable", description: "Crée une barrière qui bloque les projectiles ennemis.", damage: 0, cooldown: 20, level: 4 }
    ],
    stats: { hp: 3000, maxHp: 3000, resource: 100, maxResource: 100, atk: 100, def: 200, spd: 0.9 },
    rarity: "Epique"
  },
  {
    id: "hero_007",
    name: "Astridra",
    class: "Valkyrie",
    composition: "défense",
    skills: [
      { id: 1, name: "Lance Céleste", description: "Projette une lance divine qui transperce les ennemis.", damage: 120, cooldown: 6, level: 1 },
      { id: 2, name: "Bouclier Sacré", description: "Accorde un bouclier de 200 PV à un allié.", damage: 0, cooldown: 10, level: 1 },
      { id: 3, name: "Cri de Guerre", description: "Augmente l’attaque de 20% pour les alliés proches.", damage: 0, cooldown: 12, level: 2 },
      { id: 4, name: "Jugement Divin", description: "Frappe une zone, infligeant 250 dégâts et ralentissant.", damage: 250, cooldown: 15, level: 4 }
    ],
    stats: { hp: 2400, maxHp: 2400, resource: 100, maxResource: 100, atk: 150, def: 130, spd: 1.1 },
    rarity: "Epique"
  },
  {
    id: "hero_008",
    name: "Ezmyrion",
    class: "Mage",
    composition: "défense",
    skills: [
        { id: 1, name: "Barrière de Glace", description: "Crée un mur de glace infranchissable pendant 4s.", damage: 0, cooldown: 15, level: 1 },
        { id: 2, name: "Nova de Givre", description: "Gèle les ennemis proches pendant 2s.", damage: 80, cooldown: 12, level: 1 },
        { id: 3, name: "Armure de Glace", description: "Augmente l'armure d'un allié de 50 points.", damage: 0, cooldown: 10, level: 2 },
        { id: 4, name: "Blizzard", description: "Invoque une tempête de glace qui ralentit et blesse.", damage: 200, cooldown: 25, level: 4 }
    ],
    stats: { hp: 1900, maxHp: 1900, resource: 150, maxResource: 150, atk: 140, def: 90, spd: 1.0 },
    rarity: "Rare"
  },
  {
    id: "hero_009",
    name: "Grommash",
    class: "Blindé",
    composition: "défense",
    skills: [
      { id: 1, name: "Coup de tête", description: "Un coup violent qui repousse la cible.", damage: 100, cooldown: 7, level: 1 },
      { id: 2, name: "Peau de pierre", description: "Devient insensible aux contrôles pendant 3s.", damage: 0, cooldown: 18, level: 1 },
      { id: 3, name: "Régénération", description: "Récupère 10% de ses PV max en 5s.", damage: 0, cooldown: 20, level: 2 },
      { id: 4, name: "Ancre de la tempête", description: "Attire les ennemis dans une petite zone vers lui.", damage: 150, cooldown: 22, level: 4 }
    ],
    stats: { hp: 3200, maxHp: 3200, resource: 100, maxResource: 100, atk: 110, def: 220, spd: 0.8 },
    rarity: "Légendaire"
  },
  {
    id: "hero_010",
    name: "Sylvara",
    class: "Archer",
    composition: "défense",
    skills: [
      { id: 1, name: "Flèche de Lianes", description: "Immobilise la cible pendant 2 secondes.", damage: 60, cooldown: 12, level: 1 },
      { id: 2, name: "Tir de Suppression", description: "Réduit l'attaque de la cible de 30% pendant 4s.", damage: 80, cooldown: 10, level: 1 },
      { id: 3, name: "Oeil de Faucon", description: "Augmente la portée d'attaque de 20% pendant 10s.", damage: 0, cooldown: 15, level: 2 },
      { id: 4, "name": "Piège de Ronces", description: "Pose un piège qui immobilise et blesse la première cible.", damage: 200, cooldown: 18, level: 4 }
    ],
    stats: { hp: 1800, maxHp: 1800, resource: 100, maxResource: 100, atk: 160, def: 80, spd: 1.1 },
    rarity: "Rare"
  },
  
  // ========== CAPTURE ==========
  {
    id: "hero_011",
    name: "Nyxalis",
    class: "Assassin",
    composition: "capture",
    skills: [
      { id: 1, name: "Sprint", description: "Augmente sa vitesse de déplacement de 40% pendant 3s.", damage: 0, cooldown: 10, level: 1 },
      { id: 2, name: "Frappe Furtive", description: "La prochaine attaque inflige +100 dégâts si invisible.", damage: 100, cooldown: 8, level: 1 },
      { id: 3, name: "Brouillard Fumigène", description: "Crée une zone où elle est invisible.", damage: 0, cooldown: 15, level: 2 },
      { id: 4, name: "Capture Rapide", description: "Réduit le temps de capture d'un objectif de 50%.", damage: 0, cooldown: 30, level: 4 }
    ],
    stats: { hp: 1700, maxHp: 1700, resource: 100, maxResource: 100, atk: 160, def: 70, spd: 1.4 },
    rarity: "Epique"
  },
  {
    id: "hero_012",
    name: "Sigrune",
    class: "Valkyrie",
    composition: "capture",
    skills: [
      { id: 1, name: "Charge Ailée", description: "Fonce en avant, ignorant les collisions.", damage: 100, cooldown: 8, level: 1 },
      { id: 2, name: "Vent Porteur", description: "Augmente la vitesse de déplacement des alliés proches.", damage: 0, cooldown: 12, level: 1 },
      { id: 3, name: "Intouchable", description: "Esquive la prochaine attaque de base.", damage: 0, cooldown: 10, level: 2 },
      { id: 4, name: "Bannière de Conquête", description: "Plante une bannière qui accélère la capture.", damage: 0, cooldown: 25, level: 4 }
    ],
    stats: { hp: 1900, maxHp: 1900, resource: 100, maxResource: 100, atk: 150, def: 90, spd: 1.3 },
    rarity: "Rare"
  },
   {
    id: "hero_013",
    name: "Lirael",
    class: "Mage",
    composition: "capture",
    skills: [
      { id: 1, name: "Portail Dimensionnel", description: "Crée un portail pour se téléporter à courte distance.", damage: 0, cooldown: 18, level: 1 },
      { id: 2, name: "Vague Temporelle", description: "Ralentit tous les ennemis dans une zone.", damage: 70, cooldown: 12, level: 1 },
      { id: 3, name: "Image Miroir", description: "Crée une illusion d'elle-même pour tromper l'ennemi.", damage: 0, cooldown: 15, level: 2 },
      { id: 4, "name": "Distorsion Temporelle", description: "Accélère le temps sur un objectif, le capturant plus vite.", damage: 0, cooldown: 40, level: 4 }
    ],
    stats: { hp: 1600, maxHp: 1600, resource: 150, maxResource: 150, atk: 150, def: 60, spd: 1.1 },
    rarity: "Légendaire"
  },
  {
    id: "hero_014",
    name: "Fenris",
    class: "Assassin",
    composition: "capture",
    skills: [
      { id: 1, name: "Chasseur-Né", description: "Gagne de la vitesse en se déplaçant vers une cible.", damage: 0, cooldown: 0, level: 1 },
      { id: 2, name: "Morsure Féroce", description: "Une morsure qui inflige des dégâts et ralentit.", damage: 130, cooldown: 7, level: 1 },
      { id: 3, name: "Odorat", description: "Révèle les ennemis proches dans le brouillard de guerre.", damage: 0, cooldown: 20, level: 2 },
      { id: 4, name: "Instinct de Prédateur", description: "Devient invisible et plus rapide pendant 5s.", damage: 0, cooldown: 18, level: 4 }
    ],
    stats: { hp: 1800, maxHp: 1800, resource: 100, maxResource: 100, atk: 170, def: 80, spd: 1.5 },
    rarity: "Rare"
  },
   {
    id: "hero_015",
    name: "Eryndor",
    class: "Archer",
    composition: "capture",
    skills: [
      { id: 1, name: "Tir de Harcèlement", description: "Tir à longue portée avec de faibles dégâts.", damage: 80, cooldown: 4, level: 1 },
      { id: 2, name: "Bottes de Sept Lieues", description: "Augmente passivement la vitesse de déplacement.", damage: 0, cooldown: 0, level: 1 },
      { id: 3, name: "Repérage", description: "Révèle une zone de la carte pendant 10 secondes.", damage: 0, cooldown: 25, level: 2 },
      { id: 4, name: "Disparition", description: "Devient invisible pendant 3s s'il ne bouge pas.", damage: 0, cooldown: 15, level: 4 }
    ],
    stats: { hp: 1700, maxHp: 1700, resource: 100, maxResource: 100, atk: 160, def: 70, spd: 1.2 },
    rarity: "Rare"
  },

  // ========== ESCARMOUCHE ==========
  {
    id: "hero_016",
    name: "Kaelwyn",
    class: "Archer",
    composition: "escarmouche",
    skills: [
      { id: 1, name: "Double Tir", description: "Tire deux flèches rapidement.", damage: 160, cooldown: 6, level: 1 },
      { id: 2, name: "Esquive", description: "Fait un bond sur le côté pour esquiver.", damage: 0, cooldown: 9, level: 1 },
      { id: 3, name: "Flèche Empoisonnée", description: "Inflige des dégâts sur la durée.", damage: 120, cooldown: 10, level: 2 },
      { id: 4, name: "Rafale Cinglante", description: "Tire une rafale de 5 flèches en cône.", damage: 250, cooldown: 20, level: 4 }
    ],
    stats: { hp: 1800, maxHp: 1800, resource: 100, maxResource: 100, atk: 180, def: 80, spd: 1.2 },
    rarity: "Epique"
  },
  {
    id: "hero_017",
    name: "Eryndis",
    class: "Valkyrie",
    composition: "escarmouche",
    skills: [
      { id: 1, name: "Danse des Lames", description: "Tourbillonne en infligeant des dégâts autour d'elle.", damage: 140, cooldown: 8, level: 1 },
      { id: 2, name: "Provocation Aérienne", description: "Attire un ennemi vers elle.", damage: 50, cooldown: 12, level: 1 },
      { id: 3, name: "Lien du Destin", description: "Lie deux ennemis, partageant 25% des dégâts subis.", damage: 0, cooldown: 18, level: 2 },
      { id: 4, name: "Tempête d'Acier", description: "Une série de coups rapides sur une cible unique.", damage: 350, cooldown: 25, level: 4 }
    ],
    stats: { hp: 2100, maxHp: 2100, resource: 100, maxResource: 100, atk: 170, def: 110, spd: 1.2 },
    rarity: "Légendaire"
  },
  {
    id: "hero_018",
    name: "Zethar",
    class: "Assassin",
    composition: "escarmouche",
    skills: [
      { id: 1, name: "Dague Céraste", description: "Une frappe rapide qui applique une blessure grave.", damage: 120, cooldown: 7, level: 1 },
      { id: 2, name: "Écran de Fumée", description: "Devient invisible et ralentit les ennemis proches.", damage: 0, cooldown: 14, level: 1 },
      { id: 3, name: "Éventail de Couteaux", description: "Lance des couteaux en cône devant lui.", damage: 160, cooldown: 9, level: 2 },
      { id: 4, name: "Marque de la Mort", description: "Marque un ennemi. Le réactiver inflige de lourds dégâts.", damage: 400, cooldown: 30, level: 4 }
    ],
    stats: { hp: 1750, maxHp: 1750, resource: 100, maxResource: 100, atk: 190, def: 70, spd: 1.4 },
    rarity: "Epique"
  },
  {
    id: "hero_019",
    name: "Rylai",
    class: "Mage",
    composition: "escarmouche",
    skills: [
      { id: 1, name: "Éclat de Givre", description: "Un projectile de glace qui ralentit la cible.", damage: 110, cooldown: 5, level: 1 },
      { id: 2, name: "Pieds Glacés", description: "Se déplace plus vite sur le sol gelé.", damage: 0, cooldown: 0, level: 1 },
      { id: 3, name: "Prison de Glace", description: "Immobilise une cible dans un bloc de glace.", damage: 90, cooldown: 14, level: 2 },
      { id: 4, name: "Zéro Absolu", description: "Crée une large zone de froid intense qui blesse et ralentit.", damage: 300, cooldown: 28, level: 4 }
    ],
    stats: { hp: 1700, maxHp: 1700, resource: 150, maxResource: 150, atk: 180, def: 75, spd: 1.1 },
    rarity: "Rare"
  },
  {
    id: "hero_020",
    name: "Talon",
    class: "Assassin",
    composition: "escarmouche",
    skills: [
      { id: 1, name: "Assaut Tranchant", description: "Saute sur un ennemi et lui inflige des dégâts.", damage: 130, cooldown: 8, level: 1 },
      { id: 2, name: "Voie de l'Ombre", description: "Peut sauter par-dessus les murs et obstacles.", damage: 0, cooldown: 2, level: 1 },
      { id: 3, name: "Râtelier", description: "Lance des dagues qui reviennent vers lui.", damage: 150, cooldown: 9, level: 2 },
      { id: 4, "name": "Assaut Ténébreux", description: "Devient invisible et lance un cercle de lames.", damage: 320, cooldown: 25, level: 4 }
    ],
    stats: { hp: 1850, maxHp: 1850, resource: 100, maxResource: 100, atk: 185, def: 75, spd: 1.3 },
    rarity: "Légendaire"
  }
];
