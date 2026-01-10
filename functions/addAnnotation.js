import {PutCommand} from "@aws-sdk/lib-dynamodb";
import {corsHeaders, docClient, TABLE_NAME} from './db-config.js';

export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event));

    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return {statusCode: 200, headers: corsHeaders, body: ""};
    }

    try {
        const body = JSON.parse(event.body);
        const {label, x, y, z} = body;

        if (!label || typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({error: 'Invalid input'})
            };
        }

        const item = {label, x, y, z, timestamp: new Date().toISOString()};

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        }));

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Annotation added successfully',
                data: item
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Failed to add annotation',
                message: error.message
            })
        };
    }
};
