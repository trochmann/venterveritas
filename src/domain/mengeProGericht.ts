import { z } from "zod";
import { GerichtSchema } from "./gericht";

export const MengeProGerichtSchema = z.object({
  id: z.string(),
  gerichtId: z.string(),
  menge: z.number().default(0),
});

export type MengeProGericht = z.infer<typeof MengeProGerichtSchema>;

export const MengeProGerichtArraySchema = z.array(MengeProGerichtSchema).default([]);

export const MengeProGerichtOutSchema = MengeProGerichtSchema.extend({
  gericht: GerichtSchema,
});

export type MengeProGerichtOut = z.infer<typeof MengeProGerichtOutSchema>;