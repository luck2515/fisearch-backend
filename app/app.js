const { v4: uuidv4 } = require('uuid');
const today = new Date()
var path = require('path')
var multer = require("multer")
var pathString = "/Users/Pillow545/Desktop/projects/fisearch/app/views/";
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

var port = process.env.PORT || 3000; 

app.use(express.urlencoded({extended: false}))

var { Client } = require('pg');
const { ENETUNREACH } = require('constants');
var client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'fisearch',
    port: 15432
})
client.connect()


// ユーザー関連
// ユーザー作成
app.post('/user',(req, res) => {

    const user_uuid = uuidv4()
    const image_uuid = uuidv4()
    const {user_id : firebase_user_id,  user_name, user_image : image_url} = req.body
    client.query('INSERT INTO users (id, firebase_user_id, user_name, self_introduction, created_date, updated_date) VALUES ($1, $2,$3,$4,$5,$6)', [user_uuid, firebase_user_id, user_name, null, today, today])
    client.query('INSERT INTO image(id, relation_id, image_url, created_date, updated_date) VALUES ($1, $2, $3, $4, $5)', [image_uuid, firebase_user_id, image_url, today, today])
    res.render(pathString + 'index.ejs');

    })
     
// 質問関連
app.get('/question/new', (req, res) => {
    res.render(pathString + 'question_new.ejs')
})

app.post('/questionap/', (req, res) => {

    const {user_id,deadline_date} = req.body
    const {text : question_detail} = req.body
    const {category : question_category} = req.body
    const question_uuid = uuidv4(); 
    const {image_list : image_url} = req.body

    client.query('INSERT INTO questions (id, user_id, question_detail, question_category,deadline_date, is_closed, created_date, updated_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [question_uuid, user_id, question_detail, question_category,deadline_date, false, today, today])

    image_url.forEach(image =>{
        const image_uuid = uuidv4()
        client.query("INSERT INTO  image (id, relation_id, image_url, created_date, updated_date) VALUES ($1,$2,$3,$4,$5)", 
            [image_uuid, question_uuid,image , today, today])})

    res.render(pathString + 'index.ejs');
})




app.listen(port);
console.log('listen on port ' + port);
