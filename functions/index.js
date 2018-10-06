const functions = require('firebase-functions');

const convertExcel = require('excel-as-json').processFile;
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
var department = '';

const projectId = "sghweb-c53b2";
const bucketName = `${projectId}.appspot.com`;

const gcs = require('@google-cloud/storage')({
    projectId
})

const bucket = gcs.bucket(bucketName);

exports.excltojson = functions.database.ref('excelimport/newexcel').onWrite((change, context) => {
    const snapshot = change.after;
    const filePath = 'goodfile';
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    var file = fs.createWriteStream(tempLocalFile);
    department = snapshot.val().department;
    console.log('Department : --- ' + snapshot.val().department);
    var request = https.get(snapshot.val().thaturl, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close();  // close() is async, call cb after close completes.
            var options = {
                sheet: '1',
                isColOriented: false,
                omitEmtpyFields: false
            }

            convertExcel(file.path, '/tmp/' + department + '_jsonfile.json', options, (err, data) => {
                if (err) {
                    console.log("convertExcel--- " + err);
                }
                else {

                    bucket.upload('/tmp/' + department + '_jsonfile.json', { metadata: { contentType: 'application/json' } }).then(() => {
                        console.log('Uploaded json');
                    })
                }
            })
        });
    }).on('error', function (err) { // Handle errors
        fs.unlink(tempLocalFile); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
})

