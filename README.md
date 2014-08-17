cordova-prodder
===============

Cordova prodder is a utility born out of necessity.  I wanted to be able to 
develop cordova apps while on a Mac while still being able to run builds on
Windows for Windows 8 Modern and Windows Phone 8 applications.  Cygwin + 
ssh + Visual Studio just was taking too much time to even see if it was possible.

Instead, you get "cordova-prodder".  The service is a simple node service that 
responds to HTTP requests.  All you need to do is:

	1. have a shared directory across machines where you are doing your work
	2. clone cordova-prodder repository
	3. updating config.js with the platform type you are running on
	4. if running on windows, make sure the path to vcvarsall is correct
	5. npm install
	6. npm start
	
One assumption that the service makes is that you have cordova already configured 
for the platform you are building on (and the platforms you are targeting).  This
is just a simple service to automate builds.

Adding a project can be done easily using the command:

	- node addproject.js <host> <port> <name> <project path> <platforms>
