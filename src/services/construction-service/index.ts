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
    const dbConstruction = await constructionRepository.findById(
        constructionId
    );

    if (!dbConstruction) throw notFoundError("obra");

    const construction = await constructionRepository.findByIdAndUserId(
        userId,
        constructionId
    );

    if (!construction)
        throw unauthorizedError("O usuário logado não tem acesso a essa obra!");

    return construction;
}

async function updateConstruction(
    createConstructionParams: CreateConstructionParams,
    userId: number,
    constructionId: number
) {
    const dbConstructionByName = await constructionRepository.findByName(
        createConstructionParams.name
    );

    if (dbConstructionByName && constructionId !== dbConstructionByName.id)
        throw conflictError("Já existe uma obra cadastrada com esse nome!");

    const dbConstructionById = await constructionRepository.findById(
        constructionId
    );

    if (!dbConstructionById) throw notFoundError("obra");

    const dbConstructionIsAccessible =
        await constructionRepository.findByIdAndUserId(userId, constructionId);

    if (!dbConstructionIsAccessible)
        throw unauthorizedError("O usuário logado não tem acesso a essa obra!");

    const construction = await constructionRepository.update(
        constructionId,
        createConstructionParams
    );

    return construction;
}

const constructionService = {
    postConstruction,
    getConstructions,
    getConstructionById,
    updateConstruction,
};

export default constructionService;
