var application_root = __dirname,
    express = require("express"),
	mysql = require('mysql');
    path = require("path");
var passport = require('passport')
 LocalStrategy = require('passport-local').Strategy;

var app = express();

// Database

var connection = mysql.createConnection({
host : 'localhost',
user : 'root',
password : '',
database: "user"
});

// Config

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "/")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
*/
//Register
app.post('/insertuser', function (req, res){
  console.log("POST: ");
  username = req.body.user;
  password=req.body.user;
  fullname = req.body.user;
  email = req.body.user;
  sex = req.body.user;
  city = req.body.user;
  connection.query('insert into users ( username ,password,fullname , email , sex , city ) values (' + '"' + username +'"' +',' + '"'+password + '"' + ',' + '"' + fullname +'"'+','+'"'+email+'"' + ',' + '"' + sex +'"' +','  + '"' + city +'"' +');', function (error, rows, fields) { 
		//console.log(error);
         res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end( 'record inserted...');
		      }); 
});

/*/Login
app.post('/login',passport.authenticate('local', { 
	                               successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);
*/
//Constituency Information
app.get('/state/:sid', function (req, res) {
         
         connection.query('CALL `states` ('+req.params.sid+')'+';', function (error, rows, fields) { 
         res.writeHead(200, {'Content-Type': 'text/plain'});
		 str='';
		 if(rows==null)
		 	console.log('No record found');
		 else{
		 for(i=0;i<rows.length;i++)
			str = str + rows[i].name + rows[i].current_mp + rows[i].current_party +'\n';
		 res.end( str);
		}
      }); 
});

app.get('/state1', function (req, res) {
         
         connection.query('CALL `states` (1);', function (error, rows, fields) { 
         res.writeHead(200, {'Content-Type': 'text/plain'});
     str='';
     if(rows==null)
      console.log('No record found');
     else{
     for(i=0;i<rows.length;i++)
      str = str + rows[i].name + rows[i].current_mp + rows[i].current_party +'\n';
     res.end( str);
    }
      }); 
});

app.get('/users/:username', function (req, res){
	connection.query('SELECT * FROM users where username ='+'"'+req.params.username+'"'+';', function (error, rows, fields) { 
         res.writeHead(200, {'Content-Type': 'text/plain'});
		 str='';
		 if(rows==null)
		 {
			res.end( 'no such record found...');
			//break;
		 }
		 else
		 {
			str = str + 'User is '+ rows[0].username +'\n';
			console.log(str);
			res.end( str);
		}
      }); 
});

// Launch server

app.listen(1212);
console.log('Server running at http://127.0.0.1:1212');