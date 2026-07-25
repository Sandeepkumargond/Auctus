import {
    addnewAuction,
    getAllItem,
    getAuctionDetails,
    removefromAuction,
    republishItem,
    getMyAuctionItems,
    updateAuctionItem,
    saveAuctionDraft,
    publishAuctionDraft,
    getSellerDashboard,
    getSmartRecommendations,
    reviewSeller,
    getAuctionSync,
    streamAuctionEvents,
} from "../controllers/auctioncontroller.js";
import {
    respondToFulfillmentIssue,
    updateShipmentStatus,
} from "../controllers/fulfillmentController.js";
import { isAuth, isAuthorised, optionalAuth } from "../middlewares/auth.js";
import { requireAuctioneerKyc } from "../middlewares/kyc.js";
import express from "express";
const router = express.Router();

/**
 * @swagger
 * /api/v1/auctionitem/allitems:
 *   get:
 *     tags: [Auctions]
 *     summary: Get all active/upcoming auction listings
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title keyword
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of auction items
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuctionItem'
 *                     total:
 *                       type: integer
 */
router.get("/allitems", optionalAuth, getAllItem);

/**
 * @swagger
 * /api/v1/auctionitem/create:
 *   post:
 *     tags: [Auctions]
 *     summary: Create a new auction listing (Auctioneer + KYC required)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, category, condition, startingBid, startTime, endTime]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Vintage Leica Camera
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 example: Electronics
 *               condition:
 *                 type: string
 *                 enum: [Brand New, Like New, Used, Fair, Refurbished]
 *               startingBid:
 *                 type: number
 *                 example: 1000
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Auction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     item:
 *                       $ref: '#/components/schemas/AuctionItem'
 *       401:
 *         description: Not authenticated or KYC not approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/create", isAuth, isAuthorised("Auctioneer"), requireAuctioneerKyc, addnewAuction);

/**
 * @swagger
 * /api/v1/auctionitem/draft:
 *   post:
 *     tags: [Auctions]
 *     summary: Save an auction as draft (Auctioneer + KYC required)
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               startingBid:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Draft saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post("/draft", isAuth, isAuthorised("Auctioneer"), requireAuctioneerKyc, saveAuctionDraft);

/**
 * @swagger
 * /api/v1/auctionitem/smart-recommendations:
 *   get:
 *     tags: [Auctions]
 *     summary: Get AI-powered personalized auction recommendations
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended auction items
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuctionItem'
 */
router.get("/smart-recommendations", isAuth, getSmartRecommendations);

/**
 * @swagger
 * /api/v1/auctionitem/auction/{id}:
 *   get:
 *     tags: [Auctions]
 *     summary: Get full details of a specific auction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction item ID
 *     responses:
 *       200:
 *         description: Auction details with bids
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     auctionItem:
 *                       $ref: '#/components/schemas/AuctionItem'
 *                     bids:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Bid'
 *       404:
 *         description: Auction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/auction/:id", optionalAuth, getAuctionDetails);

/**
 * @swagger
 * /api/v1/auctionitem/auction/{id}/sync:
 *   get:
 *     tags: [Auctions]
 *     summary: Get real-time sync state for an auction (polling)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current auction sync state (bid count, current bid, status)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentBid:
 *                   type: number
 *                 bidCount:
 *                   type: integer
 *                 status:
 *                   type: string
 */
router.get("/auction/:id/sync", optionalAuth, getAuctionSync);

/**
 * @swagger
 * /api/v1/auctionitem/auction/{id}/stream:
 *   get:
 *     tags: [Auctions]
 *     summary: Subscribe to live auction events via Server-Sent Events (SSE)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SSE stream — emits bid, status, and close events
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get("/auction/:id/stream", optionalAuth, streamAuctionEvents);

/**
 * @swagger
 * /api/v1/auctionitem/seller-dashboard:
 *   get:
 *     tags: [Auctions]
 *     summary: Get seller dashboard analytics and earnings summary
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAuctions:
 *                   type: integer
 *                 totalEarnings:
 *                   type: number
 *                 activeAuctions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuctionItem'
 */
router.get("/seller-dashboard", isAuth, isAuthorised("Auctioneer"), getSellerDashboard);

/**
 * @swagger
 * /api/v1/auctionitem/myitems:
 *   get:
 *     tags: [Auctions]
 *     summary: Get all auctions created by the current auctioneer
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Auctioneer's listings
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     myAuctions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuctionItem'
 */
router.get("/myitems", isAuth, isAuthorised("Auctioneer"), getMyAuctionItems);

/**
 * @swagger
 * /api/v1/auctionitem/update/{id}:
 *   put:
 *     tags: [Auctions]
 *     summary: Update an existing auction (Auctioneer + KYC)
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startingBid:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Auction updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/update/:id", isAuth, isAuthorised("Auctioneer"), requireAuctioneerKyc, updateAuctionItem);

/**
 * @swagger
 * /api/v1/auctionitem/publish/{id}:
 *   put:
 *     tags: [Auctions]
 *     summary: Publish a saved draft auction (Auctioneer + KYC)
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
 *         description: Draft published as live auction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/publish/:id", isAuth, isAuthorised("Auctioneer"), requireAuctioneerKyc, publishAuctionDraft);

/**
 * @swagger
 * /api/v1/auctionitem/review/{id}:
 *   post:
 *     tags: [Auctions]
 *     summary: Leave a review for the seller after winning an auction (Bidder only)
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
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Item exactly as described, fast delivery
 *     responses:
 *       200:
 *         description: Review submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post("/review/:id", isAuth, isAuthorised("Bidder"), reviewSeller);

/**
 * @swagger
 * /api/v1/auctionitem/fulfillment/{id}/status:
 *   put:
 *     tags: [Fulfillment]
 *     summary: Update shipment/delivery status for a sold auction (Auctioneer)
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [packed, dispatched, delivered]
 *               trackingNumber:
 *                 type: string
 *                 example: IND123456789
 *               courier:
 *                 type: string
 *                 example: BlueDart
 *     responses:
 *       200:
 *         description: Shipment status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/fulfillment/:id/status", isAuth, isAuthorised("Auctioneer"), updateShipmentStatus);

/**
 * @swagger
 * /api/v1/auctionitem/fulfillment/{id}/issue-response:
 *   put:
 *     tags: [Fulfillment]
 *     summary: Respond to a buyer's fulfillment dispute (Auctioneer)
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
 *             required: [response]
 *             properties:
 *               response:
 *                 type: string
 *                 example: Item was shipped on time, tracking ID provided
 *     responses:
 *       200:
 *         description: Response submitted to dispute
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/fulfillment/:id/issue-response", isAuth, isAuthorised("Auctioneer"), respondToFulfillmentIssue);

/**
 * @swagger
 * /api/v1/auctionitem/delete/{id}:
 *   delete:
 *     tags: [Auctions]
 *     summary: Delete an auction listing (Auctioneer, own items only)
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
 *         description: Auction deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Not authorized to delete this item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/delete/:id", isAuth, isAuthorised("Auctioneer"), removefromAuction);

/**
 * @swagger
 * /api/v1/auctionitem/item/republish/{id}:
 *   put:
 *     tags: [Auctions]
 *     summary: Republish an unsold or cancelled auction (Auctioneer + KYC)
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
 *             required: [startTime, endTime]
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Auction republished
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/item/republish/:id", isAuth, isAuthorised("Auctioneer"), requireAuctioneerKyc, republishItem);

export default router;
