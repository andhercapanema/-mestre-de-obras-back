import { CreateConstructionParams } from "@/schemas";
import constructionRepository from "@/repositories/construction-repository";
import { exclude } from "@/utils/prisma-utils";
import { conflictError } from "@/errors";

async function postConstruction(
    createConstructionParams: CreateConstructionParams
) {
    const dbConstruction = await constructionRepository.findByName(
        createConstructionParams.name
    );

    if (dbConstruction)
        throw conflictError("Já existe uma obra cadastrada com esse nome!");

    const construction = await constructionRepository.create(
        createConstructionParams
    );

    return {
        constructionId: construction.id,
    };
}

const constructionService = {
    postConstruction,
};

export default constructionService;
