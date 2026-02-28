import { z } from "zod";

// Preprocessors handle empty string / undefined → null so HTML inputs work cleanly
const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().nullable().optional()
);

const optionalYear = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().min(1900).max(2100).nullable().optional()
);

const optionalTier = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().min(1).max(4).nullable().optional()
);

export const policyRecordSchema = z.object({
  country: z.string().min(1, "Country is required"),
  nameEng: z.string().min(1, "English name is required"),
  nameOrig: z.string().nullable().optional(),
  year: optionalYear,
  source: z.string().nullable().optional(),
  yearRevised: optionalYear,
  overview: z.string().nullable().optional(),
  policyGuidanceTier: optionalTier,
  strategyTier: optionalTier,
  comment: z.string().nullable().optional(),
  link: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) => !v || v === "" || /^https?:\/\//.test(v),
      "Must be a valid URL starting with http:// or https://"
    ),
  pages: optionalInt,
  tokens: optionalInt,
});

export const policyRecordUpdateSchema = policyRecordSchema.partial();

export type PolicyRecordInput = z.infer<typeof policyRecordSchema>;
export type PolicyRecordUpdateInput = z.infer<typeof policyRecordUpdateSchema>;
