import express from "express";
import { runEndedAuctionTasks } from "../automation/endedAuctionCron.js";
import { cleanupExpiredDemoSessions } from "../utils/demoMode.js";

const router = express.Router();

const requireCronAccess = (req, res, next) => {
    if (process.env.NODE_ENV !== "production" && !process.env.CRON_SECRET) {
        return next();
    }

    const expectedToken = process.env.CRON_SECRET;
    const authorization = req.get("authorization") || "";
    if (expectedToken && authorization === `Bearer ${expectedToken}`) {
        return next();
    }

    const err = new Error("Cron access denied");
    err.statusCode = 401;
    return next(err);
};

/**
 * @swagger
 * /api/v1/cron/auctions:
 *   get:
 *     tags: [Cron]
 *     summary: Settle all ended auctions — close, pick winner, release escrow
 *     description: |
 *       Triggered by an external cron scheduler. Requires `Authorization: Bearer {CRON_SECRET}` header in production.
 *       In development (no CRON_SECRET), this endpoint is open.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Auction settlement tasks completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   type: string
 *                   example: auctions
 *                 result:
 *                   type: object
 *                   properties:
 *                     settled:
 *                       type: integer
 *                     errors:
 *                       type: integer
 *       401:
 *         description: Invalid or missing CRON_SECRET
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/auctions", requireCronAccess, async (req, res, next) => {
    try {
        const result = await runEndedAuctionTasks();
        return res.status(200).json({
            success: true,
            task: "auctions",
            result,
        });
    } catch (error) {
        return next(error);
    }
});

/**
 * @swagger
 * /api/v1/cron/all:
 *   get:
 *     tags: [Cron]
 *     summary: Run all scheduled tasks — auction settlement + demo session cleanup
 *     description: |
 *       Runs both `auctions` and `demoCleanup` tasks in sequence.
 *       Requires `Authorization: Bearer {CRON_SECRET}` header in production.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All cron tasks completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *                   properties:
 *                     auctions:
 *                       type: object
 *                     demoCleanup:
 *                       type: object
 *       401:
 *         description: Invalid or missing CRON_SECRET
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/all", requireCronAccess, async (req, res, next) => {
    try {
        const auctions = await runEndedAuctionTasks();
        const demoCleanup = await cleanupExpiredDemoSessions();
        return res.status(200).json({
            success: true,
            result: {
                auctions,
                demoCleanup,
            },
        });
    } catch (error) {
        return next(error);
    }
});

export default router;
