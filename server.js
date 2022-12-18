const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;
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
    res.sendFile(__dirname + '/write.html')
});

app.get('/pet', function(req,res){
    res.send('펫용품 쇼핑 페이지 입니다.')
});

app.post('/add', (req,res) => {
    res.send('전송완료');

    console.log(req.body.title)
    
    db.collection('post').insertOne({title : req.body.title, date : req.body.date}, function(err, res){
        console.log('collection post 저장완료');
    });

});

// list요청시 해당 html 보여줌
app.get('/list', (req, res) => {
    db.collection('post').find().toArray((err, data)=>{
        console.log(data);
        res.render('list.ejs', {posts : data});
    });
});