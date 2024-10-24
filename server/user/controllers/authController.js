const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email){
            return res.status(404).json({msg: 'email can not be empty.', success: false});
        }

        if(!password){
            return res.status(404).json({msg: 'password can not be empty.', success: false});
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({msg: 'User not found.', success: false});
        }

        const result = await bcrypt.compare(password, user.password)

        if(!result){
            return res.status(404).json({msg: 'Invalid credentials.', success: false});
        }

        const newUser = {
            username: user.name,
            email: user.email
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
        res.status(200).json({msg: 'Login success', success: true, newUser, token});
    } catch (error) {
        res.status(501).json({msg: 'Internal server error.', success: false, error: error.message});
    }
}

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if(!name){
            return res.status(404).json({msg: 'username can not be empty.', success:false});
        }

        if(!email){
            return res.status(404).json({msg: 'email can not be empty.', success:false});
        }

        if(!password){
            return res.status(404).json({msg: 'password can not be empty.', success: false})
        }

        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.status(404).json({msg: 'A user with this email already exists.', success:false})
        }

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const hashedPass = await bcrypt.hash(password, salt);

        const user = User({
            name,
            email,
            password: hashedPass
        });

        await user.save();
        res.status(200).json({msg: 'Registration Successful', success: true});
    } catch (error) {
        res.status(501).json({msg: 'Internal server error.', success: false, error: error.message});
    }
}

module.exports = {
    login,
    register
}