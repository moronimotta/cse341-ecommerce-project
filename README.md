# E-commerce Project

## Table of Contents
Introduction
Features
Installation
Usage
API Endpoints
Dependencies
Project Structure
Contributions
License

## Introduction
This is an e-commerce project developed as part of the CSE341 course at BYU for Fall 2024. The application will manage the relationship between clients, products, and orders, providing an accessible way for managers to check their stock and assist with the orders made by the customers

## Features
User Management: Register, login, and manage different user roles (e.g,,customer, admin).
Product Management: Create, update, delete and view products
Order Management: Allow customers to create orders and managers to view and manage thoseorders.
Cart management: Allow customers to select products and view with a total in cart.
Store management: Register new stores, update and delete. 

## Instalation
1- Clone the repository
git clone [https//github.com/](https://github.com/moronimotta/cse341-ecommerce-project)

2- cd e-commerce-project

3- Install the depedencies
npm install

4- Set up envoroment variables in a .env file
MONGODB_URI 
MONGODB_DB 
PORT= 3000
ENV= developoment

AUTH= true

GITHUB_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_URL

5- Run the aplication
npm start

## Usage
Homepage: Access the homepage at http://localhost:3000
User Authentication: Register and log in to manage orders and view past purchases.
Manager Dashboard: Managers can access a dashboard to manage products, view orders, and monitor inventory levels


## API Endpoints
POST /login - User login.
POST /register - New user registration.


## Products
GET /products - Fetch all products.
POST /products - Add a new product (Managers only).
PUT /products/
- Update a product.
DELETE /products/
- Delete a product.

## Dependencies
"cors": 
"dotenv": 
"ejs": 
"express": 
"express-session": 
"express-validator": 
"http-errors": 
"mongoose": 
"nodemon": 
"passport":
"passport-github": 
"swagger-autogen": 
"swagger-ui-express":
"uuid":
"validatorjs":
"devDependencies"
"jest": 
"supertest": 


