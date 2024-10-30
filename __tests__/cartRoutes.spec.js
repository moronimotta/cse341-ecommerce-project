const express = require('express');
const request = require('supertest');
const cartController= require('../controllers/cart');
const cartRoute = require('../routes/cart');

const app = express();
app.use (express.json());
app.use ('/', cartRoute);

jest.mock('../controllers/cart');


describe('Cart API endpoints', () => {
    describe('GET /', () => {
        it('Shoud return all Cart', async ()=> {
            cartController.getAllCarts.mockImplementation((req,res)=> {
                res.status(200).send('All Cart');
            });
            const response = await request(app).get('/');
            expect(response.status).toBe(200);
            expect(response.text).toEqual('All Cart');
        })
    })
    describe('GET /cart:id ', () => {
        it('Should return a single Cart', async () => {
            const cartID = '12abc'
            cartController.getCartById.mockImplementation((req,res)=> {
                res.status(200).send(`Cart ID: ${req.params.cart_id}`);
            })

            const response = await request(app).get(`/${cartID}`);
            expect(response.status).toBe(200);
            expect(response.text).toEqual(`Cart ID: ${cartID}`);
            expect(cartController.getCartById).toHaveBeenCalled();
        })
    })
})