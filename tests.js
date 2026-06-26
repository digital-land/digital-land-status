const {readFileSync, readdirSync, statSync} = require("fs");
const {join} = require("path");
const {Client} = require("pg");
const {S3, STS} = require("aws-sdk");

const datasetsDirectory = "/mnt/datasets1";

module.exports = [{
    print: "DEPLOYMENT:TIME",
    check: async () => readFileSync(join(process.cwd(), 'DEPLOY_TIME'), 'utf-8').replace('\n', ''),
}, {
    print: "S3:FILE:MOUNT:/mnt/datasets",
    check: async () => {
        let stats;

        try {
            stats = statSync(datasetsDirectory);
        } catch (error) {
            if (error.code === "ENOENT") {
                throw new Error(`${datasetsDirectory} does not exist`);
            }

            throw error;
        }

        if (!stats.isDirectory()) {
            throw new Error(`${datasetsDirectory} is not a directory`);
        }

        const entries = readdirSync(datasetsDirectory, {withFileTypes: true});

        if (entries.length === 0) {
            throw new Error(`${datasetsDirectory} does not contain any files`);
        }

        return {
            entries: entries.length,
            files: entries.filter(entry => entry.isFile()).length,
            directories: entries.filter(entry => entry.isDirectory()).length,
        };
    },
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
