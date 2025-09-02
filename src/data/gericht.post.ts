import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  FirestoreDataConverter,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  Gericht,
  GerichtSchema,
  NewGericht,
  UpdateGericht,
} from "@/domain/gericht";
import { Timestamp } from "firebase/firestore";
import { WithFieldValue } from "firebase-admin/firestore";
import { LebensmittelProGerichtArraySchema } from "@/domain/lebensmittelProGericht";

const gerichtCol = collection(db, "gerichte");

export const GerichtConverter: FirestoreDataConverter<Gericht> = {
  toFirestore(gericht: Gericht) {
    return {
      id: gericht.id,
      name: gericht.name,
      tageszeit: gericht.tageszeit,
      lebensmittelProGericht: (gericht.lebensmittelProGericht ?? []).map(
        (item) => LebensmittelProGerichtArraySchema.parse(item),
      ),
      createdAt: Timestamp.fromDate(gericht.createdAt),
      updatedAt: Timestamp.fromDate(gericht.updatedAt),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    const obj = {
      id: snapshot.id,
      name: data.name ?? "",
      tageszeit: data.tageszeit ?? "k.A.",
      lebensmittelProGericht: (data?.lebensmittelProGericht ?? []).map(
        (raw: unknown) => LebensmittelProGerichtArraySchema.parse(raw),
      ),
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(0),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(0),
    };
    return GerichtSchema.parse(obj);
  },
};

const gericht = gerichtCol.withConverter(GerichtConverter);

export async function createGericht(input: NewGericht): Promise<Gericht> {
  const now = new Date();
  const docRef = await addDoc(gericht, {
    ...input,
    id: "temp",
    createdAt: now,
    updatedAt: now,
  } as Gericht);
  const snap = await getDoc(docRef);
  return snap.data()!;
}

export async function upsertGericht(
  id: string,
  input: NewGericht | UpdateGericht,
): Promise<void> {
  const ref = doc(gericht, id);
  const payload: WithFieldValue<Partial<Gericht>> = {
    ...input,
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
}

export async function getGericht(id: string): Promise<Gericht | null> {
  const ref = doc(gericht, id);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data()! : null;
}

export async function updateGericht(
  id: string,
  patch: UpdateGericht,
): Promise<void> {
  const ref = doc(gericht, id);
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
}
