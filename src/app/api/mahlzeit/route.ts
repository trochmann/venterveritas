export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { listMahlzeit } from "@/data/mahlzeit.post";

export async function GET() {
  try {
    const mahlzeitenSummed = await listMahlzeit();

    return NextResponse.json(mahlzeitenSummed);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
