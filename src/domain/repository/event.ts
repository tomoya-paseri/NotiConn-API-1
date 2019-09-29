export abstract class IEventRepository {
    abstract async get(req: RegExp): Promise<string>
}
