import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  FirestoreDataConverter,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  Lebensmittel,
  LebensmittelSchema,
  NewLebensmittel,
  UpdateLebensmittel,
} from "@/domain/lebensmittel";
import { Timestamp } from "firebase/firestore";
import { WithFieldValue } from "firebase-admin/firestore";

const lebensmittelCol = collection(db, "lebensmittel");

export const LebensmittelConverter: FirestoreDataConverter<Lebensmittel> = {
  toFirestore(lebensmittel: Lebensmittel) {
    return {
      id: lebensmittel.id,
      name: lebensmittel.name,
      kcal: lebensmittel.kcal,
      kh: lebensmittel.kh,
      zucker: lebensmittel.zucker,
      fett: lebensmittel.fett,
      eiweiss: lebensmittel.eiweiss,
      zustand: lebensmittel.zustand,
      anbau: lebensmittel.anbau,
      empfehlung: lebensmittel.empfehlung,
      notiz: lebensmittel.notiz,
      createdAt: Timestamp.fromDate(lebensmittel.createdAt),
      updatedAt: Timestamp.fromDate(lebensmittel.updatedAt),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    const obj = {
      id: snapshot.id,
      name: data.name ?? "",
      kcal: data.kcal,
      kh: data.kh,
      zucker: data.zucker,
      fett: data.fett,
      eiweiss: data.eiweiss,
      zustand: data.zustand ?? "",
      anbau: data.anbau ?? "",
      empfehlung: data.empfehlung ?? "",
      notiz: data.notiz ?? "",
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(0),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(0),
    };
    return LebensmittelSchema.parse(obj);
  },
};

const lebensmittel = lebensmittelCol.withConverter(LebensmittelConverter);

export async function createLebensmittel(input: NewLebensmittel): Promise<Lebensmittel> {
  const now = new Date();
  const docRef = await addDoc(lebensmittel, {
    ...input,
    id: "temp",
    createdAt: now,
    updatedAt: now,
  } as Lebensmittel);
  const snap = await getDoc(docRef);
  return snap.data()!; 
}

export async function upsertPost(id: string, input: NewLebensmittel | UpdateLebensmittel): Promise<void> {
  const ref = doc(lebensmittel, id);
  const payload: WithFieldValue<Partial<Lebensmittel>> = {
    ...input,
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
}

export async function getPost(id: string): Promise<Lebensmittel | null> {
  const ref = doc(lebensmittel, id);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data()! : null;
}

export async function updatePost(id: string, patch: UpdateLebensmittel): Promise<void> {
  const ref = doc(lebensmittel, id);
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
}

export async function listLebensmittel(): Promise<Lebensmittel[]> {
  const q = query(lebensmittel, orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}