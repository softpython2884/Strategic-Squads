
'use client'

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { teams } from '@/lib/data';

export default function PlayerDashboardPage() {
    const searchParams = useSearchParams();
    const pseudo = searchParams.get('pseudo');
    const teamId = searchParams.get('teamId');
    const squadType = searchParams.get('squadType');
    
    const team = teams[teamId as keyof typeof teams];

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <h1 className="mb-4 text-3xl font-bold font-headline">Tableau de Bord de l'Escouade</h1>
            <p className="mb-8 text-lg text-muted-foreground">
                Bienvenue, Commandant <span className="font-bold text-primary">{pseudo}</span>. Préparez votre escouade <span className='capitalize font-bold'>{squadType}</span> pour la bataille.
            </p>

             <Card>
                <CardHeader>
                    <CardTitle>Gestion de l'Escouade</CardTitle>
                    <CardDescription>
                        Composez votre escouade de 4 unités. Les unités que vous choisirez détermineront votre stratégie sur le champ de bataille.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className='text-center text-muted-foreground'>La sélection des unités sera bientôt disponible ici.</p>
                </CardContent>
             </Card>
        </main>
    );
}
