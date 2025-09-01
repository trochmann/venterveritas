import { z } from "zod";
import { LebensmittelProMahlzeitArraySchema } from "./lebensmittelProMahlzeit";

export const Tageszeit = ["Morgen", "Vormittag", "Mittag", "Nachmittag", "früher Abend", "Abend", "Nacht"] as const;

export type Tageszeit = (typeof Tageszeit)[number];

export const MahlzeitSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  tageszeit: z.enum(Tageszeit),
  lebensmittelProMahlzeit: z.array(LebensmittelProMahlzeitArraySchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Mahlzeit = z.infer<typeof MahlzeitSchema>;

export const NewMahlzeitSchema = MahlzeitSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type NewMahlzeit = z.infer<typeof NewMahlzeitSchema>;

export type UpdateMahlzeit = Partial<Pick<Mahlzeit, "name" | "createdAt" | "updatedAt">>;