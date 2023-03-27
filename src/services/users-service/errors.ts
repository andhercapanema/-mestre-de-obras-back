import { ApplicationError } from "@/errors/protocols";

export function duplicatedEmailError(): ApplicationError {
    return {
        name: "DuplicatedEmailError",
        message: "There is already an user with given email",
    };
}
