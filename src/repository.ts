import { ReturnType } from "./domain";

export function NewRepository(): ReturnType {
    const newReturnType: ReturnType = {
        statusCode: 200,
        body: ""
    };
    return newReturnType
}
