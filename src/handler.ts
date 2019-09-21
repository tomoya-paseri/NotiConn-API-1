import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { NewRepository } from "./repository";

export const hello: APIGatewayProxyHandler = async (event, _context) => {



  const retObj = NewRepository();
  return retObj;
}
