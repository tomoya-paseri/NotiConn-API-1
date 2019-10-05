import { IEventRepository } from "../domain/repository/event";
import { get } from 'request-promise';
import * as aws from 'aws-sdk';
import { resolve, reject } from "bluebird";

const paramsToGet = {
    Bucket: 'noticonn',
    Key: 'sample.json'
};

const paramsToPut = {
    Bucket: 'noticonn',
    Key: 'sample.json',
    Body: '',
};

const paramsToPutSinceId = {
    Bucket: 'noticonn',
    Key: 'sampleSinceId.json',
    Body: '',
};

const paramsToGetSinceId = {
    Bucket: 'noticonn',
    Key: 'sampleSinceId.json',
};

const paramsToPutErrorLog = {
    Bucket: 'noticonn',
    Key: 'sampleErrorLog.txt',
    Body: '',
};

const paramsToGetErrorLog = {
    Bucket: 'noticonn',
    Key: 'sampleErrorLog.txt',
};

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

    async save() {
        await this.getConnpassEvent().then(async events => {
            const sinceIdData = await this.s3.getObject(paramsToGetSinceId).promise();
            const sinceIdArray = JSON.parse(sinceIdData.Body.toString());
            let sinceId = sinceIdArray.sinceId;
            let updateSinceId = sinceIdArray.sinceId;
            const updateEvents = [];
            for (const i in events) {
                if (events[i]['event_id'] > sinceId) {
                    const description: string = events[i]['description'];
                    events[i]['description'] = description.replace(/(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g, "");
                    updateEvents.push(events[i]);
                    if (events[i]['event_id'] > updateSinceId) updateSinceId = events[i]['event_id'];
                }
            }
            const nowDataJSON = await this.getAll();
            const nowData = JSON.parse(this.ignoreUnexpectedCharacters(nowDataJSON));
            const updateData = {};
            updateData['events'] = updateEvents.concat(nowData.events);
            paramsToPut['Body'] = JSON.stringify(updateData);
            await this.s3.putObject(paramsToPut, async (err, data) => {
                if (err) {
                    await this.errorLog("data: " + data.toString() + "error: " + err.toString());
                } else {
                    const date = new Date();
                    const updateAt = date.toLocaleDateString();
                    const putData = {
                        sinceId: updateSinceId,
                        updateAt: updateAt,
                    }
                    paramsToPutSinceId['Body'] = JSON.stringify(putData);
                    await this.s3.putObject(paramsToPutSinceId).promise();
                    console.log("Successfully uploaded data : " + date.toLocaleDateString());
                }
            });
        }).catch(err => {
            console.log(err);
        });
    }

    async getConnpassEvent(): Promise<any>{
        const baseUrl: string = "https://connpass.com/api/v1/event"
        const options = {
            uri: baseUrl,
            method: "GET",
            qs: {
                count: 100,
                order: 3
            },
            headers: {
                "User-Agent": "Request-Promise"
            },
            json: true
        };
        return get(options)
            .then(body => {
                return resolve(body["events"]);
            })
            .catch(async e => {
                await this.errorLog(e.toString());
                return reject(e);
            })
    }

    async errorLog(err: string) {
        const data = await this.s3.getObject(paramsToGetErrorLog).promise()
        paramsToPutErrorLog['Body'] = data.Body.toString() + err + "\n"
        await this.s3.putObject(paramsToPutErrorLog).promise();
    }

    ignoreUnexpectedCharacters(str: string): string {
        str = str.replace(/\\n/g, "\\n")
            .replace(/\\'/g, "\\'")
            .replace(/\\"/g, '\\"')
            .replace(/\\&/g, "\\&")
            .replace(/\\r/g, "\\r")
            .replace(/\\t/g, "\\t")
            .replace(/\\b/g, "\\b")
            .replace(/\\f/g, "\\f")
            .replace(/[\u0000-\u0019]+/g, "")
        return str
    }
}
