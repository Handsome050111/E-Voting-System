const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('MongoDB Connected');

        const adminExists = await User.findOne({ email: 'admin@gmail.com' });
        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        await User.create({
            name: 'Admin User',
            email: 'admin@gmail.com',
            password: 'password123',
            role: 'admin'
        });

        console.log('Admin user created: admin@gmail.com / password123');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
