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
app.use(bodyParser.urlencoded({ extended: true }));

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





// 質問関連
// 質問作成　OK
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

// 質問一覧取得 OK  質問詳細取得:ダメ
app.get('/question', (req, res) => {
    client.query('SELECT * FROM questions', 
    (error, results) =>  {
        res.render(pathString + "questions.ejs", {question_info: results})
        console.log(results)
    })
})



// 回答関連
// 回答作成 OK
app.post('/answer', (req, res) => {
    const answer_uuid = uuidv4()
    const image_uuid = uuidv4()
    const{user_id, question_id, text:answer_detail, image:image_url} = req.body
    // console.log(req.body)
    client.query('INSERT INTO answers (id, question_id, user_id, answer_detail, is_best_answer, created_date, updated_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [answer_uuid, question_id, user_id, answer_detail, false, today, today])
    client.query('INSERT INTO image (id, relation_id, image_url, created_date, updated_date) VALUES ($1, $2, $3, $4, $5)', 
        [image_uuid, answer_uuid, image_url, today, today])
    res.render(pathString + 'index.ejs');
})





// ユーザー関連
// ユーザー作成 OK
app.post('/user',(req, res) => {
    console.log(req.params)
    const user_uuid = uuidv4()
    const image_uuid = uuidv4()
    const {user_id : firebase_user_id,  user_name, user_image : image_url} = req.body
    client.query('INSERT INTO users (id, firebase_user_id, user_name, self_introduction, created_date, updated_date) VALUES ($1, $2,$3,$4,$5,$6)', [user_uuid, firebase_user_id, user_name, null, today, today])
    client.query('INSERT INTO image(id, relation_id, image_url, created_date, updated_date) VALUES ($1, $2, $3, $4, $5)', [image_uuid, firebase_user_id, image_url, today, today])
    res.render(pathString + 'users.ejs');

    })

// ユーザー取得 OK
app.get('/user', (req, res) => {
    client.query('SELECT * FROM users',
    (error, results) => {
        res.render(pathString + 'users.ejs', {user_info: results})
        console.log(results)
    })
})

// ユーザー更新



// ユーザー削除
app.delete("/user/", (req, res) => {
    const {user_id : id} = req.body
    // console.log(req.params.id)
    // console.log(`DELETE FROM users WHERE id = ${id}`)
    client.query(`DELETE FROM users WHERE id = '${id}'`,
    (error, result) => {
        res.render(pathString + 'index.ejs')
    })

})










app.listen(port);
console.log('listen on port ' + port);
