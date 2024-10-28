const express = require('express');
const request = require('supertest');
const userController= require('../controllers/users');
const userRoute = require('../routes/users');

const app = express();
app.use (express.json());
app.use ('/', userRoute);

jest.mock('../controllers/users');


describe('User API endpoints', () => {
    describe('GET / ', () => {
        it('Should return a single User', async () => {
            const userID = '671d3d88312b9b36be4ccbcf';
            userController.getUser.mockImplementation((req, res) => {
              res.status(200).send(`User ID: ${req.params.id}`);
            });
          
            const agent = request.agent(app);
            await agent
              .get('/')
              .set('Cookie', ['session=mockSession'])
              .set('Authorization', 'Bearer token')
              .then((res) => {
                res.req.session = {
                  user: {
                    role: 'admin',
                    _id: userID,
                  },
                };
              });
          
            const response = await request(app).get(`/${userID}`);
            expect(response.status).toBe(200);
            expect(response.text).toEqual(`User ID: ${userID}`);
            expect(userController.getUser).toHaveBeenCalled();
          }, 10000); // Set timeout to 10 seconds
          
    })
})


// {
//     "_id": {
//       "$oid": "671d3d88312b9b36be4ccbcf"
//     },
//     "name": "John",
//     "last_name": "Doe",
//     "email": "admin@admin.com",
//     "password": "byui",
//     "role": "admin",
//     "active": true
//   }