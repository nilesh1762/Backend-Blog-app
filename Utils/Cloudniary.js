const cloudinary = require('cloudinary');

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,  
  });

const cloudnaryUploadImage = async (fileupload) =>{
    try{
      
        const data = await cloudinary.uploader.upload(fileupload, {
            public_id: "olympic_flag"
        });
       
        return data;

    }catch(error){
        return error;
    }
};

module.exports = cloudnaryUploadImage;