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

const paramsToPut = {
  Bucket: 'noticonn',
  Key: 'samplePut.json',
  Body: '',
};

export const getEvents: APIGatewayProxyHandler = async (event, _context) => {
  const req = event.multiValueQueryStringParameters
  console.log(req)  // event変数使用するため一旦出力
  const eventRepo = new EventRepository(s3)
  const eventUsecase = new EventUsecase(eventRepo)
  const events = await eventUsecase.getAllEvents()
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({message: events})
  };
}

export const save = async () => {
  const jsonData = {
    'title': 'テストだよ~~~~~~',
    'body': 'テストだよ!!!!!!',
  };
  paramsToPut['Body'] = JSON.stringify(jsonData);
  const date = new Date();
  await s3.putObject(paramsToPut, (err, data) => {
    if (err) {
      console.log(err);
      console.log(data);
    } else {
      console.log("Successfully uploaded data : " + date.toLocaleDateString());
    }
  });
}
