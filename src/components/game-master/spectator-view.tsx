
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Team, Unit } from "@/lib/types";

type SpectatorViewProps = {
    units: Unit[];
    teams: { [key: string]: Team };
}

export default function SpectatorView({ units, teams }: SpectatorViewProps) {
    const spectatorImage = PlaceHolderImages.find(p => p.id === "spectator-view");
    const blueSquad = units.filter(u => u.teamId === 'blue').slice(0, 4);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Perspective du Joueur</CardTitle>
                    <CardDescription>Suivi de l'escouade Alpha de l'Équipe Bleue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-hidden rounded-lg aspect-video">
                        <Image
                            src={spectatorImage?.imageUrl || "https://picsum.photos/seed/4/1280/720"}
                            alt={spectatorImage?.description || "Vue spectateur d'une bataille fantastique"}
                            data-ai-hint={spectatorImage?.imageHint || "fantasy battle"}
                            width={1280}
                            height={720}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Escouade Alpha</CardTitle>
                    <CardDescription>Statut de l'escouade actuellement observée</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {blueSquad.map(unit => (
                        <div key={unit.id} className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${unit.id}`} alt={unit.name}/>
                                <AvatarFallback>{unit.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold">{unit.name}</p>
                                  {unit.combat.buffs.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-green-400">PV</span>
                                        <Progress value={(unit.stats.hp / unit.stats.maxHp) * 100} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-blue-400">PM</span>
                                        <Progress value={(unit.stats.resource / unit.stats.maxResource) * 100} className="h-2 bg-muted" indicatorClassName="bg-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
