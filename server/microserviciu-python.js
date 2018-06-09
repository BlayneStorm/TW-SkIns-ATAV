var http = require('http');
var qs = require('querystring');
var fs = require('fs');
var PythonShell = require('python-shell');
var formidable = require('formidable');
const MongoClient = require('mongodb').MongoClient;
var url = require('url');

function renderCoursePage(response) {
    fs.readFile("./microserviciu-python/pythoncourse.html", function (error, htmlContent) {
        if (error) {
            response.writeHead(404);
            response.write("Couldn't load HTML / not found");
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' })
            response.write(htmlContent);
        }
        response.end();
    });
}

var serverPort = 9000;
http.createServer(function (request, response) {
    console.log(request.url);

    if (request.method === 'GET') {
        if (request.url === '/python') {
            renderCoursePage(response);

            // response.writeHead(200, { 'Content-Type': 'text/html' });
            // response.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
            // response.write('<input type="file" name="filetoupload"><br>');
            // response.write('<input type="submit">');
            // response.write('</form>');
            // return response.end();


        } else if (request.url === '/python/documentation') {


            fs.readFile("./microserviciu-python/documentation.txt", 'utf8', function (error, data) {
                if (error) throw error;
                
                // console.log(data)

                var jsonData = {
                    content : data
                };


                // console.log(JSON.stringify(jsonData));
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.write(JSON.stringify(jsonData));
                response.end();

            });


        } else {

            var path = url.parse(request.url).pathname;

            if (path.includes(".css")) {
                fs.readFile("../src/assets/css/" + path, function (error, cssContent) {
                    if (error) {
                        response.writeHead(404);
                        response.write("Couldn't load CSS / not found");
                    } else {
                        response.writeHead(200, { 'Content-Type': 'text/css' })
                        response.write(cssContent);
                    }
                    response.end();
                });

            } else {

                response.writeHead(404, { 'Content-type': 'text/html' })
                // response.write(results[0]);
                response.end("Page not found");
            }
        }
    } else {
        if (request.method === "POST") {
            if (request.url === '/run-python-script') {
                var requestBody = '';
                request.on('data', function (data) {
                    requestBody += data;
                });

                request.on('end', function () {
                    var formData = qs.parse(requestBody);
                    console.log(formData);


                    fs.writeFile("./microserviciu-python/script.py", formData.script, function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        console.log("The file was saved!");

                        PythonShell.run('./microserviciu-python/script.py', function (shellError, results) {
                            if (shellError) {
                                console.log(shellError);
                                response.writeHead(404, { 'content-type': 'text/html' });
                                response.end("Error at runtime");
                            } else {
                                console.log(results);

                                var jsonResult = {
                                    "result": results
                                };

                                console.log(jsonResult);
                                // jsonResult = JSON.parse(jsonResult);

                                response.writeHead(200, { 'Content-type': 'text/html' });
                                // response.write(results[0]);
                                response.end(JSON.stringify(jsonResult));
                            }
                        });

                    });



                });
            } else if (request.url == '/fileupload') {
                var form = new formidable.IncomingForm();
                form.parse(request, function (error, fields, files) {
                    var oldpath = files.filetoupload.path;
                    var newpath = './microserviciu-python/' + 'script.py';
                    fs.rename(oldpath, newpath, function (error) {
                        if (error) throw error;

                        PythonShell.run('./microserviciu-python/script.py', function (shellError, results) {
                            if (shellError) {
                                console.log(shellError);
                                response.writeHead(404, { 'content-type': 'text/html' });
                                response.end("Error at runtime");
                            } else {
                                console.log(results);

                                var jsonResult = {
                                    "result": results
                                };

                                console.log(jsonResult);
                                // jsonResult = JSON.parse(jsonResult);

                                response.writeHead(200, { 'Content-type': 'text/html' });
                                // response.write(results[0]);
                                response.end(JSON.stringify(jsonResult));
                            }
                        });

                        //   response.write('File uploaded and moved!');
                        //   response.end();
                    });
                });
            }
        }
    }


}).listen(serverPort);
console.log('Server running at localhost:' + serverPort);