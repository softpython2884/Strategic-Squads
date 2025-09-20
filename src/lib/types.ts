

export type UnitComposition = 'attaque' | 'défense' | 'capture' | 'escarmouche';

export type UnitStatus = 'alive' | 'down' | 'dead';

export type Skill = {
  id: number;
  name: string;
  description: string;
  damage: number;
  cooldown: number;
  level?: number; // Level required to unlock
};

export type Hero = {
  id: string;
  name: string;
  class: 'Valkyrie' | 'Mage' | 'Blindé' | 'Archer' | 'Assassin';
  composition: UnitComposition;
  skills: Skill[];
  stats: {
    hp: number;
    maxHp: number;
    resource: number; // mana, energy, etc.
    maxResource: number;
    atk: number;
    def: number;
    spd: number;
  };
  rarity: 'Commun' | 'Rare' | 'Epique' | 'Légendaire';
};


export type Unit = {
  // Identity
  id: string;
  name: string;
  type: string; // e.g., 'Knight', 'Archer', 'Tower', 'Idol'
  heroId: string; // ID of the hero this unit is based on
  teamId: 'blue' | 'red';
  
  // Role
  composition: UnitComposition;
  
  // Position
  position: {
    x: number;
    y: number;
  };
  
  // Base Stats
  stats: {
    hp: number;
    maxHp: number;
    resource: number; // mana, energy, etc.
    maxResource: number;
    atk: number;
    def: number;
    spd: number;
  };

  // Progression
  progression: {
    xp: number;
    level: number;
    xpToNextLevel: number;
    respawnTimeRemaining: number;
  };

  // Combat State
  combat: {
    cooldowns: { [skillId: string]: number }; // Cooldown remaining in seconds
    attackCooldown: number; // Cooldown for basic attacks
    buffs: string[];
    debuffs: string[];
    status: UnitStatus;
  };

  // Control
  control: {
    controllerPlayerId?: string;
    focus?: string; // target entity id
    moveTarget?: { x: number; y: number }; // target position for movement
    path?: number[][]; // Path for movement, array of [x, y]
  };
  
};

export type Team = {
  name: string;
  color: string;
  bgClass: string;
  textClass: string;
};

export type Ping = {
  id: string;
  x: number;
  y: number;
  playerId: string;
};
