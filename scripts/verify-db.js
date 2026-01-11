import {DescribeTableCommand, DynamoDBClient, ListTablesCommand} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    endpoint: 'http://localhost:8000',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy'
    }
});

async function verifyTable() {
    const listCommand = new ListTablesCommand({});
    const tables = await client.send(listCommand);
    console.log('Existing tables:', tables.TableNames);

    if (tables.TableNames.includes('PointCloudAnnotator')) {
        const describeCommand = new DescribeTableCommand({
            TableName: 'PointCloudAnnotator'
        });
        const description = await client.send(describeCommand);
        console.log('Table status:', description.Table.TableStatus);
        console.log('Key schema:', description.Table.KeySchema);
    }
}

verifyTable();
