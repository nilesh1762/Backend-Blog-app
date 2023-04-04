const mongoose = require('mongoose');

const ValidateMongoDbId = id => {

     const isValid = mongoose.Types.ObjectId.isValid(id);
     if(!isValid) throw new Error("This ID not vaild or Found")
}

module.exports = ValidateMongoDbId;