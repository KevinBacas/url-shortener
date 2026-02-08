import { AnalyticsList } from "@/components/analytics-list";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getAnalyticsData } from "@/lib/analytics";

export const dynamic = "force-dynamic"; // Disable caching for this page

export default async function AnalyticsPage() {
  // Create user-scoped Supabase client
  const supabase = await createClient();

  // Fetch analytics data - RLS will filter to user's links only
  const links = await getAnalyticsData(supabase);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto flex-1 px-4 py-8">
        <section className="mx-auto max-w-4xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Statistiques des liens
              </h1>
              <Link
                href="/"
                className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-default-200 bg-transparent text-sm font-medium hover:bg-default-100 transition-colors"
              >
                Retour à l&apos;accueil
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
