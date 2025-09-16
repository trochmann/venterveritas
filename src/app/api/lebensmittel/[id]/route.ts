import { NextResponse } from "next/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";
import { deleteLebensmittel } from "@/data/lebensmittel.post";
import next from "next";

const IdSchema = z.string().uuid();

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = IdSchema.parse(params.id);
    await deleteLebensmittel(id);
    NextResponse.json({ message: "Deleted" }, { status: 204 });
  } catch (e: unknown) {
    if (e?.code === "23503") {
      return NextResponse.json(
        { error: "Datensatz wird noch referenziert (FK-Violation)." },
        { status: 409 }
      );
    }
    if (e?.issues) {
      return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
    }
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
