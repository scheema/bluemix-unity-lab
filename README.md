This is the node.js server for unity for Bluemix.
This repo contains a complete sample of a node.js program that you can deploy on IBM's BlueMix PaaS, which is based on the Cloud Foundry open source project.

Before jumping into the code, make sure you have an IBM ID, by registering at the IBM ID registration page. 
You will need the IBM ID to login to BlueMix from the command line.
You will also need to install the cf command-line tool, available here:

•	https://github.com/cloudfoundry/cli/releases

At the time of this writing, the most recent version is cf v6.1.1.
install the code for the sample program
Click the magical button below to deploy the app.

 <a href="https://bluemix.net/deploy?repository=https://github.com/scheema/bluemix-unity-lab" # [required]><img src="https://bluemix.net/deploy/button.png" alt="Deploy to Bluemix"></a>

From a command/shell terminal
•	cd into the parent directory you want to install the project in
•	git clone the project into a child directory
•	cd into that child directory
•	run npm install to install dependencies
For example:
$ cd Projects
$ git clone https://github.com/IBM-Bluemix/bluemix-unity-lab

    ... git output here ...

$ cd bluemix-unity-lab

$ npm install

run locally
After installing, run the server using
npm start

Once the server is running, test it by visiting the following URL in your browser:
http://localhost:8080/


logging into BlueMix
Now that you have your IBM ID and the cf command-line tool (see above), you can log into BlueMix and the deploy your app.
First you should tell the cf command which environment you want to operate with, with the cf api command:
cf api https://api.ng.bluemix.net
You should see the following output:
Setting api endpoint to https://api.ng.bluemix.net...
OK

API endpoint: https://api.ng.bluemix.net (API version: 2.0.0)
Not logged in. Use 'cf login' to log in.
No org or space targeted, use 'cf target -o ORG -s SPACE'
Note that as long as you only ever interact with the BlueMix environment with the cf command (and not any other CloudFoundry environments), you won't have to run the cf api command again.
To login to BlueMix, use the following command:
cf login
You will be prompted for your IBM ID userid and password, as in the following example:
$ cf login
API endpoint: https://api.ng.bluemix.net

Username> [enter your IBM ID here]

Password> [enter your IBM ID password here]
Authenticating...
OK
You will then be prompted to select your 'org' and 'space', just select the defaults, which should be your IBM ID userid anddev, respectively.
When complete, you should see the following:
API endpoint: https://api.ng.bluemix.net (API version: 2.0.0)
User:         [your IBM ID]
Org:          [your IBM ID]
Space:        dev
deploying to BlueMix

You can deploy an application to BlueMix with the cf push command.
Use the following command to have the application deployed to BlueMix:
cf push


The server written with node.js. This server was adapted from the example provided in the node docs.
The difference is that the port, binding host, and url are determined via the cfenv package. This will return appropriate values both when running in Cloud Foundry and when running locally.
________________________________________
.cfignore
List of file patterns that should NOT be uploaded to BlueMix.
See the Cloud Foundry doc Prepare to Deploy an Application for more information.
In this case, the contents of the file are:
node_modules
This indicates the node modules you installed with npm install will NOT be uploaded to BlueMix. When your app is "staged" (ie, built on BlueMix during cf push), an npm install will be run there to install the required modules. By avoiding sending your node modules when you push your app, your app will be uploaded quicker than if you HAD sent the modules. But you can send the modules you have installed if you like; just delete the .cfignore file.
________________________________________
.gitignore
List of file patterns that should NOT be stored in git. If you aren't using git, you don't need this file. And the contents are personal preference.
See the npm google groups topic 'node_modules in git' from FAQ for discussion.
________________________________________
LICENSE
The open source license for this sample; in this case, it's licensed under Apache License, Version 2.0.
________________________________________
manifest.yml
This file contains information that's used when you cf push the application.
See the Cloud Foundry doc Deploying with Application Manifests for more information.
________________________________________
package.json
Standard package.json file for node packages. You will need this file for two reasons:
•	identify your node package dependencies during npm install
•	identify to BlueMix that this directory contains a node.js application
See the npm doc package.json for more information.
________________________________________

README.md
This file!

