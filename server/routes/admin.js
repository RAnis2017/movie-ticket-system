require('dotenv').config()
var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');
const moment = require('moment');
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

function convertToSlug(Text) {
    return Text.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}

const multi_upload = multer({
    dest: 'uploads/',
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 1MB
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
                duration: body.duration,
                tags: body.tags,
                trailer: body.trailer,
                actors: body.actors,
                description: body.description,
                image_urls: fileNames,
                category: body.category,
                created_by: req.user.user_id,
                slug: convertToSlug(body.title)
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
                duration: body.duration,
                tags: body.tags,
                trailer: body.trailer,
                actors: body.actors,
                description: body.description,
                slug: convertToSlug(body.title)
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

router.get('/get-tickets', (req, res, next) => {
    let ticketModel = mongoose.model('Ticket');
    let movieModel = mongoose.model('Movie');
    ticketModel.find({}, (err, tickets) => {
        if (err) {
            console.log(err);
            res.status(500).json({ 'message': 'Internal server error' });
        } else {
            movieModel.find({ slug: tickets.map((ticket) => ticket.movieID) }, (err, movie) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ 'message': 'Internal server error' });
                } else {
                    let ticketsWithMovie = tickets.map((ticket) => {
                        let movieObj = movie.find((movie) => movie.slug === ticket.movieID)
                        return {
                            ...ticket._doc,
                            movie: movieObj
                        }
                    })
                    res.status(200).json({ tickets: ticketsWithMovie });
                }
            })
        }
    })
})

router.post('/import-tickets', async (req, res, next) => {
    let ticketModel = mongoose.model('Ticket');
    let body = req.body;
    let errors = [];
    let success = [];
    const promisesTickets = await Promise.all(body.csvData.map((ticket, index) => {
        return new Promise((resolve, reject) => {
            const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const seats = ticket.seats.split(' | ').map((seat) => {
                return alphabets.indexOf(seat.split('')[0]) + '-' + alphabets.indexOf(seat.split('')[1])
            }).join(',')
            console.log(seats)

            const formattedDate = moment(ticket.date, 'DD/MM/YYYY').format('YYYY-MM-DD').toString()
            
            // check if ticket already exists
            ticketModel.findOne({ movieID: ticket.movieID, created_date: formattedDate, seats: seats }, (err, ticket) => {
                if (err) {
                    console.log(err);
                    resolve();
                    // res.status(500).json({ 'message': 'Internal server error',  });
                } else {
                    if (ticket) {
                        errors.push({
                            row: index + 1,
                            error: 'Seat already booked'
                        });
                        resolve();
                    }
                    else {
                        ticketModel.create({
                            movieID: ticket.movie,
                            seats,
                            total_price: ticket.total_price,
                            seats_count: ticket.seats_count,
                            Name: ticket.Name,
                            Email: ticket.Email,
                            created_date: ticket.created_date,
                            longitude: ticket.longitude,
                            latitude: ticket.latitude,
                            ticket_pdf: ticket.ticket_pdf,
                        }, (err, ticket) => {
                            if (err) {
                                console.log(err);
                                errors.push({
                                    row: index + 1,
                                    error: err
                                });
                                resolve();
                            } else {
                                success.push({
                                    row: index + 1,
                                    message: 'Ticket added ' + ticket.seats + ' ' + ticket.created_date + ' ' + ticket.movieID
                                });
                                resolve();
                            }
                        })
                    }
                }
            })

        })
    }))

    res.status(200).json({ 'message': 'Tickets imported', errors, success });

})

module.exports = router;
