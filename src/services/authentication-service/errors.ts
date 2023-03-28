import { ApplicationError } from "@/errors/protocols";

export function invalidCredentialsError(): ApplicationError {
    return {
        name: "InvalidCredentialsError",
        message: "E-mail ou senha estão incorretas!",
    };
}
