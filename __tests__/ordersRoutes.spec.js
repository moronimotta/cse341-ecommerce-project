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
        })
    })
})
