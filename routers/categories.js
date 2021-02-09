const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();

router.get(`/`, async(req, res) => {
    const categoryList = await Category.find();
    
    if( !categoryList ){
        res.status(500).json({ success: false });
    }
    
    res.status(200).json(categoryList); 
});

router.get(`/:id`, async(req, res) => {
    const category = await Category.findById( req.params.id );
    
    if( !category ){
        res.status(500).json({ success: false, message: 'The category with the give ID was not found' });
    }
    
    res.status(200).json(category); 
});

router.post('/', async(req, res) => {
    
    let category = new Order({
       name: req.body.name,
       icon: req.body.icon,
       color: req.body.color
    });
    
    category = await category.save();
    
    if( !category ){
        return res.status(404).send('The cagegory cannot be created');
    }
    
    res.send( category );
    
});

router.put('/:id', async (req, res ) => {
    const { name, icon, color } = req.body;
    const category = await Category.findByIdAndUpdate(
       req.params.id,
       {
            name,
            icon,
            color
       },
       {
           new: true
       }
    )
    
    if( !category ){
        return res.status(404).send('The cagegory cannot be updated');
    }
    
    res.send( category );
});

router.delete('/:id', (req, res) => {
   Category.findByIdAndRemove( req.params.id ).then( category => {
       if( category ){
           return res.status(200).json({ success: true, message: 'The category was deleted'});
       } else {
           return res.status(404).json({ success: false, message: 'Category not found'});
       }
   }).catch( err => {
       return res.status(400).json({ success: false, message: err });
   })
});

module.exports = router;