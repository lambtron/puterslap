'use strict';

// Initialize server ===========================================================
var express = require('express')
  , http = require('http')
  , app = express()
  , server = http.createServer(app)
  , port = process.env.PORT || 3000;

// Configuration ===============================================================
app.use('/public', express.static(__dirname + '/public'));
app.use(express.bodyParser());

// Listen (start app with node server.js) ======================================
server.listen(port, function() {
	console.log("App is now listening on port " + port);
});

app.get('/*', function (req, res) {
  res.sendfile('index.html', {'root': './public/views/'});
});