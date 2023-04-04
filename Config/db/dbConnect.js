const mongoose = require('mongoose');

const dbConnect = async (req, res, next) => {
   
    try{
          
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true, 

            useUnifiedTopology: true 
        });

        console.log("DB connection established");
    } 
    catch(error){
        
        console.log(`DB connection failed ${error.message}`);
    }
}


module.exports = dbConnect;