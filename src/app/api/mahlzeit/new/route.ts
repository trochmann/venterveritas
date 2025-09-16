import { NextRequest, NextResponse } from "next/server";
import { NewMahlzeit, NewMahlzeitSchema } from "@/domain/mahlzeit";
import { createMahlzeit } from "@/data/mahlzeit.post";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = NewMahlzeitSchema.pick({
      tageszeit: true,
      mengeProGericht: true,
      mengeProLebensmittel: true,
    }).parse(json);
    const created = await createMahlzeit(parsed as NewMahlzeit);
    
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return new NextResponse(
        err?.message ?? "Fehler beim Anlegen der Mahlzeit",
        { status: 400 },
      );
    } else {
      return new NextResponse("Fehler beim Anlegen der Mahlzeit", {
        status: 400,
      });
    }
  }
}
