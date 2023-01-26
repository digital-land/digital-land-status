const express = require('express')
const tests = require('./tests')
const {createLogger, transports, format} = require('winston')

const logger = createLogger({
    level: 'info',
    format: format.json(),
    defaultMeta: {service: 'status'},
    transports: [new transports.Console()],
});

const app = express()

app.get('/', (req, res) => {
    Promise.all(tests.map(test => new Promise((resolve) => {
        test.check().then(result => {
            resolve([test.print, {status: result ? 'success' : 'failure', result}])
        }).catch(error => {
            logger.error('error', {
                test: test.print,
                error,
            });
            resolve([test.print, {status: 'failure', error: error.message}])
        })
    }))).then(checks => {
        if (checks.filter(([_, v]) => v.status === 'failure').length) res.statusCode = 500

        logger.info(res.statusCode === 500 ? 'failure' : 'success', {
            results: Object.fromEntries(checks),
        });
        res.json(Object.fromEntries(checks));
    })
})

app.get('/health', (req, res) => {
    logger.info('healthcheck');
    res.status(200).json({applicationHealth: 'ok'})
})

app.listen(process.env.PORT || 80, () => {
    logger.info(`Status application listening on port ${process.env.PORT || 80}`);
})
