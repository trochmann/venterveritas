// src/domain/mahlzeit.ts
import { z } from "zod";
import { MengeProGerichtOutSchema, MengeProGerichtSchema } from "./mengeProGericht";
import { MengeProLebensmittelOutSchema, MengeProLebensmittelSchema } from "./mengeProLebensmittel";

export const TAGESZEIT = [
  "Morgen",
  "Vormittag",
  "Mittag",
  "Nachmittag",
  "früher Abend",
  "Abend",
  "Nacht",
  "k.A.",
] as const;

const TageszeitEnum = z.enum(TAGESZEIT);

const sanitizeString = (v: unknown) =>
  typeof v === "string"
    ? v
        .normalize("NFC")
        .replace(/\u00A0/g, " ")
        .trim()
    : v;

const tageszeitSchema = z.preprocess(sanitizeString, TageszeitEnum.nullable().optional());

export const MahlzeitSchema = z.object({
  id: z.string().optional(),
  tageszeit: tageszeitSchema,
  mengeProGericht: z.array(MengeProGerichtSchema).default([]),
  mengeProLebensmittel: z.array(MengeProLebensmittelSchema).default([]),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type Mahlzeit = z.infer<typeof MahlzeitSchema>;
export type MahlzeitOutSummed = z.infer<typeof MahlzeitOutSummedSchema>;

export const NewMahlzeitSchema = MahlzeitSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type NewMahlzeit = z.infer<typeof NewMahlzeitSchema>;

export type UpdateMahlzeit = Partial<Pick<Mahlzeit, "createdAt" | "updatedAt">>;

export const MahlzeitArraySchema = z.array(MahlzeitSchema).default([]);

export const MahlzeitOutSummedSchema = MahlzeitSchema.omit({
  mengeProGericht: true,
  mengeProLebensmittel: true,
}).extend({
  kcalAusGerichten: z.coerce.number().optional(),
  kcalAusLebensmitteln: z.coerce.number().optional(),
  kcalTotal: z.coerce.number().optional(),
});

export const MahlzeitOutSummedArraySchema = z.array(MahlzeitOutSummedSchema).default([]);

export const MahlzeitOutSchema = MahlzeitSchema.extend({
  mengeProGericht: z.array(MengeProGerichtOutSchema).optional(),
  mengeProLebensmittel: z.array(MengeProLebensmittelOutSchema).optional(),
});

export type MahlzeitOut = z.infer<typeof MahlzeitOutSchema>;
