import express from 'express';
import { isAuth, isAuthorised } from "../middlewares/auth.js";
import {
    removefromAuction,
    fetchAdminOverview,
    fetchAdminOperations,
    fetchAllusers,
    fetchUsersList,
    updateUserStatus,
    warnSellerRisk,
    requireSellerKycReview,
    fetchKycSubmissions,
    updateKycStatus,
    fetchAuditLogs,
    monthlyRevenue,
} from '../controllers/superadmincontroller.js';
import {
    fetchWithdrawalRequests,
    reviewWithdrawalRequest,
} from "../controllers/walletController.js";
import {
    fetchFulfillmentDisputes,
    fetchFulfillmentSettlements,
    reviewFulfillmentDispute,
    reviewFulfillmentSettlement,
} from "../controllers/fulfillmentController.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/superadmin/auctionitem/delete/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Force-remove any auction listing (Super Admin)
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
 *         description: Auction removed by admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Not a Super Admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/auctionitem/delete/:id", isAuth, isAuthorised("Super Admin"), removefromAuction);

/**
 * @swagger
 * /api/v1/superadmin/overview:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard overview — users, auctions, revenue summary
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalAuctions:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                 pendingWithdrawals:
 *                   type: integer
 */
router.get("/overview", isAuth, isAuthorised("Super Admin"), fetchAdminOverview);

/**
 * @swagger
 * /api/v1/superadmin/operations:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin operations data — active issues, disputes, settlements
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operations summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/operations", isAuth, isAuthorised("Super Admin"), fetchAdminOperations);

/**
 * @swagger
 * /api/v1/superadmin/users/getall:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users with full details (Super Admin)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users returned
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get("/users/getall", isAuth, isAuthorised("Super Admin"), fetchAllusers);

/**
 * @swagger
 * /api/v1/superadmin/users/list:
 *   get:
 *     tags: [Admin]
 *     summary: Get simplified user list for admin tables
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/users/list", isAuth, isAuthorised("Super Admin"), fetchUsersList);

/**
 * @swagger
 * /api/v1/superadmin/users/status/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Enable or disable a user account (Super Admin)
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
 *                 enum: [active, suspended]
 *     responses:
 *       200:
 *         description: User status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/users/status/:id", isAuth, isAuthorised("Super Admin"), updateUserStatus);

/**
 * @swagger
 * /api/v1/superadmin/users/{id}/warn-risk:
 *   post:
 *     tags: [Admin]
 *     summary: Issue a risk warning to a seller (Super Admin)
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
 *                 example: Multiple unresolved delivery disputes
 *     responses:
 *       200:
 *         description: Warning issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post("/users/:id/warn-risk", isAuth, isAuthorised("Super Admin"), warnSellerRisk);

/**
 * @swagger
 * /api/v1/superadmin/users/{id}/kyc-rereview:
 *   put:
 *     tags: [Admin]
 *     summary: Require a seller to resubmit KYC (Super Admin)
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
 *         description: KYC re-review required — seller notified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/users/:id/kyc-rereview", isAuth, isAuthorised("Super Admin"), requireSellerKycReview);

/**
 * @swagger
 * /api/v1/superadmin/kyc/submissions:
 *   get:
 *     tags: [Admin]
 *     summary: Get all pending KYC submissions for review (Super Admin)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC submissions list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/kyc/submissions", isAuth, isAuthorised("Super Admin"), fetchKycSubmissions);

/**
 * @swagger
 * /api/v1/superadmin/kyc/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Approve or reject a KYC submission (Super Admin)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: KYC submission ID
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
 *                 enum: [approved, rejected]
 *               remarks:
 *                 type: string
 *                 example: Document image unclear, please resubmit
 *     responses:
 *       200:
 *         description: KYC status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/kyc/:id", isAuth, isAuthorised("Super Admin"), updateKycStatus);

/**
 * @swagger
 * /api/v1/superadmin/audit-logs:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin audit log — all moderation actions (Super Admin)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Audit log entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/audit-logs", isAuth, isAuthorised("Super Admin"), fetchAuditLogs);

/**
 * @swagger
 * /api/v1/superadmin/wallet/withdrawals:
 *   get:
 *     tags: [Admin]
 *     summary: Get all pending withdrawal requests (Super Admin)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Withdrawal requests
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     withdrawals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WithdrawalRequest'
 */
router.get("/wallet/withdrawals", isAuth, isAuthorised("Super Admin"), fetchWithdrawalRequests);

/**
 * @swagger
 * /api/v1/superadmin/wallet/withdrawals/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Approve or reject a withdrawal request (Super Admin)
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
 *                 enum: [approved, rejected]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal reviewed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/wallet/withdrawals/:id", isAuth, isAuthorised("Super Admin"), reviewWithdrawalRequest);

/**
 * @swagger
 * /api/v1/superadmin/fulfillment/disputes:
 *   get:
 *     tags: [Admin]
 *     summary: Get all active fulfillment disputes (Super Admin)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fulfillment disputes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/fulfillment/disputes", isAuth, isAuthorised("Super Admin"), fetchFulfillmentDisputes);

/**
 * @swagger
 * /api/v1/superadmin/fulfillment/disputes/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Review and resolve a fulfillment dispute (Super Admin)
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
 *             required: [resolution]
 *             properties:
 *               resolution:
 *                 type: string
 *                 enum: [favour_buyer, favour_seller, partial_refund]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dispute resolved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/fulfillment/disputes/:id", isAuth, isAuthorised("Super Admin"), reviewFulfillmentDispute);

/**
 * @swagger
 * /api/v1/superadmin/fulfillment/settlements:
 *   get:
 *     tags: [Admin]
 *     summary: Get all escrow settlement records (Super Admin)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Escrow settlement records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/fulfillment/settlements", isAuth, isAuthorised("Super Admin"), fetchFulfillmentSettlements);

/**
 * @swagger
 * /api/v1/superadmin/fulfillment/settlements/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Review and approve an escrow settlement (Super Admin)
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
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settlement reviewed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put("/fulfillment/settlements/:id", isAuth, isAuthorised("Super Admin"), reviewFulfillmentSettlement);

/**
 * @swagger
 * /api/v1/superadmin/monthlyincome:
 *   get:
 *     tags: [Admin]
 *     summary: Get monthly revenue/income breakdown (Super Admin)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly income data for charts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 months:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "June 2026"
 *                       revenue:
 *                         type: number
 *                         example: 45000
 */
router.get("/monthlyincome", isAuth, isAuthorised("Super Admin"), monthlyRevenue);

export default router;
