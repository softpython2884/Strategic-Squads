
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type PingDisplayProps = {
    isMinimap?: boolean;
};

const PingDisplay = ({ isMinimap = false }: PingDisplayProps) => {
    return (
        <motion.div
            className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none",
                isMinimap ? "w-10 h-10" : "w-20 h-20"
            )}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
        >
            <div className="relative w-full h-full">
                {/* Outer ring */}
                <div className="absolute inset-0 border-2 border-yellow-400 rounded-full" />
                {/* Inner dot */}
                <div className="absolute w-1/3 h-1/3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full" />
            </div>
        </motion.div>
    );
};

export default PingDisplay;
