const { Setting } = require('../models/settings');
const mongoose = require("mongoose");
const config = require('../config')

const start = async () => {
    try {
        await mongoose.connect(`mongodb://${config.db.user}:${config.db.password}@localhost:${config.db.port}/${config.db.dbName}`);

        await Setting.create({
            setting_type: 'movie_settings_1',
            options: {
                seats_per_row: 10,
                rows: 10,
                divide_seats_by: 2,
            }
        });

        await mongoose.connection.close()
        
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
