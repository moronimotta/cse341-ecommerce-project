const express = require('express');
const request = require('supertest');
const storeController= require('../controllers/stores');
const storeRoute = require('../routes/stores');

const app = express();
app.use (express.json());
app.use ('/', storeRoute);

jest.mock('../controllers/stores');


describe('Store API endpoints', () => {
    describe('GET / ', () => {
        it('Should return a single Store', async () => {
            const storeID = 'abc123';
            storeController.getStore.mockImplementation((req,res)=> {
                res.status(200).send(`Store ID: ${req.params.id}`);
            })

            const response = await request(app).get(`/${storeID}`);
            expect(response.status).toBe(200);
            expect(response.text).toEqual(`Store ID: ${storeID}`);
            expect(storeController.getStore).toHaveBeenCalled();
        })
    })
})