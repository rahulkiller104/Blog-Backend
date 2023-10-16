const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../Models/UserSchema");





const Login = async({existingUser, password , next})=>{

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = new Error(
        "Could not log you in, please check your credentials and try again."
      );
      return next(error);
    }
  
    if (!isValidPassword) {
      const error = new Error(
        "Invalid credentials, could not log you in."
      );
      return next(error);
    }
  
    let token;
    try {
      token = jwt.sign(
        { userId: existingUser.id, username: existingUser.username },
        "supersecret_dont_share"
        //   { expiresIn: "1h" }
      );
    } catch (err) {
      const error = new Error(
        "Logging in failed, please try again later."
      );
      return next(error);
    }
  
    return ({
      userId: existingUser.id,
      username: existingUser.username,
      subscribedDate: (existingUser.subscribedDate),
      token: token,
    });
}

const Signup = async({username , password ,subscribedDate , next})=>{

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = new Error(
        "Could not Authenticate, please try again."
      );
      return next(error);
    }

    const createdUser = new User({
       username,
       password:hashedPassword,
       subscribedDate 
      });
    
      try {
        await createdUser.save();
      } catch (err) {
        const error = new Error(
          "Signing up failed, please try again later."
        );
        return next(error);
      }
     
      let token;
      try {
        token = jwt.sign(
          { userId: createdUser.id, username: createdUser.username },
          "supersecret_dont_share"
          //   { expiresIn: "1h" }
        );
      } catch (err) {
        const error = new Error(
          "Logging in failed, please try again later."
        );
        return next(error);
      }

      
    
    return  {
        userId: createdUser.id,
        username:createdUser.username,
        subscribedDate: 0,
        token: token,
      };

    
    
}

const userAuthentication = async (req, res, next) => {

    console.log('user-body',req.body);

    const {username, password , subscribedDate} = req.body;
    let existingUser;

    

    try {
        existingUser = await User.findOne({ username: username });
    } catch (err) {
        const error = new Error(
        "Authentication failed, please try again later."
        );
        return next(error);
    }
   let data;
    if(existingUser){
        data = await Login({existingUser,password , next});
    }else{
        data = await Signup({username,password,subscribedDate , next});
    }
    res.json(data);

}

const subscribe = async (req, res) => {
  console.log("subsribe is called...");
    try {
      const userId = req.userData.userId;;
      const user = await User.findById(userId);
      console.log(user);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      user.subscribedDate = new Date();
      await user.save();
  
      res.json({ subscribedDate:user.subscribedDate});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'An error occurred while subscribing the user.' });
    }
  };
  

const unsubscribe = async (req, res) => {
    console.log("unsubsribe is called...");
    try {
      const userId = req.userData.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      user.subscribedDate = 0; // Remove the subscription date to indicate unsubscribed
      await user.save();
      res.json({ subscribedDate: 0});
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while unsubscribing the user.' });
    }
  };

  
  
  



exports.userAuthentication = userAuthentication;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;