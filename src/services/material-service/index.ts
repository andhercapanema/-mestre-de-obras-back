import { conflictError } from "@/errors";
import materialRepository from "@/repositories/material-repository";

async function checkIfMaterialParamsHasConflits(
    name: string,
    method: "post" | "update",
    materialId = 0
) {
    const dbMaterialByName = await materialRepository.findByName(name);

    if (!dbMaterialByName) return;

    if (
        method === "post" ||
        (method === "update" && materialId !== dbMaterialByName.id)
    )
        throw conflictError("Já existe um material cadastrado com esse nome!");
}

async function postMaterial(name: string) {
    await checkIfMaterialParamsHasConflits(name, "post");

    const material = await materialRepository.create(name);

    return material;
}

async function getMaterials() {
    return await materialRepository.findAll();
}

const materialService = {
    postMaterial,
    getMaterials,
};

export default materialService;
