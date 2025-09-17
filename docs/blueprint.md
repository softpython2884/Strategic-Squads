# **App Name**: Strategic Squads

## Core Features:

- Server Setup and Game Logic: Initialize servers, manage timers, and implement real-time ticks for game time. Handle PTT timer calculations with ticks.
- Character and Squad Management: Allow players to choose roles (screen master, spectator, red team, blue team), select unit compositions (defense, attack, capture, research), and name groups and individual characters.
- In-Game UI (Player): Next.js React HUD includes team panel with portraits, health/mana bars, status indicators; mini-map with allied/enemy positions and objectives; objective display; skill bar with cooldowns and tooltips; in-game feedback (cast bars, animations).
- In-Game AI Unit Behavior: Implement patrol, engage and support behaviors.
- Data Management: Manage essential data entities such as towers, characters, and idols, including identity, position, stats, progression, combat state, control, and team information.
- Game Master Interface: Provide a three-screen interface for game masters: a strategic map view with complete visibility, a spectator view to follow groups or teams, and a technical dashboard for real-time stats and logs. Display a log of actions and use a tool to intelligently select only events of consequence. The data to display must be queried effectively. AI tool assists with summarizing key events and unusual patterns.
- Unit Movement and Orders: Implement click-and-drag selection, movement orders (attack, hold fire, patrol, regroup), and position management on movable terrain.
- Combat and Skills System: Implement the core combat mechanics, damage calculations, status effects (cooldowns, buffs), and skill system, including data-driven skill definitions, mana/resource management, XP progression, and the team signature skill.

## Style Guidelines:

- Primary color: Deep teal (#008080) evoking strategy and a sense of digital command.
- Background color: Dark grayish-teal (#263232) creates a focused, strategic atmosphere.
- Accent color: Bright, saturated yellow-orange (#FF8F00) for highlighting key objectives, active units, and action buttons to draw the eye and indicate importance.
- Headline font: 'Space Grotesk' (sans-serif) for headlines and short amounts of body text. Body Font: 'Inter' (sans-serif) for longer text.
- Code font: 'Source Code Pro' (monospace) for code snippets, data readouts and console outputs.
- Use crisp, modern icons to represent units, skills, and objectives.
- Subtle animations for unit movements and skill casts.