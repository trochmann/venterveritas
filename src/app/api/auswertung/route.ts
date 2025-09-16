import { NextResponse } from "next/server";
import { listMahlzeit } from "@/data/mahlzeit.post";
import { Mahlzeit, TAGESZEIT } from "@/domain/mahlzeit";

// function serializeMahlzeit(m: Mahlzeit) {
//   return {
//     ...m,
//     createdAt:
//       m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
//     updatedAt:
//       m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
//   };
// }

export async function GET() {
  try {
    const meals = await listMahlzeit();

    const byTageszeit: Record<string, number> = {};
    for (const tz of TAGESZEIT) byTageszeit[tz] = 0;

    // let earliest: Date | null = null;
    // let latest: Date | null = null;

    // meals.forEach((m) => {
    //   byTageszeit[m.tageszeit] = (byTageszeit[m.tageszeit] ?? 0) + 1;
    //   const c = m.createdAt;
    //   if (!earliest || c < earliest) earliest = c;
    //   if (!latest || c > latest) latest = c;
    // });

    const total = meals.length;

    const payload = {
      total,
      byTageszeit,
      // earliest: earliest,
      // latest: latest,
      // meals: meals.map(serializeMahlzeit),
    };

    return NextResponse.json(meals, { status: 200 });
  } catch (err: unknown) {
    console.error("/api/auswertung error", err);
    return NextResponse.json(
      { error: "Auswertung konnte nicht geladen werden." },
      { status: 500 },
    );
  }
}
