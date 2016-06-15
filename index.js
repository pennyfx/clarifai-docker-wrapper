var express = require('express'),
  http = require('http'),
  request = require('request'),
  url = require('url');

// Retrieve access keys from ENV variables
var clientId = process.env.CLIENT_ID,
  clientSecret = process.env.CLIENT_SECRET,
  port = process.env.PORT ? Number(process.env.PORT) : 7313;

if (!clientId || !clientSecret){
  console.log("CLIENT_ID and CLIENT_SECRET env variables are required");
  process.exit();
}

var baseUrl = "https://api.clarifai.com/v1";

var app = express();
app.set('port', port);

app.all('*', function(req,res){
  sendAPIRequest(req, function(err, data){
    if (err){
      res.status(400).send(err);
    } else {
      res.send(data);
    }
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Clarify API running on port ' + app.get('port'));
});

function sendAPIRequest(req, done){
  var verb = req.method,
    reqUrl = req.url,
    parsedUrl = url.parse(baseUrl + reqUrl);

  var handleResponse = function(err, res, body){
    if (err){
      console.log('error in response', err);
      return done(err);
    }
    normalizeResponse(parsedUrl.pathname, body, done);
  }

  getToken(function(err, token){
    if (err){
      return done('unable to get token' + err);
    }
    if (verb == 'POST'){
      req.pipe(request.post({
        url: baseUrl + reqUrl,
        json: true,
        headers: {
          Authorization: 'Bearer ' + token.access_token
        }
      }, handleResponse));
    }
    else if (verb == 'GET'){
      request.get({
        url: baseUrl + reqUrl,
        json: true,
        headers: {
          Authorization: 'Bearer ' + token.access_token
        },
      }, handleResponse)
    } else {
      done('unhandled verb:'+ verb);
    }
  });
}

function getToken(cb){
  if (typeof app.get('token') !== 'undefined' && app.get('token').expireTime > new Date().getTime()){
    cb(null, app.get('token'));
  } else {
   request.post({
      url: baseUrl + '/token',
      json: true,
      form: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      }
    }, function(err, res, token){
      if (err) {
        console.log(err)
        cb(err);
      } else {
        setExpireTime(token);
        app.set('token', token);
        cb(null,token);
      }
    })
  }
}

function normalizeResponse(path, body, done){
  if (!body || !body.results){
    return done('no results from API');
  }
  // each API seems to have it's own return format, normalize them
  if (!path.indexOf('/v1/tag')){
    done(null, body.results.map((item)=>{
      return {
        status: item.status_code,
        error: item.result.error || null,
        url: item.url,
        tags: item.result.tag.classes
      }
    }));
  } else if (!path.indexOf('/v1/color')){
    done(null, body.results.map((item)=>{
      return {
        status: item.status_code,
        error: item.error || null,
        url: item.url,
        colors: item.colors
      }
    }));
  } else {
    console.log('handle this type', body);
    done(null, body);
  }
}

function setExpireTime(token) {
  var now = new Date().getTime();
  token.expireTime = now + (token.expires_in * 1000);
}