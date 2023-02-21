import { APIGatewayEventRequestContextV2, APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2, context: APIGatewayEventRequestContextV2): Promise<APIGatewayProxyResultV2> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  
  //TODO: Write code to get data lineage for an activity

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Needs to be implemented',
    }),
  };
};