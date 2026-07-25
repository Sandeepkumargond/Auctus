import express from 'express';
import { isAuth, isAuthorised } from '../middlewares/auth.js';
import placebid, { manageAutoBid } from '../controllers/bidcontroller.js';
import checkAuctionEndtime from "../middlewares/checkAuctionEndtime.js";
import { lockAuctionMutation } from '../middlewares/auctionRequestLock.js';
const router = express.Router();

/**
 * @swagger
 * /api/v1/bid/place/{id}:
 *   post:
 *     tags: [Bidding]
 *     summary: Place a manual bid on an active auction (Bidder only)
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
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Bid amount — must exceed current highest bid
 *                 example: 850
 *     responses:
 *       201:
 *         description: Bid placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     bid:
 *                       $ref: '#/components/schemas/Bid'
 *       400:
 *         description: Bid too low, auction ended, or insufficient wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not a Bidder role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/place/:id", isAuth, isAuthorised("Bidder"), checkAuctionEndtime, lockAuctionMutation, placebid);

/**
 * @swagger
 * /api/v1/bid/auto/{id}:
 *   put:
 *     tags: [Bidding]
 *     summary: Set or update auto-bid configuration for an auction (Bidder only)
 *     description: |
 *       Auto-bid automatically places bids up to a set maximum, incrementing by the
 *       configured step when outbid. Set maxAmount to 0 to disable auto-bid.
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
 *             required: [maxAmount]
 *             properties:
 *               maxAmount:
 *                 type: number
 *                 description: Maximum amount to auto-bid up to (0 to disable)
 *                 example: 1200
 *               incrementStep:
 *                 type: number
 *                 description: Amount to increment per auto-bid (default from auction settings)
 *                 example: 50
 *     responses:
 *       200:
 *         description: Auto-bid configured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid configuration or auction not active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/auto/:id", isAuth, isAuthorised("Bidder"), checkAuctionEndtime, lockAuctionMutation, manageAutoBid);

export default router;
