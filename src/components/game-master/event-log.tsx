
"use client";

import { useState, useEffect } from "react";
import { getGameEventsLog, runSummarizeGameEvents } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles } from "lucide-react";

export default function EventLog() {
  const [log, setLog] = useState("Chargement du journal des événements...");
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getGameEventsLog().then(setLog).catch(console.error);
  }, []);


  async function handleSummarize() {
    setIsLoading(true);
    setSummary(null);
    setError(null);
    try {
      const response = await runSummarizeGameEvents({ gameEventsLog: log });
      setSummary(response.summary);
    } catch (e: any) {
      setError(e.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="w-full h-64 p-3 overflow-y-auto border rounded-md bg-muted/50 font-code text-sm">
        <pre className="whitespace-pre-wrap">{log}</pre>
      </div>
      <Button onClick={handleSummarize} disabled={isLoading || !log} className="w-full sm:w-auto">
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Résumer les Événements
      </Button>

      {summary && (
        <Alert>
          <Sparkles className="w-4 h-4" />
          <AlertTitle className="font-headline">Résumé IA</AlertTitle>
          <AlertDescription>{summary}</AlertDescription>
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
