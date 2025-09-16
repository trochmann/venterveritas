"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { type Lebensmittel } from "@/domain/lebensmittel";
import { type LebensmittelProGericht } from "@/domain/lebensmittelProGericht";
import {
  Tageszeit,
  type Tageszeit as TageszeitType,
} from "@/domain/gericht";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function CreateGerichtPage() {
  const router = useRouter();

  // Datenquellen & Status
  const [alleLebensmittel, setAlleLebensmittel] = useState<
    readonly Lebensmittel[] | null
  >(null);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  // Formular-State
  const [name, setName] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [tageszeit, setTageszeit] = useState<TageszeitType>(Tageszeit[0]);
  // Wir erfassen im UI nur lebensmittelId + menge
  const [zutaten, setZutaten] = useState<
    Array<Pick<LebensmittelProGericht, "lebensmittelId" | "menge">>
  >([]);
  const [saving, setSaving] = useState(false);

  // Lebensmittel laden
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchJSON<readonly Lebensmittel[]>(
          "/api/lebensmittel",
          { cache: "no-store" },
        );
        if (mounted) setAlleLebensmittel(data);
      } catch (e: unknown) {
        if (mounted)
          if (e instanceof Error) {
            setFehler(e.message);
          } else {
            setFehler("Konnte Lebensmittel nicht laden.");
          }
      } finally {
        if (mounted) setLaden(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const mapLebensmittel = useMemo(() => {
    const m = new Map<string, Lebensmittel>();
    (alleLebensmittel ?? []).forEach((l) => m.set(l.id, l));
    return m;
  }, [alleLebensmittel]);

  // Zutaten-CRUD im Formular
  function addZutat() {
    setZutaten((prev) => [...prev, { lebensmittelId: "", menge: 0 }]);
  }
  function removeZutat(index: number) {
    setZutaten((prev) => prev.filter((_, i) => i !== index));
  }
  function updateZutat(
    index: number,
    patch: Partial<Pick<LebensmittelProGericht, "lebensmittelId" | "menge">>,
  ) {
    setZutaten((prev) =>
      prev.map((z, i) => (i === index ? { ...z, ...patch } : z)),
    );
  }

  // Validierung
  const formFehler = useMemo(() => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Name des Gerichts fehlt.");
    if (!tageszeit) errs.push("Tageszeit wählen.");
    if (zutaten.length === 0)
      errs.push("Bitte mindestens eine Zutat hinzufügen.");
    zutaten.forEach((z, i) => {
      if (!z.lebensmittelId)
        errs.push(`Zutat #${i + 1}: Lebensmittel auswählen.`);
      if (!(z.menge > 0)) errs.push(`Zutat #${i + 1}: Menge > 0 angeben.`);
    });
    const seen = new Set<string>();
    zutaten.forEach((z) => {
      if (z.lebensmittelId) {
        if (seen.has(z.lebensmittelId))
          errs.push("Gleiches Lebensmittel mehrfach – ggf. zusammenfassen.");
        seen.add(z.lebensmittelId);
      }
    });
    return errs;
  }, [name, tageszeit, zutaten]);

  async function onSubmit() {
    try {
      setSaving(true);
      setFehler(null);

      const baseZutaten = zutaten.map((z) => ({
        lebensmittelId: z.lebensmittelId,
        menge: Number(z.menge),
      }));

      const payload = {
        name: name.trim(),
        tageszeit,
        lebensmittelProGericht: baseZutaten,
      };

      const payloadForApi = {
        ...payload,
        lebensmittelProGericht: baseZutaten,
      };

      const created = await fetchJSON<{ id: string }>("/api/gerichte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadForApi),
      });

      if (created?.id) router.push(`/gerichte/${created.id}`);
      else router.push("/gerichte");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setFehler(e.message);
      } else {
        setFehler("Speichern fehlgeschlagen.");
      }
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------
  // Render
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Gericht anlegen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {fehler && (
              <Alert variant="destructive">
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>{fehler}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="z. B. Spaghetti Bolognese"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tageszeit *</Label>
                <Select
                  value={tageszeit}
                  onValueChange={(val: string) =>
                    setTageszeit(val as TageszeitType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="auswählen…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {Tageszeit.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="beschreibung">Beschreibung</Label>
                <Textarea
                  id="beschreibung"
                  placeholder="optional"
                  value={beschreibung}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setBeschreibung(e.target.value)
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Zutaten</h3>
              <Button type="button" onClick={addZutat} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Zutat hinzufügen
              </Button>
            </div>

            {laden ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Lebensmittel werden
                geladen…
              </div>
            ) : (
              <div className="space-y-3">
                {zutaten.map((z, idx) => {
                  const lm = z.lebensmittelId
                    ? mapLebensmittel.get(z.lebensmittelId)
                    : undefined;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-12 items-end gap-3 rounded-2xl border p-3"
                    >
                      <div className="col-span-12 space-y-2 md:col-span-7">
                        <Label>Lebensmittel *</Label>
                        <Select
                          value={z.lebensmittelId}
                          onValueChange={(val: string) =>
                            updateZutat(idx, { lebensmittelId: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="auswählen…" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {(alleLebensmittel ?? []).map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.name + " " + l.zustand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-8 space-y-2 md:col-span-3">
                        <Label>Menge *</Label>
                        <Input
                          inputMode="decimal"
                          type="number"
                          min={0}
                          step={0.1}
                          placeholder="0"
                          value={Number.isFinite(z.menge) ? z.menge : ""}
                          onChange={(e) =>
                            updateZutat(idx, { menge: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="col-span-4 flex items-end justify-end md:col-span-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeZutat(idx)}
                          aria-label="Zutat entfernen"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      {lm && (
                        <div className="col-span-12 -mt-2 text-sm text-muted-foreground">
                          Ausgewählt: {lm.name}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {zutaten.length === 0 && (
                  <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                    Noch keine Zutaten. Füge die erste Zutat hinzu.
                  </div>
                )}
              </div>
            )}

            {formFehler.length > 0 && (
              <Alert variant="default" className="bg-amber-50">
                <AlertTitle>Bitte prüfen</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5">
                    {formFehler.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={onSubmit}
                disabled={saving || formFehler.length > 0}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// -------------------------------------------------
// Hinweise
// - GET  /api/lebensmittel → Lebensmittel[]
// - POST /api/gericht     → Body kompatibel zu src/data/gericht.post.ts
//   (wir senden vorsorglich sowohl `lebensmittelProGericht` als auch
//    `lebensmittelProGerichtSchema` identisch befüllt)
