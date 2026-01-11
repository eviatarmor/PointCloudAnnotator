import {CreateTableCommand, DeleteTableCommand, DynamoDBClient, ListTablesCommand} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    endpoint: 'http://localhost:8000',
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy'
    }
});

async function setupTable() {
    try {
        // Check if table already exists
        const listCommand = new ListTablesCommand({});
        const tables = await client.send(listCommand);

        if (tables.TableNames.includes('PointCloudAnnotator')) {
            console.log('Table "PointCloudAnnotator" already exists, deleting...');

            // Delete the existing table
            const deleteCommand = new DeleteTableCommand({
                TableName: 'PointCloudAnnotator'
            });
            await client.send(deleteCommand);
            console.log('Table deleted successfully!');

            // Wait a bit for the deletion to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Create table
        const createCommand = new CreateTableCommand({
            TableName: 'PointCloudAnnotator',
            KeySchema: [
                {AttributeName: 'label', KeyType: 'HASH'}
            ],
            AttributeDefinitions: [
                {AttributeName: 'label', AttributeType: 'S'}
            ],
            BillingMode: 'PAY_PER_REQUEST'
        });

        const response = await client.send(createCommand);
        console.log('Table "PointCloudAnnotator" created successfully!');
        console.log('Status:', response.TableDescription.TableStatus);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\nMake sure DynamoDB Local is running:');
            console.log('docker run -d -p 8000:8000 amazon/dynamodb-local');
        }
    }
}

setupTable();
