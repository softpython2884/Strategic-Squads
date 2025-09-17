import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PlayerDashboardPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <h1 className="mb-4 text-4xl font-bold font-headline">Tableau de Bord du Joueur</h1>
            <p className="mb-8 text-lg text-muted-foreground">
                La sélection des unités pour votre escouade sera bientôt disponible ici.
            </p>
            <Button asChild>
                <Link href="/team-selection">
                    <ArrowLeft className="mr-2" />
                    Retour à la sélection
                </Link>
            </Button>
        </div>
    );
}
