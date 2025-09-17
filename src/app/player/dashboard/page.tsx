
'use client'

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { teams } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

const unitTypes = ['Mage', 'Valkyrie', 'Armored', 'Archer'];

export default function PlayerDashboardPage() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');
    const teamId = searchParams.get('teamId');
    const squadType = searchParams.get('squadType');
    
    const team = teams[teamId as keyof typeof teams];

    // Placeholder for selected units
    const selectedUnits = [null, null, null, null];

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <h1 className="mb-4 text-3xl font-bold font-headline">Tableau de Bord de l'Escouade</h1>
            <p className="mb-8 text-lg text-muted-foreground">
                Bienvenue, Commandant <span className="font-bold text-primary">{pseudo}</span>. Préparez votre escouade de type <span className='capitalize font-bold'>{squadType}</span> pour la bataille.
            </p>

             <Card>
                <CardHeader>
                    <CardTitle>Gestion de l'Escouade</CardTitle>
                    <CardDescription>
                        Composez votre escouade de 4 unités. Les types disponibles sont : Mage, Valkyrie, Armored, et Archer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {selectedUnits.map((unit, index) => (
                            <Card key={index} className="flex flex-col items-center justify-center min-h-[150px] p-4 bg-muted/30 border-dashed">
                                {unit ? (
                                    <p>{/* Display unit info here */}</p>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <p className="mb-2">Emplacement d'unité {index + 1}</p>
                                        <Button variant="outline">
                                            <UserPlus className="mr-2" />
                                            Choisir l'unité
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                     <div className="flex justify-center mt-8">
                        <Button size="lg" disabled>
                            Prêt pour le combat (4/4)
                        </Button>
                    </div>
                </CardContent>
             </Card>
        </main>
    );
}
