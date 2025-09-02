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
import { Gericht, GerichtSchema } from "@/domain/gericht";
import { Timestamp } from "firebase/firestore";
import { WithFieldValue } from "firebase-admin/firestore";
import { LebensmittelProGerichtArraySchema } from "@/domain/lebensmittelProGericht";
import {
  Mahlzeit,
  MahlzeitSchema,
  NewMahlzeit,
  UpdateMahlzeit,
} from "@/domain/mahlzeit";

const mahlzeitCol = collection(db, "gerichte");

const MahlzeitConverter: FirestoreDataConverter<Mahlzeit> = {
  toFirestore(mahlzeit: Mahlzeit) {
    return {
      id: mahlzeit.id,
      tageszeit: mahlzeit.tageszeit,
      gericht: (mahlzeit.gericht ?? []).map((item: unknown) =>
        GerichtSchema.parse(item),
      ),
      lebensmittelProGericht: (mahlzeit.lebensmittel ?? []).map((item: unknown) =>
        LebensmittelProGerichtArraySchema.parse(item),
      ),
      createdAt: Timestamp.fromDate(mahlzeit.createdAt),
      updatedAt: Timestamp.fromDate(mahlzeit.updatedAt),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    const obj = {
      id: snapshot.id,
      tageszeit: data.tageszeit ?? "k.A.",
      gericht: (data?.gericht ?? []).map((raw: unknown) =>
        GerichtSchema.parse(raw),
      ),
      lebensmittelProGericht: (data?.lebensmittel ?? []).map((raw: unknown) =>
        LebensmittelProGerichtArraySchema.parse(raw),
      ),
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(0),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(0),
    };
    return MahlzeitSchema.parse(obj);
  },
};

const mahlzeit = mahlzeitCol.withConverter(MahlzeitConverter);

export async function createMahlzeit(input: NewMahlzeit): Promise<Mahlzeit> {
  const now = new Date();
  const docRef = await addDoc(mahlzeit, {
    ...input,
    id: "temp",
    createdAt: now,
    updatedAt: now,
  } as Mahlzeit);
  const snap = await getDoc(docRef);
  return snap.data()!;
}

export async function upsertPost(
  id: string,
  input: NewMahlzeit | UpdateMahlzeit,
): Promise<void> {
  const ref = doc(mahlzeit, id);
  const payload: WithFieldValue<Partial<Gericht>> = {
    ...input,
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
}

export async function getPost(id: string): Promise<Mahlzeit | null> {
  const ref = doc(mahlzeit, id);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data()! : null;
}

export async function updatePost(
  id: string,
  patch: UpdateMahlzeit,
): Promise<void> {
  const ref = doc(mahlzeit, id);
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
}
