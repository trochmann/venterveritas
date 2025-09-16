export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { Gericht, Tageszeit } from "@/domain/gericht";
import { LebensmittelProGerichtSchema } from "@/domain/lebensmittelProGericht";
import { createGericht, listPlainGerichte } from "@/data/gericht.post";

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
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  createGericht(parsed.data as Gericht);

  return NextResponse.json({ id: "asd" }, { status: 201 });
}

export async function GET() {
  try {
    const gerichte = await listPlainGerichte();
    return NextResponse.json(gerichte);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
