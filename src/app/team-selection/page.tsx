import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, ArrowLeft, Shield, Swords, Crosshair, FlaskConical, Users } from 'lucide-react';
import { teams } from '@/lib/data';

const squads = [
    { type: 'attack', icon: Swords, count: 2 },
    { type: 'defense', icon: Shield, count: 2 },
    { type: 'capture', icon: Crosshair, count: 1 },
    { type: 'research', icon: FlaskConical, count: 1 },
]

export default function TeamSelectionPage() {
    return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b shrink-0 bg-background/90 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
              <Bot className="w-6 h-6" />
            </div>
          <h1 className="text-xl font-bold md:text-2xl font-headline text-primary-foreground">
            Strategic Squads
            <span className="hidden ml-3 text-sm font-medium sm:inline-block text-muted-foreground">
              Team Selection
            </span>
          </h1>
        </div>
         <Button asChild variant="outline">
          <Link href="/lobby">
            <ArrowLeft className="mr-2" />
            Back to Lobby
          </Link>
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
            <h2 className="mb-6 text-3xl font-bold text-center font-headline">Choose Your Team & Squad</h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {Object.values(teams).map(team => (
                    <Card key={team.name} className="flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary">
                        <CardHeader className="text-center">
                            <CardTitle className={`text-2xl font-bold ${team.textClass} ${team.bgClass} rounded-t-lg p-4`}>{team.name}</CardTitle>
                            <CardDescription className="pt-4">Select a squad to command.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow grid grid-cols-2 gap-4">
                           {squads.map(squad => (
                                <Button key={squad.type} variant="outline" className="h-20 text-lg">
                                   <div className="flex flex-col items-center gap-2">
                                    <squad.icon className="w-6 h-6"/>
                                    <span className="capitalize">{squad.type} ({squad.count})</span>
                                   </div>
                                </Button>
                           ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="flex justify-center mt-8">
                <Button size="lg" disabled>
                    <Users className="mr-2" />
                    Confirm Selection & Enter Game
                </Button>
             </div>
        </div>
      </main>
    </div>
    );
}