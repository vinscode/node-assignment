const request = require('supertest')
const {app, setUpAdmin} = require('../src/app')

describe('User login', () => {
    test('Admin login', async() => {
        await request(app)
        .post('/users/login')
        .send({
            "admin": "true"
        })
        .expect(200)
    })
    
    test('Non admin user login', async() => {
        await request(app)
        .post('/users/login')
        .send({
            "admin": "false"
        })
        .expect(200)
    })

    test('Admin logout', async() => {
        const response = await request(app)
        .post('/users/logout')
        .send()
        .expect(200)
    })
})

describe('Data returned successfull', () => {
    beforeAll(() => {
        return setUpAdmin(true)
    })

    test('Get all users details available', async() => {
        await request(app)
        .get('/users')    
        .send()
        .expect('Content-Type', /json/)
        .expect(200)
    })
    
    test('Get all users and their assosiated posts', async() => {
        //Generate random user Id's from 1 - 10
        const id = Math.floor(Math.random() * 11)
        const response = await request(app)
        .get('/users/'+id)
        .send()
        .expect('Content-Type', /json/)
        .expect(200)
        
        // verify all posts are related to the same user        
        expect(response.body.posts.forEach(post => post.userId === response.body.data[0].id))                
    })

    test('Get all users and their assosiated posts with invalid id', async() => {        
        const id = 'dummy'
        const response = await request(app)
        .get('/users/'+id)
        .send()
        .expect('Content-Type', /json/)
        .expect(200)
                
        expect(response.body.error).toBe('Please enter a valid User ID.')                
    })
})

describe('Data returned unsuccessfull', () => {
    beforeAll(() => {
        return setUpAdmin(false)
    })

    test('Get all users details available', async() => {
        await request(app)
        .get('/users')    
        .send()
        .expect(401)
    })
    
    test('Get all users and their assosiated posts', async() => {
        const id = Math.floor(Math.random() * 11)
        await request(app)
        .get('/users/'+id)
        .send()
        .expect(401)
    })
})