"use client";

import { useState } from "react";
import { Button, Card, CardHeader, CardBody } from "@heroui/react";
import type { LinkWithClicks } from "@/lib/analytics";

interface AnalyticsListProps {
  links: LinkWithClicks[];
}

export function AnalyticsList({ links }: AnalyticsListProps) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (linkId: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(linkId)) {
        next.delete(linkId);
      } else {
        next.add(linkId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncate = (text: string | null, maxLength: number = 50) => {
    if (!text) return "N/A";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Aucun lien créé pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link) => {
        const isExpanded = expandedCards.has(link.id);

        return (
          <Card key={link.id} className="w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-mono font-semibold">
                    /{link.slug}
                  </h3>
                  <p className="text-sm text-default-500 mt-1">
                    {link.target_url}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {link.click_count}{" "}
                    {link.click_count === 1 ? "clic" : "clics"}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-sm text-muted-foreground mb-4">
                Créé le {formatDate(link.created_at)}
              </div>

              {link.click_count > 0 && (
                <>
                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={() => toggleCard(link.id)}
                    className="w-full"
                  >
                    {isExpanded ? "Masquer" : "Voir"} les détails des clics
                  </Button>

                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-semibold text-sm">
                        Historique des clics:
                      </h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {link.clicks.map((click) => (
                          <div
                            key={click.id}
                            className="p-3 bg-muted rounded-lg text-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">
                                {formatDate(click.clicked_at)}
                              </span>
                            </div>
                            <div className="space-y-1 text-muted-foreground">
                              <div>
                                <span className="font-medium">User Agent:</span>{" "}
                                {truncate(click.user_agent, 60)}
                              </div>
                              <div>
                                <span className="font-medium">Referrer:</span>{" "}
                                {truncate(click.referrer, 60)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {link.click_count === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Ce lien n&apos;a pas encore été utilisé
                </p>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
