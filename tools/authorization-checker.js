const dotenv = require('dotenv');
dotenv.config();

const authorizationChecker = (lvl = 'admin') => {
    return async (req, res, next) => {
        if (process.env.AUTH !== 'true') {
            return next();
        }

        if (req.session.user.role === 'admin') {
            return next();
        }

        if (!req.session.user) {
            return res.status(401).json({ message: 'Unauthorized: Not logged in' });
        }

        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Unauthorized: No API Key' });
        }

        const apiKey = req.headers.authorization.split(' ')[1];

        if (req.session.user.api_key !== apiKey) {
            return res.status(401).json({ message: 'Unauthorized: API Key does not match' });
        }

        switch (lvl) {
            case 'admin':
                if (req.session.user.role === 'admin') {
                    return next();
                } else {
                    return res.status(403).json({ message: 'Forbidden' });
                }

                case 'manager':
                    if (req.session.user.role === 'admin' || (req.session.user.role === 'manager' && req.body.store_id === undefined && req.params.id === undefined)) {
                        return next();
                    }
                    else if (req.session.user.role === 'manager'
                        && ((req.session.user.store_id === req.body.store_id && req.body !== undefined) 
                        || (req.session.user.store_id === req.params.id && req.params !== undefined))) {
                        return next();
                    } else {
                        return res.status(403).json({ message: 'Forbidden' });
                    }
                
                case 'customer':
                    if (req.session.user.role === 'admin' || req.session.user.role === 'manager') {
                        return next();
                    }
                    else if ((req.session.user.role === 'customer')
                        && ((req.session.user._id === req.body.user_id && req.body !== undefined) 
                        || (req.session.user._id === req.params.id && req.params !== undefined))) {
                        return next();
                    } else {
                        return res.status(403).json({ message: 'Forbidden' });
                    }
                

            default:
                return res.status(403).json({ message: 'Forbidden' });
        }
    };
};

module.exports = authorizationChecker;
