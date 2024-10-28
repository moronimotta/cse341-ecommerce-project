const express = require('express');
const request = require('supertest');
const prodRoutes = require('../routes/products');
const prodController = require('../controllers/products') 

const app =  express();
app.use(express.json());
app.use('/', prodRoutes);

jest.mock('../controllers/products') 

describe('Products API endpoints', ()=>{
    describe('GET / ', () => {
        it('Should return all products', async ()=> {
            // const prod = [
            //     {_id: "1", name: "Updated Product Name", stock: 150, description: "Updated Product Description", brand: "Updated Brand Name", price: 100, category: "Updated Category Name"},
            //     {_id: "2", name: "Updated Product Name", stock: 150, description: "Updated Product Description", brand: "Updated Brand Name", price: 100, category: "Updated Category Name"}
            // ];
            
            prodController.getAllProd.mockImplementation((req,res) => {
                res.status(200).send('All Products');
            })

            const response = await request(app).get('/');
             

            expect(response.status).toBe(200);
            expect(response.text).toEqual('All Products');
            // expect(response.body).toEqual({message: "List of products"});
        });
        
    });

    describe('GET /product_id', () => {
        it('Shoud return a single product by id', async () => {
            
            // const prod1 = {_id: "1", name: "Updated Product Name", stock: 150, description: "Updated Product Description", brand: "Updated Brand Name", price: 100, category: "Updated Category Name"};
            const prodID = '12345';
            prodController.getSingleProd.mockImplementation((req,res) => {
                res.status(200).send(`Product ID: ${req.params.product_id}`);
            })
            // const response = await request(app).get('/products/1');
            const response = await request(app).get(`/${prodID}`);
                
            
            expect(response.status).toBe(200);
            expect(response.text).toBe(`Product ID: ${prodID}`);
            expect(prodController.getSingleProd).toHaveBeenCalled();
            // expect(response.body).toEqual(prod1);
        })
    })
})