
"use client";

import { motion } from "framer-motion";
import { Bot, Eye, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const roles = [
    {
        key: "gm",
        icon: Bot,
        title: "Maître du Jeu",
        description: "Contrôlez le champ de bataille et l'IA.",
        href: "/gm",
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
        key: "spectator",
        icon: Eye,
        title: "Spectateur",
        description: "Observez la guerre stratégique.",
        href: "/spectator",
        color: "text-emerald-400",
        gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
        key: "player",
        icon: Users,
        title: "Joueur",
        description: "Menez votre escouade à la victoire.",
        href: "/team-selection",
        color: "text-orange-400",
        gradient: "from-orange-500/20 to-red-500/20",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

export function MainMenu() {
    return (
        <div className="relative z-10 w-full max-w-5xl mx-auto p-4 md:p-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-12"
            >
                <motion.div variants={itemVariants} className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-emerald-400">
                        Strategic Squads
                    </h1>
                    <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
                        Commandez, Conquérez, Dominez. Choisissez votre rôle dans la bataille.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <Link key={role.key} href={role.href} className="block group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "relative h-full p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden transition-colors hover:border-primary/50",
                                )}
                            >
                                {/* Background Gradient */}
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", role.gradient)} />

                                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                    <div className={cn("p-4 rounded-full bg-background/50 shadow-lg ring-1 ring-white/10", role.color)}>
                                        <role.icon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-headline text-foreground group-hover:text-primary transition-colors">
                                        {role.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-body">
                                        {role.description}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
