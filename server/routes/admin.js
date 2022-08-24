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
// const nodemailer = require('nodemailer');

// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: process.env.MAIL_USERNAME,
//         pass: process.env.MAIL_PASSWORD,
//         clientId: process.env.OAUTH_CLIENTID,
//         clientSecret: process.env.OAUTH_CLIENT_SECRET,
//         refreshToken: process.env.OAUTH_REFRESH_TOKEN
//     }
// });
// let mailOptions = {
//     from: 'admin@cms.com',
//     to: 'razaanis123@gmail.com',
//     subject: 'Zepcom CMS App',
//     text: ''
// };

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


router.post('/add-movie', (req, res, next) => {
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

            let movieModel = mongoose.model('Movie');
            movieModel.create({
                title: body.title,
                director: body.director,
                category: body.category,
                release_date: body.release_date,
                actors: body.actors,
                description: body.description,
                image_urls: fileNames,
                category: body.category,
                created_by: req.user.user_id
            }, (err, movie) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ 'message': 'Internal server error' });
                } else {
                    // mailOptions.text = `A new post named ${body.title} has been added to the CMS react app`
                    // transporter.sendMail(mailOptions, function (err, data) {
                    //     if (err) {
                    //         console.log("Error " + err);
                    //     } else {
                    //         console.log("Email sent successfully");
                    //     }
                    // });
                    res.status(200).json({ 'message': 'Movie added' });
                }
            });
        }
    })
})

router.put('/update-movie/:id', (req, res, next) => {
    let movieModel = mongoose.model('Movie');
    multi_upload(req, res, function (err) {
        if (err) {
            console.log(err)
        } else {
            let body = req.body;
            let fileNames = []

            let options = {
                title: body.title,
                director: body.director,
                category: body.category,
                release_date: body.release_date,
                actors: body.actors,
                description: body.description,
            }
            if (req.files && req.files.length) {
                for (let i = 0; i < req.files.length; i++) {
                    fileNames.push(req.files[i].filename)
                }
                options['image_urls'] = fileNames
            }

            movieModel.updateOne({ _id: req.params.id }, options, (err, movie) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ 'message': 'Internal server error' });
                } else {
                    res.status(200).json({ 'message': 'Movie updated' });
                }
            })

        }
    })

})

router.delete('/delete-movie/:id', (req, res, next) => {
    let movieModel = mongoose.model('Movie');
    movieModel.deleteOne({ _id: req.params.id }, (err, movie) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json({ 'message': 'Movie deleted' });
        }
    })
})

router.get('/get-settings', (req, res, next) => {
    let settingModel = mongoose.model('Setting');
    settingModel.find({}, (err, settings) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json(settings);
        }
    }
    )
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

router.put('/update-setting/:id', (req, res, next) => {
    let settingModel = mongoose.model('Setting');
    settingModel.updateOne({ _id: req.params.id }, {
        options: req.body
    }, (err, setting) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            res.status(200).json({ 'message': 'Settings updated' });
        }
    }
    )
}
)

module.exports = router;
