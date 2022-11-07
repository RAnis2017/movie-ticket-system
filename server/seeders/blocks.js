const { Block } = require('../models/blocks');
const mongoose = require("mongoose");
const config = require('../config')

const start = async () => {
    try {
        await mongoose.connect(`mongodb://${config.db.user}:${config.db.password}@localhost:${config.db.port}/${config.db.dbName}`);

        await Block.create({
            Name: 'Footer 1',
            Content: '',
            order: 1,
        });

        await Block.create({
            Name: 'Footer 2',
            Content: '',
            order: 2,
        });

        await Block.create({
            Name: 'Footer 3',
            Content: '',
            order: 3,
        })

        await Block.create({
            Name: 'Footer 4',
            Content: '',
            order: 4,
        });

        await mongoose.connection.close()
        
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
