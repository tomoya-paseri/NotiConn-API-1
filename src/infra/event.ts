import { IEventRepository } from "../domain/repository/event";
import { getEventsReq } from "../domain/event";
import { get, post } from 'request-promise';
import * as aws from 'aws-sdk';
import { resolve, reject } from "bluebird";
import prefecture from "../prefecture.json";

const paramsToGet = {
    Bucket: process.env.BUCKET,
    Key: process.env.EVENT_FILE,
};

const paramsToPut = {
    Bucket: process.env.BUCKET,
    Key: process.env.EVENT_FILE,
    Body: '',
};

const paramsToPutSinceId = {
    Bucket: process.env.BUCKET,
    Key: process.env.SINCE_ID_FILE,
    Body: '',
};

const paramsToGetSinceId = {
    Bucket: process.env.BUCKET,
    Key: process.env.SINCE_ID_FILE,
};

const logType = {
    ERROR: "<!here> [ERROR] ",
    WARN: "[WARN] ",
    INFO: "[INFO] "
};

export class EventRepository extends IEventRepository{
    private s3: aws.S3;
    constructor(s3: aws.S3) {
        super()
        this.s3 = s3;
    }
    async get(req: getEventsReq): Promise<string> {
        const data = await this.s3.getObject(paramsToGet).promise()
        const formattedData = this.ignoreUnexpectedCharacters(data.Body.toString())
        const events = JSON.parse(formattedData).events
        // もしprefがnullだったら東京が指定されるように
        const reqPrefId = req.pref ? String(req.pref) : "0";
        const filteredEvents = await events
            .filter(event => event.description.match( req.topics ) != null && event.pref == reqPrefId);
        if (reqPrefId === "0") {
            filteredEvents.filter(event => event.pref == reqPrefId);
        }
        filteredEvents.forEach((e, i) => {
            const topic = e.description.match(req.topics)[0]
            filteredEvents[i].topic = topic
        });
        return JSON.stringify(filteredEvents)
    }

    async save() {
        await this.getConnpassEvent().then(async events => {
            const sinceIdData = await this.s3.getObject(paramsToGetSinceId).promise();
            const sinceIdArray = JSON.parse(sinceIdData.Body.toString());
            const sinceId = sinceIdArray.sinceId || 0;
            let updateSinceId = sinceId;
            const updateEvents = [];
            for (const i in events) {
                if (events[i]['event_id'] > sinceId) {
                    const description: string = events[i]['description'];
                    events[i]['description'] = description
                        .replace(/(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g, "")
                        .replace(/^ [a - zA - Z0 - 9.!#$ %& '*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g, '');
                    const lon = events[i]["lon"]
                    const lat = events[i]["lat"]

                    if (events[i]['event_id'] > updateSinceId) updateSinceId = events[i]['event_id']

                    if (description.match(/リモート/)) {
                        // リモート開催の場合
                        events[i]["pref"] = 0
                    } else if (!(lon && lat)) {
                        // リモート開催ではなく、かつ地域未設定のとき
                        const text= `\"${events[i]["title"]}\"は緯度経度が設定されていないイベントです`
                        await this.postSlackLog(text, logType.WARN);
                        continue;
                    } else {
                        // それ以外は正常
                        const prefName = await this.getPrefFromLongLat(lon, lat);
                        const prefId = getIdFromPrefName(prefName)
                        events[i]["pref"] = prefId
                    }
                    updateEvents.push(events[i]);
                }
            }
            const updateData = {};
            updateData['events'] = updateEvents;
            paramsToPut['Body'] = JSON.stringify(updateData);
            await this.s3.putObject(paramsToPut).promise();
            const date = new Date();
            const options = {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric"
            }
            const updateAt = date.toLocaleDateString("ja-JP", options);
            if (process.env.ENV == "dev") updateSinceId = 0;
            const putData = {
                sinceId: updateSinceId,
                updateAt: updateAt,
            }
            paramsToPutSinceId['Body'] = JSON.stringify(putData);
            await this.s3.putObject(paramsToPutSinceId).promise();
            await this.postSlack(updateEvents);
        }).catch(err => {
            console.error(err);
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
                await this.postSlackLog(e.toString(), logType.ERROR);
                return reject(e);
            })
    }

    deleteHtmlTagAndCutText = (text: string): string => {
        const replaceText: string = text.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "").replace(/\n/g, "");
        return replaceText.slice(0, 100);
    }

    createSection = (title: string, event_id: number, event_url: string, description: string) => {
        const arrangeDescripttion: string = this.deleteHtmlTagAndCutText(description);
        return {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*${title} (id: ${event_id})*\nurl: ${event_url}\n\`\`\`${arrangeDescripttion}...\`\`\``
            }
        }
    };

    async getPrefFromLongLat(lon: number, lat: number): Promise<any>{
        const apiKey = process.env.MAP_API_KEY
        const baseURL = "https://maps.googleapis.com/maps/api/geocode/json"
        const options = {
            uri: baseURL,
            method: "GET",
            qs: {
                key: apiKey,
                latlng: lat + "," + lon,
                language: "ja"
            },
            json: true
        };
        return get(options)
            .then(body => {
                const prefName = parser_results(body)
                return resolve(prefName)
            })
            .catch(async e => {
                await this.postSlackLog(e.toString(), logType.ERROR);
                return reject(e);
            })
    };

    async postSlack(messages: any[]): Promise<any> {
        if (process.env.ENV == "dev") return;
        if (messages.length < 1) {
            return resolve("no operation");
        }
        const slackMessageContent = [];
        messages.forEach(message => {
            slackMessageContent.push(
                this.createSection(
                    message['title'],
                    message['event_id'],
                    message['event_url'],
                    message['description']
                )
            );
        });
        const hookURL = process.env.HOOKS_URL;
        const options = {
            uri: hookURL,
            method: "POST",
            headers: {
                "User-Agent": "Request-Promise"
            },
            json: {
                "blocks": slackMessageContent
            }
        };
        return post(options)
            .then(body => {
                return resolve(body);
            })
            .catch(async e => {
                console.error(e.toString());
                await this.postSlackLog(e.toString(), logType.ERROR);
                return reject(e);
            })
    }

    async postSlackLog(errorMessage: string, type: string): Promise<any> {
        const hookURL = process.env.HOOKS_URL;
        const options = {
            uri: hookURL,
            method: "POST",
            headers: {
                "User-Agent": "Request-Promise"
            },
            json: {
                "text": type + errorMessage.slice(0, 300)
            }
        };
        return post(options)
            .then(body => {
                return resolve(body);
            })
            .catch(async e => {
                console.error(e);
                return reject(e);
            })
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

function parser_results(data): String {
    // 場所データ取得
    const prefData = data["results"] && data["results"][0] && data["results"][0]["address_components"] || [{}];
    // 県の名前が書かれている場所を取得
    const len = prefData.length - 3 >= 0 ? prefData.length - 3 : 0;
    const pref = prefData[len]["long_name"]
    return pref
}

function getIdFromPrefName(name: String): number {
    return Number(Object.keys(prefecture).filter(k => prefecture[k] == name)[0]) || 13
}
