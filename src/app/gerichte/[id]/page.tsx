"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Edit, Copy, Printer, Trash2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Lebensmittel } from "@/domain/lebensmittel";

type ZutatenOut = {
  id: string;
  lebensmittelId: string;
  menge: number;
  lebensmittel: Lebensmittel;
  createdAt: string | null;
  updatedAt: string | null;
};

type LebensmittelMini = { id: string; name: string; kcal: number };

type GerichtDetail = {
  id: string;
  name: string;
  tageszeit:
    | "Morgen"
    | "Vormittag"
    | "Mittag"
    | "Nachmittag"
    | "früher Abend"
    | "Abend"
    | "Nacht"
    | "k.A.";
  beschreibung?: string;
  lebensmittelProGericht: ZutatenOut[];
  createdAt: string | null;
  updatedAt: string | null;
  lebensmittelExpanded?: LebensmittelMini[];
};

// kleines Fetch-Helferlein
async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function fmt(dateIso: string | null) {
  if (!dateIso) return "–";
  const d = new Date(dateIso);
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function kcalForAmount(kcalPer100g: number, grams: number, precision = 0): number {
  const val = (Number(kcalPer100g) * Number(grams)) / 100;
  const p = 10 ** precision;
  return Math.round((val + Number.EPSILON) * p) / p;
}

export default function GerichtDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [data, setData] = useState<GerichtDetail | null>(null);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  async function load() {
    try {
      setFehler(null);
      setLaden(true);
      const d = await fetchJSON<GerichtDetail>(
        `/api/gerichte/${id}?expand=lebensmittel`,
        { cache: "no-store" },
      );
      setData(d);
    } catch (e: unknown) {
      setFehler(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLaden(false);
    }
  }

  useEffect(() => {
    if (id) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {data?.name ?? "Gericht"}
                </CardTitle>
                <div className="mt-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                    {data?.tageszeit ?? "–"}
                  </span>
                  <span className="mx-2">•</span>
                  <span>Erstellt: {fmt(data?.createdAt ?? null)}</span>
                  <span className="mx-2">•</span>
                  <span>Aktualisiert: {fmt(data?.updatedAt ?? null)}</span>
                </div>
              </div>
              {/* Fake-Menüleiste */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/gerichte/${id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Bearbeiten
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    /* später duplizieren */
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> Duplizieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  <Printer className="mr-2 h-4 w-4" /> Drucken
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled
                  onClick={() => {
                    /* später löschen */
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Löschen
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {fehler && (
              <Alert variant="destructive">
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription className="flex items-center justify-between gap-4">
                  <span className="break-words">{fehler}</span>
                  <Button variant="secondary" size="sm" onClick={load}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Erneut laden
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {laden ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Daten werden
                geladen…
              </div>
            ) : data ? (
              <>
                {data.beschreibung && (
                  <div>
                    <h3 className="text-lg font-semibold">Beschreibung</h3>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {data.beschreibung}
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Zutaten</h3>
                    <Button size="sm" variant="outline" onClick={load}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Aktualisieren
                    </Button>
                  </div>

                  {data.lebensmittelProGericht.length === 0 ? (
                    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                      Keine Zutaten hinterlegt.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr className="text-left">
                            <th className="px-3 py-2 font-medium">
                              Lebensmittel
                            </th>
                            <th className="px-3 py-2 font-medium">kcal / 100g</th>
                            <th className="px-3 py-2 font-medium">Menge</th>
                            <th className="px-3 py-2 font-medium">kcal / Menge</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.lebensmittelProGericht.map((z) => {                            
                            return (
                              <tr key={z.id} className="border-t">
                                <td className="px-3 py-2">{z.lebensmittel.name + " " + z.lebensmittel.zustand}</td>                                
                                <td className="px-3 py-2">{z.lebensmittel.kcal}</td>
                                <td className="px-3 py-2">{z.menge}</td>
                                <td className="px-3 py-2">{kcalForAmount(z.lebensmittel.kcal, z.menge, 1)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Kein Datensatz gefunden.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Zurück
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
