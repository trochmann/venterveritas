import { Lebensmittel, LebensmittelArraySchema } from "@/domain/lebensmittel";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// const lebensmittel = lebensmittelCol.withConverter(LebensmittelConverter);

// export async function createLebensmittel(input: NewLebensmittel): Promise<Lebensmittel> {
//   const now = new Date();
//   const docRef = await addDoc(lebensmittel, {
//     ...input,
//     id: "temp",
//     createdAt: now,
//     updatedAt: now,
//   } as Lebensmittel);
//   const snap = await getDoc(docRef);
//   return snap.data()!;
// }

// export async function upsertPost(id: string, input: NewLebensmittel | UpdateLebensmittel): Promise<void> {
//   const ref = doc(lebensmittel, id);
//   const payload: WithFieldValue<Partial<Lebensmittel>> = {
//     ...input,
//     updatedAt: serverTimestamp(),
//   };
//   await setDoc(ref, payload, { merge: true });
// }

// export async function getPost(id: string): Promise<Lebensmittel | null> {
//   const ref = doc(lebensmittel, id);
//   const snap = await getDoc(ref);
//   return snap.exists() ? snap.data()! : null;
// }

// export async function updatePost(id: string, patch: UpdateLebensmittel): Promise<void> {
//   const ref = doc(lebensmittel, id);
//   await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
// }

export async function listLebensmittel(): Promise<Lebensmittel[]> {  
  const data = await sql`SELECT * FROM lebensmittel;`;
  const parsed = LebensmittelArraySchema.safeParse(data);

  if (!parsed.success) {    
    throw new Error("Zod parse failed for lebensmittel rows");
  }

  return parsed.data;
}

export async function deleteLebensmittel(id: string): Promise<void> {  
  await sql`DELETE FROM lebensmittel WHERE id = ${id};`;  
}

// \copy "lebensmittel"("name","kcal","kh","zucker","fett","eiweiss","zustand")
// FROM 'd:/werte.csv'
// WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8');
// psql "postgresql://neondb_owner:npg_SQAq8sdlG9ZN@ep-falling-dawn-a22ze2mj-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
