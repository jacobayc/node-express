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
    db.collection('counter').findOne({name : '게시물 갯수'}, (err, res) => {
        console.log(res.totalPost)
        var total = res.totalPost;

        db.collection('post').insertOne({ _id: total+1, title : req.body.title, date : req.body.date}, function(err, res){
            console.log('collection post 저장완료');
            db.collection('counter').updateOne({name:'게시물 갯수'},{ $inc : {totalPost:1}},(err, res) =>{
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


app.delete('/delete', (req,res)=>{
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, (err,deleteRes) => {
        console.log('삭제완료');
        res.status(200).send({message : '성공했습니다.'})
    });
});