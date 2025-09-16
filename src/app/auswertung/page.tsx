"use client";

import { Mahlzeit } from "@/domain/mahlzeit";
import React, { useEffect, useState, useCallback } from "react";

function formatDate(iso: string | null) {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toLocaleString();
}

export default function Page() {
  const [data, setData] = useState<Mahlzeit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auswertung", { cache: "no-store" });
      console.log(res);
      if (!res.ok) throw new Error(await res.text());
      const json: Mahlzeit[] = await res.json();
      console.log("json", json);
      setData(json);
      console.log("data", data);
    } catch (err) {
      setError(String((err as Error)?.message ?? err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Auswertung</h1>
        <p className="mt-2 text-sm text-gray-500">Lade Daten …</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Auswertung</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Fehler beim Laden: {error}
        </div>
        <button
          onClick={load}
          className="rounded-xl border px-4 py-2 shadow-sm hover:bg-gray-50"
        >
          Erneut versuchen
        </button>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Auswertung</h1>
          <p className="text-sm text-gray-500">Überblick über gespeicherte Mahlzeiten</p>
        </div>
        <button
          onClick={load}
          className="rounded-xl border px-4 py-2 shadow-sm hover:bg-gray-50"
        >
          Aktualisieren
        </button>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-sm text-gray-500">Gesamt</div>
          <div className="text-3xl font-bold">{data[0].tageszeit}</div>
        </div>
        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-sm text-gray-500">Erste Erfassung</div>
          <div className="text-lg font-medium">{formatDate(data[0].id ?? "")}</div>
        </div>
        {/* <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-sm text-gray-500">Letzte Erfassung</div>
          <div className="text-lg font-medium">{formatDate(data.latest)}</div>
        </div> */}
        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-sm text-gray-500">Tageszeiten (≠0)</div>
          <div className="mt-1 text-sm">
            {/* {Object.entries(data.tageszeit  )
              .filter(([, v]) => v > 0)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))} */}
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Erfasst</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Tageszeit</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">#Gerichte</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">#Lebensmittel</th>
              </tr>
            </thead>
            <tbody>
              {/* {data.meals
                .slice()
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                .map((m) => (
                  <tr key={m.id ?? m.createdAt} className="border-t">
                    <td className="px-4 py-2">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-2">{m.tageszeit}</td>
                    <td className="px-4 py-2">{m.mengeProGericht?.length ?? 0}</td>
                    <td className="px-4 py-2">{m.mengeProLebensmittel?.length ?? 0}</td>
                  </tr>
                ))} */}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}