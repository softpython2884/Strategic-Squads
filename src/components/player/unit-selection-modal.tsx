
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HEROES_DATA } from '@/lib/heroes';
import type { Hero } from '@/lib/types';


type UnitSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (hero: Hero, unitName: string) => void;
  pseudo: string;
  slotIndex: number | null;
  squadType: string | null;
};

export function UnitSelectionModal({ isOpen, onClose, onSelect, pseudo, slotIndex, squadType }: UnitSelectionModalProps) {
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [unitName, setUnitName] = useState('');

  const availableHeroes = HEROES_DATA.filter(h => h.composition === squadType);

  useEffect(() => {
    if (isOpen && slotIndex !== null && availableHeroes.length > 0) {
      // Reset state when modal opens
      const randomHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
      setSelectedHero(randomHero);
      setUnitName(`${pseudo} ${randomHero.name} ${slotIndex + 1}`);
    } else if (!isOpen) {
        setSelectedHero(null);
        setUnitName('');
    }
  }, [isOpen, slotIndex, pseudo, squadType]);

  const handleSelectHero = (heroId: string) => {
      const hero = availableHeroes.find(h => h.id === heroId);
      if (hero) {
        setSelectedHero(hero);
        if (slotIndex !== null) {
            setUnitName(`${pseudo} ${hero.name} ${slotIndex + 1}`);
        }
      }
  }

  const handleSubmit = () => {
    if (selectedHero && unitName) {
      onSelect(selectedHero, unitName);
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choisir un Héros pour l'emplacement {slotIndex !== null ? slotIndex + 1 : ''}</DialogTitle>
          <DialogDescription>Sélectionnez un héros et donnez un nom à votre unité.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
                <Label>Héros disponibles ({squadType})</Label>
                <ScrollArea className="h-72 w-full rounded-md border p-4">
                    {availableHeroes.map(hero => (
                        <div 
                            key={hero.id} 
                            className={`p-3 rounded-md cursor-pointer ${selectedHero?.id === hero.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                            onClick={() => handleSelectHero(hero.id)}
                        >
                            <p className="font-bold">{hero.name}</p>
                            <p className="text-sm opacity-80">{hero.class}</p>
                        </div>
                    ))}
                </ScrollArea>
            </div>
            {selectedHero && (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="unit-name">Nom de l'unité</Label>
                        <Input
                            id="unit-name"
                            value={unitName}
                            onChange={(e) => setUnitName(e.target.value)}
                        />
                    </div>
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
                </div>
            )}

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!selectedHero || !unitName}>Confirmer l'unité</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
