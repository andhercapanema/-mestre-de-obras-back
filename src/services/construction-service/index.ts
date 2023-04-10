import { CreateConstructionParams } from "@/schemas";
import constructionRepository from "@/repositories/construction-repository";
import { conflictError } from "@/errors";
import userConstructionRepository from "@/repositories/user-construction-repository";

async function postConstruction(
    createConstructionParams: CreateConstructionParams,
    userId: number
) {
    const dbConstruction = await constructionRepository.findByName(
        createConstructionParams.name
    );

    if (dbConstruction)
        throw conflictError("Já existe uma obra cadastrada com esse nome!");

    const construction = await constructionRepository.create(
        createConstructionParams
    );

    await userConstructionRepository.create(userId, construction.id);

    return {
        constructionId: construction.id,
    };
}

async function getConstructions(userId: number) {
    const constructions = await constructionRepository.findByUserId(userId);

    return constructions;
}

const constructionService = {
    postConstruction,
    getConstructions,
};

export default constructionService;
