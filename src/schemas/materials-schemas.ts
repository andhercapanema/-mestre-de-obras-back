import { z } from "zod";

export const createMaterialSchema = z.object({
    name: z.string(),
});

export type CreateMaterialParams = z.infer<typeof createMaterialSchema>;
