import { ApplicationError } from "./protocols";

export function enviromentVariableError(envVar: string): ApplicationError {
    return {
        name: "EnviromentVariableError",
        message: `Variável de ambiente ${envVar} não definida!`,
    };
}
