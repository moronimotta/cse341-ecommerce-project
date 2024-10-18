const mongodb = require('../data/database');
const ObjectId = require ('mongodb').ObjectId;


//--------------------------------------------
//--FUNCTION TO GET ALL PRODUCTS
//--------------------------------------------

const getAllProd = async (req, res, next) => {
    // swagger.tags = ['Retro Consoles'];
    try{
      const result = await mongodb
          .getDb()
          .collection('products')
          .find();
        result.toArray().then((lists) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(lists);
      });
    }catch (err) {
      res.status(500).json({message: err.message});
    }
  };


  //------------------------------------
//--FUNCTION TO GET A SINGLE PRODUCT
//------------------------------------
const getSingleProd = async (req, res, next) => {
    try{
      const prodId = new ObjectId(req.params.id);
      const result = await mongodb
            .getDb()
             
            .collection('products')
            .find({ _id: prodId });
        result.toArray().then((lists) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(lists[0]);
      });
    }catch(err) {
      res.status(500).json(err);
  }
  };


  //----------------------------------------
//--Function to CREATE A NEW CONSOLE DOCUMENT
//----------------------------------------
const createProd= async (req,res)=>{
    // const productBody = {
    //     name: req.body.name,
    //     stock: req.body.name,
    //     description: req.body.description,
    //     updated_at: req.body.updated_at,
    //     brand: req.body.brand,
    //     category: req.body.category
    //   };
    const result = await mongodb
      .getDb()
        
      .collection('products')
      .insertOne(req.body);
      if (result.acknowledged) {
        res.status(201).json(result);
      }else {
        res.status(500).json(result.error || "Error while Creating");
      }
  
  };


  //-------------------------------------------
//--FUNCTION TO UPDATE PRODUCT
//-------------------------------------------

const updateProd= async (req,res)=>{
    const prodId = new ObjectId(req.params.id);
    const input = req.body;

    const result = await mongodb
      .getDb()
      .collection('products')
      .updateOne({_id: prodId}, {$set: input});
      console.log(result);
      if (result.modifiedCount > 0 ){
        res.status(204).send();
      }else {
        res.status(500).json(result.error || "Error while Updating");
      }
  };

  //----------------------------------------
//--Function to Delete Product Document
//----------------------------------------
const deleteProd= async(req,res)=>{
    const prodId = new ObjectId(req.params.id);
    const result = await mongodb
      .getDb()
        
      .collection('products')
      .deleteOne({_id:prodId});
    //   console.log(result);
      if (result.deletedCount > 0) {
        res.status(204).send();
      }else {
        res.status(500).json(result.error || 'Error while deleting');
      }
  };

  module.exports = {
    getAllProd,
    getSingleProd,
    updateProd,
    createProd,
    deleteProd
  }