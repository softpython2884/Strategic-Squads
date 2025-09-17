
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArmoredIcon, ArcherIcon, MageIcon, ValkyrieIcon } from './unit-icons';

const unitTypes = [
    { value: 'Mage', label: 'Mage', icon: MageIcon },
    { value: 'Valkyrie', label: 'Valkyrie', icon: ValkyrieIcon },
    { value: 'Armored', label: 'Blindé', icon: ArmoredIcon },
    { value: 'Archer', label: 'Archer', icon: ArcherIcon }
];


type UnitSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (unitType: string, unitName: string) => void;
  pseudo: string;
  slotIndex: number | null;
};

export function UnitSelectionModal({ isOpen, onClose, onSelect, pseudo, slotIndex }: UnitSelectionModalProps) {
  const [unitType, setUnitType] = useState('');
  const [unitName, setUnitName] = useState('');

  useEffect(() => {
    if (isOpen && slotIndex !== null) {
      // Reset state when modal opens
      const randomType = unitTypes[Math.floor(Math.random() * unitTypes.length)].value;
      setUnitType(randomType);
      setUnitName(`${pseudo} ${randomType} ${slotIndex + 1}`);
    }
  }, [isOpen, slotIndex, pseudo]);

  const handleSubmit = () => {
    if (unitType && unitName) {
      onSelect(unitType, unitName);
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choisir une unité pour l'emplacement {slotIndex !== null ? slotIndex + 1 : ''}</DialogTitle>
          <DialogDescription>Sélectionnez un type et donnez un nom à votre unité.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div>
                <Label htmlFor="unit-type">Type d'unité</Label>
                <Select value={unitType} onValueChange={setUnitType}>
                    <SelectTrigger id="unit-type">
                        <SelectValue placeholder="Sélectionnez un type..." />
                    </SelectTrigger>
                    <SelectContent>
                        {unitTypes.map(type => (
                             <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                    <type.icon className="w-5 h-5" />
                                    <span>{type.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="unit-name">Nom de l'unité</Label>
                <Input
                    id="unit-name"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!unitType || !unitName}>Confirmer l'unité</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
