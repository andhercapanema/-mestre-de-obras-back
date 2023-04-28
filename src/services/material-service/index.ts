import { prisma } from "@/config";
import { conflictError } from "@/errors";
import materialRepository from "@/repositories/material-repository";
import { CreateMaterialsParams } from "@/schemas";
import { Material } from "@prisma/client";

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
        throw conflictError(
            "Já existe um insumo cadastrado com esse(s) nome(s)!"
        );
}

async function postMaterial({ newMaterials }: CreateMaterialsParams) {
    const hash: {
        [key: string]: boolean;
    } = {};
    for (const material of newMaterials) {
        const materialName = material.name;

        if (hash[materialName]) {
            throw conflictError(
                "Mais de um insumo sendo cadastrado com o mesmo nome! Apenas insumos com nomes únicos são aceitos!"
            );
        } else {
            hash[materialName] = true;
        }

        await checkIfMaterialParamsHasConflits(materialName, "post");
    }

    return await prisma.$transaction(async (prismaInstance) => {
        const createdMaterials: Material[] = [];

        for (const material of newMaterials) {
            const createdMaterial = await materialRepository.create(
                prismaInstance,
                material
            );
            createdMaterials.push(createdMaterial);
        }

        return createdMaterials;
    });
}

async function getMaterials() {
    return await materialRepository.findAll();
}

const materialService = {
    postMaterial,
    getMaterials,
};

export default materialService;
