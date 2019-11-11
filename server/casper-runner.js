require('dotenv').config({ silent: true });

var spawn = require('child_process').spawn;

var app = require('./app');
const express = require("express");
const application = express();
var port = 3001;

var server = application.listen(port, function() {
  console.log('Server running on port: %d', port);

  function kill(code) {
    server.close(function() {
      process.exit(code);
    });
  }

  function runTests() {
    var casper = spawn('npm', ['run', 'test-integration']);
    casper.stdout.pipe(process.stdout);

    casper.on('error', function(error) {
      console.error(error);
      server.close(function() {
        process.exit(1);
      });
    });

    casper.on('close', kill);
  }

  runTests();
});
