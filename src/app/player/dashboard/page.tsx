'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hourglass, UserPlus, XSquare } from 'lucide-react';
import { UnitSelectionModal } from '@/components/player/unit-selection-modal';
import type { Unit } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


type SquadUnit = Pick<Unit, 'id' | 'name' | 'type'>;

export default function PlayerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pseudo = searchParams.get('pseudo');
  const teamId = searchParams.get('teamId');
  const squadType = searchParams.get('squadType');

  const [squad, setSquad] = useState<(SquadUnit | null)[]>([null, null, null, null]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  const handleOpenModal = (slotIndex: number) => {
    setEditingSlot(slotIndex);
    setIsModalOpen(true);
  };

  const handleSelectUnit = (unitType: string, unitName: string) => {
    if (editingSlot === null) return;
    
    const newUnit: SquadUnit = {
      id: `unit_${pseudo}_${editingSlot}`,
      name: unitName,
      type: unitType,
    };
    
    const newSquad = [...squad];
    newSquad[editingSlot] = newUnit;
    setSquad(newSquad);
    
    setEditingSlot(null);
    setIsModalOpen(false);
  };
  
  const handleRemoveUnit = (slotIndex: number) => {
    const newSquad = [...squad];
    newSquad[slotIndex] = null;
    setSquad(newSquad);
  };

  if (!pseudo || !teamId || !squadType) {
    // This case should ideally not happen if the flow is correct
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <p>Erreur: Informations sur le joueur manquantes. Veuillez retourner au lobby.</p>
      </main>
    );
  }
  
  const isSquadFull = squad.every((unit) => unit !== null);

  const handleConfirmSquad = () => {
    const params = new URLSearchParams(searchParams);
    squad.forEach((unit, index) => {
        if(unit) {
            params.set(`unit${index}_name`, unit.name);
            params.set(`unit${index}_type`, unit.type);
        }
    });
    router.push(`/player/waiting-room?${params.toString()}`);
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <UnitSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectUnit}
        pseudo={pseudo}
        slotIndex={editingSlot}
      />
      <h1 className="mb-4 text-3xl font-bold font-headline">Tableau de Bord de l'Escouade</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Bienvenue, Commandant <span className="font-bold text-primary">{pseudo}</span>. Composez votre escouade de type{' '}
        <span className="font-bold capitalize text-primary">{squadType}</span> pour la bataille.
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
            {squad.map((unit, index) => (
              <Card key={index} className="flex flex-col items-center justify-between min-h-[200px] p-4 bg-muted/30 border-dashed">
                {unit ? (
                  <div className="flex flex-col items-center w-full h-full text-center">
                    <Avatar className="w-16 h-16 mb-2">
                        <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${unit.type}`} />
                        <AvatarFallback>{unit.type.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold">{unit.name}</p>
                    <p className="text-sm text-muted-foreground">{unit.type}</p>
                    <Button variant="ghost" size="icon" className="mt-auto text-destructive/70 hover:text-destructive" onClick={() => handleRemoveUnit(index)}>
                        <XSquare />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                     <p className="mb-2">Emplacement {index + 1}</p>
                    <Button variant="outline" onClick={() => handleOpenModal(index)}>
                      <UserPlus className="mr-2" />
                      Choisir l'unité
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button size="lg" disabled={!isSquadFull} onClick={handleConfirmSquad}>
              <Hourglass className="mr-2" />
              Prêt pour le combat (Salle d'attente)
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
