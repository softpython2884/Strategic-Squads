
'use client'

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { gameState as serverGameState } from "@/server/game-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Shield, Swords, Crosshair, FlaskConical, User, Loader2, Play, Users } from 'lucide-react';
import type { Unit, Team } from "@/lib/types"
import { Button } from "@/components/ui/button"

const compositionIcons: { [key in Unit['composition']]: React.ReactNode } = {
  attaque: <Swords className="w-4 h-4" />,
  défense: <Shield className="w-4 h-4" />,
  capture: <Crosshair className="w-4 h-4" />,
  recherche: <FlaskConical className="w-4 h-4" />,
};

type PlayerSquad = {
    playerId: string;
    squadUnits: Unit[];
    composition: Unit['composition'];
}

const PlayerCard = ({ player, team, isCurrentUser }: { player: PlayerSquad, team: Team, isCurrentUser: boolean }) => (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isCurrentUser ? "border-primary shadow-lg" : "bg-card/60 hover:shadow-md"
    )}>
        <CardHeader className={cn("p-4", team.bgClass, team.textClass)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <User className="w-6 h-6" />
                    <CardTitle className="text-xl">{player.playerId}</CardTitle>
                </div>
                <Badge variant="secondary" className="flex items-center gap-2">
                    {compositionIcons[player.composition]}
                    <span className="capitalize">{player.composition}</span>
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Unités de l'escouade :</h4>
            {player.squadUnits.map(unit => (
                <div key={unit.id} className="flex items-center gap-4 p-2 rounded-md bg-muted/30">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${unit.type}`} alt={unit.name} />
                        <AvatarFallback>{unit.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{unit.name}</p>
                        <p className="text-sm text-muted-foreground">{unit.type}</p>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

export default function WaitingRoomPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');
    
    // Client-side state for units, updated via WebSocket
    const [allUnits, setAllUnits] = useState<Unit[]>([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'full-state' || message.type === 'update-state') {
                setAllUnits(message.payload);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        }

        // Cleanup on component unmount
        return () => {
            ws.close();
        };
    }, []);

    // Get static team info from server
    const teams = serverGameState.getTeams();
    
    const getSquadsByTeam = (teamId: 'blue' | 'red'): PlayerSquad[] => {
        const teamUnits = allUnits.filter(u => u.teamId === teamId);
        if (teamUnits.length === 0) return [];
        
        const playerGroups = teamUnits.reduce((acc, unit) => {
            const playerId = unit.control.controllerPlayerId;
            if (playerId) {
                if (!acc[playerId]) {
                    acc[playerId] = [];
                }
                acc[playerId].push(unit);
            }
            return acc;
        }, {} as { [key: string]: Unit[] });

        return Object.entries(playerGroups).map(([playerId, squadUnits]) => ({
            playerId,
            squadUnits,
            composition: squadUnits[0]?.composition || 'attaque' // All units in a squad have the same composition
        }));
    }

    const blueSquads = getSquadsByTeam('blue');
    const redSquads = getSquadsByTeam('red');
    
    // Check if both teams have at least one player to enable the start button
    const canStartGame = blueSquads.length > 0 && redSquads.length > 0;

    const handleStartGame = () => {
        // Here we would ideally trigger a "start-game" event via WebSocket
        // For now, we just navigate the current player.
        const params = new URLSearchParams(searchParams);
        router.push(`/player/game?${params.toString()}`);
    }

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Card className="mb-8 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-3xl text-center font-headline">Salle d'attente</CardTitle>
                        <CardDescription className="text-center">En attente des autres joueurs. La partie commencera lorsque les deux équipes auront au moins un joueur.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-lg text-muted-foreground">
                            <Loader2 className="animate-spin" />
                            <span>La partie va bientôt commencer...</span>
                        </div>
                        <Button onClick={handleStartGame} disabled={!canStartGame}>
                            <Play className="mr-2" />
                            (Dev) Démarrer la partie
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Blue Team Column */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-4">
                            <Users className="w-8 h-8" style={{ color: teams.blue.color }}/>
                            <h2 className="text-2xl font-bold text-center font-headline" style={{ color: teams.blue.color }}>
                                {teams.blue.name} ({blueSquads.length}/5)
                            </h2>
                        </div>
                         {blueSquads.length > 0 ? (
                            blueSquads.map(player => (
                               <PlayerCard 
                                 key={player.playerId} 
                                 player={player} 
                                 team={teams.blue}
                                 isCurrentUser={player.playerId === pseudo}
                               />
                            ))
                        ) : (
                             <p className="text-center text-muted-foreground">En attente de joueurs...</p>
                        )}
                    </div>

                    {/* Red Team Column */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-4">
                            <Users className="w-8 h-8" style={{ color: teams.red.color }}/>
                            <h2 className="text-2xl font-bold text-center font-headline" style={{ color: teams.red.color }}>
                                {teams.red.name} ({redSquads.length}/5)
                            </h2>
                        </div>
                        {redSquads.length > 0 ? (
                            redSquads.map(player => (
                               <PlayerCard 
                                key={player.playerId} 
                                player={player} 
                                team={teams.red}
                                isCurrentUser={player.playerId === pseudo}
                               />
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">En attente de joueurs...</p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
