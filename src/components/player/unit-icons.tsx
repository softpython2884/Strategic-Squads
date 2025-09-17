
import { Shield, Wand, Feather, Mountain } from 'lucide-react';

export const MageIcon = ({ className }: { className?: string }) => (
    <Wand className={className} />
);

export const ValkyrieIcon = ({ className }: { className?: string }) => (
    <Feather className={className} />
);

export const ArmoredIcon = ({ className }: { className?: string }) => (
    <Shield className={className} />
);

export const ArcherIcon = ({ className }: { className?: string }) => (
    <Mountain className={className} />
);
