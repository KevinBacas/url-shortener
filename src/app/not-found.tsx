"use client";

import { Button, Card, CardHeader, CardBody } from "@heroui/react";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold">Page introuvable</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link href="/">
            <Button className="w-full">Retour à l&apos;accueil</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
