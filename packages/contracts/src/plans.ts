import { z } from "zod";

export const planImportSchema = z.object({
  text: z.string().trim().min(1),
});

export type PlanImportInput = z.infer<typeof planImportSchema>;
