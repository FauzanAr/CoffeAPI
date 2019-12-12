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

//Post method
app.post('/posts', async(req, res) => {
    try{
        const post: Post = {
            title: req.body['title'],
            content: req.body['content'],
            author: req.body['author'],
            id: req.body['id']
        }
        const newDoc = await db.collection(postsCollection).add(post);
        res.status(200).send(`Create new ${newDoc.id}`);
    } catch(error){
        res.status(400).send('Error there is unfilled variable');
    }
});

//Get all posts
app.get('/posts', async(req,res) => {
    try{
        const userQuerySnapshot = await db.collection(postsCollection).get();
        const posts: any[] = [];

        userQuerySnapshot.forEach((doc) => {
            posts.push({
                id: doc.id,
                data: doc.data()
            });
        });
        res.status(200).json(posts);
    } catch (error){
        res.status(500).send(error);
    }
})

//Get single posts
app.get('/posts/:postId',(req,res) => {
    const postId = req.params.postId;
    db.collection(postsCollection).doc(postId).get().then(post => {
        if(!post.exists) throw new Error('Post not found');
        res.status(200).json({
            id:post.id, 
            data: post.data()
        })
    }).catch(error => res.status(500).send(error));
})

//Delete post
app.delete('/posts/:postId', (req, res) => {
    db.collection(postsCollection).doc(req.params.postId).delete().then( () => res.status(204).send("Post successfully deleted!")).catch(function (error){
        res.status(500).send(error);
    })
})

//Update post
app.put('/post/:postId', async (req, res) => {
    await db.collection(postsCollection).doc(req.params.postId).set(req.body,{merge:true}).then(() => res.json({id:req.params.userId})).catch((error) => res.status(500).send(error));
})