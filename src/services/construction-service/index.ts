import { CreateConstructionParams } from "@/schemas";
import constructionRepository from "@/repositories/construction-repository";
import { conflictError, notFoundError, unauthorizedError } from "@/errors";
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

    return construction;
}

async function getConstructions(userId: number) {
    const constructions = await constructionRepository.findByUserId(userId);

    return constructions;
}

async function getConstructionById(userId: number, constructionId: number) {
    const construction = await constructionRepository.findById(constructionId);

    if (!construction) throw notFoundError("obra");

    const userConstruction = await constructionRepository.findByIdAndUserId(
        userId,
        constructionId
    );

    if (!userConstruction)
        throw unauthorizedError("O usuário logado não tem acesso a essa obra!");

    return userConstruction;
}

const constructionService = {
    postConstruction,
    getConstructions,
    getConstructionById,
};

export default constructionService;
