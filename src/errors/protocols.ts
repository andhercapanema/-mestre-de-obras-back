export type ApplicationError = {
    name: string;
    message: string;
};

export function isApplicationError(err: unknown): err is ApplicationError {
    return (
        typeof (err as ApplicationError).name === "string" &&
        typeof (err as ApplicationError).message === "string"
    );
}
