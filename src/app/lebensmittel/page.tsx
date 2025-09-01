"use client";

import React, { useEffect, useMemo, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { z } from "zod";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type Lebensmittel, NewLebensmittelSchema } from "@/domain/lebensmittel";
import { PlusCircle, Trash2, Search } from "lucide-react";

const LM_COL = collection(db, "lebensmittel");

const FormSchema = NewLebensmittelSchema.pick({
  name: true,
  kcal: true,
  kh: true,
  zucker: true,
  fett: true,
  eiweiss: true,
  zustand: true,
  anbau: true,
  empfehlung: true,
  notiz: true,
});

type ErrorWithMessage = { message: string };
function isErrorWithMessage(e: unknown): e is ErrorWithMessage {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as Record<string, unknown>).message === "string"
  );
}

function asDate(v: unknown): Date | null {
  if (v instanceof Date) return v;
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "object" && v !== null) {
    const maybe = v as { toDate?: unknown };
    if (typeof maybe.toDate === "function") {
      try {
        return (maybe.toDate as () => Date)();
      } catch {
        return null;
      }
    }
  }
  return null;
}

export default function LebensmittelPage() {
  const [form, setForm] = useState({
    name: "",
    kcal: "",
    kh: "",
    zucker: "",
    fett: "",
    eiweiss: "",
    zustand: "",
    anbau: "",
    empfehlung: "",
    notiz: "",
  } as Record<string, string>);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [items, setItems] = useState<Lebensmittel[]>([]);
  const [qText, setQText] = useState("");

  useEffect(() => {
    const qRef = query(LM_COL, orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(qRef, (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>; 
        return {
          id: d.id,
          name: (data.name as string) ?? "",
          kcal: Number(data.kcal ?? 0),
          kh: Number(data.kh ?? 0),
          zucker: Number(data.zucker ?? 0),
          fett: Number(data.fett ?? 0),
          eiweiss: Number(data.eiweiss ?? 0),
          zustand: (data.zustand as string) ?? "",
          anbau: (data.anbau as string) ?? "",
          empfehlung: (data.empfehlung as string) ?? "",
          notiz: (data.notiz as string) ?? "",
          createdAt: asDate(data.createdAt),
          updatedAt: asDate(data.updatedAt),
        } as Lebensmittel;
      });
      setItems(rows);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = qText.trim().toLowerCase();
    const base = [...items];
    if (!q) return base;
    return base.filter((x) =>
      [x.name, x.notiz, x.zustand, x.anbau, x.empfehlung].some((f) => String(f ?? "").toLowerCase().includes(q))
    );
  }, [items, qText]);

  function setF(key: string, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payloadCandidate = {
        ...form,
        kcal: Number(form.kcal || 0),
        kh: Number(form.kh || 0),
        zucker: Number(form.zucker || 0),
        fett: Number(form.fett || 0),
        eiweiss: Number(form.eiweiss || 0),
      };

      const parsed = FormSchema.parse(payloadCandidate);

      await addDoc(LM_COL, {
        ...parsed,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setForm({
        name: "",
        kcal: "",
        kh: "",
        zucker: "",
        fett: "",
        eiweiss: "",
        zustand: "",
        anbau: "",
        empfehlung: "",
        notiz: "",
      });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.issues.map((i) => i.message).join(" • "));
      } else if (err instanceof Error) {
        setError(err.message);
      } else if (isErrorWithMessage(err)) {
        setError(err.message);
      } else {
        setError("Unbekannter Fehler beim Speichern");
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await deleteDoc(doc(LM_COL, id));
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      <Card className="p-4 md:p-6 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Lebensmittel</h1>
        <p className="text-sm text-muted-foreground mb-6">Neue Lebensmittel erfassen. Die Liste unten aktualisiert sich live.</p>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
          <Field label="Name" className="md:col-span-4">
            <Input
              placeholder="z.B. Apfel"
              value={form.name}
              onChange={(e) => setF("name", e.target.value)}
              required
            />
          </Field>

          <Field label="kcal" className="md:col-span-2">
            <Input type="number" inputMode="decimal" step="any" value={form.kcal} onChange={(e) => setF("kcal", e.target.value)} />
          </Field>
          <Field label="KH (g)" className="md:col-span-2">
            <Input type="number" inputMode="decimal" step="any" value={form.kh} onChange={(e) => setF("kh", e.target.value)} />
          </Field>
          <Field label="Zucker (g)" className="md:col-span-2">
            <Input type="number" inputMode="decimal" step="any" value={form.zucker} onChange={(e) => setF("zucker", e.target.value)} />
          </Field>
          <Field label="Fett (g)" className="md:col-span-2">
            <Input type="number" inputMode="decimal" step="any" value={form.fett} onChange={(e) => setF("fett", e.target.value)} />
          </Field>
          <Field label="Eiweiß (g)" className="md:col-span-2">
            <Input type="number" inputMode="decimal" step="any" value={form.eiweiss} onChange={(e) => setF("eiweiss", e.target.value)} />
          </Field>

          <Field label="Zustand" className="md:col-span-3">
            <Input placeholder="z.B. frisch, TK, getrocknet" value={form.zustand} onChange={(e) => setF("zustand", e.target.value)} />
          </Field>
          <Field label="Anbau" className="md:col-span-3">
            <Input placeholder="z.B. Bio, konventionell" value={form.anbau} onChange={(e) => setF("anbau", e.target.value)} />
          </Field>
          <Field label="Empfehlung" className="md:col-span-3">
            <Input placeholder="1 - 5" value={form.empfehlung} onChange={(e) => setF("empfehlung", e.target.value)} />
          </Field>
          <Field label="Notiz" className="md:col-span-12">
            <Input placeholder="Freitext…" value={form.notiz} onChange={(e) => setF("notiz", e.target.value)} />
          </Field>

          <div className="md:col-span-12 flex items-end gap-2 mt-1">
            <Button type="submit" className="gap-2" disabled={busy}>
              <PlusCircle className="h-4 w-4" /> {busy ? "Speichert…" : "Hinzufügen"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </form>
      </Card>

      {/* UNTERER BEREICH: Liste */}
      <div className="mt-8 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <h2 className="text-xl md:text-2xl font-semibold">Vorhandene Lebensmittel</h2>
          <div className="grow" />
          <div className="relative max-w-sm w-full">
            <Input className="pl-9" placeholder="Suchen…" value={qText} onChange={(e) => setQText(e.target.value)} />
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <Card className="p-2 md:p-3">
          <div className="grid grid-cols-12 px-2 py-2 text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Name</div>
            <div className="col-span-1">kcal</div>
            <div className="col-span-1">KH</div>
            <div className="col-span-1">Zucker</div>
            <div className="col-span-1">Fett</div>
            <div className="col-span-1">Eiweiß</div>
            <div className="col-span-3 text-right">Aktionen</div>
          </div>
          <div className="divide-y">
            {filtered.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">Keine Einträge gefunden.</div>
            )}
            {filtered.map((lm) => {
              return (
                <div key={lm.id} className="grid grid-cols-12 items-center px-2 py-3 gap-2">
                  <div className="col-span-3">
                    <div className="font-medium">{lm.name}<div className="text-xs">{lm.zustand}</div></div>
                  </div>
                  <div className="col-span-1 text-xs">{lm.kcal}</div>
                  <div className="col-span-1 text-xs">{lm.kh}</div>
                  <div className="col-span-1 text-xs">{lm.zucker}</div>
                  <div className="col-span-1 text-xs">{lm.fett}</div>
                  <div className="col-span-1 text-xs">{lm.eiweiss}</div>
                  <div className="col-span-3 flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => remove(lm.id)} aria-label="Löschen">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

{/* Footer */}
      <div className="mt-6 text-xs text-muted-foreground">
        <p>
        </p>
        <p>
        </p>
      </div>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}