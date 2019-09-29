export abstract class IEventRepository {
    abstract async getAll(): Promise<string>
}
