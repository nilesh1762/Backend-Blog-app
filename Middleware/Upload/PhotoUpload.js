const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const multerStorage = multer.memoryStorage()

const multerFIlter = (req, file, cb) => {

    if(file.mimetype.startsWith("image")){
        cb(null, true);
    }else{

        cb({
             message: "Unsupported file type."
        }, false);
    }
}

const PhotoUpload = multer({

    storage: multerStorage,
    fileFilter: multerFIlter,
    limits: {fileSize: 10000000},
});

// Image Resize

const profilePhotosize = async (req, res, next ) => {

     // Check if file not exit
     if(!req.file) return next();
     req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

     await sharp(req.file.buffer).resize(250, 250).toFormat("jpeg").jpeg({quality: 90}).toFile(path.join(`Public/Images/Profile/${ req.file.filename}`));
     
     next();
     // console.log("resize==", req.file)
}

//Post Image Resizing

const postImgResize = async (req, res, next ) => {

    // Check if file not exit
    if(!req.file) return next();
    req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

    await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({quality: 90}).toFile(path.join(`Public/Images/post/${ req.file.filename}`));
    
    next();
    // console.log("resize==", req.file)
}

module.exports = { PhotoUpload,postImgResize, profilePhotosize}

