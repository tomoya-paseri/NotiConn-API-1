import { IEventRepository } from "../domain/repository/event";
import { Event, getEventsReq } from "../domain/event";
import { parseToOutput } from "./output/event";
import { parseToInput } from "./input/event";

abstract class IEventUsecase {
    abstract async getEvents(req: any): Promise<Event[]>
    abstract async saveEvents()
}

export class EventUsecase extends IEventUsecase {
    private repo: IEventRepository
    constructor(repo: IEventRepository){
        super()
        this.repo = repo
    }
    async getEvents(req: any): Promise<Event[]> {
        const inputData: getEventsReq = parseToInput(req)
        const events = await this.repo.get(inputData)
        return parseToOutput(events)
    }
    async saveEvents() {
        await this.repo.save()
    }
}
