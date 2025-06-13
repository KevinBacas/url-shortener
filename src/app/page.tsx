import { HomepageForm } from "@/components/homepage-form";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto flex-1 px-4 py-8">
        <section className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Raccourcissez vos liens en un instant
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Transformez vos URLs longues en liens courts et élégants. Suivez les
            statistiques et gérez vos liens facilement.
          </p>
          <HomepageForm />
        </section>

        {/* <StatsCards /> */}

        <section className="mx-auto mt-16 max-w-4xl">
          <h3 className="mb-6 text-2xl font-bold">Historique des liens</h3>
          {/* <HistorySection /> */}
        </section>
      </main>
      <footer className="border-t bg-background py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 LinkCourt. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
