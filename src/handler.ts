import { APIGatewayProxyHandler } from 'aws-lambda';
import * as aws from 'aws-sdk';

aws.config.update({
  region: process.env.AWS_REGION,
  credentials: new aws.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)
})

const s3 = new aws.S3();

import 'source-map-support/register';
import { NewRepository } from "./repository";


const paramsToGet = {
  Bucket: 'noticonn',
  Key: 'sample.json'
};

export const hello: APIGatewayProxyHandler = async (_, _context) => {
  const retObj = NewRepository();
  console.log(await s3.getObject(paramsToGet).promise())
  const data = await s3.getObject(paramsToGet).promise()
  retObj.body = data.Body.toString();
  return retObj;
  // return callback(null, retObj);
}
