"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, Copy, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { CreateLinkResponse, ApiErrorResponse } from "@/lib/api-types";

const shortenUrl = async (url: string): Promise<string> => {
  const response = await fetch("/api/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(
      errorData.error || "Erreur lors de la création du lien raccourci",
    );
  }

  const data: CreateLinkResponse = await response.json();
  return data.shortUrl;
};

export function HomepageForm() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast("URL requise", {
        description: "Veuillez entrer une URL à raccourcir.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await shortenUrl(url);

      // Show loading state while checking authentication
      if (isAuthenticated === null) {
        return (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        );
      }

      // Show message if not authenticated
      if (!isAuthenticated) {
        return (
          <Card className="mx-auto max-w-md p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-3">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Connexion requise</h3>
              <p className="text-sm text-muted-foreground">
                Vous devez être connecté pour créer des liens raccourcis.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Se connecter</Link>
            </Button>
          </Card>
        );
      }
      setShortUrl(result);
      toast("Lien créé !", {
        description: "Votre lien raccourci a été créé avec succès.",
      });
    } catch (error) {
      toast("Erreur", {
        description: "Impossible de raccourcir cette URL: " + error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast("Copié !", {
        description: "Le lien a été copié dans le presse-papiers",
      });
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col gap-2 mx-auto sm:flex-row"
      >
        <Input
          type="url"
          placeholder="Collez votre lien ici..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-12 flex-1"
          disabled={isLoading}
        />
        <Button type="submit" className="h-12 px-8" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Raccourcir"
          )}
        </Button>
      </form>

      {shortUrl && (
        <Card className="mx-auto flex flex-row max-w-md items-center justify-between p-4">
          <Link
            href={shortUrl}
            prefetch={false}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {shortUrl}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            aria-label="Copier le lien"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </Card>
      )}

      <div className="text-center pt-4">
        <Link
          href="/analytics"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          Voir les statistiques de tous les liens →
        </Link>
      </div>
    </div>
  );
}
