var url = require('url');
var fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

module.exports = {
    handleRequest: function(request, response){
        var path = url.parse(request.url).pathname;
        console.log("Path: " + path);
        if (request.method === "GET" && path.includes(".css") === false) {
            if (path === "/courses") {
                MongoClient
                .connect('mongodb://localhost:27017', function (error, connection) {
                    if (error) {
                        throw error;
                        connection.close();
                    }

                    var dbConnection = connection.db("TW_PROJECT_SkIns");
                    dbConnection.collection('Cursuri').find({}).toArray(function (queryError, queryResult) {

                        if (queryError) {
                            throw queryError;
                            connection.close();
                        }
                        console.log(JSON.stringify(queryResult));
                        response.writeHead(200,{'Content-Type': 'application/json'});
                        response.write(JSON.stringify(queryResult));
                        response.end();
                        connection.close();
                        console.log("Am trimis raspuns.");
                    });
                })
            }else {
                response.writeHead(404);
                response.write("Couldn't load HTML / not found");
            }
        }
        else{
            response.writeHead(404, 'Resource Not Found', { 'Content-Type': 'text/html' });
            response.end('<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found</body></html>');
        }
                }
}