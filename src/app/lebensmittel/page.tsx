"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type Lebensmittel,
} from "@/domain/lebensmittel";
import { Trash2, Search } from "lucide-react";

export default function LebensmittelPage() {
  const [items, setItems] = useState<Lebensmittel[]>([]);
  const [qText, setQText] = useState("");

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/lebensmittel", { cache: "no-store" });
      const rows: Lebensmittel[] = await res.json();
      setItems(rows);
    }
    fetchData();
  }, []);

  async function remove(id: string) {
    await fetch(`/api/lebensmittel/${id}`, { method: "DELETE" });
    const index = items.findIndex((i) => i.id === id);
    items.splice(index, 1);
    setItems([...items]);
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">

      <div className="mt-8 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <h2 className="text-xl font-semibold md:text-2xl">
            Vorhandene Lebensmittel
          </h2>
          <div className="grow" />
          <div className="relative w-full max-w-sm">
            <Input
              className="pl-9"
              placeholder="Suchen…"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
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
            {items.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">
                Keine Einträge gefunden.
              </div>
            )}
            {items.map((lm) => {
              return (
                <div
                  key={lm.id}
                  className="grid grid-cols-12 items-center gap-2 px-2 py-3"
                >
                  <div className="col-span-3">
                    <div className="font-medium">
                      {lm.name}
                      <div className="text-xs">{lm.zustand}</div>
                    </div>
                  </div>
                  <div className="col-span-1 text-xs">{lm.kcal}</div>
                  <div className="col-span-1 text-xs">{lm.kh}</div>
                  <div className="col-span-1 text-xs">{lm.zucker}</div>
                  <div className="col-span-1 text-xs">{lm.fett}</div>
                  <div className="col-span-1 text-xs">{lm.eiweiss}</div>
                  <div className="col-span-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(lm.id)}
                      aria-label="Löschen"
                    >
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
        <p></p>
        <p></p>
      </div>
    </div>
  );
}
