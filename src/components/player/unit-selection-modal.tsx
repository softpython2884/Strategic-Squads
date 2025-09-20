
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HEROES_DATA } from '@/lib/heroes';
import type { Hero } from '@/lib/types';
import type { SquadUnit } from '@/app/actions';


type UnitSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (hero: Hero) => void;
  squadType: string | null;
  currentSquad: (SquadUnit | null)[];
};

export function UnitSelectionModal({ isOpen, onClose, onSelect, squadType, currentSquad }: UnitSelectionModalProps) {
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  const alreadySelectedHeroIds = currentSquad.map(unit => unit?.id).filter(Boolean);

  const availableHeroes = HEROES_DATA
    .filter(h => h.composition === squadType)
    .filter(h => !alreadySelectedHeroIds.includes(h.id));

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens, select the first available hero by default
      if (availableHeroes.length > 0) {
        setSelectedHero(availableHeroes[0]);
      } else {
        setSelectedHero(null);
      }
    } else {
        setSelectedHero(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSelectHero = (heroId: string) => {
      const hero = availableHeroes.find(h => h.id === heroId);
      if (hero) {
        setSelectedHero(hero);
      }
  }

  const handleSubmit = () => {
    if (selectedHero) {
      onSelect(selectedHero);
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choisir un Héros</DialogTitle>
          <DialogDescription>Sélectionnez un héros pour cet emplacement.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
                <Label>Héros disponibles (type {squadType})</Label>
                <ScrollArea className="h-72 w-full rounded-md border p-4">
                    {availableHeroes.length > 0 ? (
                        availableHeroes.map(hero => (
                            <div 
                                key={hero.id} 
                                className={`p-3 rounded-md cursor-pointer ${selectedHero?.id === hero.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                onClick={() => handleSelectHero(hero.id)}
                            >
                                <p className="font-bold">{hero.name}</p>
                                <p className="text-sm opacity-80">{hero.class}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">Aucun autre héros de ce type n'est disponible.</p>
                    )}
                </ScrollArea>
            </div>
            {selectedHero && (
                <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-bold text-lg mb-2">{selectedHero.name}</h4>
                    <div className="space-y-1 text-sm">
                        <p>PV: {selectedHero.stats.maxHp}</p>
                        <p>Attaque: {selectedHero.stats.atk}</p>
                        <p>Défense: {selectedHero.stats.def}</p>
                        <p>Rareté: <span className="font-semibold">{selectedHero.rarity}</span></p>
                    </div>
                    <h5 className="font-semibold mt-3 mb-1">Compétences:</h5>
                    <ul className="space-y-1 list-disc list-inside text-xs">
                        {selectedHero.skills.map(skill => <li key={skill.id}>{skill.name}</li>)}
                    </ul>
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!selectedHero}>Confirmer le Héros</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
