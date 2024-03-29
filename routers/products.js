const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { Category } = require('../models/category');
const { Product } = require('../models/product');

const router = express.Router();
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');
        if( isValid ){
            uploadError = null;
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      
      const fileName = file.originalname.split(' ').join('-')
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${ fileName }_${ Date.now() }.${ extension }`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })
  

router.get(`/`, async(req, res) => {
    
    let filter = {};
    if( req.query.categories ){
        filter = { category: req.query.categories.split(',') };
    }
    
    const productList = await Product.find(filter).populate('category');
   res.json(productList); 
});

router.get(`/:id`, async(req, res) => {
    const product = await Product.findById( req.params.id ).populate('category');
   
    if( !product ){
        return res.status(404).send('No encontrado');
    }
    
    res.status(200).send( product );
});

router.post(`/`, uploadOptions.single('image'), async(req, res) => {
    
    console.log(req.body);
    const category = await Category.findById( req.body.category );
    
    if( !category ){
        return res.status(400).send('Invalid Category');
    }
    
    const file = req.file;
    if( !file ){
        return res.status(400).send('No image in the request');
    } 
    
    const fileName = req.file.filename;
    const basePath = `${ req.protocol }://${ req.get('host') }/public/uploads/`;
    console.log(fileName);
   let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
   });
   product = await product.save();
   
   if(!product){
    return res.status(500).send('The producto cannot be created');
   }
   
   res.status(201).send(product);
   
});

router.put('/:id', uploadOptions.single('image'), async (req, res ) => {
    
    console.log(req.body);
    if( !mongoose.isValidObjectId( req.params.id )){
        return res.status(400).send('Invalid Product Id');
    }
    if( !req.body.category ){
        return res.status(400).send('Invalid Category');
    }
    
    const file = req.file;
    if( !file ){
        return res.status(400).send('No image in the request');
    } 
    
    const fileName = req.file.filename;
    const basePath = `${ req.protocol }://${ req.get('host') }/public/uploads/`;
    console.log(fileName);
    
    
    const product = await Product.findByIdAndUpdate(
       req.params.id,
       {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: `${basePath}${fileName}`,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
       },
       {
           new: true
       }
    )
    
    if( !product ){
        return res.status(404).send('The product cannot be updated');
    }
    
    res.send( product );
});

router.put(
    '/gallery-images/:id', 
    uploadOptions.array('images', 10), 
    async (req, res ) => {
        if( !mongoose.isValidObjectId( req.params.id )){
            return res.status(400).send('Invalid Product Id');
        }
        
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${ req.protocol }://${ req.get('host') }/public/uploads/`;
        
        if( files ){
            files.map( file => {
                imagesPaths.push( `${ basePath }${ file.filename }` );
            })
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                 images: imagesPaths,
            },
            {
                new: true
            }
        )
        
        if( !product ){
            return res.status(404).send('The product cannot be updated');
        }
        
        res.send( product );
    }
)

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove( req.params.id ).then( product => {
        if( product ){
            return res.status(200).json({ success: true, message: 'The product was deleted'});
        } else {
            return res.status(404).json({ success: false, message: 'Product not found'});
        }
    }).catch( err => {
        return res.status(400).json({ success: false, message: err });
    })
 });
 
 router.get(`/get/count`, async(req, res) => {
    const productCount = await Product.countDocuments(( count ) => count );
   
    if( !productCount ){
        return res.status(404).send('No encontrado');
    }
    
    res.status(200).send({
        productCount
    });
});

router.get(`/get/featured/:count`, async(req, res) => {
    
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit( +count );
   
    if( !products ){
        return res.status(404).send('No encontrado');
    }
    
    res.status(200).send(products);
});

module.exports = router;