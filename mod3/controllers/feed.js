const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    try {
    totalItems = await Post.find().countDocuments()
    const posts = await Post.find().skip((currentPage - 1) * perPage)
                .limit(perPage);

    res.status(200).json({
        message:'Fetched post successfully!', posts: posts, 
        totalItems: totalItems
    })
    }
    catch(err){
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err)                      // As it's inside async code, throwing of error won't work
    }
};
exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('validation Failed, data is incorrect!');
        error.statusCode = 422;
        throw error;
    }
    if ( !req.file ){
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }
    let creator;
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId, 
    })
    post.save()
        .then(result => {
            console.log(result)
            return User.findById(req.userId);
        }).then(user => {
            creator = user;
            user.posts.push(post);
            return user.save()
        })
        .then(() => {
            res.status(201).json({
                message: 'Post created successfully!!',
                post: post,
                creator: {_id: creator._id, name: creator.name}
            });
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            next(err)                      // As it's inside async code, throwing of error won't work
        });
    
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post!');
                error.statusCode = 404;
                throw error;                        // Will be caught by catch and forwarded using next to express middleware handling it
            }
            res.status(200).json({
                message: 'Post fetched.', post: post
            });
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            next(err)                      // As it's inside async code, throwing of error won't work
        })
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    let imageUrl = req.body.image;
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('validation Failed, data is incorrect!');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
   if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl){
        const error = new Error('No file picked!');
        error.stausCode = 422;
        throw error;

    }
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post!');
                error.statusCode = 404;
                throw error;                        // Will be caught by catch and forwarded using next to express middleware handling it
            }
            if (post.creator.toString() !== req.userId) {
                const error = new error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }
            if (imageUrl !== post.imageUrl){       //if photo is updated, delete older one
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content; 
            return post.save();
       })
        .then(result => {
            res.status(200).json({message: 'Post updated!', post: result});
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            next(err)                      // As it's inside async code, throwing of error won't work
        })
}
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}


exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post!');
                error.statusCode = 404;
                throw error;                        // Will be caught by catch and forwarded using next to express middleware handling it
            }
            if (post.creator.toString() !== req.userId) {
                const error = new error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }
            // Check logged in user
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(result => {
            return User.findById(req.userId);
        }).then(user => {
            user.posts.pull(postId);       // mongo feature to remove element from array
            return user.save();
        }).then(() => {
             res.status(200).json({message: 'Deleted Post'})
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            next(err)                      // As it's inside async code, throwing of error won't work
        })
}