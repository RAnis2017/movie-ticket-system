require('dotenv').config()
var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require('../config');

// Define the home page route
router.get('/', function (req, res) {
  res.status(200).json({ 'message': 'hello' });
});

function createUser(userModel, email, name, password) {
  return new Promise((resolve, reject) => {
    let hash = bcrypt.hashSync(password, 12);
    userModel.create({
      email: email,
      password: hash,
      name: name,
    }, (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
}

//random string generator
function makePass(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.post('/login-google', function (req, res) {
  console.log(req.body);
  let email = req.body.email
  let name = req.body.name
  let userModel = mongoose.model('User');
  userModel.findOne({ email: email }).exec(async (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else if (!user) {
      let password = makePass(8);
      let user = await createUser(userModel, email, name, password)

      const token = jwt.sign(
        { user_id: user._id, email, isAdmin: user.isAdmin },
        config.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      let loggedInUser = {
        name: user.name,
        token,
        isAdmin: user.isAdmin,
        email
      };

      res.status(200).json(loggedInUser);
    } else {
      if (err) {
        console.log(err);
        res.status(500).json({ 'message': 'Internal server error' });
      } else if (!user) {
        res.status(401).json({ 'message': 'Password incorrect' });
      } else {
        const token = jwt.sign(
          { user_id: user._id, email },
          config.TOKEN_KEY,
          {
            expiresIn: "24h",
          }
        );

        let loggedInUser = {
          name: user.name,
          token,
          email,
          isAdmin: user.isAdmin,
        };

        res.status(200).json(loggedInUser);
      }
    }
  });
})


router.post('/login', function (req, res) {
  console.log(req.body);
  let email = req.body.email;
  let password = req.body.password;
  let user = mongoose.model('User');
  user.findOne({ email: email }).exec(async (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else if (!user) {
      res.status(401).json({ 'message': 'User not found' });
    } else {
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          console.log(err);
          res.status(500).json({ 'message': 'Internal server error' });
        } else if (!result) {
          res.status(401).json({ 'message': 'Password incorrect' });
        } else {
          const token = jwt.sign(
            { user_id: user._id, email, isAdmin: user.isAdmin },
            config.TOKEN_KEY,
            {
              expiresIn: "24h",
            }
          );

          let loggedInUser = {
            name: user.name,
            token,
            email,
            isAdmin: user.isAdmin,
          };

          res.status(200).json(loggedInUser);
        }
      });
    }
  });
});

router.get('/get-movies', (req, res, next) => {
  let movieModel = mongoose.model('Movie');
  let userModel = mongoose.model('User');

  movieModel.find({}).populate({ path: 'created_by', model: userModel }).exec((err, movies) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    }
    res.status(200).json(movies);
  })
})

router.get('/get-movie/:id', (req, res, next) => {
  let movieModel = mongoose.model('Movie');
  let userModel = mongoose.model('User');
  movieModel.findById(req.params.id).populate({ path: 'created_by', model: userModel }).exec((err, movie) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else {
      res.status(200).json(movie);
    }
  })
})

router.get('/get-upcoming-recent-movies', (req, res, next) => {
  let movieModel = mongoose.model('Movie');
  movieModel.aggregate([{
    $addFields: {
      onlyDate: {
        $dateToString: {
          format: '%Y-%m-%d',
          date: '$release_date'
        }
      }
    }
  },
  {
    $match: {
      onlyDate: {
        '$eq': new Date().toISOString().split('T')[0]
      }
    }
  }
  ]).exec((err, showingNow) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else {
      movieModel.aggregate([{
        $addFields: {
          onlyDate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$release_date'
            }
          }
        }
      },
      {
        $match: {
          onlyDate: {
            '$gt': new Date().toISOString().split('T')[0]
          }
        }
      }
      ]).exec((err, upcomingMovies) => {
        res.status(200).json({ showingNow, upcomingMovies });
      })
    }
  })
})

router.get('/get-settings/:setting_type', (req, res, next) => {
  let settingModel = mongoose.model('Setting');
  settingModel.findOne({
      setting_type: req.params.setting_type
  }, (err, setting) => {
      if (err) {
          console.log(err);
          res.status(500).json({ 'message': 'Internal server error' });
      } else {
          res.status(200).json({_id: setting._id, ...setting?.options});
      }
  }
  )
})

router.use(auth);

router.use('/admin', require('./admin'));

module.exports = router;