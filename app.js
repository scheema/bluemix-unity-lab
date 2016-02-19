/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*eslint-env node */
'use strict';

var express      = require('express'),
  app            = express(),
  watson         = require('watson-developer-cloud'),
  methodOverride = require('method-override'),
  extend         = require('util')._extend,
  passport       = require('passport'),
  cookieParser   = require('cookie-parser'),
  session        = require('express-session'),
  i18n           = require('i18next');

app.use(methodOverride());
app.use(cookieParser());
app.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'keyboard cat'}));
app.use(passport.initialize());
app.use(passport.session()); 
  
var cloudant;
var dbCredentials = {};

//i18n settings
require('./config/i18n')(app);

// Bootstrap application settings
require('./config/express')(app);

function initDBConnection() {	
	if(process.env.VCAP_SERVICES) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		if(vcapServices.cloudantNoSQLDB) {
			dbCredentials.host = vcapServices.cloudantNoSQLDB[0].credentials.host;
			dbCredentials.port = vcapServices.cloudantNoSQLDB[0].credentials.port;
			dbCredentials.user = vcapServices.cloudantNoSQLDB[0].credentials.username;
			dbCredentials.password = vcapServices.cloudantNoSQLDB[0].credentials.password;
			dbCredentials.url = vcapServices.cloudantNoSQLDB[0].credentials.url;

			cloudant = require('cloudant')(dbCredentials.url);			
		} else {
			console.warn('Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
		}
	} else{
		console.warn('VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
	}
}

initDBConnection();

/* SINGLE SIGN ON */
passport.serializeUser(function(user, done) {
   done(null, user);
}); 

passport.deserializeUser(function(obj, done) {
   done(null, obj);
});

var services = JSON.parse(process.env.VCAP_SERVICES || "{}");


//passport.use(Strategy); 
//app.get('/api/single_sign_on/authenticate', passport.authenticate('openidconnect', {}));

app.get('/auth/sso/callback', function(req,res,next) {
  var redirect_url = req.session.originalUrl;                
  passport.authenticate('openidconnect', {
    successRedirect: '/success',                                
    failureRedirect: '/failure',                        
  })(req,res,next);
});

app.get('/success', ensureAuthenticated, function(req, res) {
  res.send(req.query.code);
});

app.get('/failure', ensureAuthenticated, function(req, res) { 
  res.send('login failed');
});

app.get('/', ensureAuthenticated, function(req, res) {
  res.redirect('/hello');
});

app.get('/hello', ensureAuthenticated, function(req, res) {
  res.send('Hello Buddy!');
});

function ensureAuthenticated(req, res, next) {
  if (!req.isAuthenticated())
    res.redirect('/sso/login');
  else
    return next();
}

/* PERSONALITY INSIGHTS */
app.post('/api/personality_insights/profile', function(req, res, next) {  
  // Create the service wrapper
  var personalityInsights = watson.personality_insights({
    version: 'v2',
    username: '<username>',
    password: '<password>'
  });
  	
  var parameters = extend(req.body, { acceptLanguage : i18n.lng() });
  	
  personalityInsights.profile(parameters, function(err, profile) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
  if (err)
    return next(err);
  else
    return res.json(profile);
  });
});

/* TRADEOFF ANALYTICS */
app.post('/api/tradeoff_analytics/dilemmas', function(req, res, next) {  
  // Create the service wrapper
  var tradeoff_analytics = watson.tradeoff_analytics({
    username: '<username>',
    password: '<password>',
    version: 'v1'
  });
  	
  tradeoff_analytics.dilemmas(JSON.parse(req.body.problem), function(err, dilemma) {
    if (err)
      return next(err);
    else
      return res.json(dilemma);
  });
});

/* CLOUDANT */
app.put('/api/cloudant/create_database', function(req, res, next) {   
  cloudant.db.create(req.body.dbName, function(err, data) {
  	if (err)
      return next(err);
    else
      return res.json(data);    
  });
});

app.get('/api/cloudant/read_database', function(req, res, next) {   
  cloudant.db.get(req.query.dbName, function(err, data) {
  	if (err)
      return next(err);
    else
      return res.json(data);    
  });
});

app.get('/api/cloudant/get_databases', function(req, res, next) {   
  cloudant.db.list(function(err, data) {
    if (err)
      return next(err);
    else
      return res.json(data);    
  });
});

app.get('/api/cloudant/get_documents_in_database', function(req, res, next) {   
  var db = cloudant.db.use(req.query.dbName);
  db.list(function(err, data) {
    if (err)
      return next(err);
    else
      return res.json(data);    
  });
});

app.get('/api/cloudant/get_changes_in_database', function(req, res, next) {   
  cloudant.db.changes(req.query.dbName, function(err, data) {
    if (err)
      return next(err);
    else
      return res.json(data);    
  });
});

app.delete('/api/cloudant/delete_database', function(req, res, next) {
  cloudant.db.destroy(req.body.dbName, function(err, data) {
  if (err)
    return next(err);
  else
    return res.json(data);
  });
});

app.post('/api/cloudant/create_document', function(req, res, next) {   
  var db = cloudant.db.use(req.body.dbName);
  
  db.insert(JSON.parse(req.body.jsonDocument), function(err, data) {
  	if (err)
      return next(err);
    else
      return res.json(data);    
  });
});

app.get('/api/cloudant/read_document', function(req, res, next) {   
  var db = cloudant.db.use(req.query.dbName);
  
  db.get(req.query.documentID, function(err, data) {
  	if (err)
      return next(err);
    else
      return res.json(data);    
  });
});

app.put('/api/cloudant/update_document', function(req, res, next) {   
  var db = cloudant.db.use(req.body.dbName);
  
  db.insert(JSON.parse(req.body.jsonDocument), function(err, data) {
  	if (err)
      return next(err);
    else
      return res.json(data);    
  });
});

app.delete('/api/cloudant/delete_document', function(req, res, next) {
  var db = cloudant.db.use(req.body.dbName);
  
  db.destroy(req.body.documentID, req.body.documentRev, function(err, data) {
  	if (err)
      return next(err);
    else
      return res.json(data);
  });
});

// error-handler settings
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);