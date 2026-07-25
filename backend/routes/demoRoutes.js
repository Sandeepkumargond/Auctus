import express from "express";
import { isAuth } from "../middlewares/auth.js";
import {
  requireDemoDatabase,
  requireProductionDatabase,
} from "../middlewares/database.js";
import asyncErrorHandler from "../middlewares/asyncErrorHandler.js";
import {
  clearDemoAuthCookie,
  convertDemoWatchlist,
  endDemoSession,
  getDemoDashboardPath,
  issueDemoAuthToken,
  normalizeDemoPersona,
  startDemoSession,
  switchDemoPersona,
} from "../utils/demoMode.js";
import { isDemoModeEnabled } from "../utils/demoScope.js";

const router = express.Router();

const requireDemoMode = (req, res, next) => {
  if (isDemoModeEnabled()) return next();

  const err = new Error("Demo mode is unavailable because MONGODB_URL is not configured");
  err.statusCode = 503;
  return next(err);
};

const serializeDemoUser = (user, demoSession, persona) => ({
  ...(user.toObject?.() || user),
  isDemo: true,
  demoSessionId: demoSession._id,
  demoExpiresAt: demoSession.expiresAt,
  demoPersona: persona,
});

/**
 * @swagger
 * /api/v1/demo/status:
 *   get:
 *     tags: [Demo]
 *     summary: Check if demo mode is available
 *     responses:
 *       200:
 *         description: Demo availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 available:
 *                   type: boolean
 *                 ttlHours:
 *                   type: integer
 *                   example: 24
 *                 personas:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [Bidder, Auctioneer, Super Admin]
 *                 message:
 *                   type: string
 */
router.get("/status", (req, res) => {
  const ttlHours = Number(process.env.DEMO_SESSION_TTL_HOURS || 24);
  return res.status(200).json({
    success: true,
    available: isDemoModeEnabled(),
    ttlHours: Number.isFinite(ttlHours) && ttlHours > 0 ? ttlHours : 24,
    personas: ["Bidder", "Auctioneer", "Super Admin"],
    message: isDemoModeEnabled()
      ? "Demo Mode is available"
      : "Demo Mode is unavailable until MONGODB_URL is configured",
  });
});

/**
 * @swagger
 * /api/v1/demo/start:
 *   post:
 *     tags: [Demo]
 *     summary: Start a sandboxed demo session
 *     description: |
 *       Creates an isolated demo session with a pre-seeded persona (Bidder, Auctioneer, or Super Admin).
 *       Demo data is scoped to the session and expires automatically after TTL hours.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona:
 *                 type: string
 *                 enum: [Bidder, Auctioneer, Super Admin]
 *                 default: Bidder
 *                 example: Bidder
 *     responses:
 *       201:
 *         description: Demo session started, JWT issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 demo:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     persona:
 *                       type: string
 *                     dashboardPath:
 *                       type: string
 *                     limitations:
 *                       type: string
 *       503:
 *         description: Demo mode not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/start",
  requireDemoMode,
  requireDemoDatabase,
  asyncErrorHandler(async (req, res) => {
    const { demoSession, user, persona, conversionToken } = await startDemoSession({
      req,
      persona: req.body?.persona,
    });
    const token = issueDemoAuthToken({ user, demoSession, persona, res });

    return res.status(201).json({
      success: true,
      message: "Demo Mode started",
      token,
      conversionToken,
      user: serializeDemoUser(user, demoSession, persona),
      demo: {
        sessionId: demoSession._id,
        expiresAt: demoSession.expiresAt,
        persona,
        dashboardPath: getDemoDashboardPath(persona),
        limitations:
          "Demo money, bids, auctions, shipments, and admin actions are sandbox-only and reset after 24 hours.",
      },
    });
  })
);

/**
 * @swagger
 * /api/v1/demo/switch:
 *   post:
 *     tags: [Demo]
 *     summary: Switch persona within the current demo session
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [persona]
 *             properties:
 *               persona:
 *                 type: string
 *                 enum: [Bidder, Auctioneer, Super Admin]
 *     responses:
 *       200:
 *         description: Persona switched, new JWT issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Not in demo mode
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/switch",
  requireDemoMode,
  requireDemoDatabase,
  isAuth,
  asyncErrorHandler(async (req, res, next) => {
    if (!req.isDemo) {
      const err = new Error("Persona switching is available only inside Demo Mode");
      err.statusCode = 403;
      return next(err);
    }

    const { demoSession, user, persona } = await switchDemoPersona({
      demoSessionId: req.demoSessionId,
      persona: req.body?.persona,
    });
    const token = issueDemoAuthToken({ user, demoSession, persona, res });

    return res.status(200).json({
      success: true,
      message: `Switched to ${persona}`,
      token,
      user: serializeDemoUser(user, demoSession, persona),
      demo: {
        sessionId: demoSession._id,
        expiresAt: demoSession.expiresAt,
        persona,
        dashboardPath: getDemoDashboardPath(persona),
      },
    });
  })
);

/**
 * @swagger
 * /api/v1/demo/session:
 *   delete:
 *     tags: [Demo]
 *     summary: End the current demo session and clear demo cookie
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Demo session ended
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.delete(
  "/session",
  requireDemoMode,
  requireDemoDatabase,
  isAuth,
  asyncErrorHandler(async (req, res) => {
    if (req.isDemo && req.demoSessionId) {
      await endDemoSession(req.demoSessionId);
    }
    clearDemoAuthCookie(res);
    return res.status(200).json({
      success: true,
      message: "Exited Demo Mode",
    });
  })
);

/**
 * @swagger
 * /api/v1/demo/convert-watchlist:
 *   post:
 *     tags: [Demo]
 *     summary: Copy demo watchlist interests to a real user account after signup
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               demoSessionId:
 *                 type: string
 *               conversionToken:
 *                 type: string
 *               persona:
 *                 type: string
 *     responses:
 *       200:
 *         description: Demo watchlist items copied to real account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 copiedCount:
 *                   type: integer
 *                 watchlist:
 *                   type: array
 *                   items:
 *                     type: string
 *       403:
 *         description: Cannot convert from inside a demo session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/convert-watchlist",
  requireDemoMode,
  requireProductionDatabase,
  isAuth,
  asyncErrorHandler(async (req, res, next) => {
    if (req.isDemo) {
      const err = new Error("Create a real account before converting demo intent");
      err.statusCode = 403;
      return next(err);
    }

    const result = await convertDemoWatchlist({
      realUser: req.user,
      demoSessionId: req.body?.demoSessionId,
      conversionToken: req.body?.conversionToken,
    });

    return res.status(200).json({
      success: true,
      message:
        result.copiedCount > 0
          ? "Demo watchlist interests copied to your real account"
          : "No demo watchlist interests were available to copy",
      copiedCount: result.copiedCount,
      watchlist: result.watchlist,
      persona: normalizeDemoPersona(req.body?.persona),
    });
  })
);

export default router;
