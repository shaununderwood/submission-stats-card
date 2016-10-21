var connect  = require('connect');
var static = require('serve-static');
var package = require('./package.json');
 
var server = connect();
 
server.use(  static(__dirname + '/app'));
 
server.listen( package.defaultPort );
 
console.log('Server is listening on port: ' + package.defaultPort);

