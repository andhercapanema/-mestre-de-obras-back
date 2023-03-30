import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

function getPath(nodeEnv: string | undefined) {
    if (nodeEnv === "test") return ".env.test";
    if (nodeEnv === "development") return ".env.development";
    return ".env";
}

export function loadEnv() {
    let path = getPath(process.env.NODE_ENV);
    const currentEnvs = dotenv.config({ path });
    dotenvExpand.expand(currentEnvs);
}
