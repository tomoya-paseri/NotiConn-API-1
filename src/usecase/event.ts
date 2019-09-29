import { IEventRepository } from "../domain/repository/event";
import { Event } from "../domain/event";
import { parseToOutput } from "./output/event";
import { parseToInput } from "./input/event";

abstract class IEventUsecase {
    abstract async getEvents(req: any): Promise<Event[]>
}

export class EventUsecase extends IEventUsecase {
    private repo: IEventRepository
    constructor(repo: IEventRepository){
        super()
        this.repo = repo
    }
    async getEvents(req: any): Promise<Event[]> {
        const inputData: RegExp = parseToInput(req)
        const events = await this.repo.get(inputData)
        return parseToOutput(events)
    }
}
