const express = require('express')
const request = require('postman-request')

const app = express()
app.use(express.json())

// Admin flag is used to authenticate if the user logged in is an Admin
let admin = false

app.post('/users/login', async(req, res) => {
    setUpAdmin(req.body.admin === 'true' ? true : false)            
    if(admin) {
        res.status(200).send('Admin logged in!')
    }else {
        res.status(200).send('User loged in is not an Admin!')
    }            
})

app.post('/users/logout', async(req, res) => {    
    if(admin) {
        setUpAdmin(false)
    }
    res.status(200).send('Admin logged out!')
})

app.get('/posts/:id', async(req, res) => {
    const user_id = req.params.id    
    
    if(admin) {                       
        await getPosts(user_id, (error, posts) => {
            if(error) {
                return res.send({error})
            }
            // const data = posts.filter(d => d.userId === parseInt(user_id))
            res.status(200).send(posts)
        })        
    }else {
        res.status(401).send({
            error:'Authorization failed!'
        })
    }    
})

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

app.get('/users/:id', async(req, res) => {    
    const user_id = req.params.id
    if(isNaN(user_id)) {
        return res.send({
            error: 'Please enter a valid User ID.'
        })
    }

    if(admin) {                
        await getUsers(user_id, (error, data) => {
            if(error) {
                return res.send({error})
            }else if(data.length === 0) {
                return res.status(200).send({
                    error: 'User not available! Please select a different User ID.'
                })
            }
            
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

const getUsers = (user_id, callback) => {
    const url = 'https://jsonplaceholder.typicode.com/users'

    request({ url, json: true}, (error, { body}) => {
        if(error){  
            callback('Unable to connect to users data')
        } else if(body.length === 0) {
            callback('Unable to find users') 
        }else {
            const userData = user_id === undefined ? body : body.filter(d => d.id === parseInt(user_id))
            callback(undefined, userData)
        }
    })
}

const getPosts = (user_id, callback) => {
    const url = 'https://jsonplaceholder.typicode.com/posts/'
    
    request({ url, json: true}, (error, { body}) => {
        if(error){    
            callback('Unable to connect to posts data')
        } else if(body.length === 0) {
            callback('Unable to find posts')
        }else {
            const posts = body.filter(d => d.userId === parseInt(user_id))    
            callback(undefined, posts)
        }
    })
}

const setUpAdmin = (flag) => {
    admin = flag    
}

module.exports = { app, setUpAdmin}