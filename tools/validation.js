const Validator = require('validatorjs');

const usersRule = () => ({
    name: 'required|string',
    last_name: 'required|string', 
    email: 'required|email',
    role: 'required|in:admin,user,manager',
  });

  const productsRule = () => ({
    name: 'required|string', 
    stock: 'required|integer|min:0', 
    description: 'nullable|string',  
    brand: 'nullable|string',  
    category: 'nullable|string' 
  });

  const ordersRule = () => ({
    amount: 'required|numeric|min:0',
    status: 'required|in:paid,refund,pending',
    date: 'required|date',  
    cart_id: 'required|string'  
  });


const storesRule = () => ({
  name: 'required|string',
  address: 'required|string',
  phone: 'required|string',
  email: 'required|email',
  status: 'required|in:open,closed',
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

module.exports = { usersRule, productsRule, ordersRule, storesRule, validate };
