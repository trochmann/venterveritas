export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// Hilfsfunktionen für Timestamp → ISO
function toIso(val: unknown): string | null {
  // Firestore Timestamp hat .toDate()
  // @ts-expect-error runtime check
  return val && typeof val.toDate === "function"
  // @ts-expect-error runtime check
    ? val.toDate().toISOString()
    : null;
}

type LebensmittelOut = {
  id: string;
  name: string;
  kcal: number;
  kh: number;
  zucker: number;
  fett: number;
  eiweiss: number;
  zustand: string;
  anbau: string;
  empfehlung: string;
  notiz: string;
  createdAt: string | null;
  updatedAt: string | null;
};

type ZutatOut = {
  id: string;
  lebensmittelId: string;
  menge: number;
  createdAt: string | null;
  updatedAt: string | null;
  lebensmittel: LebensmittelOut;
};

type GerichtOut = {
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
  lebensmittelProGericht: ZutatOut[];
  createdAt: string | null;
  updatedAt: string | null;
};

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const { id } = await ctx.params;

    // 1) Gericht laden
    const gerichtRef = doc(collection(db, "gerichte"), id);
    const gerichtSnap = await getDoc(gerichtRef);
    if (!gerichtSnap.exists()) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
    const gData = gerichtSnap.data() as Record<string, unknown>;

    // 2) Zutaten laden
    const relCol = collection(db, "lebensmittelProGericht");
    const relQ = query(relCol, where("gerichtId", "==", id));
    const relSnap = await getDocs(relQ);

    const zutatenRaw = relSnap.docs.map((d) => {
      const r = d.data() as Record<string, unknown>;
      return {
        id: (r.id as string) ?? d.id,
        lebensmittelId: (r.lebensmittelId as string) ?? "",
        menge: Number(r.menge ?? 0),
        createdAt: toIso(r.createdAt),
        updatedAt: toIso(r.updatedAt),
      };
    });

    // 3) Alle benötigten Lebensmittel parallel laden und in Map legen
    const lebensmittelIds = Array.from(
      new Set(zutatenRaw.map((z) => z.lebensmittelId).filter(Boolean)),
    );

    const lebensmittelDocs = await Promise.all(
      lebensmittelIds.map(async (lmId) => {
        const ref = doc(collection(db, "lebensmittel"), lmId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;

        const lm = snap.data() as Record<string, unknown>;
        const out: LebensmittelOut = {
          id: snap.id,
          name: (lm.name as string) ?? "",
          kcal: Number(lm.kcal ?? 0),
          kh: Number(lm.kh ?? 0),
          zucker: Number(lm.zucker ?? 0),
          fett: Number(lm.fett ?? 0),
          eiweiss: Number(lm.eiweiss ?? 0),
          zustand: (lm.zustand as string) ?? "",
          anbau: (lm.anbau as string) ?? "",
          empfehlung: (lm.empfehlung as string) ?? "",
          notiz: (lm.notiz as string) ?? "",
          createdAt: toIso(lm.createdAt),
          updatedAt: toIso(lm.updatedAt),
        };
        return out;
      }),
    );

    const lebensmittelMap = new Map<string, LebensmittelOut>();
    for (const lm of lebensmittelDocs) {
      if (lm) lebensmittelMap.set(lm.id, lm);
    }

    // 4) Zutaten mit vollständigem Lebensmittel zusammenbauen
    const zutaten: ZutatOut[] = zutatenRaw.map((z) => {
      const lm = lebensmittelMap.get(z.lebensmittelId) ?? {
        id: z.lebensmittelId,
        name: "(unbekannt)",
        kcal: 0,
        kh: 0,
        zucker: 0,
        fett: 0,
        eiweiss: 0,
        zustand: "",
        anbau: "",
        empfehlung: "",
        notiz: "",
        createdAt: null,
        updatedAt: null,
      };
      return { ...z, lebensmittel: lm };
    });

    const out: GerichtOut = {
      id,
      name: (gData.name as string) ?? "",
      tageszeit: (gData.tageszeit as GerichtOut["tageszeit"]) ?? "k.A.",
      beschreibung: (gData.beschreibung as string) || undefined,
      lebensmittelProGericht: zutaten,
      createdAt: toIso(gData.createdAt),
      updatedAt: toIso(gData.updatedAt),
    };

    return NextResponse.json(out);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
