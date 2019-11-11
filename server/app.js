
"use strict";

require("dotenv").config({
    silent: true
});

const fs = require("fs");
const VisualRecognitionV3 = require("watson-developer-cloud/visual-recognition/v3");
const express = require("express");
const application = express();
const formidable = require("formidable");
const WatsonVisRecSetup= require('./lib/watson-visRec-setup');

const visual_recognition = new VisualRecognitionV3({
    version: "2018-03-19"
});
var custom_classifier = null;
let setupError = '';

const visRecSetup = new WatsonVisRecSetup(visual_recognition);
const visRecSetupParams = {
  "classifiers": [
    {
      "classifier_id": "",
      "name": "vehicleDamageAnalyzer",
      "status": "ready"
    }
  ]
};

visRecSetup.setupVisRec(visRecSetupParams, (err, data) => {
  if (err) {
    handleSetupError(err);
  } else {
    console.log('Visual Recognition is ready!');
    console.log('vehicleDamageAnalyzer classifier_id: ' + data.classifier_id);
    custom_classifier = data.classifier_id;
  }
});

function handleSetupError(reason) {
  setupError += ' ' + reason;
  console.error('The app failed to initialize properly. Setup and restart needed.' + setupError);
  console.error('\nAborting due to setup error!');
  process.exit(1);
}

application.use(express.static(__dirname + "/public"));
application.post("/uploadpic", function (req, result) {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
        } else {
            const filePath = JSON.parse(JSON.stringify(files));
            const params = {
                image_file: fs.createReadStream(filePath.myPhoto.path),
                classifier_ids: [custom_classifier] || "",
                threshold: 0
            };
            visual_recognition.classify(params, function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    const labelsvr = JSON.parse(JSON.stringify(res)).images[0].classifiers[0];
                    result.send({data: labelsvr});
                }
            });
        }
    });
});
const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

application.listen(port, function () {
    console.log("Server running on port: %d", port);
});
