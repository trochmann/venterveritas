export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getMahlzeit } from "@/data/mahlzeit.post";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const { id } = ctx.params;
    const gericht = await getMahlzeit(id);

    return NextResponse.json(gericht);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}