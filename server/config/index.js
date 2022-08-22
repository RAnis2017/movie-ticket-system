module.exports = {
    port: 3001,
    db: {
        user: 'Raza',
        password: '123',
        dbName: 'cmsDb',
        port: '27017'
    },
    TOKEN_KEY: 'longSecretKey',
    PERMISSIONS: {
        can_see_posts: ['get-posts', 'like-dislike-posts', 'create-tracking', 'airplane_crashes_data'],
        can_see_categories: ['get-categories'],
        can_admin_posts: ['add-post', 'update-post', 'delete-post', 'change-status'],
        can_admin_categories: ['add-category', 'update-category', 'delete-category'],
        can_admin_users: ['users', 'permissions', 'add-user-permission', 'get-trackings'],
    }
}