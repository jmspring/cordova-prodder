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

/**
 * Handling of cordova project info
 */
var    fs = require('fs'),
      path = require('path');
var projectConfig = {
  path: path.join(__dirname, "projdb") // where are the projects stored
}

var projectErrors = {
  ok:                "No error.",
  invalidName:       "Inavlid project name.",
  invalidData:      "Project data specified is incorrect.",
  notFound:          "Project not found.",
  noPlatform:        "Platform specified not configured."
}
module.exports.projectErrors = projectErrors;

// monkey patch fs to support recursive mkdir.  taken from:
// http://lmws.net/making-directory-along-with-missing-parents-in-node-js
fs.mkdirParent = function(dirPath, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.errno === 34) {
      //Create all the parents recursively
      fs.mkdirParent(path.dirname(dirPath), mode, callback);
      //And then the directory
      fs.mkdirParent(dirPath, mode, callback);
    }
    //Manually run the callback since we used our own callback to do all these
    callback && callback(error);
  });
};

/**
 * Load the specified project and return the details as an object.
 *
 * projectName - name of the project
 * callback(err, data) - the data handler
 */
module.exports.load_project = function(projectName, callback) {
  if(!valid_project_name(projectName)) {
    callback(projectErrors.invalidName);
  }
  var fsPath = path.join(projectConfig.path, projectName + ".json");
  fs.readFile(fsPath, function(err, data) {
    if(err) {
      callback(err, null);
    } else {
      try {
        var info = JSON.parse(data);
        callback(null, info);
      } catch(ex) {
        callback(ex, null);
      }      
    }
  });
}

/**
 * Save the details of the project as JSON.
 *
 * projectName - name of the project
 * projectData - project specifications
 * callback(err) - success/fail callback.
 */
module.exports.save_project = function(projectName, projectData, callback) {
  if(!valid_project_name(projectName)) {
    callback(projectErrors.invalidName);
  }
  var fsPath = path.join(projectConfig.path, projectName + ".json");
  try {
    var data = JSON.stringify(projectData, null, "  ");
  } catch(ex) {
    callback(ex);
    return;
  }
  fs.exists(projectConfig.path, function(exists) {
    if(!exists) {
      fs.mkdirParent(projectConfig.path, function(err) {
        fs.writeFile(fsPath, data, function(err) {
          callback(err);
        });
      });
    } else {
      fs.writeFile(fsPath, data, function(err) {
        callback(err);
      });
    }
  });
}


/**
 * Delete the specified project.
 *
 * projectName - name of the project
 * callback(err) - the result handler
 */
module.exports.delete_project = function(projectName, callback) {
  if(!valid_project_name(projectName)) {
    callback(projectErrors.invalidName);
  }
  var fsPath = path.join(projectConfig.path, projectName + ".json");
  fs.unlink(fsPath, function(err) {
    if(err && err.code == 'ENOENT') {
      err = null;
    }
    callback(err);
  });
}

/**
 * Validates that a project name.  Requirements are that a project name
 * be all lowercase alphanumerics.
 *
 * projectName - the name to validate
 */
module.exports.valid_project_name = valid_project_name = function(projectName) {
  if((projectName == null) || (projectName === undefined) || (typeof projectName !== "string")) {
    return false;
  }
  
  if(projectName.toLowerCase() != projectName) {
    return false;
  }
  
  if(/[^a-z0-9]/.test(projectName)) {
    return false;
  }
  
  return true;
}

/** 
 * Validate the project has the proper format.
 *
 * projectData - the data for the projectConfig.  The expected format is:
 *    {
 *      name: <a user friendly string>,
 *      path: <a string path to the project, will be verified>
 *      platforms: <array of strings for the platforms>
 *    }
 * callback(err) - is the project valid
 *
 * Likely errors are specified in "projectErrors"
 */
module.exports.validate_project = validate_project = function(projectData, callback) {
  if(!projectData.hasOwnProperty("name") || 
      !projectData.hasOwnProperty("path") ||
      !projectData.hasOwnProperty("platforms")) {
    callback(projectErrors.invalidData);
  } else {
    if(((typeof projectData["name"] !== "string") || (projectData["name"].length == 0)) ||
        ((typeof projectData["path"] !== "string") || (projectData["path"].length == 0)) ||
        ((typeof projectData["platforms"] !== "object") ||
            (Object.prototype.toString.call( projectData["platforms"] ) !== '[object Array]') &&
            (projectData["platforms"].length == 0))) {
      callback(projectErrors.invalidData);
    } else {  
      fs.stat(projectData["path"], function(err, stats) {
        if(err) {
          callback(err);
        } else {
          if(!stats.isDirectory()) {
            callback(projectErrors.notFound);
          } else {
            callback(projectErrors.ok);
          }
        }
      });
    }
  }
}
