import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { deleteLebensmittel } from "@/data/lebensmittel.post";

const IdSchema = z.string().uuid();

function isPgError(x: unknown): x is { code: string } {
  return !!x && typeof x === "object" && "code" in x;
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; 
    const parsedId = IdSchema.parse(id);
    await deleteLebensmittel(parsedId);
    return new Response(null, { status: 204 }); 
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
    }
    if (isPgError(e) && e.code === "23503") {
      return NextResponse.json({ error: "Datensatz wird noch referenziert (FK-Violation)." }, { status: 409 });
    }
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
