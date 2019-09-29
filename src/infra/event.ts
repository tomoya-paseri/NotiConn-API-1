import { IEventRepository } from "../domain/repository/event";
import * as aws from 'aws-sdk';

const paramsToGet = {
    Bucket: 'noticonn',
    Key: 'sample.json'
};

export class EventRepository extends IEventRepository{
    private s3: aws.S3;
    constructor(s3: aws.S3) {
        super()
        this.s3 = s3;
    }
    async getAll(): Promise<string> {
        const data = await this.s3.getObject(paramsToGet).promise()
        return data.Body.toString()
    }
}
