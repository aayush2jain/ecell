import { Router } from "express";
import { changePassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, registeredUser } from "../controllers/registeruser.js";

import { verifyJWT } from "../middlewares/auth.js";
const router = Router();
router.route('/register').post(registeredUser);
router.route('/').post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/auth").post(verifyJWT);
router.route("/changepass").post(verifyJWT,changePassword);
router.route('/getuser').get(verifyJWT,getCurrentUser);
// router.route("/refresh-token").post(refreshAccessToken);
export default router