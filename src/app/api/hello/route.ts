import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  const docRef = adminDb.collection("hello").doc("world");
  const snap = await docRef.get();
  const data = snap.exists ? snap.data() : { message: "Hallo aus Firebase Admin!" };
  return NextResponse.json({ ok: true, data });
}