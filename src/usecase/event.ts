import { IEventRepository } from "../domain/repository/event";
import { Event } from "../domain/event";
import { parseToOutput } from "./output/event";

abstract class IEventUsecase {
    abstract async getAllEvents(): Promise<Event[]>
    abstract async saveEvents()
}

export class EventUsecase extends IEventUsecase {
    private repo: IEventRepository
    constructor(repo: IEventRepository){
        super()
        this.repo = repo
    }
    async getAllEvents(): Promise<Event[]> {
        const events = await this.repo.getAll()
        return parseToOutput(events)
    }
    async saveEvents() {
        await this.repo.save()
    }
}
