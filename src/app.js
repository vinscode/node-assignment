const express = require('express')
const request = require('postman-request')

const app = express()
app.use(express.json())

// Admin flag is used to authenticate if the user logged in is an Admin
let admin = false

app.get('', (req, res) => {
    res.send('Welcome to Blog app!')
})

//End point for user login - setting admin flag to true to pretend user logged in has admin rights
app.post('/user/login', async(req, res) => {
    setUpAdmin(req.body.admin === 'true' ? true : false)            
    if(admin) {
        res.status(200).send('Admin logged in!')
    }else {
        res.status(200).send('User loged in is not an Admin!')
    }            
})

//End point to user logout - setting admin flag to false
app.post('/user/logout', async(req, res) => {    
    if(admin) {
        setUpAdmin(false)
    }
    res.status(200).send('User logged out!')
})

//End point to get all users 
app.get('/users', async(req, res) => {
    
    if(admin) {    
        await getUsers(undefined, (error, data) => {
            if(error) {
                return res.send({error})
            }            
            res.send({data})
        })
    } else {
        res.status(401).send({
            error:'Authorization failed!'
        })
    }
})

//End point to get specific user with all associated posts
app.get('/users/:id', async(req, res) => {    
    const user_id = req.params.id
    // check the id entered is a number
    if(isNaN(user_id)) {
        return res.send({
            error: 'Please enter a valid User ID.'
        })
    }

    if(admin) {                
        // Use API to fetch all the users
        await getUsers(user_id, (error, data) => {
            if(error) {
                return res.send({error})
            }else if(data.length === 0) {
                return res.status(200).send({
                    error: 'User not available! Please select a different User ID.'
                })
            }
            
            // Use posts to fetch all the users
            getPosts(user_id, (error, posts) => {                
                if(error) {
                    return res.send({error})
                } else if(posts.length === 0) {
                    posts.push('User has no posts at the moment.')
                    res.status(200).send({data, posts})
                }else {
                    res.status(200).send({data, posts})
                }                                                                        
            })                        
        })        
    }else {
        res.status(401).send({
            error:'Authorization failed!'
        })
    }    
})

/**
 * Function to get user data. callback return either error or data
 * @param {*} user_id 
 * @param {*} callback 
 */
const getUsers = (user_id, callback) => {
    const url = 'https://jsonplaceholder.typicode.com/users'
    
    //request above API to fetch all the users
    request({ url, json: true}, (error, { body}) => {
        if(error){  
            callback('Unable to connect to users data')
        } else if(body.length === 0) {
            callback('Unable to find users') 
        }else {
            //If the userID is not provided, return all user data. else, return specific user data
            const userData = user_id === undefined ? body : body.filter(d => d.id === parseInt(user_id))
            callback(undefined, userData)
        }
    })
}

/**
 * Function to get posts data. callback return either error or data
 * @param {*} user_id 
 * @param {*} callback 
 */
const getPosts = (user_id, callback) => {
    const url = 'https://jsonplaceholder.typicode.com/posts/'
    
    //request above API to fetch specific user posts
    request({ url, json: true}, (error, { body}) => {
        if(error){    
            callback('Unable to connect to posts data')
        } else if(body.length === 0) {
            callback('Unable to find posts')
        }else {
            // return all the posts that have same userId
            const posts = body.filter(d => d.userId === parseInt(user_id))    
            callback(undefined, posts)
        }
    })
}

/**
 * Fuction to set admin flag and is also used Jest test file
 * @param {boolean} flag 
 */
const setUpAdmin = (flag) => {
    admin = flag    
}

module.exports = { app, setUpAdmin}