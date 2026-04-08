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

// Policy Guidance Tier: 1–4
const optionalPolicyTier = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().min(1).max(4).nullable().optional()
);

// Strategy Classification: 1–6
const optionalStrategyType = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().min(1).max(6).nullable().optional()
);

export const policyRecordSchema = z.object({
  country: z.string().min(1, "Country is required").max(3, "Must be an ISO3 country code"),
  nameEng: z.string().min(1, "English name is required").max(1000, "Name too long"),
  nameOrig: z.string().max(1000, "Name too long").nullable().optional(),
  year: optionalYear,
  source: z.string().max(500, "Source too long").nullable().optional(),
  yearRevised: optionalYear,
  overview: z.string().max(50000, "Overview too long").nullable().optional(),
  policyGuidanceTier: optionalPolicyTier,
  strategyTier: optionalStrategyType,
  comment: z.string().max(10000, "Comment too long").nullable().optional(),
  link: z
    .string()
    .max(2000, "URL too long")
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
