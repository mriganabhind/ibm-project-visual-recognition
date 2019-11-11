

const fs = require('fs'); // file system for loading training pictures 

function WatsonVisRecSetup(vizRecClient) {
  this.vizRecClient = vizRecClient;
}
WatsonVisRecSetup.prototype.getVisRecList = function(params) {
  return new Promise((resolve, reject) => {
    this.vizRecClient.listClassifiers({}, (err,response) => {
      if (err) {
        console.log('Failed to get VisualRecognition classifier. Proceed to create one. Error: ' + err);
        return resolve(params);
      } else {
        const classifiers = response.classifiers;
        for (let i = 0, size = classifiers.length; i < size; i++) {
          const classifier = classifiers[i];
          console.log("getVisRecList classifier: " + JSON.stringify(classifier, null, 2))
          if (classifier.name === 'vehicleDamageAnalyzer') {
            response.classifier_id = classifier.classifier_id;
            console.log("getVisRecList classifier_id: " + response.classifier_id)
            return resolve(response);
          }
        }
        return resolve(params);
      }
    });
  });
};


WatsonVisRecSetup.prototype.createVisRecClassifier = function(params) {
  if (params.classifier_id) {
    return Promise.resolve(params);
  }
  return new Promise((resolve, reject) => {
    // No existing classifier_id found, so create it.
    console.log('Creating VisualRecognition classifier...');
    var createClassifierParams = {
        name: 'vehicleDamageAnalyzer',
        BrokenWindshield_positive_examples: fs.createReadStream('./data/BrokenWindshield.zip'),
        FlatTire_positive_examples: fs.createReadStream('./data/FlatTire.zip'), 
        DamagedFrontBumper_positive_examples: fs.createReadStream('./data/DamagedFrontBumper.zip'),
        negative_examples: fs.createReadStream('./data/Negatives.zip')
      }
    this.vizRecClient.createClassifier(createClassifierParams, (err, response) => {
      if (err) {
        console.error('Failed to create VisualRecognition classifier.');
        return reject(err);
      } else {
        console.log('Created VisualRecognition classifier: ', response);
        resolve(response);
      }
    });
  });
};

WatsonVisRecSetup.prototype.setupVisRec = function(setupParams, callback) {
 this.getVisRecList(setupParams)
    .then(params => this.createVisRecClassifier(params))
    .then(params => callback(null, params))
    .catch(callback);
};

module.exports = WatsonVisRecSetup;
