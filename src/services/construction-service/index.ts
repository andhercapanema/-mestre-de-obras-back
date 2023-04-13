import { CreateConstructionParams } from "@/schemas";
import constructionRepository from "@/repositories/construction-repository";
import { conflictError, notFoundError, unauthorizedError } from "@/errors";
import userConstructionRepository from "@/repositories/user-construction-repository";

async function checkIfConstructionParamsHasConflits(
    createConstructionParams: CreateConstructionParams,
    method: "post" | "update",
    constructionId = 0
) {
    const dbConstructionByName = await constructionRepository.findByName(
        createConstructionParams.name
    );

    if (!dbConstructionByName) return;

    if (
        method === "post" ||
        (method === "update" && constructionId !== dbConstructionByName.id)
    )
        throw conflictError("Já existe uma obra cadastrada com esse nome!");
}

async function postConstruction(
    createConstructionParams: CreateConstructionParams,
    userId: number
) {
    await checkIfConstructionParamsHasConflits(
        createConstructionParams,
        "post"
    );

    const construction = await constructionRepository.create(
        createConstructionParams
    );

    await userConstructionRepository.create(userId, construction.id);

    return construction;
}

async function getConstructions(userId: number) {
    return await constructionRepository.findByUserId(userId);
}

async function checkConstructionOnDb(constructionId: number) {
    const dbConstruction = await constructionRepository.findById(
        constructionId
    );

    if (!dbConstruction) throw notFoundError("obra");
}

async function getConstructionIfUserHasAccess(
    userId: number,
    constructionId: number
) {
    const construction = await constructionRepository.findByIdAndUserId(
        userId,
        constructionId
    );

    if (!construction)
        throw unauthorizedError("O usuário logado não tem acesso a essa obra!");

    return construction;
}

async function getConstructionById(userId: number, constructionId: number) {
    await checkConstructionOnDb(constructionId);

    const construction = await getConstructionIfUserHasAccess(
        userId,
        constructionId
    );

    return construction;
}

async function updateConstruction(
    createConstructionParams: CreateConstructionParams,
    userId: number,
    constructionId: number
) {
    await checkIfConstructionParamsHasConflits(
        createConstructionParams,
        "update"
    );

    await checkConstructionOnDb(constructionId);

    await getConstructionIfUserHasAccess(userId, constructionId);

    const construction = await constructionRepository.update(
        constructionId,
        createConstructionParams
    );

    return construction;
}

async function deleteConstruction(userId: number, constructionId: number) {
    await checkConstructionOnDb(constructionId);

    await getConstructionIfUserHasAccess(userId, constructionId);

    await userConstructionRepository.deleteByConstructionId(constructionId);
    await constructionRepository.deleteById(constructionId);
}

const constructionService = {
    postConstruction,
    getConstructions,
    getConstructionById,
    updateConstruction,
    deleteConstruction,
};

export default constructionService;
