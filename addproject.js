// /*
//  Copyright (c) Jim Spring
//  All Rights Reserved
//  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the
//  License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// 
//  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED,
//  INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
//  MERCHANTABLITY OR NON-INFRINGEMENT.
// 
//  See the Apache 2 License for the specific language governing permissions and limitations under the License.
//  */

// A simple utility to add a new project to the cordova prodder.

//var http = require('http');
var request = require('request');

function usage() {
	console.log(process.argv[0] + " " + process.argv[1] + " <host> <port> <name> <project_dir> <platforms>");
	console.log("  <name> must be a string made up of only lowercase characters and 0-9");
	console.log("  <platforms> is a quoted, comma separated list of platforms.  for instance \"ios,android\"");
	process.exit(1);
}

if(process.argv.length != 7) {
	usage();
}

var host = process.argv[2];
var port = parseInt(process.argv[3]);
var name = process.argv[4];
var projectDir = process.argv[5];
var platforms = process.argv[6].split(",");

if((host == null || host.length == 0) ||
		(projectDir == null || projectDir.length == 0) || 
		(platforms == null || platforms.length == 0)) {
	usage();
}

var body = {
	"name": name,
	"path": projectDir,
	"platforms": platforms
};

var r = request.post("http://" + host + ":" + port + "/new/" + name, function optionalCallback(err, httpResponse, body) {
	if(err) {
		console.error("Failed to create project entry:", err);
	} else {
 		console.log("Project creation succeeded");
 	}
}).form(body);
