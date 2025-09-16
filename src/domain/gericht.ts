import { z } from "zod";
import { LebensmittelProGerichtOutSchema, LebensmittelProGerichtSchema } from "./lebensmittelProGericht";

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

export const GerichtSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  tageszeit: z.enum(Tageszeit),
  lebensmittelProGericht: z.array(LebensmittelProGerichtSchema).default([]),
  createdAt: z.coerce.date().optional().nullable(),
  updatedAt: z.coerce.date().optional().nullable(),
});

export const GerichtOutSchema = GerichtSchema.extend({
  lebensmittelProGericht: z.array(LebensmittelProGerichtOutSchema).default([]),
});

export type GerichtOut = z.infer<typeof GerichtOutSchema>;

export type Gericht = z.infer<typeof GerichtSchema>;
export const GerichtArraySchema = z.array(GerichtSchema).default([]);
export const NewGerichtSchema = GerichtSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type NewGericht = z.infer<typeof NewGerichtSchema>;

export type UpdateGericht = Partial<
  Pick<Gericht, "name" | "createdAt" | "updatedAt">
>;
