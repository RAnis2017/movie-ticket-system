require('dotenv').config()
var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require('../config');
const adminRoutes = require('./admin');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const { sendMessage } = require('../config/socket-io');

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
  userModel.findOne({ email: email }).populate('permissions').exec(async (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else if (!user) {
      let password = makePass(8);
      let user = await createUser(userModel, email, name, password)

      const token = jwt.sign(
        { user_id: user._id, email },
        config.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      let loggedInUser = {
        token,
        isAdmin: email === 'admin@email.com',
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
          { user_id: user._id, email, permissions: user.permissions },
          config.TOKEN_KEY,
          {
            expiresIn: "24h",
          }
        );

        let loggedInUser = {
          token,
          email,
          isAdmin: email === 'admin@email.com',
          permissions: user.permissions
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
  user.findOne({ email: email }).populate('permissions').exec(async (err, user) => {
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
            { user_id: user._id, email, permissions: user.permissions },
            config.TOKEN_KEY,
            {
              expiresIn: "24h",
            }
          );

          let loggedInUser = {
            token,
            email,
            isAdmin: email === 'admin@email.com',
            permissions: user.permissions
          };

          res.status(200).json(loggedInUser);
        }
      });
    }
  });
});

router.use(auth);

function nestedCategories(categories, parentId = null, checkedId = null) {
  const categoryList = [];
  let category;
  if (parentId == null) {
      category = categories.filter(cat => cat.parent== null);
  } else {
      category = categories.filter(cat => String(cat.parent) == String(parentId));
  }

  for (let cate of category) {
      categoryList.push({
          label: cate.name,
          value: cate._id,
          checked: checkedId == cate._id ? true : false,
          children: nestedCategories(categories, cate._id, checkedId)
      })
  }
  return categoryList;
}

router.get('/get-categories', (req, res, next) => {
  let categoryModel = mongoose.model('Category');
  categoryModel.find({}, (err, categories) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else {
      if(req.query.admin) {
        res.status(200).json(categories);
      } else {
        let categoryList = nestedCategories(categories, null, req.query.id);
        res.status(200).json(categoryList);
      }
    }
  })
})

router.get('/get-posts', (req, res, next) => {
  let postModel = mongoose.model('Post');
  let userModel = mongoose.model('User');
  let likeDislikeModel = mongoose.model('LikeDislike');
  let categoryModel = mongoose.model('Category');
  
  const isAdmin = req.user.permissions.find((permission) =>  permission.label === 'can_admin_posts');

  postModel.aggregate([
    {
      $lookup: {
        from: likeDislikeModel.collection.name,
        localField: '_id',
        foreignField: 'postId',
        pipeline: isAdmin ? [] : [
          { $match: { created_by:  ObjectId(req.user.user_id) } },
        ],
        as: 'likesDislikes'
      }
    }
  ]).exec((err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    }
    postModel.populate(results, { path: 'created_by', model: userModel }, (err, posts) => {
      if (err) {
        console.log(err);
        res.status(500).json({ 'message': 'Internal server error' });
      }
      postModel.populate(posts, { path: 'category', model: categoryModel }, (err, posts) => {
        if (err) {
          console.log(err);
          res.status(500).json({ 'message': 'Internal server error' });
        } else {
          res.status(200).json(posts);
        }
      })
    })
  })
})

router.get('/get-post/:id', (req, res, next) => {
  let postModel = mongoose.model('Post');
  let userModel = mongoose.model('User');
  let categoryModel = mongoose.model('Category');
  postModel.findById(req.params.id).populate({ path: 'created_by', model: userModel }).populate({ path: 'category', model: categoryModel }).exec((err, post) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else {
      res.status(200).json(post);
    }
  })
})

router.get('/get-user-permissions', (req, res, next) => {
  if (!req.user) {
    console.log(err);
    res.status(500).json({ 'message': 'Internal server error' });
  } else {
    res.status(200).json(req.user.permissions);
  }
}
)

