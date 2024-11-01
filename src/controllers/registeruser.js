import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Cookie } from 'express-session';
import mongoose from 'mongoose';
import Task from '../models/task.model.js';

const generateAndAcessRefreshToken = async(userId)=>{
   try{
      const user = await User.findById(userId);
      console.log(user,"generate token");
      const accessToken =  await user.generateacessToken();
      const refreshToken = await user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({validateBeforeSave:false});
     
     console.log(refreshToken,"",accessToken)
      return {refreshToken,accessToken}
   }
   catch(error){
    console.log(error)
   }
}


    const registeredUser = async (req, res, next) => {
    const { username, email,college,number,collegeCity,year,resume,password } = req.body;

    console.log("fullname:", username, "email:", email, "pass:", password);

    // Validate required fields
    if ([username, email,college, password].some((field) => field?.trim() === "")) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if the user already exists
        const existedUser = await User.findOne({
            $or: [{email}]
        })

        if (existedUser) {
            return res.status(409).json({ error: "Email already register please login" });
        }

        const user = await User.create({
            username,
            email,
            college,
            collegeCity,
            resume,
            number,
            year,
            password,
        });

        // Fetch the created user without password and refreshToken
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        
        if (!createdUser) {
            return res.status(500).json({ error: "Something went wrong while registering the user" });
        }

        console.log("User registered:", createdUser);

        return res.status(201).json({ message: "User created successfully", user: createdUser });
    } catch (error) {
        next(error);
    }
};
const loginUser = async (req, res, next) => {
    const {email,password } = req.body;
    console.log( "email:",email, "pass", password);

    try {
        const existedUser = await User.findOne({ email });
        if (!existedUser) {
            console.log("User not found:", email);
            return res.status(404).json({ message: "User not found please register" });
        }

        const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            return res.status(404).json({ message: "Incorrect password" });
        }

        // Generate access and refresh tokens
        const { accessToken, refreshToken } = await generateAndAcessRefreshToken(existedUser._id);
        console.log("Access token:", accessToken);

        // Get user data without the password field
        const loggedInUser = await User.findById(existedUser._id).select("-password");
        console.log("Logged in user:", loggedInUser);
        
           // Set cookie options based on environment
        const isProduction = process.env.NODE_ENV === 'production';
        const options = {
            httpOnly: true,
            secure: isProduction, // secure in production only
            sameSite: isProduction ? 'None' : 'Lax', // Required for cross-origin cookies in production
            maxAge: 24 * 60 * 60 * 1000 // Set the cookie expiration (1 day)
        };

        // Set cookies and send response
        res
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .status(200)
            .json(loggedInUser);

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//////////////////////////////////////////
/////////////////
/////////////////////////
///////////////////////////////
////////////////////////////
const task = async (req, res) => {
    const { title, description, points } = req.body;

    try {
        // Validate request body
        if (!title || !description || !points) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new task
        const newTask = new Task({
            title,
            description,
            points
        });

        // Save task to the database
        const savedTask = await newTask.save();

        return res.status(201).json({ message: 'Task created successfully', task: savedTask });
    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getSubmittedTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the user by their ID
    const user = await User.findById(userId).populate('tasksCompleted.taskId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the list of submitted tasks
    const submittedTasks = user.tasksCompleted;

    return res.status(200).json({ submittedTasks });
  } catch (error) {
    console.error('Error fetching submitted tasks:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



const alltask = async (req, res) => {
  try {
    // Fetch all tasks from the database
    const tasks = await Task.find({});
    
    // Respond with the fetched tasks
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
const submittask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id; // Correct way to access userId from req.user
  const  {submission}  = req.body;
  console.log("googlelink",submission);
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the task was already submitted
    const existingSubmission = user.tasksCompleted.find(sub => sub.taskId.toString() === taskId);
    if (existingSubmission) {
      return res.status(400).json({ message: 'Task already submitted' });
    }

    // Add task submission with points from the task
    user.tasksCompleted.push({
      taskId: task._id,          // Reference to the task
      completed: true,
      submission: submission,
      title:task.title,
      pointsEarned: task.points, // Use the points from the Task model
      submissionDate: new Date() // Submission date
    });

    // Save the updated user document
    await user.save();

    return res.status(200).json({ message: 'Task submitted successfully', user });
  } catch (error) {
    console.error('Error submitting task:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const logoutUser = async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
}

const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw Error(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw Error(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw Error(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw Error(401, error?.message || "Invalid refresh token")
    }

}

const changePassword = async(req,res)=>{
    const user = await User.findById(req.user._id);
    if(!user){
        console.log("bhai user hi nahi aa rha")
    }
    else{
        const{oldpassword,newpassword}= req.body;
        const isPassCorrect= user.isPasswordCorrect(oldpassword)
        if(!isPassCorrect){
            
            console.log("wrong password bhai")
        }
       user.password=newpassword;
       user.save({validateBeforeSave:false});

       return res.status(200).json(
        new ApiResponse(200,{},"password is changed")
       )
    }
}

const getCurrentUser = async(req, res) => {
    console.log(req.user)
    const user = req.user;
    return res
    .status(200)
    .json(user)
}

export { registeredUser,loginUser,logoutUser,refreshAccessToken ,
    changePassword,getCurrentUser,getSubmittedTasks,
    task,alltask,submittask
};
