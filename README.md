# Shoe Shoe - Children's Shoe Marketplace

A full-stack marketplace for buying and selling children's shoes - singles or pairs!

## Features

- **Landing Page**: Choose between single shoes or pairs
- **Buy/Sell Portal**: Separate portals for buyers and sellers
- **Seller Features**:
  - Upload shoes with images (up to 5 images)
  - Set brand, year, color, size, condition, description, and price
  - Manage listings and transactions
  - Confirm shipment with tracking
  - Receive ratings from buyers

- **Buyer Features**:
  - Browse available shoes in tile/grid format
  - Make offers or buy at asking price
  - Guest checkout option
  - Track shipment
  - Rate sellers after delivery

- **Transaction Flow**:
  - Buyer initiates purchase or makes counteroffer
  - Seller accepts/rejects counteroffer
  - Payment processing placeholder
  - Shipping confirmation with tracking
  - Delivery confirmation
  - Rating system

- **Notifications**: Real-time notifications for sellers on sales, counteroffers, and ratings

- **Service Fee**: $0.99 fee added to each purchase

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js (email/password + guest support)
- **Image Storage**: Base64 (can be upgraded to Cloudinary)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd shoe-shoe
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

The `.env` file is already configured with defaults:

- `DATABASE_URL`: SQLite database file location
- `NEXTAUTH_SECRET`: Secret for NextAuth (change in production!)
- `NEXTAUTH_URL`: URL for NextAuth callbacks

### Optional (for production):

- Cloudinary credentials for image hosting
- Stripe credentials for payment processing

## Project Structure

```
shoe-shoe/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── shoes/        # Shoe listing endpoints
│   │   ├── transactions/ # Transaction endpoints
│   │   ├── ratings/      # Rating endpoints
│   │   └── notifications/# Notification endpoints
│   ├── auth/             # Auth pages
│   ├── buy/              # Buyer browse page
│   ├── sell/             # Seller upload page
│   ├── shoe/[id]/        # Individual shoe detail page
│   ├── transaction/[id]/ # Transaction detail page
│   ├── rate/[id]/        # Rating page
│   ├── notifications/    # Notifications page
│   ├── portal/           # Buy/Sell selection page
│   └── page.tsx          # Landing page
├── components/           # React components
├── lib/                  # Utilities
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
├── prisma/
│   └── schema.prisma    # Database schema
└── types/               # TypeScript type definitions
```

## Database Schema

- **User**: Authentication and profile data
- **Shoe**: Shoe listings with details
- **Transaction**: Sales and purchases
- **Rating**: User ratings
- **Notification**: User notifications

## Usage

### For Sellers:

1. Sign up or sign in
2. Choose "Single Shoes" or "Pairs" from the homepage
3. Click "Sell"
4. Fill out the shoe details form
5. Upload images (up to 5)
6. Set your price
7. Wait for buyers to make offers
8. Accept/reject counteroffers
9. Confirm shipment when ready
10. Receive ratings from buyers

### For Buyers:

1. Choose "Single Shoes" or "Pairs" from the homepage
2. Click "Buy"
3. Browse available shoes
4. Click on a shoe to view details
5. Make an offer or buy at asking price
6. Can checkout as guest or signed-in user
7. Wait for seller to accept
8. Receive shipping confirmation
9. Confirm delivery
10. Rate the seller

## Future Enhancements

- Payment integration with Stripe
- Image hosting with Cloudinary
- Email notifications
- Advanced search and filtering
- Seller profiles with ratings
- Messaging system between buyers and sellers
- Mobile app companion
- Social media integration
- Saved searches and favorites
- Price negotiation chat

## License

MIT
