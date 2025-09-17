import { Bot, Eye, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const roles = [
  {
    icon: Bot,
    title: 'Maître du Jeu',
    description: 'Supervisez la partie, contrôlez l"IA et les variables du jeu.',
    href: '/gm',
    color: 'text-primary',
  },
  {
    icon: Eye,
    title: 'Spectateur',
    description: 'Regardez la partie se dérouler d"un point de vue neutre.',
    href: '/spectator',
    color: 'text-accent-foreground',
  },
  {
    icon: Users,
    title: 'Joueur',
    description: 'Rejoignez une équipe et menez votre escouade à la victoire.',
    href: '/team-selection',
    color: 'text-red-400',
  },
];

export default function LobbyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b shrink-0 bg-background/90 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
            <Bot className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold md:text-2xl font-headline text-primary-foreground">
            Strategic Squads
            <span className="hidden ml-3 text-sm font-medium sm:inline-block text-muted-foreground">
              Salon
            </span>
          </h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-6 text-3xl font-bold text-center font-headline">Choisissez votre rôle</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.title} className="flex flex-col text-center transition-all duration-300 hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <role.icon className={`w-16 h-16 mx-auto ${role.color}`} />
                  <CardTitle className="mt-4">{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{role.description}</CardDescription>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full">
                    <Link href={role.href}>Sélectionner</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
