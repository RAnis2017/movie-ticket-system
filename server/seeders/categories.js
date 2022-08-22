const { Category } = require('../models/categories');
const mongoose = require("mongoose");
const config = require('../config')

const start = async () => {
    try {
        await mongoose.connect(`mongodb://${config.db.user}:${config.db.password}@localhost:${config.db.port}/${config.db.dbName}`);

        await Category.create({
            name: 'Child Category',
            parent: '62d845b070ae70226a010620',
            created_by: '62c31bbed614d5b71ab0dfd1',
        });

        await mongoose.connection.close()
        
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
