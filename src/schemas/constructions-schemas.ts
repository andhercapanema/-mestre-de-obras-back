import { z } from "zod";

export const createConstructionSchema = z.object({
    name: z.string(),
    address: z.string(),
    client: z.string(),
    technicalManager: z.string(),
    initialDate: z.string().datetime(),
    endDate: z.string().datetime(),
});

export type CreateConstructionParams = z.infer<typeof createConstructionSchema>;
