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
    describe('GET /store/id', () => {
        it('Shoud return all products by STORE id', async () => {
             // const prod1 = {_id: "1", name: "Updated Product Name", stock: 150, description: "Updated Product Description", brand: "Updated Brand Name", price: 100, category: "Updated Category Name"};
            const storeID = '123abc';
            prodController.getAllProductsByStoreId.mockImplementation((req,res) => {
                res.status(200).send(`All Products by Store ID: ${req.params.id}`);
            })
            // const response = await request(app).get('/products/1');
            const response = await request(app).get(`/store/${storeID}`);
                
            expect(response.status).toBe(200);
            expect(response.text).toBe(`All Products by Store ID: ${storeID}`);
            expect(prodController.getAllProductsByStoreId).toHaveBeenCalled();
            
        })
    })
    describe('GET /store/low-stock/id', () => {
        it('Shoud return products with low-Stock', async () => {
             // const prod1 = {_id: "1", name: "Updated Product Name", stock: 150, description: "Updated Product Description", brand: "Updated Brand Name", price: 100, category: "Updated Category Name"};
            const storeID = '123abc';
            prodController.getLowStock.mockImplementation((req,res) => {
                res.status(200).send(`Products with Low Stock: ${req.params.id}`);
            })
            // const response = await request(app).get('/products/1');
            const response = await request(app).get(`/store/low-stock/${storeID}`);
                
            expect(response.status).toBe(200);
            expect(response.text).toBe(`Products with Low Stock: ${storeID}`);
            expect(prodController.getAllProductsByStoreId).toHaveBeenCalled();
            
        })
    })
})
