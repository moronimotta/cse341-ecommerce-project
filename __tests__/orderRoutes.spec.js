const express = require('express');
const request = require('supertest');
const orderRoutes = require('../routes/orders');
const orderController = require('../controllers/orders')

const app =  express();
app.use(express.json());
app.use('/', orderRoutes);

jest.mock('../controllers/orders')

describe('Order API endpoints', ()=>{
    describe('GET / ', () => {
        it('Should return all orders', async ()=> {
            // const orders = [
            //     {_id: "1", user_id: "132", amount: 100, status: "any", date: "any", cart_id: "any"},
            //     {_id: "2", user_id: "234", amount: 100, status: "any", date: "any", cart_id: "any"}

            // ];
            orderController.getAllOrders.mockImplementation((req,res) => {
                res.status(200).send('All Orders');
            })

            const response = await request(app).get('/');
            
            expect(response.status).toBe(200);
            expect(response.text).toEqual('All Orders');
            // expect(response.body).toEqual(orders);
        });
        
    });

    describe('GET /order_id', () => {
        it('Shoud return a single order by id', async () => {
            // const order = {user_id: "1", amount: 100, status: "any", date: "any", cart_id: "any"};
            
            const orderID = 'abcde';
            orderController.getSingleOrder.mockImplementation((req,res) => {
                res.status(200).send(`Order ID: ${req.params.order_id}`);
            })

            const response = await request(app).get(`/${orderID}`);
            
            expect(response.status).toBe(200);
            expect(response.text).toEqual(`Order ID: ${orderID}`)
            expect(orderController.getSingleOrder).toHaveBeenCalled();
            // expect(response.body).toEqual(order);
        });
    });

    describe('GET /orders/store/:id', () => {
        it('Should return all orders by STORE id', async ()=> {
            
            const storeID = '123456'
            orderController.getAllOrdersByStoreId.mockImplementation ((req,res)=> {
                res.status(200).send(`Order by StoreID: ${req.params.id}`);

            });
            const response = await request(app).get(`/store/${storeID}`);

            expect(response.status).toBe(200);
            expect(response.text).toEqual(`Order by StoreID: ${storeID}`);
        })
    })

    describe('GET /orders/user/:id', () => {
        it('Should return all orders by USER id', async ()=> {
            
            const userID = '123abc'
            orderController.getAllOrdersByUserId.mockImplementation ((req,res)=> {
                res.status(200).send(`Order by UserID: ${req.params.user_id}`);

            });
            const response = await request(app).get(`/user/${userID}`);

            expect(response.status).toBe(200);
            expect(response.text).toEqual(`Order by UserID: ${userID}`);
        })
    })
})