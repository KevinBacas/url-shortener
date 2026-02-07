"use client";

import { AnalyticsList } from "@/components/analytics-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/analytics", {
          cache: "no-store",
        });

        if (!response.ok) {
          console.error("Failed to fetch analytics:", response.statusText);
          setLinks([]);
          return;
        }

        const data = await response.json();
        setLinks(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setLinks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto flex-1 px-4 py-8">
        <section className="mx-auto max-w-4xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Statistiques des liens
              </h1>
              <Link href="/">
                <Button variant="outline">Retour à l&apos;accueil</Button>
              </Link>
            </div>
            <p className="text-muted-foreground">
              Consultez les statistiques d&apos;utilisation de tous vos liens
              raccourcis
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <AnalyticsList links={links} />
          )}
        </section>
      </main>
    </div>
  );
}
