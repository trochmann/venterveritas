import { z } from "zod";
import { LebensmittelProGerichtSchema } from "./lebensmittelProGericht";
import { GerichtSchema } from "./gericht";

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
  lebensmittel: z.array(LebensmittelProGerichtSchema).default([]),
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

export type UpdateMahlzeit = Partial<
  Pick<Mahlzeit, "createdAt" | "updatedAt">
>;
