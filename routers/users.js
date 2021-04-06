const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get(`/:id`, async(req, res) => {
    const user = await User.findById( req.params.id ).select('-passwordHash');
    
    console.log(user);
    
    if( !user ){
        res.status(500).json({ success: false, message: 'The user with the give ID was not found' });
    }
    
    res.status(200).json(user); 
});

router.post(`/`, async(req, res) => {
   const salt = bcrypt.genSaltSync();
   let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, salt),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
   });
   
   user = await user.save();
   
   if(!user){
    return res.status(500).send('The user cannot be created');
   }
   
   res.status(201).send(user);
   
});

router.post('/login', async (req, res) => {
   const userDB = await User.findOne({
       email: req.body.email
   });
   
   const secret = process.env.SECRET;
   if( !userDB ){
    return res.status(404).json({
        ok: false,
        msg: 'Email not found'
    });
   }
   
   const validPassword = bcrypt.compareSync( req.body.password, userDB.passwordHash);
   
   if( userDB && validPassword){
    const token = jwt.sign({
        userId: userDB.id,
        isAdmin: userDB.isAdmin
    }
    , secret
    ,{
        expiresIn: '1d'
    })
    
    
    res.status(200).send({
        user: userDB.email,
        token
    });
   } else {
    res.status(400).json({
        ok: false,
        msg: 'Invalid password'
    });   
   }
   
   
});

router.post(`/register`, async(req, res) => {
    const salt = bcrypt.genSaltSync();
    let user = new User({
         name: req.body.name,
         email: req.body.email,
         passwordHash: bcrypt.hashSync(req.body.password, salt),
         phone: req.body.phone,
         isAdmin: req.body.isAdmin,
         street: req.body.street,
         apartment: req.body.apartment,
         zip: req.body.zip,
         city: req.body.city,
         country: req.body.country,
    });
    
    user = await user.save();
    
    if(!user){
     return res.status(500).send('The user cannot be created');
    }
    
    res.status(201).send(user);
    
 });
 
 router.get(`/get/count`, async(req, res) => {
    const userCount = await User.countDocuments(( count ) => count );
   
    if( !userCount ){
        return res.status(404).send('No encontrado');
    }
    
    res.status(200).send({
        userCount: userCount
    });
});

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove( req.params.id ).then( user => {
        if( user ){
            return res.status(200).json({ success: true, message: 'The user was deleted'});
        } else {
            return res.status(404).json({ success: false, message: 'User not found'});
        }
    }).catch( err => {
        return res.status(400).json({ success: false, message: err });
    })
 });

module.exports = router;