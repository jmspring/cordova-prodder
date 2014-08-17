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
var config = {};

config.port = 9876;          // which port to listen on
config.platform = "osx";    // which platform the server is running on

// host platform specific steps needed to generate the script to be executed
config.script_base = {
  "windows": [
    "call \"C:\\Program Files (x86)\\Microsoft Visual Studio 12.0\\VC\\vcvarsall.bat\" x86"
  ],
  "osx": [
  ]
};

// host platform specific config needed to execute the script
config.exec = {
  "windows": {
    "command":  "cmd /c",
    "suffix":    ".bat"
  },
  "osx": {
    "command":  "sh",
    "suffix":    ".sh"
  }
};

module.exports = config;
