import express from 'express';
import {
    addToWatchlist,
    fetchLeaderboard,
    getWatchlist,
    register,
    login,
    googleLogin,
    logout,
    getUserprofile,
    getWonAuctions,
    getNotifications,
    markNotificationsRead,
    removeFromWatchlist,
    submitKyc,
} from '../controllers/userController.js';
import {
    confirmFulfillmentDelivery,
    reportFulfillmentIssue,
    submitDeliveryAddress,
} from "../controllers/fulfillmentController.js";
import { isAuth, optionalAuth } from '../middlewares/auth.js';
const router = express.Router();

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userName, email, phone, address, password, role]
 *             properties:
 *               userName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               address:
 *                 type: string
 *                 example: 123 Main St, City
 *               password:
 *                 type: string
 *                 example: Secret@123
 *               role:
 *                 type: string
 *                 enum: [Bidder, Auctioneer]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", register);

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Secret@123
 *     responses:
 *       200:
 *         description: Login successful — JWT set in HTTP-only cookie
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/user/google-login:
 *   post:
 *     tags: [Auth]
 *     summary: Login or register with Google OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google ID token from Google Sign-In
 *     responses:
 *       200:
 *         description: Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid Google token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/google-login", googleLogin);

/**
 * @swagger
 * /api/v1/user/logout:
 *   get:
 *     tags: [Auth]
 *     summary: Logout and clear session cookie
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/logout", logout);

/**
 * @swagger
 * /api/v1/user/me:
 *   get:
 *     tags: [User]
 *     summary: Get current authenticated user profile
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", isAuth, getUserprofile);

/**
 * @swagger
 * /api/v1/user/leaderboard:
 *   get:
 *     tags: [User]
 *     summary: Get top bidders and auctioneers leaderboard
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaderboard data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     leaderboard:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userName:
 *                             type: string
 *                           moneySpent:
 *                             type: number
 *                           auctionsWon:
 *                             type: integer
 */
router.get("/leaderboard", optionalAuth, fetchLeaderboard);

/**
 * @swagger
 * /api/v1/user/watchlist:
 *   get:
 *     tags: [User]
 *     summary: Get current user's watchlist
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watchlist items returned
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     watchlist:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuctionItem'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/watchlist", isAuth, getWatchlist);

/**
 * @swagger
 * /api/v1/user/watchlist/{id}:
 *   post:
 *     tags: [User]
 *     summary: Add an auction to watchlist
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction item ID
 *     responses:
 *       200:
 *         description: Added to watchlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [User]
 *     summary: Remove an auction from watchlist
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction item ID
 *     responses:
 *       200:
 *         description: Removed from watchlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post("/watchlist/:id", isAuth, addToWatchlist);
router.delete("/watchlist/:id", isAuth, removeFromWatchlist);

/**
 * @swagger
 * /api/v1/user/won-auctions:
 *   get:
 *     tags: [User]
 *     summary: Get auctions won by the current user
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of won auctions with fulfillment status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     wonAuctions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuctionItem'
 */
router.get("/won-auctions", isAuth, getWonAuctions);

/**
 * @swagger
 * /api/v1/user/won-auctions/{id}/delivery:
 *   put:
 *     tags: [Fulfillment]
 *     summary: Submit delivery address for a won auction
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address]
 *             properties:
 *               address:
 *                 type: object
 *                 properties:
 *                   line1: { type: string, example: "45 Park Avenue" }
 *                   city: { type: string, example: "Mumbai" }
 *                   state: { type: string, example: "Maharashtra" }
 *                   pincode: { type: string, example: "400001" }
 *                   country: { type: string, example: "India" }
 *     responses:
 *       200:
 *         description: Delivery address submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/won-auctions/:id/delivery", isAuth, submitDeliveryAddress);

/**
 * @swagger
 * /api/v1/user/won-auctions/{id}/confirm-delivery:
 *   put:
 *     tags: [Fulfillment]
 *     summary: Confirm item delivery received
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery confirmed, escrow released
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/won-auctions/:id/confirm-delivery", isAuth, confirmFulfillmentDelivery);

/**
 * @swagger
 * /api/v1/user/won-auctions/{id}/issue:
 *   post:
 *     tags: [Fulfillment]
 *     summary: Report a fulfillment issue (dispute)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Item not delivered after 2 weeks
 *     responses:
 *       200:
 *         description: Issue reported, escalated for admin review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post("/won-auctions/:id/issue", isAuth, reportFulfillmentIssue);

/**
 * @swagger
 * /api/v1/user/notifications:
 *   get:
 *     tags: [User]
 *     summary: Get in-app notifications for current user
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 */
router.get("/notifications", isAuth, getNotifications);

/**
 * @swagger
 * /api/v1/user/notifications/read:
 *   put:
 *     tags: [User]
 *     summary: Mark all notifications as read
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/notifications/read", isAuth, markNotificationsRead);

/**
 * @swagger
 * /api/v1/user/kyc:
 *   post:
 *     tags: [User]
 *     summary: Submit KYC documents for seller verification
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               docType:
 *                 type: string
 *                 enum: [Aadhaar, PAN, Passport, Driving License]
 *               docNumber:
 *                 type: string
 *                 example: ABCDE1234F
 *               docImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: KYC submitted, pending admin review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post("/kyc", isAuth, submitKyc);

export default router;
