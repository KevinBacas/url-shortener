import { AnalyticsList } from "@/components/analytics-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { getAnalyticsData } from "@/lib/analytics";

export const dynamic = "force-dynamic"; // Disable caching for this page

export default async function AnalyticsPage() {
  // Create user-scoped Supabase client
  const supabase = await createClient();

  // Fetch analytics data - RLS will filter to user's links only
  const links = await getAnalyticsData(supabase);

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
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
              Consultez les statistiques d&apos;utilisation de vos liens
              raccourcis
            </p>
          </div>

          <AnalyticsList links={links} />
        </section>
      </main>
    </div>
  );
}
