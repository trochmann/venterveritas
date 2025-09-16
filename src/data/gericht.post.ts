import {
  Gericht,
  GerichtArraySchema,
  GerichtOutSchema,
  NewGericht,
} from "@/domain/gericht";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function createGericht(input: NewGericht): Promise<Gericht> {
  const res =
    await sql`INSERT INTO gericht (name, tageszeit) values (${input.name}, ${input.tageszeit}) RETURNING "id"`;
  const gerichtId = res[0].id;

  input.lebensmittelProGericht.forEach(async (z) => {
    await sql`INSERT INTO "lebensmittelProGericht" ("gerichtId", "lebensmittelId", menge) values (${gerichtId}, ${z.lebensmittelId}, ${z.menge})`;
  });

  return input as Gericht;
}

// export async function upsertGericht(
//   id: string,
//   input: NewGericht | UpdateGericht,
// ): Promise<void> {
//   const ref = doc(gericht, id);
//   const payload: WithFieldValue<Partial<Gericht>> = {
//     ...input,
//     updatedAt: serverTimestamp(),
//   };
//   await setDoc(ref, payload, { merge: true });
// }

export async function getGericht(id: string): Promise<Gericht | null> {
  const rows = await sql /* sql */ `
  SELECT
    g."id",
    g."name",
    g."tageszeit",
    g."createdAt",
    g."updatedAt",
    COALESCE(
      json_agg(
        json_build_object(
          'id',             lpg."id",
          'lebensmittelId', lpg."lebensmittelId",
          'menge',          lpg."menge",
          'lebensmittel',   CASE
                              WHEN l."id" IS NULL THEN NULL
                              ELSE json_build_object(
                                'id',         l."id",
                                'name',       l."name",
                                'kcal',       l."kcal",
                                'kh',         l."kh",
                                'zucker',     l."zucker",
                                'fett',       l."fett",
                                'eiweiss',    l."eiweiss",
                                'zustand',    l."zustand",
                                'anbau',      l."anbau",
                                'empfehlung', l."empfehlung",
                                'notiz',      l."notiz",
                                'createdAt',  l."createdAt",
                                'updatedAt',  l."updatedAt"
                              )
                            END
        )
      ) FILTER (WHERE lpg."id" IS NOT NULL),
      '[]'
    ) AS "lebensmittelProGericht"
  FROM "gericht" g
  LEFT JOIN "lebensmittelProGericht" lpg
         ON lpg."gerichtId" = g."id"
  LEFT JOIN "lebensmittel" l
         ON l."id" = lpg."lebensmittelId"
  WHERE g."id" = ${id}
  GROUP BY g."id";
`;

  const parsed = GerichtOutSchema.safeParse(rows[0]);

  if (!parsed.success) {
    throw new Error(`Zod parse failed for gericht ${id}`);
  }

  return parsed.data;
}

// export async function updateGericht(
//   id: string,
//   patch: UpdateGericht,
// ): Promise<void> {
//   const ref = doc(gericht, id);
//   await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
// }

export function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function listPlainGerichte(): Promise<Gericht[]> {
  const data = await sql`SELECT * FROM gericht;`;
  const parsed = GerichtArraySchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Zod parse failed for lebensmittel rows");
  }

  return parsed.data;
}

export async function getGerichteByIds(ids: string[]) {
  const unique = [...new Set(ids)].filter(Boolean);
  const col = collection(db, "gerichte").withConverter(GerichtConverter);
  const map = new Map<string, Gericht>();

  for (const batch of chunk(unique, 30)) {
    const snap = await getDocs(query(col, where(documentId(), "in", batch)));
    snap.forEach((d) => map.set(d.id, { ...d.data() }));
  }
  return map;
}

