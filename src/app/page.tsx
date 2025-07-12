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
      </main>
    </div>
  );
}
