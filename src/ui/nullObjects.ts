import type { Lebensmittel } from "@/domain/lebensmittel";

const EPOCH = new Date(0); // klar erkennbar: "nicht gesetzt"

export function makeEmptyLebensmittel(id = ""): Lebensmittel {
  return {
    id,
    name: "",
    kcal: 0,
    kh: 0,
    zucker: 0,
    fett: 0,
    eiweiss: 0,
    zustand: "",
    anbau: "",
    empfehlung: "",
    notiz: "",
    createdAt: EPOCH,
    updatedAt: EPOCH,
  };
}

export const NULL_LEBENSMITTEL: Readonly<Lebensmittel> =
  Object.freeze(makeEmptyLebensmittel());
