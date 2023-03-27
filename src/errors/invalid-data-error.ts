import { ApplicationError } from "./protocols";

export function invalidDataError(details: string[]): InvalidateDataError {
    return {
        name: "InvalidDataError",
        message: "Invalid data",
        details,
    };
}

export type InvalidateDataError = ApplicationError & {
    details: string[];
};
