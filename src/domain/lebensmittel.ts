import { z } from "zod";

export const LebensmittelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  kcal: z.coerce.number().default(0),
  kh: z.coerce.number().default(0),
  zucker: z.coerce.number().default(0),
  fett: z.coerce.number().default(0),
  eiweiss: z.coerce.number().default(0),
  zustand: z.string().nullable().default(""),
  anbau: z.string().nullable().default(""),
  empfehlung: z.string().nullable().default(""),
  notiz: z.string().nullable().default(""),
  createdAt: z.coerce.date().nullable().optional(),
  updatedAt: z.coerce.date().nullable().optional(),
});

export type Lebensmittel = z.infer<typeof LebensmittelSchema>;
export const LebensmittelArraySchema = z.array(LebensmittelSchema).default([]);

export const NewLebensmittelSchema = LebensmittelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type NewLebensmittel = z.infer<typeof NewLebensmittelSchema>;

export type UpdateLebensmittel = Partial<
  Pick<Lebensmittel, "name" | "createdAt" | "updatedAt">
>;

