export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { addDoc, collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { z } from "zod";
import { Tageszeit } from "@/domain/gericht";
import { LebensmittelProGerichtSchema } from "@/domain/lebensmittelProGericht";

const LebensmittelProGerichtInputSchema = LebensmittelProGerichtSchema.pick({
  lebensmittelId: true,
  menge: true,
});

const CreateGerichtInputSchema = z.object({
  name: z.string().min(1),
  tageszeit: z.enum(Tageszeit),
  beschreibung: z.string().optional(),
  lebensmittelProGericht: z.array(LebensmittelProGerichtInputSchema).min(1),
});

export async function POST(req: Request) {    
  const body = await req.json();
  const parsed = CreateGerichtInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { name, tageszeit, beschreibung, lebensmittelProGericht } = parsed.data;
  const gerichtRef = await addDoc(collection(db, "gerichte"), {
    name,
    tageszeit,
    beschreibung: beschreibung ?? "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const gerichtId = gerichtRef.id;
  const relCol = collection(db, "lebensmittelProGericht");
  const batch = writeBatch(db);

  for (const z of lebensmittelProGericht) {
    const relRef = doc(relCol); 
    batch.set(relRef, {
      id: relRef.id,
      gerichtId,                
      lebensmittelId: z.lebensmittelId,
      menge: z.menge,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();

  return NextResponse.json({ id: gerichtId }, { status: 201 });
}
