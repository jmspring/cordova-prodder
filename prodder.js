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

var config = require('./config'),
    temp = require('temp').track(),
    fs = require('fs'),
    exec = require('child_process').exec;

/**
 * Execute the specified action.  Done via setting up and execing the script.
 *
 * Expects a callback that takes an error code and possibly an explanation.
 */
module.exports.execute_command = function(action, data, targetPlatform, callback) {
  var device = null;
  if(action.indexOf("run") == 0) {
    device = action.substr(4);
    action = "run";
  }
    
  if(!config.script_base.hasOwnProperty(config.platform) || 
      !config.exec.hasOwnProperty(config.platform)) {
    callback(503, "invalid platform configuration");
    return;
  }
  
  script = config.script_base[config.platform];
  script[script.length] = "cd " + data.path;
  script[script.length] = "cordova " + action + " " + targetPlatform;
  if(device != null) {
    script[script.length - 1] = script[script.length - 1] + " --" + device;
  }

  var info = config.exec[config.platform];
  var tempInfo = {
    "prefix": "cordova-prodder",
    "suffix": info.suffix
  };
  var cmd = info.command;
  temp.open(tempInfo, function(err, info) {
    if(err) {
      callback(503, "internal error with temporary thingies");
    } else {
      fs.writeSync(info.fd, script.join("\n"));
      fs.close(info.fd, function(err) {
        if(err) {
          callback(503, "internal error closing temporary thingies");
          return;
        } else {
          var tmpfile = info.path;
          child = exec(cmd + " " + tmpfile, function(err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            if(err) {
              callback(503, "execution failed.");
            } else {
              callback(200, null);
            }
          });
        }
      });
    }
  });
};
