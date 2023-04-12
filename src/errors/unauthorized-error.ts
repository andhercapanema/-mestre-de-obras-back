import { ApplicationError } from "./protocols";

export function unauthorizedError(
    message: string = "Você deve estar logado para continuar!"
): ApplicationError {
    return {
        name: "UnauthorizedError",
        message: message,
    };
}
