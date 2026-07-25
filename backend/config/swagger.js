import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auctus API',
      version: '1.0.0',
      description:
        'REST API for Auctus — a MERN auction marketplace with wallet-based bidding, ' +
        'escrow settlement, KYC verification, delivery tracking, and AI-powered helpers.',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Local development server',
      },
      {
        url: 'https://your-backend-domain.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT stored in HTTP-only cookie (set automatically on login)',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT bearer token (for clients that cannot use cookies)',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64b1234567890abcdef12345' },
            userName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            phone: { type: 'string', example: '9876543210' },
            address: { type: 'string', example: '123 Main St, City' },
            role: { type: 'string', enum: ['Bidder', 'Auctioneer', 'Super Admin'], example: 'Bidder' },
            profileImage: {
              type: 'object',
              properties: {
                public_id: { type: 'string' },
                url: { type: 'string' },
              },
            },
            kycStatus: { type: 'string', enum: ['not_submitted', 'pending', 'approved', 'rejected'] },
          },
        },
        AuctionItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Vintage Watch' },
            description: { type: 'string', example: 'A rare 1960s mechanical watch' },
            category: { type: 'string', example: 'Watches' },
            condition: { type: 'string', enum: ['Brand New', 'Like New', 'Used', 'Fair', 'Refurbished'] },
            startingBid: { type: 'number', example: 500 },
            currentBid: { type: 'number', example: 750 },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['Upcoming', 'Active', 'Ended', 'Cancelled', 'Draft'] },
            createdBy: { type: 'string', description: 'Auctioneer user ID' },
          },
        },
        Bid: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            auctionItem: { type: 'string' },
            bidder: { type: 'object', properties: { userName: { type: 'string' } } },
            amount: { type: 'number', example: 750 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            balance: { type: 'number', example: 1500 },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  amount: { type: 'number' },
                  description: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        WithdrawalRequest: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            amount: { type: 'number', example: 500 },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            bankDetails: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registration, login, and session management' },
      { name: 'User', description: 'Profile, watchlist, notifications, KYC' },
      { name: 'Auctions', description: 'Auction CRUD, listings, and marketplace' },
      { name: 'Bidding', description: 'Place bids and manage auto-bidding' },
      { name: 'Fulfillment', description: 'Delivery, shipment tracking, and disputes' },
      { name: 'Wallet', description: 'Wallet balance, top-up, and withdrawals' },
      { name: 'Admin', description: 'Super Admin dashboard and moderation tools' },
      { name: 'AI', description: 'Gemini-powered AI helpers for listings and bids' },
      { name: 'Demo', description: 'Sandboxed demo session management' },
      { name: 'Cron', description: 'Scheduled task triggers (cron secret required)' },
      { name: 'System', description: 'Health, readiness, and API root' },
    ],
  },
  apis: [
    './routes/*.js',
    './index.js',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
