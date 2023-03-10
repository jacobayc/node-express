const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')

var db;
MongoClient.connect('mongodb+srv://admin:1234rewq@cluster0.pdnixo4.mongodb.net/?retryWrites=true&w=majority', function(err, client) {
   
    //연결 성공
    if(err) return console.log(err)
    db = client.db('memoApp');
    app.listen(8080, function(){
        console.log('listening on 8080 with MongoDB')
    });
});

app.get('/', (req,res) => {
    res.render('index.ejs')
});

app.get('/write', function(req,res){
    res.render('write.ejs');
});

app.post('/list', (req,res) => {
    res.redirect('/list')
    console.log(req.body.title)
    db.collection('counter').findOne({name : 'countId'}, (err, response) => {
        console.log(response.totalPost)
        var total = response.totalPost;
        let today = new Date();
        db.collection('post').insertOne({ _id: total+1, title : req.body.title, date : req.body.date, time : today.toLocaleTimeString()}, function(err, res){
            db.collection('counter').updateOne({name:'countId'},{ $inc : {totalPost:1}},(err, res) =>{
                if(err) {return console.log(err)}
            });
        });
    });
});

// list요청시 해당 html 보여줌
app.get('/list', (req, res) => {
    db.collection('post').find().toArray((err, data)=>{
        console.log(data);
        res.render('list.ejs', {posts : data});
    });
});

//search 검색요청
app.get('/search', (req, res) => {
   console.log(req.query.value);
   db.collection('post').find({title : req.query.value}).toArray((err, response)=>{
    console.log(response)
    res.render('search.ejs', {posts : response});
   });
});




app.delete('/delete', (req,res)=>{
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, (err,deleteRes) => {
        console.log('삭제완료');
        res.status(200).send({message : '성공했습니다.'})
    });
});

//  /detail/number 로 접속하면 detail.ejs 보여줌

app.get('/detail/:id', (req,res) => {
    db.collection('post').findOne({_id : parseInt(req.params.id) }, (err, response) => {
        console.log(response);
        res.render('detail.ejs',{ data: response});
    })
});

app.get('/edit/:id', function(req, res){

    db.collection('post').findOne({_id: parseInt(req.params.id)}, function(err, response){
        if(err){console.log(err,"수정대상 글이 존재하지 않습니다.")}
        console.log(response);
        res.render('edit.ejs', {post : response})
        })  
    });

app.put('/edit', function(req, res){
    db.collection('post').updateOne({_id : parseInt(req.body.id)},{ $set : { title : req.body.title, date : req.body.date}}, function(err, response){
        console.log('수정완료')
        res.redirect('/list')
    })
});


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());

//미들웨어 : 요청-응답 중간에 실행되는 코드

app.get('/login', (req, res) => {
    res.render('login.ejs')
});
app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), (req, res) => {
    res.redirect('/')
});

app.get('/mypage',checkLogin, (req, res) =>{
    console.log(req.user);
    res.render('mypage.ejs', {thisUser : req.user})
});

function checkLogin(req, res, next){
    if(req.user){
        next()
    } else {
        res.send('plz login first')
    }
}





passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

  passport.serializeUser(function(user, done){
    done(null, user.id)
  });



  //마이페이지 접속시 session 찾을 때
  passport.deserializeUser(function(id, done){
    //db에서 위의 user.id로 user를 찾은 뒤 유저 정보를 아래 done에 넣어줌  
    db.collection('login').findOne({id : id}, function (err, response){
        done(null, response)
    })
});
