export type ApplicationError = {
    name: string;
    message: string;
};

export function isApplicationError(err: Error): err is ApplicationError {
    return typeof err.name === "string" && typeof err.message === "string";
}
