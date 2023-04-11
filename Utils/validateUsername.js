const User = require("../Model/User/User");

exports.validateUsername = async (username) => {
    let a = false;
  
    do {
      let check = await User.findOne({ username });
      if (check) {
        //change username
        username += (+new Date() * Math.random()).toString().substring(0, 1);
        a = true;
      } else {
        a = false;
      }
    } while (a);
    return username;
  };