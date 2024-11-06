import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const taskSubmissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  title:{
   type:String,
  },
  completed: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  submission:{
    type: String,
  },
  submissionDate: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        number: {
            type: String,
            required: true,  
        },
        email: {
            type: String,
            required:true,
        },
        college: {
            type: String,
            required: true
        },
        resume:{
            type:String
        },
        suitability:{
            type:String
        },
        collegeCity:{
            type:String
        },
        year:{
            type:Number
        },
        password:{
            type:String,
            required:true
        },
        refreshToken: {
            type: String
        },
        tasksCompleted: [taskSubmissionSchema]
    },
    {
        timestamps: true
    }
)

userSchema.pre('save',function(next){
    if(!this.isModified('password')){
        return next();
    }
    else{
        this.password=bcrypt.hash(this.password,10);
        next();
    }
})
userSchema.methods.isPasswordCorrect = async function(password){
    if(password==this.password){
        // console.log("password",password,"this_password",this.password)
        return true
    }
    else{
        return false
    }
}
userSchema.methods.generateacessToken = async function(){
    return  jwt.sign(
        {
            _id:this._id,
            email:this.email,
            name:this.fullName
        },
         process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken =async function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}




export const User = mongoose.model("User", userSchema)