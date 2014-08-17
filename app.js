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

// A simple application to allow building cordova projects on a remote machine.  A typical scenario might be
// when you are developing on one machine, using a shared drive and want to build on the other.  Building for
// iOS from Windows or vice-versa.

var express = require('express'),
    bodyParser = require('body-parser'),
    project = require('./project'),
    prodder = require('./prodder');
    config = require('./config');
    
var app = express();
app.use(bodyParser.json());

/**
 * Create a new project.  Syntax is:
 *
 * HTTP POST /new/<project name>
 * JSON Body:
 *    {
 *      name: <a user friendly string>,
 *      path: <a string path to the project, will be verified>
 *      platforms: <array of strings for the platforms>
 *    }
 *
 * Returns a 201 on success.
 */
app.post("/new/:name([a-z0-9]+)", function(req, res) {
  if(project.valid_project_name(req.params.name)) {
    project.validate_project(req.body, function(err) {
      if(err === project.projectErrors.ok) {
        project.save_project(req.params.name, req.body, function(err) {
          if(err == null) {
            res.send(201);
          } else {
            res.send(503, "unable to save: " + err);
          }
        });
      } else {
        res.send(400, "invalid project data: " + err);
      }
    });
  } else {
    res.send(400, "invalid project name");
  }
});

/**
 * Delete the specified project config.  The actual project files
 * that are referenced in the config are left untouched.
 *
 * HTTP GET /delete/<project name>
 *
 * Returns 200 on success.
 */
app.get("/delete/:name([a-z0-9]+)", function(req, res) {
  if(project.valid_project_name(req.params.name)) {
    project.delete_project(req.params.name, function(err) {
      if(err == null) {
        res.send(200);
      } else {
        res.send(503, "unable to delete: " + err.code);
      }
    });
  } else {
    res.send(400, "invalid project name");
  }
});

/**
 * Load and prod the project to actually do something.  Note that these
 * methods exec a command-line action, so they may be slow to run or 
 * fail in some way.
 *
 * action - the action to take
 * name - the name of the project
 * platform - which platform to perform the action on
 */
function do_some_prodding(action, name, platform, res) {
  if(project.valid_project_name(name)) {
    project.load_project(name, function(err, data) {
      if(err) {
        // TODO -- filter errors better
        res.send(503, "unable to load project.  action: " + action + ", error: " + err);
      } else {
        if(data.platforms.indexOf(platform) >= 0) {
          prodder.execute_command(action, data, platform, function(code, err) {
            if(err) {
              res.send(code, "unable to execute action: " + action + ", error: " + err);
            } else {
              res.send(200);
            }
          });
        } else {
          res.send(400, "platform specified not part of the project: " + platform);
        }
      }
    });
  } else {
    res.send(400, "invalid project name.  action: " + action);
  }
}

/**
 * Build the specified project for the specified platform.  Note, that the
 * platform must have been specified in the initial config of the project.
 *
 * HTTP GET /build/<project name>/<platform>
 *
 * Returns 200 on success.
 */
app.get("/build/:name([a-z0-9]+)/:platform([a-z0-9]+)", function(req, res) {
  do_some_prodding("build", req.params.name, req.params.platform, res);  
});

/**
 * Compile the specified project for the specified platform.  Note, that the
 * platform must have been specified in the initial config of the project.
 *
 * HTTP GET /compile/<project name>/<platform>
 *
 * Returns 200 on success.
 */
app.get("/compile/:name([a-z0-9]+)/:platform([a-z0-9]+)", function(req, res) {
  do_some_prodding("compile", req.params.name, req.params.platform, res);  
});

/**
 * Prepare the specified project for the specified platform.  Note, that the
 * platform must have been specified in the initial config of the project.
 *
 * HTTP GET /prepare/<project name>/<platform>
 *
 * Returns 200 on success.
 */
app.get("/prepare/:name([a-z0-9]+)/:platform([a-z0-9]+)", function(req, res) {
  do_some_prodding("prepare", req.params.name, req.params.platform, res);  
});

/**
 * Run the specified project for the specified platform on an attached device.  
 * Note, that the platform must have been specified in the initial config of 
 * the project.
 *
 * HTTP GET /run/device/<project name>/<platform>
 *
 * Returns 200 on success.
 */
app.get("/run/device/:name([a-z0-9]+)/:platform([a-z0-9]+)", function(req, res) {
  do_some_prodding("run/device", req.params.name, req.params.platform, res);  
});

/**
 * Run the specified project for the specified platform in the emulator.  
 * Note, that the platform must have been specified in the initial config of 
 * the project.
 *
 * HTTP GET /run/emulator/<project name>/<platform>
 *
 * Returns 200 on success.
 */
app.get("/run/emulator/:name([a-z0-9]+)/:platform([a-z0-9]+)", function(req, res) {
  do_some_prodding("run/emulator", req.params.name, req.params.platform, res);  
});

app.listen(config.port);
