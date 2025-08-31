import { z } from "zod";

export const LebensmittelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  kcal: z.number().default(0),
  kh: z.number().default(0),
  zucker: z.number().default(0),
  fett: z.number().default(0),
  eiweiss: z.number().default(0),
  zustand: z.string(),
  anbau: z.string(),
  empfehlung: z.string(),
  notiz: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Lebensmittel = z.infer<typeof LebensmittelSchema>;

export const NewLebensmittelSchema = LebensmittelSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type NewLebensmittel = z.infer<typeof NewLebensmittelSchema>;

export type UpdateLebensmittel = Partial<Pick<Lebensmittel, "name" | "createdAt" | "updatedAt">>;