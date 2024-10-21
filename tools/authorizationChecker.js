// User:

// He's logged in.

// He needs to insert the api_key in the header.

// Create a middleware that validates if user_id belongs to that api_key (if is admin, never mind) (if is manager and store_id is the same, OK)

// In the authorizationChecker:

// sees the req.session.user.role
// if is admin -> return OK

// if is manager -> check if the info he is trying to access belongs to the same store_id.
// req.session.user.store_id == (product store_id or user store_id, cart...)

// if is user -> check if the info belongs to him.

const authorizationChecker = (req, res, next) => {
    if (req.session.user.role === 'admin') {
        next();
    } else if (req.session.user.role === 'manager') {
        if (req.session.user.store_id === req.body.store_id) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    } else if (req.session.user.role === 'user') {
        if (req.session.user.id === req.body.user_id) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    }
}