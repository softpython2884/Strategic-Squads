
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, ArrowLeft, Shield, Swords, Crosshair, FlaskConical, User, ChevronsRight } from 'lucide-react';
import { gameState } from '@/server/game-state';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const squads = [
    { type: 'attaque', icon: Swords, count: 2, description: "Unités offensives pour percer les défenses." },
    { type: 'défense', icon: Shield, count: 2, description: "Unités robustes pour protéger les objectifs." },
    { type: 'capture', icon: Crosshair, count: 1, description: "Unités rapides pour capturer des points stratégiques." },
    { type: 'recherche', icon: FlaskConical, count: 1, description: "Unités qui accélèrent les améliorations de l'équipe." },
]

type SelectionStep = 'pseudo' | 'team' | 'squad';

export default function TeamSelectionPage() {
    const [step, setStep] = useState<SelectionStep>('pseudo');
    const [pseudo, setPseudo] = useState('');
    const [teamId, setTeamId] = useState<string | null>(null);
    const [squadType, setSquadType] = useState<string | null>(null);
    const router = useRouter();

    const teams = gameState.getTeams();

    const handleNext = () => {
        if (step === 'pseudo' && pseudo.trim().length > 2) {
            setStep('team');
        } else if (step === 'team' && teamId) {
            setStep('squad');
        }
    }
    
    const handleConfirm = () => {
        if (!pseudo || !teamId || !squadType) return;
        
        const params = new URLSearchParams({
            pseudo,
            teamId,
            squadType,
        });

        router.push(`/player/dashboard?${params.toString()}`);
    }

    const renderStep = () => {
        switch (step) {
            case 'pseudo':
                return (
                     <Card className="w-full max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">Entrez votre pseudonyme</CardTitle>
                            <CardDescription className="text-center">Ce sera le nom de votre groupe en jeu.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pseudo">Pseudonyme</Label>
                                <Input 
                                    id="pseudo" 
                                    placeholder="Votre nom de joueur..." 
                                    value={pseudo} 
                                    onChange={(e) => setPseudo(e.target.value)} 
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                />
                            </div>
                            <Button onClick={handleNext} disabled={pseudo.trim().length <= 2} className="w-full">
                                Suivant <ChevronsRight className="ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                );

            case 'team':
                return (
                    <div className="w-full max-w-4xl mx-auto">
                        <h2 className="mb-6 text-3xl font-bold text-center font-headline">Choisissez votre équipe</h2>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {Object.entries(teams).map(([id, team]) => (
                                <Card 
                                    key={team.name}
                                    className={cn(
                                        "text-center cursor-pointer transition-all duration-300 hover:shadow-lg",
                                        teamId === id ? 'border-primary shadow-lg' : 'hover:border-primary/50'
                                    )}
                                    onClick={() => setTeamId(id)}
                                >
                                    <CardHeader>
                                        <CardTitle className={`text-3xl font-bold p-8 rounded-t-lg ${team.bgClass} ${team.textClass}`}>
                                            {team.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Rejoignez les forces de l'{team.name} et combattez pour la victoire.</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-center mt-8">
                             <Button onClick={handleNext} disabled={!teamId} size="lg">
                                Suivant <ChevronsRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                );
            
            case 'squad':
                 return (
                    <div className="w-full max-w-5xl mx-auto">
                        <h2 className="mb-2 text-3xl font-bold text-center font-headline">Sélectionnez votre escouade</h2>
                        <p className="mb-6 text-center text-muted-foreground">Vous commanderez ce type d'escouade pour l'équipe {teams[teamId!]?.name}.</p>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                           {squads.map(squad => (
                                <Card 
                                    key={squad.type} 
                                    className={cn(
                                        "flex flex-col text-center cursor-pointer transition-all duration-300",
                                        squadType === squad.type ? 'border-primary shadow-lg' : 'hover:shadow-lg hover:border-primary/50'
                                    )}
                                    onClick={() => setSquadType(squad.type)}
                                >
                                    <CardHeader>
                                        <squad.icon className="w-12 h-12 mx-auto text-primary" />
                                        <CardTitle className="capitalize">{squad.type} <span className="text-sm font-normal text-muted-foreground">({squad.count} disp.)</span></CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <CardDescription>{squad.description}</CardDescription>
                                    </CardContent>
                                </Card>
                           ))}
                        </div>
                        <div className="flex justify-center mt-8">
                            <Button onClick={handleConfirm} size="lg" disabled={!squadType}>
                                 <User className="mr-2" />
                                 Confirmer et préparer l'escouade
                            </Button>
                        </div>
                    </div>
                 );
        }
    }

    const breadcrumbs = () => {
        const steps: SelectionStep[] = ['pseudo', 'team', 'squad'];
        const currentStepIndex = steps.indexOf(step);

        return (
            <div className="absolute flex items-center gap-2 text-sm top-20 left-6 text-muted-foreground">
                <Button variant="link" size="sm" onClick={() => setStep('pseudo')} disabled={currentStepIndex < 1}>
                    Pseudo
                </Button>
                <ChevronsRight className="w-4 h-4" />
                <Button variant="link" size="sm" onClick={() => setStep('team')} disabled={currentStepIndex < 1}>
                    Équipe
                </Button>
                <ChevronsRight className="w-4 h-4" />
                <Button variant="link" size="sm" onClick={() => setStep('squad')} disabled={currentStepIndex < 2}>
                    Escouade
                </Button>
            </div>
        )
    }

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
              Préparation du Joueur
            </span>
          </h1>
        </div>
         <Button asChild variant="outline">
          <Link href="/lobby">
            <ArrowLeft className="mr-2" />
            Retour au Salon
          </Link>
        </Button>
      </header>
      <main className="relative flex items-center flex-1 p-4 md:p-6 lg:p-8">
        {step !== 'pseudo' && breadcrumbs()}
        <div className="w-full">
            {renderStep()}
        </div>
      </main>
    </div>
    );
}
