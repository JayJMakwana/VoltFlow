const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/ev_station_db';

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('MongoDB connected');

    const existingAdmin = await User.findOne({
      role: 'Admin'
    });

    if (existingAdmin) {
      console.log(
        `Admin already exists: ${existingAdmin.email}`
      );

      await mongoose.connection.close();
      return;
    }

    const password = 'Admin@123';

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: 'VOLTFLOW Admin',
      email: 'admin@gmail.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'Admin'
    });

    console.log('Admin created successfully');
    console.log('Email:', admin.email);
    console.log('Password:', password);

    await mongoose.connection.close();

  } catch (error) {

    console.error(
      'Admin creation error:',
      error.message
    );

    process.exit(1);
  }
};

createAdmin();