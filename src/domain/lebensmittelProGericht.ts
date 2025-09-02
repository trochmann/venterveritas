import { z } from "zod";
import { LebensmittelSchema } from "./lebensmittel";

export const LebensmittelProGerichtSchema = z.object({
  id: z.string(),
  lebensmittelId: z.string(),
  // gerichtId: z.string(),
  menge: z.number().default(0),
});

export type LebensmittelProGericht = z.infer<typeof LebensmittelProGerichtSchema>;

export const LebensmittelProGerichtArraySchema = z.array(LebensmittelProGerichtSchema).default([]);

export const ZutatOutSchema = LebensmittelProGerichtSchema.extend({
  lebensmittel: LebensmittelSchema,
});

export type ZutatOut = z.infer<typeof ZutatOutSchema>;