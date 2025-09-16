export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { listLebensmittel } from "../../../data/lebensmittel.post";

export async function GET() {
  try {
    const lebensmittelCol = await listLebensmittel();
    return NextResponse.json(lebensmittelCol);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const parsed = NewLebensmittelSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
//         { status: 400 },
//       );
//     }

//     const created = await createLebensmittel(parsed.data);

//     return new NextResponse(JSON.stringify(created), {
//       status: 201,
//       headers: {
//         "Content-Type": "application/json",
//         Location: `/api/lebensmittel/${created.id}`,
//       },
//     });
//   } catch (e: unknown) {
//     const message = e instanceof Error ? e.message : "Unbekannter Fehler";
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }
