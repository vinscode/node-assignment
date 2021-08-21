const request = require('supertest')
const {app, setUpAdmin} = require('../src/app')

/**
 * Below describe block is mainly to test if the user logged in is admin or not
 */
describe('User login', () => {
    //Login as admin
    test('Admin login', async() => {
        await request(app)
        .post('/users/login')
        .send({
            "admin": "true"
        })
        .expect(200)
    })
    
    //Login as non admin
    test('Non admin user login', async() => {
        await request(app)
        .post('/users/login')
        .send({
            "admin": "false"
        })
        .expect(200)
    })

    //Logout
    test('Admin logout', async() => {
        const response = await request(app)
        .post('/users/logout')
        .send()
        .expect(200)
    })
})

/**
 * Below describe block is used to group test cases that returns valid results and expect a response status OK 
 */
describe('Data returned successfull', () => {
    // set admin to true befor executing all the below test cases
    beforeAll(() => {
        return setUpAdmin(true)
    })

    // Test case should return all the available users with status 200
    test('Get all users details available', async() => {
        await request(app)
        .get('/users')    
        .send()
        .expect('Content-Type', /json/)
        .expect(200)
    })
    
    // Test case should return specific user data along with associated posts with status 200
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

    //Test to verify if the user id passed is valid
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

/**
 * Below describe block is used to group test cases that returns authentication error 
 * when a non admin user attempts to fectch data and expect a response status 401  
 */
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