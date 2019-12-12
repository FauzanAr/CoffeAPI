import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const app = express();
const main = express();

const postsCollection = 'posts';

main.use('/api', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

export const webApi = functions.https.onRequest(main);

interface Post{
    title: String,
    content: String,
    author: String,
    id: String
}

app.post('/posts', async(req, res) => {
    try{
        const post: Post = {
            title: req.body['title'],
            content: req.body['content'],
            author: req.body['author'],
            id: req.body['id']
        }
        const newDoc = await db.collection(postsCollection).add(post);
    } catch(error){
        res.status(400).send('Error there is unfilled variable');
    }
});