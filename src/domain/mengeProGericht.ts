// src/domain/mengeProGericht.ts
import { z } from "zod";
import { GerichtOutSchema } from "./gericht";

export const MengeProGerichtSchema = z.object({
  id: z.string(),
  gerichtId: z.string(),
  menge: z.coerce.number().default(0),
});

export type MengeProGericht = z.infer<typeof MengeProGerichtSchema>;

export const MengeProGerichtArraySchema = z.array(MengeProGerichtSchema).default([]);

export const MengeProGerichtOutSchema = MengeProGerichtSchema.omit({
  gerichtId: true,
}).extend({
  gericht: GerichtOutSchema,
});

export type MengeProGerichtOut = z.infer<typeof MengeProGerichtOutSchema>;