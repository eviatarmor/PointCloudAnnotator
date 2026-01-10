import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, isLocal, corsHeaders, TABLE_NAME } from './db-config.js';

export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event));
    console.log('Running in local mode:', isLocal);

    try {
        const params = { TableName: TABLE_NAME };

        console.log('Scanning DynamoDB...');
        const result = await docClient.send(new ScanCommand(params));
        console.log('Result:', result);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                annotations: result.Items || [],
                count: result.Count || 0
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Failed to get annotations',
                message: error.message
            })
        };
    }
};
