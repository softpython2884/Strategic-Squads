
'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hourglass, Loader2, UserPlus, XSquare } from 'lucide-react';
import { UnitSelectionModal } from '@/components/player/unit-selection-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type SquadUnit, type JoinGameInput } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Hero } from '@/lib/types';
import { ArmoredIcon, AssassinIcon, MageIcon, ValkyrieIcon, ArcherIcon } from './unit-icons';

const classIcons: { [key: string]: React.ElementType } = {
  Blindé: ArmoredIcon,
  Mage: MageIcon,
  Valkyrie: ValkyrieIcon,
  Archer: ArcherIcon,
  Assassin: AssassinIcon,
};


export default function PlayerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const pseudo = searchParams.get('pseudo');
  const teamId = searchParams.get('teamId');
  const squadType = searchParams.get('squadType');

  const [isLoading, setIsLoading] = useState(false);
  const [squad, setSquad] = useState<(SquadUnit | null)[]>([null, null, null, null]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  const ws = useRef<WebSocket | null>(null);

  // Establish WebSocket connection on component mount
  useEffect(() => {
    if (!ws.current) {
      const wsUrl = `ws://${window.location.hostname}:8080`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => console.log('Dashboard WebSocket connected');
      ws.current.onerror = (error) => {
        console.error("Dashboard WebSocket error:", error);
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Impossible de communiquer avec le serveur de jeu. Veuillez réessayer.",
        });
      };
      ws.current.onclose = () => console.log('Dashboard WebSocket disconnected');
    }
    
    // Return a cleanup function
    return () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.close();
        }
    }
  }, [toast]);


  const handleOpenModal = (slotIndex: number) => {
    setEditingSlot(slotIndex);
    setIsModalOpen(true);
  };

  const handleSelectUnit = (hero: Hero) => {
    if (editingSlot === null) return;
    
    const newUnit: SquadUnit = {
      id: hero.id,
      name: hero.name,
      type: hero.class, // The "type" is now the hero's class
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
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <p>Erreur: Informations sur le joueur manquantes. Veuillez retourner à la sélection d'équipe.</p>
      </main>
    );
  }
  
  const isSquadFull = squad.every((unit) => unit !== null);

  const handleConfirmSquad = async () => {
    if (!isSquadFull || !pseudo || !teamId || !squadType || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
       toast({
        variant: "destructive",
        title: "Erreur de Connexion",
        description: "La connexion au serveur de jeu n'est pas établie. Veuillez rafraîchir la page.",
      });
      return;
    }
    
    setIsLoading(true);

    const joinGameInput: JoinGameInput = {
      pseudo,
      teamId: teamId as 'blue' | 'red',
      squadType: squadType as any,
      squad: squad as SquadUnit[],
    };
    
    // Add a listener for the server's response
    ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'join-success') {
            const params = new URLSearchParams({ pseudo });
            router.push(`/player/waiting-room?${params.toString()}`);
        } else if (message.type === 'join-failed') {
             toast({
                variant: "destructive",
                title: "Impossible de rejoindre la partie",
                description: message.reason || "Une erreur est survenue.",
            });
             setIsLoading(false);
        } else if (message.type === 'full-state' || message.type === 'update-state') {
            // Ignore game state updates on this page for now
        }
    };

    // Send the join request
    ws.current.send(JSON.stringify({
      type: 'joinGame',
      payload: joinGameInput,
    }));
  }

  const UnitCard = ({ unit, onRemove }: { unit: SquadUnit, onRemove: () => void }) => {
    const Icon = classIcons[unit.type];
    return (
      <div className="flex flex-col items-center w-full h-full text-center">
        <div className="relative mb-2">
            <Avatar className="w-16 h-16">
                <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${unit.id}`} />
                <AvatarFallback>{unit.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {Icon && (
                <div className="absolute top-0 right-0 flex items-center justify-center w-6 h-6 border-2 rounded-full bg-muted border-background">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
            )}
        </div>
        <p className="font-bold">{unit.name}</p>
        <p className="text-sm text-muted-foreground">{unit.type}</p>
        <Button variant="ghost" size="icon" className="mt-auto text-destructive/70 hover:text-destructive" onClick={onRemove}>
            <XSquare />
        </Button>
      </div>
    );
  };

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <UnitSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectUnit}
        squadType={squadType}
        currentSquad={squad}
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
            Composez votre escouade de 4 héros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {squad.map((unit, index) => (
              <Card key={index} className="flex flex-col items-center justify-between min-h-[200px] p-4 bg-muted/30 border-dashed">
                {unit ? (
                  <UnitCard unit={unit} onRemove={() => handleRemoveUnit(index)} />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                     <p className="mb-2">Emplacement {index + 1}</p>
                    <Button variant="outline" onClick={() => handleOpenModal(index)}>
                      <UserPlus className="mr-2" />
                      Choisir un Héros
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button size="lg" disabled={!isSquadFull || isLoading} onClick={handleConfirmSquad}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Hourglass className="mr-2" />}
              Prêt pour le combat (Salle d'attente)
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

    