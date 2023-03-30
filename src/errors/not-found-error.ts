import { ApplicationError } from "./protocols";

export function notFoundError(element: string): ApplicationError {
    return {
        name: "NotFoundError",
        message: `Nenhum(a) ${element} correspondente foi encontrado!`,
    };
}
