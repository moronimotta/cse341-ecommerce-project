const router = require('express').Router();
const passport = require('passport');
const usersController = require('../controllers/users');
const User = require('../models/User');

router.use('/swagger', require('./swagger')); 
router.use('/users', require('./users'));
router.use('/products', require('./products'));
router.use('/cart', require('./cart'));
router.use('/orders', require('./orders'));
router.use('/stores', require('./stores'));

router.get('/', (req, res) => {
   if (req.session.user !== undefined) {
    res.send(`Welcome, ${req.session.user.name}!`);
  }else {
    res.send('Please log in to continue.');
  }
});

router.get('/healthcheck', (req, res) => {
  res.send('OK');
});

router.get('/login',
  async (req, res, next) => {

    if(req.session.user !== undefined) {
      return res.redirect('/');
    }

    const email = req.headers.email;
    const password = req.headers.password;

    if (email && password) {
      try {
        let user = await usersController.getUserByEmailAndPassword(email, password);
        if (!user) {
          return res.status(404).send('User not found / Incorrect password');
        }
      
        req.session.user = user;
        console.log('User logged in:', user);
        return res.redirect('/');
      } catch (error) {
        console.error('Error in /login', error);
        next(error);
      }
    } else {
      return passport.authenticate('github')(req, res, next);
    }
  }
  );

router.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  async (req, res, next) => { 
    try {
      let user = await usersController.getUserByGithubId(req.user.id);
      
      if (!user) {
        const userData = {
          github_id: req.user.id,
          email: req.user.username, 
          password: req.user.id,
          name: req.user.displayName,
        };
        req.body = userData;
        const newUser = await usersController.createUser(req, res, next);  
        const newUserId = newUser.id;
        const newApiKey = newUser.api_key;
        res.status(200).send(`
          <html>
        <body>
          <p>Please finish the registration. Here is your user_id: ${JSON.stringify(newUserId)} and api_key: ${JSON.stringify(newApiKey)} </p>
          <p>Here's your temporary info:</p>
          <p>Email: ${req.user.username} </p>
          <p>Password: ${req.user.id} </p>
          <p>Update the email and password as well</p>
          <p>You will be logged out in <span id="countdown"305</span> seconds.</p>
          <script>
            let countdown = 30;
            const countdownElement = document.getElementById('countdown');
            const interval = setInterval(() => {
              countdown--;
              countdownElement.textContent = countdown;
              if (countdown === 0) {
                clearInterval(interval);
                window.location.href = '/logout';
              }
            }, 1000);
          </script>
        </body>
      </html>
        `);

      } else {
        // user needs to finish registration
        try{
          const dbUser = new User(user);
          await dbUser.validate()

        }catch (err) {
          const errorMessages = Object.values(err.errors).map(error => {
            return `${error.path}: ${error.message}`;
          });
        
          const formattedErrors = errorMessages.join(', ');
        
          return res.status(404).send(`
            <html>
              <body>
                <h1>Registration Incomplete</h1>
                <p>Please finish filling the other fields to complete the registration:</p>
                <ul>
                  <li>${formattedErrors}</li>
                </ul>
                <p>You will be logged out in <span id="countdown">10</span> seconds.</p>
                <script>
                  let countdown = 10; // Countdown starting from 5 seconds
                  const countdownElement = document.getElementById('countdown');
                  const interval = setInterval(() => {
                    countdown--;
                    countdownElement.textContent = countdown;
                    if (countdown === 0) {
                      clearInterval(interval);
                      window.location.href = '/logout';
                    }
                  }, 1000);
                </script>
              </body>
            </html>
          `);
        }
        req.session.user = user;
        console.log('User logged in:', user);
        return res.redirect('/');
      }
    } catch (error) {
      console.error('Error in /auth/github/callback:', error);
      next(error); 
    }
  }
);

router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { 
      console.error('Error during logout:', err);
      return next(err); 
    }

    req.session.destroy(err => {
      if (err) { 
        console.error('Error destroying session during logout:', err);
        return next(err); 
      }

      res.clearCookie('connect.sid', { path: '/' }); // Clear the session cookie
      console.error('User logged out and session destroyed.');
      res.redirect('/');
    });
  });
});

module.exports = router;
