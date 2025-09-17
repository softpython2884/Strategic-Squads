import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { units as allUnits, teams } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function SpectatorView() {
    const spectatorImage = PlaceHolderImages.find(p => p.id === "spectator-view");
    const blueSquad = allUnits.filter(u => u.teamId === 'blue').slice(0, 4);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Player Perspective</CardTitle>
                    <CardDescription>Following Blue Team's Alpha Squad</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-hidden rounded-lg aspect-video">
                        <Image
                            src={spectatorImage?.imageUrl || "https://picsum.photos/seed/4/1280/720"}
                            alt={spectatorImage?.description || "Spectator view of a fantasy battle"}
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
                    <CardTitle>Alpha Squad</CardTitle>
                    <CardDescription>Status of currently spectated squad</CardDescription>
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
                                  {unit.status.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-green-400">HP</span>
                                        <Progress value={unit.stats.health} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-blue-400">MP</span>
                                        <Progress value={unit.stats.mana} className="h-2 bg-muted" indicatorClassName="bg-blue-500" />
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

// Small modification to Progress to allow indicator class
declare module "@/components/ui/progress" {
    interface ProgressProps {
        indicatorClassName?: string;
    }
}
import {Progress as OriginalProgress} from "@/components/ui/progress";
import React from "react";

const ModifiedProgress = React.forwardRef<
  React.ElementRef<typeof OriginalProgress>,
  React.ComponentPropsWithoutRef<typeof OriginalProgress> & { indicatorClassName?: string }
>(({ value, className, indicatorClassName, ...props }, ref) => (
  <OriginalProgress value={value} className={className} {...props} ref={ref}>
    <div
      className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </OriginalProgress>
));
Object.assign(Progress, { ...OriginalProgress, displayName: "Progress" });
