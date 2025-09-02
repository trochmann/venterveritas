import { z } from "zod";
import { LebensmittelSchema } from "./lebensmittel";

export const MengeProLebensmittelSchema = z.object({
  id: z.string(),
  lebensmittelId: z.string(),  
  menge: z.number().default(0),
});

export type MengeProLebensmittel = z.infer<typeof MengeProLebensmittelSchema>;

export const MengeProLebensmittelArraySchema = z
  .array(MengeProLebensmittelSchema)
  .default([]);

export const MengeProLebensmittelOutSchema = MengeProLebensmittelSchema.extend({
  lebensmittel: LebensmittelSchema,
});

export type MengeProLebensmittelOut = z.infer<typeof MengeProLebensmittelOutSchema>;
