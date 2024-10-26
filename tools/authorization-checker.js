const dotenv = require('dotenv');
dotenv.config();

const authorizationChecker = (lvl = 'admin') => {
    return async (req, res, next) => {
        // If AUTH is not enabled, allow all requests
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
                if (req.session.user.role === 'admin' || 
                    req.session.user.role === 'manager' ) {
                    return next();
               } else {
                    return res.status(403).json({ message: 'Forbidden' });
                }
                case 'customer':
                    return next();
                
            default:
                return res.status(403).json({ message: 'Forbidden' });
        }
    };
};

module.exports = authorizationChecker;