router.put('/like-dislike-posts', (req, res, next) => {
  let likeDislikeModel = mongoose.model('LikeDislike')
  let postModel = mongoose.model('Post');
  const postId = req.body.postId
  const created_by = req.user.user_id
  const liked = req.body.isLiked
  const session = req.session;

  // get post 
  postModel.findById(postId, (err, post) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else {
      // check if user has already liked/disliked the post

      likeDislikeModel.findOne({
        created_by,
        postId
      }, (err, likeDislikes) => {
        if (err) {
          console.log(err);
          res.status(500).json({ 'message': 'Internal server error' });
        } else {
          if (!likeDislikes) {
            likeDislikeModel.create({
              postId,
              created_by,
              liked
            }, (err, likeDislikes) => {
              if (err) {
                console.log(err);
                res.status(500).json({ 'message': 'Internal server error' });
              }
              
              sendMessage(JSON.stringify({message: `${req.user.email} ${liked ? 'liked' : 'disliked'} your post ${post.name}`, isAdmin: req.user.email === 'admin@email.com', user: created_by}), 'new_like_dislike', session);
              res.status(200).json(likeDislikes)
            })
          } else {
            likeDislikeModel.updateOne({ postId, created_by }, {
              liked,
              updated_date: new Date()
            }, (err, likeDislike) => {
              if (err) {
                console.log(err);
                res.status(500).json({ 'message': 'Internal server error' });
              } else {

                sendMessage(JSON.stringify({message: `${req.user.email} ${liked ? 'liked' : 'disliked'} your post ${post.name}`, isAdmin: req.user.email === 'admin@email.com', user: created_by}), 'new_like_dislike', session);
                res.status(200).json({ 'message': 'LikeDislike updated' });
              }
            })
          }
        }
      })
    }
  })
})

router.post('/create-tracking', (req, res, next) => {
  let trackingModel = mongoose.model('Tracking')
  const postId = req.body.postId
  const created_by = req.user.user_id
  const action = req.body.action
  trackingModel.findOne({
    created_by,
    postId,
    created_date: { $eq: new Date().toISOString().split('T')[0] }
  }, (err, tracking) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else {
      if (!tracking) {

        trackingModel.create({
          postId,
          created_by,
          created_date: new Date().toISOString().split('T')[0],
          action
        }, (err, tracking) => {
          if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
          } else {
            res.status(200).json({ 'message': 'Tracking created' });
          }
        })
      } else {
        res.status(200).json({ 'message': 'Tracking not updated' });
      }
    }
  })
}
)

router.get('/get-trackings', (req, res, next) => {
  let trackingModel = mongoose.model('Tracking')
  let userModel = mongoose.model('User')
  let postModel = mongoose.model('Post')
  trackingModel.find({ }).populate({path:'created_by', model: userModel}).populate({path:'postId', model: postModel}).exec((err, trackings) => {
    if (err) {
      console.log(err);
      res.status(500).json({ 'message': 'Internal server error' });
    } else {
      res.status(200).json(trackings);
    }
  })
}
)

// Read CSV file from local and send data as response
router.get('/airplane_crashes_data', (req, res, next) => {
  let csvFilePath = './Airplane_Crashes_and_Fatalities_Since_1908.csv';
  let csv = fs.readFileSync(csvFilePath, { encoding: 'utf8' });
  let csvData = csv.split('\n');
  let csvDataArray = [];
  for (let i = 0; i < csvData.length; i++) {
    csvDataArray.push(csvData[i].split(','));
  }
  csvDataArray = csvDataArray.slice(1);
  const data = {};
  csvDataArray.map(item => {
    let year = item[0].split('/')[2];
    if(year) {
      if(data[year]) {
        data[year] += 1;
      } else {
        data[year] = 1;
      }
    }
  })

  res.status(200).json(data);
}
)

router.use('/admin', adminRoutes);

module.exports = router;