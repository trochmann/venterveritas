import { z } from "zod";
import { LebensmittelProGerichtArraySchema } from "./lebensmittelProGericht";

export const Tageszeit = ["Morgen", "Vormittag", "Mittag", "Nachmittag", "früher Abend", "Abend", "Nacht", "k.A."] as const;

export type Tageszeit = (typeof Tageszeit)[number];

export const GerichtSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  tageszeit: z.enum(Tageszeit),
  lebensmittelProGericht: z.array(LebensmittelProGerichtArraySchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Gericht = z.infer<typeof GerichtSchema>;

export const NewGerichtSchema = GerichtSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type NewGericht = z.infer<typeof NewGerichtSchema>;

export type UpdateGericht = Partial<Pick<Gericht, "name" | "createdAt" | "updatedAt">>;