const jwt = require('jsonwebtoken');
const User = require('../user/models/userModel')

const protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if(!token){
            return res.status(401).json({error: 'Access denied.', success:false})
        }
        
        const decoded = await jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        const uid = decoded.userId;

        const userExists = await User.findOne({_id:uid});
        if(!userExists){
            return res.status(404).json({msg: 'Invalid token.', success: false});
        }

        req.userId = uid;
        next();
    } catch (error) {
        res.status(501).json({msg: 'Internal server error.', success: false, error: error.message});
    }
}

module.exports = protect;