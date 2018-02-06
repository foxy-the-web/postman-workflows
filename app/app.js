const http = require('http');
const express = require('express');
const app = express();

// Use static files
app.use(express.static('public'));

// Root route
app.get('/', function (req, res) {
	res.sendFile('index.html', {
    	root: __dirname
 	})
});

// Start server
const server = app.listen(3000, function () {
 
	const host = server.address().address;
    const port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});