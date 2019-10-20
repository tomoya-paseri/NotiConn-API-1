import { getEventsReq } from "../event";

export abstract class IEventRepository {
    abstract async get(req: getEventsReq): Promise<string>
    abstract async save()
}
