// app/mahlzeiten/[id]/page.tsx
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { z } from "zod";

const MahlzeitSchema = z.object({
  id: z.string(),
  tageszeit: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  mengeProGericht: z
    .array(
      z.object({
        id: z.string(),
        menge: z.number().nullable().optional(),
        gericht: z.object({
          id: z.string(),
          name: z.string().nullable().optional(),
          tageszeit: z.string().nullable().optional(),
          createdAt: z.string().nullable().optional(),
          updatedAt: z.string().nullable().optional(),
          lebensmittelProGericht: z
            .array(
              z.object({
                id: z.string(),
                menge: z.number().nullable().optional(),
                lebensmittel: z.object({
                  id: z.string(),
                  name: z.string().nullable().optional(),
                  kcal: z.number().nullable().optional(),
                  kh: z.number().nullable().optional(),
                  zucker: z.number().nullable().optional(),
                  fett: z.number().nullable().optional(),
                  eiweiss: z.number().nullable().optional(),
                  zustand: z.string().nullable().optional(),
                  anbau: z.string().nullable().optional(),
                  empfehlung: z.string().nullable().optional(),
                  notiz: z.string().nullable().optional(),
                  createdAt: z.string().nullable().optional(),
                  updatedAt: z.string().nullable().optional(),
                }),
              }),
            )
            .default([]),
        }),
      }),
    )
    .default([]),
  mengeProLebensmittel: z
    .array(
      z.object({
        id: z.string(),
        menge: z.number().nullable().optional(),
        lebensmittel: z.object({
          id: z.string(),
          name: z.string().nullable().optional(),
          kcal: z.number().nullable().optional(),
          kh: z.number().nullable().optional(),
          zucker: z.number().nullable().optional(),
          fett: z.number().nullable().optional(),
          eiweiss: z.number().nullable().optional(),
          zustand: z.string().nullable().optional(),
          anbau: z.string().nullable().optional(),
          empfehlung: z.string().nullable().optional(),
          notiz: z.string().nullable().optional(),
          createdAt: z.string().nullable().optional(),
          updatedAt: z.string().nullable().optional(),
        }),
      }),
    )
    .default([]),
});

type Mahlzeit = z.infer<typeof MahlzeitSchema>;

export default function Page({
  params,
}: {
  // In Next.js 15 sind params/searchParams asynchron:
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // React 19: unwrap Promise synchron synchronously

  const [data, setData] = useState<Mahlzeit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // API-Fetch: holt die JSON-Struktur aus deiner Route /api/mahlzeiten/[id]
  useEffect(() => {
    let canceled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/mahlzeit/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const body = await res.json();
console.log("body", body);
        const parsed = MahlzeitSchema.safeParse(body);
        console.log("parsed", parsed);
        if (!parsed.success) {
          console.error(parsed.error);
          throw new Error("Antwortvalidierung fehlgeschlagen");
        }
        if (!canceled) setData(parsed.data);
      } catch (e: unknown) {
        if (e instanceof Error)
          if (!canceled) setError(e?.message ?? "Unbekannter Fehler");
          else setError("Unbekannter Fehler");
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    run();
    return () => {
      canceled = true;
    };
  }, [id]);

  const title = useMemo(
    () =>
      data?.tageszeit
        ? `Mahlzeit – ${data.tageszeit}`
        : data
          ? "Mahlzeit"
          : "Mahlzeit laden",
    [data],
  );

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          ID: <code>{id}</code>
        </p>
      </header>

      {loading && <Skeleton />}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-700">Fehler: {error}</p>
          <p className="mt-1 text-sm text-red-700/80">
            Prüfe die Route <code>/api/mahlzeiten/{id}</code> und die Datenbank.
          </p>
        </div>
      )}

      {!loading && !error && !data && (
        <EmptyHinweis text="Keine Daten gefunden." />
      )}

      {!loading && !error && data && (
        <>
          {/* Basisdaten */}
          <section className="grid gap-2">
            <h2 className="text-xl font-semibold">Basis</h2>
            <div className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-2">
              <Info label="Tageszeit" value={data.tageszeit ?? "–"} />
              <Info label="Erstellt" value={data.createdAt ?? "–"} />
              <Info label="Geändert" value={data.updatedAt ?? "–"} />
            </div>
          </section>

          {/* mengeProGericht */}
          <section className="grid gap-3">
            <h2 className="text-xl font-semibold">Gerichte (mit Menge)</h2>
            <div className="space-y-4">
              {data.mengeProGericht.length === 0 && (
                <EmptyHinweis text="Keine Gerichte zugeordnet." />
              )}
              {data.mengeProGericht.map((mpg) => (
                <div
                  key={mpg.id}
                  className="space-y-3 rounded-2xl border bg-white/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {mpg.gericht.name ?? "Unbenanntes Gericht"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Menge: {mpg.menge ?? "–"}
                    </div>
                  </div>

                  {/* lebensmittelProGericht */}
                  <div className="pl-1">
                    <div className="mb-2 text-sm font-semibold">
                      Lebensmittel im Gericht
                    </div>
                    {mpg.gericht.lebensmittelProGericht.length === 0 ? (
                      <EmptyHinweis text="Keine Lebensmittel zugeordnet." />
                    ) : (
                      <ul className="grid gap-2">
                        {mpg.gericht.lebensmittelProGericht.map((lpg) => (
                          <li
                            key={lpg.id}
                            className="flex items-center justify-between rounded-xl border p-3"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {lpg.lebensmittel.name ?? "Lebensmittel"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                kcal: {lpg.lebensmittel.kcal ?? "–"} · KH:{" "}
                                {lpg.lebensmittel.kh ?? "–"} · Zucker:{" "}
                                {lpg.lebensmittel.zucker ?? "–"} · Fett:{" "}
                                {lpg.lebensmittel.fett ?? "–"} · Eiweiß:{" "}
                                {lpg.lebensmittel.eiweiss ?? "–"}
                              </span>
                            </div>
                            <div className="text-sm">
                              Menge: {lpg.menge ?? "–"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* mengeProLebensmittel */}
          <section className="grid gap-3">
            <h2 className="text-xl font-semibold">
              Direkt zugeordnete Lebensmittel
            </h2>
            {data.mengeProLebensmittel.length === 0 ? (
              <EmptyHinweis text="Keine direkten Lebensmittel zugeordnet." />
            ) : (
              <ul className="grid gap-3">
                {data.mengeProLebensmittel.map((mpl) => (
                  <li
                    key={mpl.id}
                    className="flex items-center justify-between rounded-2xl border p-4"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {mpl.lebensmittel.name ?? "Lebensmittel"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        kcal: {mpl.lebensmittel.kcal ?? "–"} · KH:{" "}
                        {mpl.lebensmittel.kh ?? "–"} · Zucker:{" "}
                        {mpl.lebensmittel.zucker ?? "–"} · Fett:{" "}
                        {mpl.lebensmittel.fett ?? "–"} · Eiweiß:{" "}
                        {mpl.lebensmittel.eiweiss ?? "–"}
                      </span>
                    </div>
                    <div className="text-sm">Menge: {mpl.menge ?? "–"}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? "–"}</span>
    </div>
  );
}

function EmptyHinweis({ text }: { text: string }) {
  return (
    <div className="rounded-xl border p-3 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="h-20 w-full rounded bg-gray-200" />
      <div className="h-6 w-56 rounded bg-gray-200" />
      <div className="h-24 w-full rounded bg-gray-200" />
      <div className="h-24 w-full rounded bg-gray-200" />
    </div>
  );
}
