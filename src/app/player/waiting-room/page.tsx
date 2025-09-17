
'use client'

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { units, teams } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Shield, Swords, Crosshair, FlaskConical, User, Loader2 } from 'lucide-react';
import type { Unit } from "@/lib/types"

const compositionIcons: { [key in Unit['composition']]: React.ReactNode } = {
  attaque: <Swords className="w-4 h-4" />,
  défense: <Shield className="w-4 h-4" />,
  capture: <Crosshair className="w-4 h-4" />,
  recherche: <FlaskConical className="w-4 h-4" />,
};

export default function WaitingRoomPage() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');
    const teamId = searchParams.get('teamId');

    if (!teamId) {
        return <div className="flex items-center justify-center h-full">Veuillez sélectionner une équipe.</div>
    }

    const team = teams[teamId as keyof typeof teams];
    const teamUnits = units.filter(u => u.teamId === teamId);

    const playerGroups: { [key: string]: Unit[] } = {};
    teamUnits.forEach(unit => {
        if (unit.control.controllerPlayerId) {
        if (!playerGroups[unit.control.controllerPlayerId]) {
            playerGroups[unit.control.controllerPlayerId] = [];
        }
        playerGroups[unit.control.controllerPlayerId].push(unit);
        }
    });

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <Card className="mb-8 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-3xl text-center font-headline">Salle d'attente - Équipe {team.name}</CardTitle>
                        <CardDescription className="text-center">En attente des autres joueurs et du lancement de la partie par le Maître du Jeu.</CardDescription>
                    </CardHeader>
                     <CardContent className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-lg text-muted-foreground">
                            <Loader2 className="animate-spin" />
                            <span>La partie va bientôt commencer...</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(playerGroups).map(([playerId, squadUnits]) => {
                        const commanderName = playerId === 'player1' && pseudo ? pseudo : `Cmdr ${playerId.replace('player', '')}`;
                        const squadComposition = squadUnits[0]?.composition || 'attaque';
                        
                        return (
                            <Card key={playerId} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary">
                                <CardHeader className={cn("p-4", team.bgClass, team.textClass)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <User className="w-6 h-6"/>
                                            <CardTitle className="text-xl">{commanderName}</CardTitle>
                                        </div>
                                        <Badge variant="secondary" className="flex items-center gap-2">
                                            {compositionIcons[squadComposition]}
                                            <span className="capitalize">{squadComposition}</span>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                     <h4 className="font-semibold text-muted-foreground">Unités de l'escouade :</h4>
                                    {squadUnits.map(unit => (
                                        <div key={unit.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={`https://i.pravatar.cc/150?u=${unit.id}`} alt={unit.name}/>
                                                <AvatarFallback>{unit.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold">{unit.name}</p>
                                                <p className="text-sm text-muted-foreground">{unit.type}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                 {unit.combat.buffs.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
