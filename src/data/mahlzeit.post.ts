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
import { Gericht, GerichtArraySchema } from "@/domain/gericht";
import { Timestamp } from "firebase/firestore";
import { WithFieldValue } from "firebase-admin/firestore";
import {
  Mahlzeit,
  MahlzeitSchema,
  NewMahlzeit,
  UpdateMahlzeit,
} from "@/domain/mahlzeit";
import { LebensmittelArraySchema } from "@/domain/lebensmittel";

const mahlzeitCol = collection(db, "mahlzeiten");

const MahlzeitConverter: FirestoreDataConverter<Mahlzeit> = {
  toFirestore(mahlzeit: Mahlzeit) {
    return {
      id: mahlzeit.id,
      tageszeit: mahlzeit.tageszeit,
      mengeProGericht: (mahlzeit.mengeProGericht ?? []).map((item: unknown) =>
        GerichtArraySchema.parse(item),
      ),
      mengeProLebensmittel: (mahlzeit.mengeProLebensmittel ?? []).map((item: unknown) =>
        LebensmittelArraySchema.parse(item),
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
      mengeProGericht: (data?.gericht ?? []).map((raw: unknown) =>
        GerichtArraySchema.parse(raw),
      ),
      mengeProLebensmittel: (data?.lebensmittel ?? []).map((raw: unknown) =>
        LebensmittelArraySchema.parse(raw),
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

export async function upsertMahlzeit(
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

export async function getMahlzeit(id: string): Promise<Mahlzeit | null> {
  const ref = doc(mahlzeit, id);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data()! : null;
}

export async function updateMahlzeit(
  id: string,
  patch: UpdateMahlzeit,
): Promise<void> {
  const ref = doc(mahlzeit, id);
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
}
