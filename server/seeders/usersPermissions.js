const { User } = require('../models/users');
const { Permission } = require('../models/permissions');
const mongoose = require("mongoose");
const config = require('../config')
const ObjectId = require('mongodb').ObjectId;

const start = async () => {
    try {
        await mongoose.connect(`mongodb://${config.db.user}:${config.db.password}@localhost:${config.db.port}/${config.db.dbName}`);

        let permissionsRes = await Permission.find({})
        let permissions = {};
        permissionsRes.map(permission => (
            permissions[permission.label] = permission._id
        ))

        await User.updateOne({
            email: 'admin@email.com'
        }, {
            $set: {
                permissions: [
                    permissions.can_see_posts,
                    permissions.can_see_categories,
                    permissions.can_admin_posts,
                    permissions.can_admin_categories
                ]
            }
        })

        await User.updateOne({
            email: 'razaanis123@gmail.com'
        }, {
            $set: {
                permissions: [
                    permissions.can_see_posts,
                    permissions.can_see_categories,
                ]
            }
        })

        await User.updateOne({
            email: 'raza.anis@qavitechnologies.com'
        }, {
            $set: {
                permissions: [
                    permissions.can_see_categories
                ]
            }
        })

        await mongoose.connection.close()
        
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
