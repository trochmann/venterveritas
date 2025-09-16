// app/mahlzeit-kcal/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { MahlzeitOutSummedSchema } from "@/domain/mahlzeit";
import Link from "next/link";
import { Plus } from "lucide-react";

type Row = z.infer<typeof MahlzeitOutSummedSchema>;

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const ArraySchema = useMemo(() => z.array(MahlzeitOutSummedSchema), []);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/mahlzeit", { cache: "no-store" });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const parsed = ArraySchema.safeParse(data);

        if (!parsed.success) {
          throw new Error("Antwortvalidierung (Zod) fehlgeschlagen.");
        }
        if (!canceled) setRows(parsed.data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (!canceled) setError(e?.message ?? "Unbekannter Fehler");
        } else {
          if (!canceled) setError("Unbekannter Fehler");
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [ArraySchema]);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Mahlzeiten – Kalorien</h1>
        <p className="text-sm text-muted-foreground">
          Datenquelle: View (Array), validiert mit <code>MahlzeitOutSummedSchema</code>
        </p>
      </header>

      <nav aria-label="Aktionen" className="rounded-2xl border bg-muted/20 p-2">
        <ul className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/mahlzeiten/new"
              className="inline-flex items-center rounded-xl border bg-background px-3 py-2 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Plus className="mr-2 h-4 w-4" />
              Neue Mahlzeit
            </Link>
          </li>
        </ul>
      </nav>

      {loading && <Skeleton />}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-700">Fehler: {error}</p>
        </div>
      )}

      {!loading && !error && rows.length === 0 && <EmptyHinweis text="Keine Einträge gefunden." />}

      {!loading && !error && rows.length > 0 && (
        <ul className="grid gap-3">
          {rows.map((r, i) => (
            <li key={r.id ?? i} className="flex items-center justify-between rounded-2xl border p-4">
              <Link href={`/mahlzeiten/${r.id}`} className="block flex items-center justify-between rounded-2xl p-4">
                <div className="space-y-1">
                  <div className="font-medium">{r.tageszeit ?? "—"}</div>
                  <div className="text-sm text-muted-foreground">
                    Aus Gerichten: {fmt(r.kcalAusGerichten)} kcal · Direkt: {fmt(r.kcalAusLebensmitteln)} kcal
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold">{fmt(r.kcalTotal)} kcal</div>

                  {r.createdAt && <div className="text-xs text-muted-foreground">{toDateString(r.createdAt)}</div>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/* ---------- kleine UI-Helper ---------- */

function fmt(v?: number) {
  if (v == null) return "0";
  // maximal 2 Nachkommastellen, ohne Spezialfarben
  return Number.isInteger(v) ? `${v}` : v.toFixed(2);
}

function toDateString(d: unknown) {
  try {
    if (d == null) return "";
    const date = d instanceof Date ? d : new Date(0);
    return date.toLocaleString();
  } catch {
    return String(d);
  }
}

function EmptyHinweis({ text }: { text: string }) {
  return <div className="rounded-xl border p-3 text-sm text-muted-foreground">{text}</div>;
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-6 w-48 rounded bg-gray-200" />
      <div className="h-20 w-full rounded bg-gray-200" />
      <div className="h-16 w-full rounded bg-gray-200" />
    </div>
  );
}
