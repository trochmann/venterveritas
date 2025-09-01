import { z } from "zod";

export const LebensmittelProMahlzeitSchema = z.object({
  id: z.string(),
  lebensmittelId: z.string(),
  mahlzeitId: z.string(),
  menge: z.number().default(0),
});

export type LebensmittelProMahlzeit = z.infer<typeof LebensmittelProMahlzeitSchema>;

export const LebensmittelProMahlzeitArraySchema = z.array(LebensmittelProMahlzeitSchema).default([]);
