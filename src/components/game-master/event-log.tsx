"use client";

import { useState } from "react";
import { runSummarizeGameEvents } from "@/app/actions";
import { gameEventsLog } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles } from "lucide-react";

export default function EventLog() {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSummarize() {
    setIsLoading(true);
    setSummary(null);
    setError(null);
    try {
      const response = await runSummarizeGameEvents({ gameEventsLog });
      setSummary(response.summary);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="w-full h-64 p-3 overflow-y-auto border rounded-md bg-muted/50 font-code text-sm">
        <pre className="whitespace-pre-wrap">{gameEventsLog}</pre>
      </div>
      <Button onClick={handleSummarize} disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Summarize Events
      </Button>

      {summary && (
        <Alert>
          <Sparkles className="w-4 h-4" />
          <AlertTitle className="font-headline">AI Summary</AlertTitle>
          <AlertDescription>{summary}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
