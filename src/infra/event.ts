import { IEventRepository } from "../domain/repository/event";
import * as aws from 'aws-sdk';

const paramsToGet = {
    Bucket: 'noticonn',
    Key: 'sample.json'
};

function ignoreUnexpectedCharacters(str: string): string {
    str = str.replace(/\\n/g, "\\n")
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f")
    .replace(/[\u0000-\u0019]+/g,"")
    return str
}

export class EventRepository extends IEventRepository{
    private s3: aws.S3;
    constructor(s3: aws.S3) {
        super()
        this.s3 = s3;
    }
    async get(req: RegExp): Promise<string> {
        const data = await this.s3.getObject(paramsToGet).promise()
        const formattedData = ignoreUnexpectedCharacters(data.Body.toString())
        const events = JSON.parse(formattedData).events
        const filteredEvents = events.filter(event => event.description.match( req ) != null );
        return JSON.stringify(filteredEvents)
    }
}
