"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const shortenUrl = async (url: string) => {
  const response = await fetch("/api/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la création du lien raccourci");
  }

  const data = await response.json();
  // Assumes the API returns { shortUrl: string }
  return data.shortUrl;
};

export function HomepageForm() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      setShortUrl(result);

      // Add to local storage history
      const history = JSON.parse(localStorage.getItem("urlHistory") || "[]");
      const newItem = {
        originalUrl: url,
        shortUrl: result,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "urlHistory",
        JSON.stringify([newItem, ...history.slice(0, 9)]),
      );

      // Trigger history update
      window.dispatchEvent(new Event("historyUpdated"));
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
