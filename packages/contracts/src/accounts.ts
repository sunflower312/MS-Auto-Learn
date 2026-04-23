import { z } from "zod";

export const accountImportSchema = z.object({
  text: z.string().trim().min(1),
});

export type AccountImportInput = z.infer<typeof accountImportSchema>;
