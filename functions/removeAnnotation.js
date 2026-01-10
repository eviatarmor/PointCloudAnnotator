import {DeleteCommand} from "@aws-sdk/lib-dynamodb";
import {corsHeaders, docClient, TABLE_NAME} from './db-config.js';

export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event));

    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return {statusCode: 200, headers: corsHeaders, body: ""};
    }

    try {
        const body = JSON.parse(event.body);
        const {label} = body;

        if (!label) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({error: 'Label is required'})
            };
        }

        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {label}
        }));

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Annotation deleted successfully',
                label
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Failed to delete annotation',
                message: error.message
            })
        };
    }
};
