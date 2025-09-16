// src/data/mahlzeit.post.ts
import {
  Mahlzeit,
  MahlzeitArraySchema,
  MahlzeitOut,
  MahlzeitOutSchema,
  MahlzeitOutSummed,
  MahlzeitOutSummedArraySchema,
  NewMahlzeit,
} from "@/domain/mahlzeit";
import { MengeProGericht, MengeProGerichtSchema } from "@/domain/mengeProGericht";
// import { getGerichteByIds } from "./gericht.post";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function createMahlzeit(input: NewMahlzeit): Promise<string> {
  const res = await sql`INSERT INTO mahlzeit (tageszeit) values (${input.tageszeit}) RETURNING "id"`;
  const mahlzeitId = res[0].id;

  input.mengeProGericht.forEach(async (z) => {
    await sql`INSERT INTO "mengeProGericht" ("mahlzeitId", "gerichtId", menge) values (${mahlzeitId}, ${z.gerichtId}, ${z.menge})`;
  });

  input.mengeProLebensmittel.forEach(async (z) => {
    await sql`INSERT INTO "mengeProLebensmittel" ("mahlzeitId", "lebensmittelId", menge) values (${mahlzeitId}, ${z.lebensmittelId}, ${z.menge})`;
  });

  return mahlzeitId;
}

export async function getMahlzeit(id: string): Promise<MahlzeitOut | null> {
  const rows = await sql /* sql */ `
SELECT jsonb_build_object(
  'id', m.id,
  'tageszeit', m.tageszeit,
  'createdAt', m."createdAt",
  'updatedAt', m."updatedAt",
  'mengeProGericht', COALESCE(mpg_nested.mpg_arr, '[]'::jsonb),
  'mengeProLebensmittel', COALESCE(mpl_nested.mpl_arr, '[]'::jsonb)
) AS "Mahlzeit"
FROM public.mahlzeit m
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
           jsonb_build_object(
             'id', mpg.id,
             'menge', mpg.menge,
             'gericht',
               jsonb_build_object(
                 'id', g.id,
                 'name', g.name,
                 'tageszeit', g.tageszeit,
                 'createdAt', g."createdAt",
                 'updatedAt', g."updatedAt",
                 -- gericht.lebensmittelProGericht[]
                 'lebensmittelProGericht', COALESCE((
                   SELECT jsonb_agg(
                            jsonb_build_object(
                              'id', lpg.id,
                              'menge', lpg.menge,
                              'lebensmittel',
                                jsonb_build_object(
                                  'id', l1.id,
                                  'name', l1.name,
                                  'kcal', l1.kcal, 'kh', l1.kh, 'zucker', l1.zucker,
                                  'fett', l1.fett, 'eiweiss', l1.eiweiss,
                                  'zustand', l1.zustand, 'anbau', l1.anbau,
                                  'empfehlung', l1.empfehlung, 'notiz', l1.notiz,
                                  'createdAt', l1."createdAt", 'updatedAt', l1."updatedAt"
                                )
                            )
                            ORDER BY lpg.id
                          )
                   FROM public."lebensmittelProGericht" lpg
                   JOIN public.lebensmittel l1 ON l1.id = lpg."lebensmittelId"
                   WHERE lpg."gerichtId" = g.id
                 ), '[]'::jsonb)
               )
           )
           ORDER BY mpg.id
         ) AS mpg_arr
  FROM public."mengeProGericht" mpg
  JOIN public.gericht g ON g.id = mpg."gerichtId"
  WHERE mpg."mahlzeitId" = m.id
) AS mpg_nested ON TRUE

LEFT JOIN LATERAL (
  SELECT jsonb_agg(
           jsonb_build_object(
             'id', mpl.id,
             'menge', mpl.menge,
             'lebensmittel',
               jsonb_build_object(
                 'id', l2.id,
                 'name', l2.name,
                 'kcal', l2.kcal, 'kh', l2.kh, 'zucker', l2.zucker,
                 'fett', l2.fett, 'eiweiss', l2.eiweiss,
                 'zustand', l2.zustand, 'anbau', l2.anbau,
                 'empfehlung', l2.empfehlung, 'notiz', l2.notiz,
                 'createdAt', l2."createdAt", 'updatedAt', l2."updatedAt"
               )
           )
           ORDER BY mpl.id
         ) AS mpl_arr
  FROM public."mengeProLebensmittel" mpl
  JOIN public.lebensmittel l2 ON l2.id = mpl."lebensmittelId"
  WHERE mpl."mahlzeitId" = m.id
) AS mpl_nested ON TRUE

-- >> Eine (konkrete) Mahlzeit auswählen:
WHERE m.id = ${id};
`;
  const parsed = MahlzeitOutSchema.safeParse(rows[0].Mahlzeit);

  if (!parsed.success) {
    throw new Error(`Zod parse failed for gericht ${id}`);
  }

  return parsed.data;
}

// export async function updateMahlzeit(
//   id: string,
//   patch: UpdateMahlzeit,
// ): Promise<void> {
//   const ref = doc(mahlzeit, id);
//   await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
// }

export async function listMahlzeit(): Promise<MahlzeitOutSummed[]> {
  const data = await sql`SELECT * FROM public.v_mahlzeit_kcal;`;
  const parsed = MahlzeitOutSummedArraySchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Zod parse failed for lebensmittel rows");
  }

  return parsed.data;
}

// export async function listMahlzeitExpanded(): Promise<MahlzeitOut[]> {
//   const q = query(mahlzeit, orderBy("createdAt", "asc"));
//   const snap = await getDocs(q);
//   const meals = snap.docs.map((d) => d.data());

//   const allIds = meals.flatMap((m) => m.mengeProGericht?.map((x) => x.gerichtId) ?? []);
//   const gerichteMap = await getGerichteByIds(allIds);

//   const expanded = meals.map((m) => ({
//     ...m,
//     mengeProGericht: m.mengeProGericht.map((link) => ({
//       ...link,
//       gericht: gerichteMap.get(link.gerichtId) ?? null,
//     })),
//   }));

//   return expanded.map((m) => MahlzeitOutSchema.parse(m));
// }

// export async function getMahlzeitExpanded(id: string): Promise<MahlzeitOut | null> {
//   const m = await getMahlzeit(id);
//   if (!m) return null;

//   const ids = m.mengeProGericht.map((x) => x.gerichtId);
//   const gerichteMap = await getGerichteByIds(ids);

//   const expanded = {
//     ...m,
//     mengeProGericht: m.mengeProGericht.map((link) => ({
//       ...link,
//       gericht: gerichteMap.get(link.gerichtId) ?? null,
//     })),
//   };

//   return MahlzeitOutSchema.parse(expanded);
// }
