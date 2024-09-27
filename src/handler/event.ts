import { APIGatewayProxyHandler } from 'aws-lambda';
import * as aws from 'aws-sdk';

aws.config.update({
  region: aws.config.region,
  credentials: new aws.Credentials(aws.config.credentials.accessKeyId, aws.config.credentials.secretAccessKey, aws.config.credentials.sessionToken)
})

const s3 = new aws.S3();

import 'source-map-support/register';
import { EventRepository } from '../infra/event';
import { EventUsecase } from '../usecase/event';

export const getEvents: APIGatewayProxyHandler = async (event, _context) => {
  const req = event.multiValueQueryStringParameters
  const eventRepo = new EventRepository(s3)
  const eventUsecase = new EventUsecase(eventRepo)
  const events = await eventUsecase.getEvents(req)
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization"
    },
    body: JSON.stringify({message: events})
  };
}

export const save = async () => {
  const eventRepo = new EventRepository(s3)
  const eventUsecase = new EventUsecase(eventRepo)
  await eventUsecase.saveEvents()
}
