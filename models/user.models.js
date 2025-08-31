const { Schema ,model } = require('mongoose');

const { createHmac , randomBytes } = require("crypto");
const { createToken } = require('../services/authentication');
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageUrl: {
        type: String,
        default: '/images/default.png'
    },
    role: {
        type: String,
        enum: ["USER","ADMIN"],
        default: "USER", 
    }
},{timestamps: true});


userSchema.pre("save", function(next) {
    const user = this;
    // if the password is not modified then return from then and there
    if(!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256',salt).update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
})


userSchema.static("matchPasswordAndGenerateToken", async function(email,password) {
    const user = await this.findOne({email});
    if(!user) throw new Error("User Not Found");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedPassword = createHmac('sha256',salt).update(password).digest("hex");

    if(hashedPassword !== userProvidedPassword){
        throw new Error("Invalid Password");
    }
    const token = createToken(user);
    return token;
});

const User = model("user",userSchema);
module.exports = User; 