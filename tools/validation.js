const Validator = require('validatorjs');

const usersRule = () => ({
    name: 'required|string',
    last_name: 'required|string', 
    role: 'required|in:admin,manager,customer',
    active: 'required|boolean' 
  });

  const productsRule = () => ({
    name: 'required|string', 
    stock: 'required|integer|min:0',
    price: 'required|float', 
    description: 'nullable|string',  
    updated_at: 'nullable|date',  
    brand: 'nullable|string',  
    category: 'nullable|string' 
  });

  const ordersRule = () => ({
    amount: 'required|numeric|min:0',
    status: 'required|in:paid,refund,pending',
    date: 'required|date',  
    cart_id: 'required|string'  
  });

  const cartRule = () => ({
    items: 'required|string',
    amount: 'required|numeric|min:0',
    date: 'required|date',
    totalPrice: 'required|float'    
  });

const validate = (rules) => {
  return (req, res, next) => {
    const validation = new Validator(req.body, rules);

    if (validation.passes()) {
      return next();
    } else {
      return res.status(422).json({
        errors: validation.errors.all()
      });
    }
  };
};

module.exports = { usersRule, productsRule, ordersRule, cartRule, validate };
