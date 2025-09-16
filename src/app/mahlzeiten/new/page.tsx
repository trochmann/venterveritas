"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TAGESZEIT } from "@/domain/mahlzeit";
import type { NewMahlzeit, Mahlzeit } from "@/domain/mahlzeit";
import type { MengeProGericht } from "@/domain/mengeProGericht";
import type { MengeProLebensmittel } from "@/domain/mengeProLebensmittel";
import { Gericht } from "@/domain/gericht";
import { Lebensmittel } from "@/domain/lebensmittel";

async function loadGerichte(): Promise<Gericht[]> {
  const res = await fetch("/api/gerichte", { cache: "no-store" });
  const rows: Gericht[] = await res.json();
  return rows;
}

async function loadLebensmittel(): Promise<Lebensmittel[]> {
  const res = await fetch("/api/lebensmittel", { cache: "no-store" });
  const rows: Lebensmittel[] = await res.json();
  return rows;
}

export default function NewMahlzeitPage() {
  const router = useRouter();
  const [tageszeit, setTageszeit] =
    useState<NewMahlzeit["tageszeit"]>("Mittag");
  const [gerichte, setGerichte] = useState<MengeProGericht[]>([]);
  const [lebensmittel, setLebensmittel] = useState<MengeProLebensmittel[]>([]);
  const [gerichtOptions, setGerichtOptions] = useState<Gericht[]>([]);
  const [lmOptions, setLmOptions] = useState<Lebensmittel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [g, l] = await Promise.all([loadGerichte(), loadLebensmittel()]);
        setGerichtOptions(g);
        setLmOptions(l);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e?.message);
        } else {
          setError("Unbekannter Fehler beim Laden");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canSubmit = useMemo(() => {
    return (gerichte.length > 0 || lebensmittel.length > 0) && !saving;
  }, [gerichte.length, lebensmittel.length, saving]);

  function addGericht() {
    setGerichte((prev) => [
      ...prev,
      { id: crypto.randomUUID(), gerichtId: "", menge: 0 },
    ]);
  }

  function addLebensmittel() {
    setLebensmittel((prev) => [
      ...prev,
      { id: crypto.randomUUID(), lebensmittelId: "", menge: 0 },
    ]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: Omit<NewMahlzeit, "createdAt" | "updatedAt" | "id"> = {
        tageszeit,
        mengeProGericht: gerichte.filter((g) => g.gerichtId && g.menge > 0),
        mengeProLebensmittel: lebensmittel.filter(
          (l) => l.lebensmittelId && l.menge > 0,
        ),
      } as Mahlzeit;

      const res = await fetch("/api/mahlzeit/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const mahlzeitId = await res.text();
      const trim = mahlzeitId.replace(/"/g, "");
      
      router.push(`/mahlzeiten/${trim}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e?.message);
      } else {
        setError("Speichern fehlgeschlagen");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Neue Mahlzeit anlegen</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Tageszeit */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Tageszeit</label>
          <select
            className="w-full rounded-xl border bg-gray-50 p-2"
            value={TAGESZEIT}
            onChange={(e) => setTageszeit(e.target.value as NewMahlzeit["tageszeit"])}
          >
            {TAGESZEIT.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {/* Gerichte */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Gericht(e)</h2>
            <button
              type="button"
              className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={addGericht}
              disabled={loading}
            >
              + Gericht hinzufügen
            </button>
          </div>

          {gerichte.length === 0 && (
            <p className="text-sm text-gray-500">
              Noch kein Gericht hinzugefügt.
            </p>
          )}

          <div className="space-y-2">
            {gerichte.map((g) => (
              <div key={g.id} className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-7">
                  <select
                    className="w-full rounded-xl border bg-gray-50 p-2"
                    value={g.gerichtId}
                    onChange={(e) => {
                      const v = e.target.value;
                      setGerichte((prev) =>
                        prev.map((x) =>
                          x.id === g.id ? { ...x, gerichtId: v } : x,
                        ),
                      );
                    }}
                  >
                    <option value="">– Gericht wählen –</option>
                    {gerichtOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full rounded-xl border bg-gray-50 p-2"
                    placeholder="Menge (g/ml)"
                    value={g.menge}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setGerichte((prev) =>
                        prev.map((x) =>
                          x.id === g.id ? { ...x, menge: v } : x,
                        ),
                      );
                    }}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    className="rounded-xl border px-2 py-1 text-xs hover:bg-gray-50"
                    onClick={() =>
                      setGerichte((prev) => prev.filter((x) => x.id !== g.id))
                    }
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lebensmittel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Lebensmittel</h2>
            <button
              type="button"
              className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={addLebensmittel}
              disabled={loading}
            >
              + Lebensmittel hinzufügen
            </button>
          </div>

          {lebensmittel.length === 0 && (
            <p className="text-sm text-gray-500">
              Noch kein Lebensmittel hinzugefügt.
            </p>
          )}

          <div className="space-y-2">
            {lebensmittel.map((l) => (
              <div key={l.id} className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-7">
                  <select
                    className="w-full rounded-xl border bg-gray-50 p-2"
                    value={l.lebensmittelId}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLebensmittel((prev) =>
                        prev.map((x) =>
                          x.id === l.id ? { ...x, lebensmittelId: v } : x,
                        ),
                      );
                    }}
                  >
                    <option value="">– Lebensmittel wählen –</option>
                    {lmOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full rounded-xl border bg-gray-50 p-2"
                    placeholder="Menge (g/ml)"
                    value={l.menge}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setLebensmittel((prev) =>
                        prev.map((x) =>
                          x.id === l.id ? { ...x, menge: v } : x,
                        ),
                      );
                    }}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    className="rounded-xl border px-2 py-1 text-xs hover:bg-gray-50"
                    onClick={() =>
                      setLebensmittel((prev) =>
                        prev.filter((x) => x.id !== l.id),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Speichern…" : "Mahlzeit speichern"}
          </button>
          <button
            type="button"
            className="rounded-xl border px-4 py-2"
            onClick={() => router.back()}
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
