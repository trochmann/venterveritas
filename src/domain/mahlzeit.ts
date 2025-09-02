import { z } from "zod";
import { LebensmittelProGerichtSchema } from "./lebensmittelProGericht";
import { GerichtSchema } from "./gericht";
import { MengeProGerichtSchema } from "./mengeProGericht";
import { MengeProLebensmittelSchema } from "./mengeProLebensmittel";

export const Tageszeit = [
  "Morgen",
  "Vormittag",
  "Mittag",
  "Nachmittag",
  "früher Abend",
  "Abend",
  "Nacht",
  "k.A.",
] as const;

export type Tageszeit = (typeof Tageszeit)[number];

export const MahlzeitSchema = z.object({
  id: z.string(),
  tageszeit: z.enum(Tageszeit),
  gericht: z.array(GerichtSchema).default([]),
  mengeProGericht: z.array(MengeProGerichtSchema).default([]),
  lebensmittel: z.array(LebensmittelProGerichtSchema).default([]),
  mengeProLebensmittel: z.array(MengeProLebensmittelSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Mahlzeit = z.infer<typeof MahlzeitSchema>;

export const NewMahlzeitSchema = MahlzeitSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type NewMahlzeit = z.infer<typeof NewMahlzeitSchema>;

export type UpdateMahlzeit = Partial<Pick<Mahlzeit, "createdAt" | "updatedAt">>;
