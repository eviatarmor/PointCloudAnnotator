import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";

// Detect if running in SAM Local
export const isLocal = process.env.AWS_SAM_LOCAL === 'true';

// Configure client based on environment
export const client = new DynamoDBClient(isLocal ? {
    endpoint: 'http://host.docker.internal:8000',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy'
    }
} : {});

export const docClient = DynamoDBDocumentClient.from(client);

// CORS headers
export const corsHeaders = {
    "Access-Control-Allow-Origin": isLocal ? "*" : "http://point-cloud-annotator.com.s3-website.eu-north-1.amazonaws.com",
    "Access-Control-Allow-Methods": "DELETE, PUT, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
};

// Table name constant
export const TABLE_NAME = 'PointCloudAnnotator';
