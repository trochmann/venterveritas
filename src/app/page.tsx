import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase/client";
import { collection, addDoc } from "firebase/firestore";

export default function Home() {
  async function addHello() {
    await addDoc(collection(db, "hello"), { createdAt: Date.now() });
    alert("Doc geschrieben");
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Next.js + Firebase + shadcn/ui</h1>
      {/* <Button onClick={addHello}>Dokument anlegen</Button> */}
    </main>
  );
}