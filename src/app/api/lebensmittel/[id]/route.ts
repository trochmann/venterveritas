import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteLebensmittel } from "@/data/lebensmittel.post";

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
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
