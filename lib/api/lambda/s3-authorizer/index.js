const AWS = require('aws-sdk');
const s3 = new AWS.S3({ signatureVersion: 'v4' })

const bucket = process.env.S3_BUCKET
if (!bucket) {
    throw Error(`S3 bucket not set`)
}

exports.handler = async function(event) {
    try {
        const key = JSON.parse(event.body)['object_key'];
        const action = JSON.parse(event.body)['action'];
        if (!key) {
            throw Error('S3 object key missing')
        }
        if (action !== "putObject" && action !== "getObject") {
            throw Error('Action not allowed')
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            body: s3.getSignedUrl(action, {
                Bucket: bucket,
                Key: key,
                Expires: 24 * 60 * 60
            })
        }
    } catch (error) {
        throw Error(`Error in backend: ${error}`)
    }

}