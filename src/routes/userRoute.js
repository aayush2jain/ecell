import { Router } from "express";
import { alltask, changePassword, getCurrentUser,getSubmittedTasks,loginUser, logoutUser, registeredUser, submittask, task, totalResponses } from "../controllers/registeruser.js";
import { verifyJWT } from "../middlewares/auth.js";
const router = Router();
router.route('/create-task').post(task);

// Route to submit task completion for a user
router.route('/usertask').get(verifyJWT,getSubmittedTasks);
router.route('/submit-task/:taskId').post(verifyJWT,submittask);
router.route('/get-task').get(alltask);
router.route('/count').get(totalResponses);
router.route('/register').post(registeredUser);
router.route('/').post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/auth").post(verifyJWT);
router.route("/changepass").post(verifyJWT,changePassword);
router.route('/getuser').get(verifyJWT,getCurrentUser);
// router.route("/refresh-token").post(refreshAccessToken);
export default router