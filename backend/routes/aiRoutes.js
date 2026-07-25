import express from "express";
import {
    assistAuctionListing,
    bidAdvice,
    suggestAuctionCategory,
    summarizeAuction,
} from "../controllers/aiController.js";
import { isAuth, isAuthorised } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/ai/auction-listing-assist:
 *   post:
 *     tags: [AI]
 *     summary: Get AI-generated suggestions to improve an auction listing (Auctioneer)
 *     description: Uses Gemini to suggest better title, description, and pricing for a draft auction.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Old camera
 *               description:
 *                 type: string
 *                 example: A film camera from the 80s
 *               category:
 *                 type: string
 *               startingBid:
 *                 type: number
 *     responses:
 *       200:
 *         description: AI-generated listing suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: object
 *                   properties:
 *                     improvedTitle:
 *                       type: string
 *                     improvedDescription:
 *                       type: string
 *                     suggestedBid:
 *                       type: number
 *       503:
 *         description: AI features disabled or Gemini API unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    "/auction-listing-assist",
    isAuth,
    isAuthorised("Auctioneer"),
    assistAuctionListing
);

/**
 * @swagger
 * /api/v1/ai/category-suggest:
 *   post:
 *     tags: [AI]
 *     summary: Get AI-suggested category for an auction item (Auctioneer)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Vintage Rolex Submariner
 *               description:
 *                 type: string
 *                 example: A 1972 Rolex Submariner with original box
 *     responses:
 *       200:
 *         description: Suggested category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                   example: Watches
 *                 confidence:
 *                   type: string
 *                   enum: [high, medium, low]
 */
router.post(
    "/category-suggest",
    isAuth,
    isAuthorised("Auctioneer"),
    suggestAuctionCategory
);

/**
 * @swagger
 * /api/v1/ai/auction-summary:
 *   post:
 *     tags: [AI]
 *     summary: Get an AI-generated summary of an auction item
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [auctionId]
 *             properties:
 *               auctionId:
 *                 type: string
 *                 description: ID of the auction to summarize
 *     responses:
 *       200:
 *         description: AI summary of the auction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *                   example: "A rare 1972 Rolex Submariner in excellent condition, starting at ₹50,000..."
 */
router.post(
    "/auction-summary",
    isAuth,
    summarizeAuction
);

/**
 * @swagger
 * /api/v1/ai/bid-advice:
 *   post:
 *     tags: [AI]
 *     summary: Get AI-powered bidding advice for an auction (Bidder)
 *     description: Analyzes auction history and suggests an optimal bid strategy.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [auctionId]
 *             properties:
 *               auctionId:
 *                 type: string
 *               budget:
 *                 type: number
 *                 description: Your maximum budget for this auction
 *                 example: 2000
 *     responses:
 *       200:
 *         description: Bid advice returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 advice:
 *                   type: string
 *                 suggestedBid:
 *                   type: number
 *                 confidence:
 *                   type: string
 */
router.post(
    "/bid-advice",
    isAuth,
    isAuthorised("Bidder"),
    bidAdvice
);

export default router;
