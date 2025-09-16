import { z } from "zod";
import { LebensmittelSchema } from "./lebensmittel";

export const LebensmittelProGerichtSchema = z.object({
  id: z.string(),
  lebensmittelId: z.string(),
  menge: z.number().default(0),
});

export type LebensmittelProGericht = z.infer<typeof LebensmittelProGerichtSchema>;

export const LebensmittelProGerichtArraySchema = z.array(LebensmittelProGerichtSchema).default([]);

export const LebensmittelProGerichtOutSchema = LebensmittelProGerichtSchema
  .omit({ lebensmittelId: true })
  .extend({
    lebensmittel: z.lazy(() => LebensmittelSchema).optional().nullable(),
  });

export type LebensmittelProGerichtOut = z.infer<typeof LebensmittelProGerichtOutSchema>;