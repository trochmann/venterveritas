import { z } from "zod";

export const LebensmittelProGerichtSchema = z.object({
  id: z.string(),
  lebensmittelId: z.string(),
  // gerichtId: z.string(),
  menge: z.number().default(0),
});

export type LebensmittelProGericht = z.infer<typeof LebensmittelProGerichtSchema>;

export const LebensmittelProGerichtArraySchema = z.array(LebensmittelProGerichtSchema).default([]);
