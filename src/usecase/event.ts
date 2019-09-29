import { IEventRepository } from "../domain/repository/event";
import { Event } from "../domain/event";
import { parseToOutput } from "./output/event";

abstract class IEventUsecase {
    abstract async getAllEvents(): Promise<Event[]>
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
}
