"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Une erreur est survenue</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Désolé, une erreur inattendue s&apos;est produite. Veuillez
            réessayer.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Code d&apos;erreur: {error.digest}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Réessayer
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="flex-1"
            >
              Retour à l&apos;accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
