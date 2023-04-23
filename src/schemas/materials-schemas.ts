import { z } from "zod";

export const createUniqueMaterialSchema = z.object({
    name: z.string(),
    unit: z.string(),
});

export type CreateUniqueMaterialParams = z.infer<
    typeof createUniqueMaterialSchema
>;

export const createMaterialsSchema = z.object({
    newMaterials: z.array(createUniqueMaterialSchema).nonempty(),
});

export type CreateMaterialsParams = z.infer<typeof createMaterialsSchema>;
