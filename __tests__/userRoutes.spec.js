const express = require('express');
const app = express();
const userRoutes = require('../routes/users');
const userController = require('../controllers/users');
const request = require('supertest');

app.use(express.json());
app.use('/', userRoutes);
jest.mock('../controllers/users');

describe('Users API endpoints', () => {
    describe('GET / ', () => {
        it('Should return all Users', async()=> {
            userController.getUsers.mockImplementation((req,res)=>{
                res.status(200).send('All Users');
            })
            const response = await request(app).get('/');
            expect(response.status).toBe(200);
            expect(response.text).toEqual('All Users');
        })
    })
    describe('GET /:id ', () => {
        it('Should return a single User', async()=> {
            const userID = '4567';
            // const role = 'admin'
            userController.getUser.mockImplementation((req,res)=>{
                res.status(200).send(`The User is: ${req.params.id}`);
            })
            const response = await request(app).get(`/${userID}`);
            expect(response.status).toBe(200);
            expect(response.text).toEqual(`The User is: ${userID}`);
        })
    })
    describe('GET /store/id', () => {
        it('Shoud return User by STORE id', async () => {
             // const prod1 = {_id: "1", name: "Updated Product Name", stock: 150, description: "Updated Product Description", brand: "Updated Brand Name", price: 100, category: "Updated Category Name"};
            const storeID = '123abc';
            userController.getUsersByStoreId.mockImplementation((req,res) => {
                res.status(200).send(`User by Store ID: ${req.params.id}`);
            })
            // const response = await request(app).get('/products/1');
            const response = await request(app).get(`/store/${storeID}`);
                
            expect(response.status).toBe(200);
            expect(response.text).toBe(`User by Store ID: ${storeID}`);
            expect(userController.getUsersByStoreId).toHaveBeenCalled();
            
        })
    })

})