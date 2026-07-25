import express from "express";
import { isAuth, isAuthorised } from "../middlewares/auth.js";
import {
    getWallet,
    getMyWithdrawals,
    requestWithdrawal,
    topUpWallet,
} from "../controllers/walletController.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/wallet:
 *   get:
 *     tags: [Wallet]
 *     summary: Get current user's wallet balance and transaction history
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet data returned
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", isAuth, getWallet);

/**
 * @swagger
 * /api/v1/wallet/top-up:
 *   post:
 *     tags: [Wallet]
 *     summary: Add funds to wallet (Bidder only — simulated top-up for demo)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
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
 *                 description: Amount to add to wallet
 *                 minimum: 100
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Wallet topped up successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     newBalance:
 *                       type: number
 *                       example: 6500
 *       400:
 *         description: Invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/top-up", isAuth, isAuthorised("Bidder"), topUpWallet);

/**
 * @swagger
 * /api/v1/wallet/withdrawals:
 *   get:
 *     tags: [Wallet]
 *     summary: Get current user's withdrawal request history
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Withdrawal requests returned
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
 *   post:
 *     tags: [Wallet]
 *     summary: Request a wallet withdrawal (Bidder or Auctioneer)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, bankDetails]
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw (must not exceed wallet balance)
 *                 example: 1000
 *               bankDetails:
 *                 type: object
 *                 properties:
 *                   bankName:
 *                     type: string
 *                     example: State Bank of India
 *                   accountNumber:
 *                     type: string
 *                     example: "12345678901"
 *                   ifsc:
 *                     type: string
 *                     example: SBIN0001234
 *                   accountHolderName:
 *                     type: string
 *                     example: John Doe
 *     responses:
 *       201:
 *         description: Withdrawal request submitted, pending admin approval
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     withdrawal:
 *                       $ref: '#/components/schemas/WithdrawalRequest'
 *       400:
 *         description: Insufficient balance or invalid bank details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/withdrawals", isAuth, getMyWithdrawals);
router.post(
    "/withdrawals",
    isAuth,
    isAuthorised("Auctioneer", "Bidder"),
    requestWithdrawal
);

export default router;
