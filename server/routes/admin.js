require('dotenv').config()
var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`)
    }
})
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
});
let mailOptions = {
    from: 'admin@cms.com',
    to: 'razaanis123@gmail.com',
    subject: 'Zepcom CMS App',
    text: ''
};

let upload = multer({ dest: 'uploads/', storage }).single('image');

const multi_upload = multer({
    dest: 'uploads/',
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg format allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    },
}).array('images', 10)


router.post('/add-post', (req, res, next) => {
    multi_upload(req, res, function (err) {
        if (err) {
            console.log(err)
        } else {
            let fileNames = []
            console.dir(req.files)
            for (let i = 0; i < req.files.length; i++) {
                fileNames.push(req.files[i].filename)
            }
            let body = req.body;
            console.log(req.body.category, fileNames);

            let postModel = mongoose.model('Post');
            postModel.create({
                name: body.title,
                description: body.description,
                image_urls: fileNames,
                featured_image_index: body.featured_image_index ? body.featured_image_index : 0,
                slug: body.slug,
                created_by: req.user.user_id,
                category: body.category,
                status: body.status,
            }, (err, post) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ 'message': 'Internal server error' });
                } else {
                    mailOptions.text = `A new post named ${body.title} has been added to the CMS react app`
                    transporter.sendMail(mailOptions, function (err, data) {
                        if (err) {
                            console.log("Error " + err);
                        } else {
                            console.log("Email sent successfully");
                        }
                    });
                    res.status(200).json({ 'message': 'Post added' });
                }
            });
        }
    })
})

router.post('/add-category', (req, res, next) => {
    let categoryModel = mongoose.model('Category');
    console.log(req.body);
    categoryModel.create({
        name: req.body.name,
        created_by: req.user.user_id,
        parent: req.body.parent?.length > 0 ? req.body.parent : null,
    }, (err, category) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json({ 'message': 'Category added' });
        }
    })
})


router.put('/update-post/:id', (req, res, next) => {
    let postModel = mongoose.model('Post');
    multi_upload(req, res, function (err) {
        if (err) {
            console.log(err)
        } else {
            let body = req.body;
            let fileNames = []

            let options = {
                name: body.title,
                description: body.description,
                slug: body.slug,
                category: body.category,
                status: body.status === 'true' ? true : false,
            }
            if (req.files && req.files.length) {
                for (let i = 0; i < req.files.length; i++) {
                    fileNames.push(req.files[i].filename)
                }
                options['image_urls'] = fileNames
                options['featured_image_index'] = body.featured_image_index ? body.featured_image_index : 0
            }

            postModel.updateOne({ _id: req.params.id }, options, (err, post) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ 'message': 'Internal server error' });
                } else {
                    mailOptions.text = `An old post has been updated named ${options.name} to the CMS react app`
                    transporter.sendMail(mailOptions, function (err, data) {
                        if (err) {
                            console.log("Error " + err);
                        } else {
                            console.log("Email sent successfully");
                        }
                    });
                    res.status(200).json({ 'message': 'Post updated' });
                }
            })

        }
    })

})

router.put('/update-category/:id', (req, res, next) => {
    let categoryModel = mongoose.model('Category');
    categoryModel.updateOne({ _id: req.params.id }, {
        name: req.body.name,
        parent: req.body.parent?.length > 0 ? req.body.parent : null,
    }, (err, category) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json({ 'message': 'Category updated' });
        }
    })
})

router.delete('/delete-post/:id', (req, res, next) => {
    let postModel = mongoose.model('Post');
    postModel.deleteOne({ _id: req.params.id }, (err, post) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json({ 'message': 'Post deleted' });
        }
    })
})

router.delete('/delete-category/:id', (req, res, next) => {
    let categoryModel = mongoose.model('Category');
    categoryModel.deleteOne({ _id: req.params.id }, (err, category) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            let postModel = mongoose.model('Post');
            postModel.deleteMany({ category: req.params.id }, (err, post) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ 'message': 'Internal server error' });
                } else {
                    res.status(200).json({ 'message': 'Category deleted' });
                }
            })
        }
    })
})

router.put('/change-status/:id', (req, res, next) => {
    let postModel = mongoose.model('Post');
    postModel.updateOne({ _id: req.params.id }, {
        status: req.body.status === 'true' ? false : true,
    }, (err, post) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json({ 'message': 'Status updated' });
        }
    })
})

router.get('/users', (req, res, next) => {
    let userModel = mongoose.model('User');
    userModel.find({
        // email: { $ne: req.user.email }
    }).populate('permissions').exec(async (err, users) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json(users);
        }
    }
    )
})

router.get('/permissions', (req, res, next) => {
    let permissionModel = mongoose.model('Permission');
    permissionModel.find({}).exec(async (err, permissions) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json(permissions);
        }
    }
    )
}
)

router.put('/add-user-permission/:id', async (req, res, next) => {
    let userModel = mongoose.model('User');
    let userId = req.params.id;
    let permissions = req.body.permissions;

    userModel.updateOne({ _id: userId }, {
        permissions: permissions,
    }, (err, user) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json({ 'message': 'Permission added' });
        }

    })
}
)


module.exports = router;