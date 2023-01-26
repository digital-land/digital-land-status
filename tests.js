const {readFileSync} = require("fs");
const {join} = require("path");
const {Client} = require("pg");
const {S3, STS} = require("aws-sdk");

module.exports = [{
    print: "DEPLOYMENT:TIME",
    check: async () => readFileSync(join(process.cwd(), 'DEPLOY_TIME'), 'utf-8').replace('\n', ''),
}, {
    print: "DB:READ",
    check: async () => {
        const client = new Client({connectionString: process.env.READ_DATABASE_URL});
        await client.connect();
        await client.end();
        return true;
    },
}, {
    print: "DB:WRITE",
    check: async () => {
        const client = new Client({connectionString: process.env.WRITE_DATABASE_URL});
        await client.connect();
        await client.end();
        return true;
    },
}, {
    print: "BUCKET:READ",
    check: async () => {
        const client = new S3({region: 'eu-west-2'});
        await client.getObject({Bucket: process.env.COLLECTION_DATA_BUCKET, Key: 'index.html'}).promise();
        return true;
    },
}, {
    print: "ROLE:APPLICATION",
    check: async () => {
        const client = new STS({region: 'eu-west-2'});
        const response = await client.getCallerIdentity({}).promise();
        return response.Arn.indexOf('task-application-role') !== -1;
    },
}]
