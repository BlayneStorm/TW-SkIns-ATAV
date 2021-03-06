var http = require('http');
var qs = require('querystring');
var fs = require('fs');
var Cookies = require('cookies');
var subscribeController = require('./subscribeController');

var port = 8053;
const hostname = '127.0.0.1';

const server = http.createServer(function (req, res) {
    var cookies = new Cookies(req, res, null);
    // console.log(req.url, req.method)
    subscribeController.handleRequest(req,res,cookies);
    
});

server.listen(port, hostname, ()=> {
	console.log('Server started at port ' + port);
});
