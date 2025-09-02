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
import { LebensmittelConverter } from "@/data/lebensmittel.post";
import { getGericht } from "@/data/gericht.post";
import { LebensmittelProGericht } from "@/domain/lebensmittelProGericht";
import { NULL_LEBENSMITTEL } from "@/ui/nullObjects";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const { id } = ctx.params;

    const gericht = await getGericht(id);

    const relCol = collection(db, "lebensmittelProGericht");
    const relQ = query(relCol, where("gerichtId", "==", id));
    const relSnap = await getDocs(relQ);

    const zutatenRaw = relSnap.docs.map((d) => {
      return d.data() as LebensmittelProGericht;
    });

    const lebensmittelIds = Array.from(
      new Set(relSnap.docs.map((z) => z.data().lebensmittelId).filter(Boolean)),
    );

    const lebensmittelDocs = await Promise.all(
      lebensmittelIds.map(async (lmId) => {
        const ref = doc(collection(db, "lebensmittel"), lmId).withConverter(
          LebensmittelConverter,
        );
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        return snap.data();
      }),
    );

    if (gericht) {
      gericht.lebensmittelProGericht = zutatenRaw.map((z) => {
        const lm =
          lebensmittelDocs.find((x) => x?.id == z.lebensmittelId) ??
          NULL_LEBENSMITTEL;
        return { ...z, lebensmittel: lm };
      });
    }

    return NextResponse.json(gericht);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
