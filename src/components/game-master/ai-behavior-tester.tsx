"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { runAIUnitBehaviors } from "@/app/actions";
import { Separator } from "@/components/ui/separator";
import { Bot, Loader2, MinusCircle, PlusCircle, Sparkles } from "lucide-react";
import type { AIUnitBehaviorsOutput } from "@/ai/flows/implement-ai-unit-behaviors";

const formSchema = z.object({
  unitType: z.string().min(1, "Le type d'unité est requis."),
  unitHealth: z.coerce.number().min(0).max(100),
  unitPosition: z.object({
    x: z.coerce.number(),
    y: z.coerce.number(),
  }),
  nearbyEnemies: z.array(z.object({
    type: z.string().min(1, "Le type est requis."),
    health: z.coerce.number().min(0).max(100),
    position: z.object({ x: z.coerce.number(), y: z.coerce.number() }),
    distance: z.coerce.number().min(0),
  })),
  nearbyAllies: z.array(z.object({
    type: z.string().min(1, "Le type est requis."),
    health: z.coerce.number().min(0).max(100),
    position: z.object({ x: z.coerce.number(), y: z.coerce.number() }),
    distance: z.coerce.number().min(0),
  })),
  objective: z.string().min(1, "L'objectif est requis."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiBehaviorTester() {
  const [result, setResult] = useState<AIUnitBehaviorsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitType: "mêlée",
      unitHealth: 80,
      unitPosition: { x: 5, y: 5 },
      nearbyEnemies: [{ type: "distance", health: 50, position: { x: 7, y: 5 }, distance: 2 }],
      nearbyAllies: [],
      objective: "défendre la tour",
    },
  });

  const { fields: enemyFields, append: appendEnemy, remove: removeEnemy } = useFieldArray({
    control: form.control,
    name: "nearbyEnemies",
  });

  const { fields: allyFields, append: appendAlly, remove: removeAlly } = useFieldArray({
    control: form.control,
    name: "nearbyAllies",
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await runAIUnitBehaviors(values);
      setResult(response);
    } catch (e: any) {
      setError(e.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>État de l'Unité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="unitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'Unité</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Sélectionnez le type d'unité" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="melee">Mêlée</SelectItem>
                          <SelectItem value="ranged">Distance</SelectItem>
                          <SelectItem value="support">Soutien</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitHealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Santé</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <FormField control={form.control} name="unitPosition.x" render={({ field }) => (<FormItem><FormLabel>Pos X</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="unitPosition.y" render={({ field }) => (<FormItem><FormLabel>Pos Y</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objectif</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Entités à Proximité</h3>
              {enemyFields.map((field, index) => (
                <div key={field.id} className="p-4 space-y-2 border rounded-lg bg-muted/30">
                  <div className="flex justify-between">
                    <FormLabel>Ennemi #{index + 1}</FormLabel>
                    <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground" onClick={() => removeEnemy(index)}><MinusCircle className="w-4 h-4" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name={`nearbyEnemies.${index}.type`} render={({ field }) => (<FormItem><FormControl><Input placeholder="Type" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`nearbyEnemies.${index}.health`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Santé" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`nearbyEnemies.${index}.position.x`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Pos X" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`nearbyEnemies.${index}.position.y`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Pos Y" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`nearbyEnemies.${index}.distance`} render={({ field }) => (<FormItem className="col-span-2"><FormControl><Input type="number" placeholder="Distance" {...field} /></FormControl></FormItem>)} />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendEnemy({ type: '', health: 100, position: { x: 0, y: 0 }, distance: 0 })}><PlusCircle className="w-4 h-4 mr-2" />Ajouter Ennemi</Button>
            
              {allyFields.map((field, index) => (
                <div key={field.id} className="p-4 space-y-2 border rounded-lg bg-muted/30">
                  <div className="flex justify-between">
                    <FormLabel>Allié #{index + 1}</FormLabel>
                    <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground" onClick={() => removeAlly(index)}><MinusCircle className="w-4 h-4" /></Button>
                  </div>
                   <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name={`nearbyAllies.${index}.type`} render={({ field }) => (<FormItem><FormControl><Input placeholder="Type" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`nearbyAllies.${index}.health`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Santé" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`nearbyAllies.${index}.position.x`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Pos X" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`nearbyAllies.${index}.position.y`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Pos Y" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`nearbyAllies.${index}.distance`} render={({ field }) => (<FormItem className="col-span-2"><FormControl><Input type="number" placeholder="Distance" {...field} /></FormControl></FormItem>)} />
                  </div>
                </div>
              ))}
               <Button type="button" variant="outline" size="sm" onClick={() => appendAlly({ type: '', health: 100, position: { x: 0, y: 0 }, distance: 0 })}><PlusCircle className="w-4 h-4 mr-2" />Ajouter Allié</Button>
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Simuler le Comportement
          </Button>
        </form>
      </Form>
      
      {result && (
        <Alert variant="default" className="bg-primary/10 border-primary/20">
            <Bot className="w-4 h-4 text-primary" />
            <AlertTitle className="font-headline text-primary">Décision de l'IA</AlertTitle>
            <AlertDescription className="mt-2 space-y-2 text-primary-foreground">
                <p><strong className="font-semibold text-muted-foreground">Action:</strong> <span className="px-2 py-1 text-sm rounded-md bg-accent/80 font-code text-accent-foreground">{result.action}</span></p>
                {result.target && <p><strong className="font-semibold text-muted-foreground">Cible:</strong> <span className="font-code">{result.target}</span></p>}
                <p><strong className="font-semibold text-muted-foreground">Raisonnement:</strong> {result.reasoning}</p>
            </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
