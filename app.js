var application_root = __dirname,
    express = require("express"),
    mysql = require('mysql'),
    path = require("path"),
    nib = require("nib"),
    passport = require('passport'),
    stylus = require('stylus'),
    LocalStrategy = require('passport-local').Strategy;

var app = express();

// Database
var connection = mysql.createConnection({
host : 'localhost',
user : 'root',
password : '',
database: "user",
multipleStatements : true
});

//NIB and STYLUS
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
// Config
  app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.cookieParser("secret"));
  app.use(express.session({
    secret: 'keyboard cat'
  }));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
  ));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(__dirname + '/public'))
  app.use(app.router);
});


passport.use(new LocalStrategy(
 
    function(username, password, done) {
 
        return check_auth_user(username,password,done);
 
    }
 
    ));


//Register
app.get('/registerview', function (req, res) {
  res.render('register.jade',
  { title : 'Register' }
  );
});
app.post('/insertuser', function (req, res){
  username = req.body.user;
  password=req.body.password;
  fullname = req.body.fullname;
  email = req.body.email;
  sex = req.body.sex;
  city = req.body.city;
  connection.query('insert into users ( username ,password,fullname , email , sex , city ) values (' + '"' + username +'"' +',' + '"'+password + '"' + ',' + '"' + fullname +'"'+','+'"'+email+'"' + ',' + '"' + sex +'"' +','  + '"' + city +'"' +');', function (error, rows, fields) { 
		        res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('recorded');
		      }); 
});

//Login
app.get('/loginview', function (req, res) {
  res.render('login.jade',
  { title : 'Login' }
  );
});

app.post("/login" 
                ,passport.authenticate('local',{
                        successRedirect : "/",
                        failureRedirect : "/loginview",
                })
        );

app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});

function check_auth_user(username,password,done){
    var sql='SELECT * FROM users WHERE username ='+ '"'+ username +'"'+' and password = '+'"'+ password+'";'; 
    connection.query(sql,
        function (err,results,fields) {
 
            if (err) throw err;
 
            if(results.length > 0){
 
                var res=results[0]; 
                //serialize the query result save whole data as session in req.user[] array  
                passport.serializeUser(function(res, done) {
                    done(null,res);
                });
 
                passport.deserializeUser(function(res, done) {
                    done(null,res);
 
                });
                //console.log(JSON.stringify(results));
                //console.log(results[0]['member_id']);
                return done(null, res);
            }
            else
            {
              return done(null, false); 
            }
         });
  }


//Constituency Information
app.get('/state/:sid', function (req, res) {
  var x=req.params.sid;
  var u=req.user.username;
 connection.query('SELECT sname FROM  `state` WHERE sid ='+x+';',function (err,result,field){
   var y=result[0].sname;
  connection.query('select id,name,current_mp,current_party from constituency where constituency.sid='+x+';', function (err,rows,field) {
        res.render('const.jade',
         {
          user : req.user.username,
          uname : u,
          state : y,
          num : '1',
          consid : rows[0].id,
          name : rows[0].name,
          crmp : rows[0].current_mp,
          crpr : rows[0].current_party
         });  
      });
   });
});

app.get('/candidate/:cid',function (req,res){
 var u=req.user.username;
 connection.query('select name from constituency where id='+req.params.cid+';',function (err,result,field){
    connection.query('select cndid,name,age,sex,party_name,category from candidate where cons_id='+req.params.cid+';', function (error,rows,field){
    res.render('candidate.jade',
    {
      user : req.user.username,
      uname : u,
      consname : result[0].name,
      numo : '1',
      nameo : rows[0].name,
      ageo : rows[0].age,
      sexo : rows[0].sex,
      partyo : rows[0].party_name,
      categoryo : rows[0].category,
      numt : '2',
      namet : rows[1].name,
      aget : rows[1].age,
      sext : rows[1].sex,
      partyt : rows[1].party_name,
      categoryt : rows[1].category,
      numh : '3',
      nameh : rows[2].name,
      ageh : rows[2].age,
      sexh : rows[2].sex,
      partyh : rows[2].party_name,
      categoryh : rows[2].category,
      cido : rows[0].cndid,
      cidt : rows[1].cndid,
      cidh : rows[2].cndid
    });
   }); 
  });
});
app.get('/profile/:username', function (req, res){
	connection.query('SELECT * FROM users where username ='+'"'+req.params.username+'"'+';', function (error, rows, fields) { 
       res.render('profile.jade',
       {
        uname : req.params.username,
        user : rows[0].username,
        name : rows[0].fullname,
        sex : rows[0].sex,
        city : rows[0].city,
        email : rows[0].email
       })  
      }); 
});

app.post('/vote/:cid',function (req,res){
  stars=req.body.rate;
  connection.query('insert into poll ( uname , cid, stars ) values (' + '"' + req.user.username +'"' +',' + req.params.cid + ',' + stars +');', function (error, rows, fields) { 
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Vote Registered');
          });
});

app.get('/delete',function (req,res){
 connection.query('delete from users where username="'+req.user.username+'";')
 req.logout();
 res.redirect('/');
});
// Launch server
function loggedIn(req, res){
  if (req.user) {
   var u=req.user.username;
   res.render('index',
  { 
    uname : u,
    user : req.user.username,
    title : 'Home',
    scripts: ['public/js/main.js']
   }
  )

   } 
   else {
    res.redirect('/loginview');
  }
}
app.get('/',loggedIn,function (req, res) {
});
app.listen(1212);
console.log('Server running at http://127.0.0.1:1212');