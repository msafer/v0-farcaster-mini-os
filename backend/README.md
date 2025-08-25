# Snel OS Backend

A comprehensive TypeScript backend for Snel OS, built with Fastify, Prisma, PostgreSQL, and WebSocket support.

## 🚀 Features

### Core Systems
- **Authentication**: Farcaster OAuth callback with optional Lens Profile linking
- **Posts**: Daily image posts with compression, S3 storage, and like system
- **Notes**: Auto-incrementing user notes with public/private visibility
- **Credits**: Off-chain ledger system with charges and daily free allowances
- **Daily Tasks**: Gamified task system with rewards
- **User Search**: Random eligible user discovery with reroll cooldown
- **Treasury**: Read-only financial summary endpoint
- **Chat**: WebSocket-based real-time chat with room support
- **Moderation**: Report system with auto-moderation hooks

### Technical Features
- **Image Processing**: Server-side compression and validation (≤2MB, ≤1440px)
- **Daily Limits**: One photo post per UTC day enforcement
- **Credits System**: Pay-per-action model (5¢ image, 10¢ reroll, 10¢ first like)
- **Free Allowances**: Daily free image OR free like via task completion
- **Rate Limiting**: 10-minute reroll cooldown per user
- **Atomic Transactions**: Charge + action wrapped in single DB transaction
- **Canonical URLs**: Public URLs for all posts and notes

## 📋 API Endpoints

### Authentication
- `POST /auth/fc/callback` - Farcaster OAuth token exchange
- `POST /link/lens` - Link Lens profile with wallet signature

### User Profile
- `GET /me` - Current user profile with credits and daily status
- `GET /users/:id` - Public user profile

### Posts
- `POST /posts` - Create image post (multipart/form-data)
- `GET /posts` - List all posts (public feed)
- `GET /feed` - Personalized feed (Lens users only)
- `GET /posts/:id` - Get specific post
- `POST /posts/:id/like` - Like a post

### Notes
- `POST /notes` - Create note
- `GET /notes` - List all public notes
- `GET /notes/:handle` - Get notes by user handle/lens profile
- `GET /notes/id/:id` - Get specific note
- `PUT /notes/id/:id` - Update note (owner only)
- `DELETE /notes/id/:id` - Delete note (owner only)

### Tasks
- `GET /tasks/today` - Get today's available tasks
- `POST /tasks/:id/complete` - Complete a task
- `GET /tasks/stats` - User task completion stats

### Search
- `GET /search/random10` - Get 10 random eligible users
- `POST /search/reroll` - Reroll search (costs 10¢)
- `GET /search/users?q=query` - Search users by handle
- `GET /search/users/:id` - Get user profile

### Treasury
- `GET /treasury/summary` - Public treasury summary
- `GET /treasury/stats` - Detailed treasury statistics

### Moderation
- `POST /report` - Submit content report
- `GET /admin/reports` - List reports (admin)
- `POST /admin/reports/:id/review` - Review report (admin)
- `GET /admin/moderation/stats` - Moderation statistics (admin)

### Chat
- `WS /chat?room=ROOM&token=TOKEN` - WebSocket chat connection
- `GET /chat/messages?room=ROOM` - Get chat history
- `GET /chat/rooms/:room/stats` - Room statistics
- `DELETE /chat/messages/:id` - Delete message (owner only)

### Health
- `GET /health` - Health check endpoint

## 🛠 Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- S3-compatible storage (AWS S3, MinIO, etc.)

### Installation

1. **Clone and install dependencies**
\`\`\`bash
cd backend
npm install
\`\`\`

2. **Environment setup**
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. **Database setup**
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
\`\`\`

4. **Start development server**
\`\`\`bash
npm run dev
\`\`\`

## ⚙️ Environment Variables

See `.env.example` for all required environment variables:

- **Database**: `DATABASE_URL`
- **Server**: `PORT`, `NODE_ENV`, `JWT_SECRET`
- **S3 Storage**: `S3_ENDPOINT`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, etc.
- **Farcaster**: `FARCASTER_CLIENT_ID`, `FARCASTER_CLIENT_SECRET`
- **Limits**: `MAX_IMAGE_SIZE_MB`, `REROLL_COOLDOWN_MINUTES`
- **Pricing**: `COST_POST_IMAGE`, `COST_REROLL_SEARCH`, `COST_FIRST_LIKE`

## 🗄️ Database Schema

### Core Models
- **User**: Farcaster ID, wallets, Lens profile, credits, free usage tracking
- **Post**: User posts with images, tags, like counts
- **PostLike**: Like relationships (unique per user/post)
- **Note**: Auto-incrementing notes with markdown content
- **DailyTask**: JSON-stored daily tasks
- **TaskCompletion**: User task completion tracking
- **Eligibility**: Daily user eligibility for search
- **ChatMessage**: Real-time chat messages by room
- **CreditsLedger**: All credit transactions with metadata
- **Report**: Content moderation reports
- **Treasury**: System-wide statistics

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm test -- posts.test.ts
\`\`\`

### Test Coverage
- Credits system (charging, daily free status)
- Posts (daily limits, image validation, likes)
- Notes (auto-increment, access control)
- Image processing validation
- Reroll cooldown enforcement

## 🔒 Security Features

- JWT-based authentication
- Wallet signature verification for Lens linking
- Input validation with Zod schemas
- SQL injection prevention via Prisma
- Rate limiting and cooldowns
- Content moderation hooks
- Graceful error handling

## 📊 Business Logic

### Credits System
- **Image Post**: 5¢ (waived if daily free available)
- **Reroll Search**: 10¢ (no free option)
- **First Like**: 10¢ per post per user (waived if daily free available)
- **Task Completion**: Grants daily free + 10¢ bonus

### Daily Limits
- One image post per UTC day per user
- Free image OR free like available via task completion
- Reroll cooldown: 10 minutes per user

### Content Rules
- Images: Auto-compressed to ≤2MB and ≤1440px
- Chat: 180 characters max, text + emoji only
- Notes: Markdown supported, public/private visibility

## 🚀 Production Deployment

1. **Database**
   - Set up PostgreSQL instance
   - Run `npm run db:migrate` on production DB

2. **Storage**
   - Configure S3-compatible storage
   - Set up CDN for public image URLs

3. **Environment**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure proper CORS origins

4. **Monitoring**
   - Health check endpoint at `/health`
   - Structured logging via Pino
   - Error tracking and metrics

## 📝 API Usage Examples

### Authentication Flow
\`\`\`bash
# 1. User completes Farcaster OAuth, get code
# 2. Exchange code for session
curl -X POST http://localhost:3001/auth/fc/callback \
  -H "Content-Type: application/json" \
  -d '{"code":"oauth_code_here"}'

# Response: {"token":"jwt_token","user":{...}}
\`\`\`

### Create Post
\`\`\`bash
curl -X POST http://localhost:3001/posts \
  -H "Authorization: Bearer jwt_token" \
  -F "image=@photo.jpg" \
  -F "promptTag=nature"
\`\`\`

### WebSocket Chat
\`\`\`javascript
const ws = new WebSocket('ws://localhost:3001/chat?room=general&token=jwt_token');
ws.send(JSON.stringify({type: 'message', text: 'Hello!'}));
\`\`\`

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update API documentation
4. Use conventional commit messages
5. Ensure all tests pass

## 📄 License

MIT License - see LICENSE file for details
