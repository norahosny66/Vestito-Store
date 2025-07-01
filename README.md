# Fashion Customizer - AI-Powered Custom Clothing

A modern e-commerce platform for customizable fashion with AI-powered design generation using Together AI and secure payments via Stripe.

## 🌟 Live Demo

Visit the live application: **[https://vestito.netlify.app](https://vestitostore.netlify.app/)**

## Features

- **AI-Powered Customization**: Generate custom clothing designs using Together AI's FLUX model
- **Product Catalog**: Browse and filter fashion items with high-quality images
- **Real-time Preview**: See AI-generated previews of your customizations
- **Secure Payments**: Stripe integration for deposit payments (demo mode)
- **User Authentication**: Supabase auth with email/password
- **Admin Dashboard**: Manage custom orders and track business metrics
- **Responsive Design**: Works seamlessly on all devices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Together AI
VITE_TOGETHER_API_KEY=your_together_api_key_here

# Supabase
VITE_SUPABASE_URL=https://iidpiqbdilfrydxhviwt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZHBpcWJkaWxmcnlkeGh2aXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzY5NjcsImV4cCI6MjA2NjY1Mjk2N30._tYbzXPYowhKrwCQfACxAGbz4DPwty0Acp1y929Aiks

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ReqRBPvYhY0SUYRvpAzdGbeKt8EZKRQHXNBGgppo8Xk1x5uY49HrWiwpFn4yPO2zhd7jYXs2IWClfee9Ycol6AS004BvX7qHN
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

### 3. API Keys Setup

#### Together AI
1. Sign up at [https://api.together.xyz](https://api.together.xyz)
2. Get your API key from [https://api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys)

#### Stripe (Demo Mode)
- **Publishable Key**: Already configured for demo
- **Test Card**: Use `4242 4242 4242 4242` with any future expiry date and CVV
- **Live Integration**: Replace with your own Stripe keys for production

### 4. Start Development Server

```bash
npm run dev
```

## How It Works

1. **Browse Products**: Users can explore the fashion catalog
2. **Customize**: Click "Customize with AI" on any product
3. **Describe Changes**: Write a text prompt describing desired modifications
4. **AI Generation**: Together AI generates a customized version using FLUX.1-kontext-dev
5. **Preview & Approve**: Users review the AI-generated design
6. **Secure Payment**: Stripe processes the 50% deposit payment (demo mode)
7. **Order Processing**: Approved designs go into production

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Together AI (FLUX.1-kontext-dev model)
- **Payments**: Stripe (demo integration)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify

## Database Schema

### Tables
- **User**: User profiles and authentication data
- **items**: Product catalog with images, prices, and details
- **customizations**: User customization requests with AI-generated images
- **orders**: Order tracking and payment status

### Key Features
- Row Level Security (RLS) enabled on all tables
- Automatic timestamps and UUIDs
- Foreign key relationships for data integrity

## API Integration

### Together AI
- **Model**: `black-forest-labs/FLUX.1-kontext-dev`
- **Input**: Original product image + text prompt
- **Output**: Base64-encoded customized image
- **Resolution**: 768x1024 pixels

### Stripe (Demo Mode)
- **Test Card**: 4242 4242 4242 4242
- **Payment Flow**: Simulated for demonstration
- **Integration**: Ready for production Stripe setup

## Demo Features

### Test the Application
1. **Browse Products**: View the curated fashion collection
2. **Sign Up/Login**: Create an account or sign in
3. **Customize Items**: Try AI-powered customization with prompts like:
   - "Make the sleeves longer and add lace details"
   - "Change the color to lavender with gold accents"
   - "Convert to off-shoulder style with flowing fabric"
4. **Payment Demo**: Use test card `4242 4242 4242 4242`
5. **Track Orders**: View your customizations in "My Customizations"

### Admin Dashboard
- Access at `/admin` route
- View order statistics and manage customizations
- Track business metrics and customer requests

## Environment Variables

### Required for Full Functionality
- `VITE_TOGETHER_API_KEY`: Your Together AI API key (for AI customization)
- `VITE_SUPABASE_URL`: Supabase project URL (pre-configured)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (pre-configured)
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (pre-configured for demo)

### Optional for Production
- `STRIPE_SECRET_KEY`: Your Stripe secret key (for live payments)

## Deployment

The application is deployed on Netlify at: **https://vestito.netlify.app**

### Deploy Your Own Version
1. Fork this repository
2. Connect to Netlify
3. Add your environment variables
4. Deploy automatically

## Development Notes

- **AI Integration**: Located in `src/services/togetherAI.ts`
- **Payment Processing**: Located in `src/lib/stripe.ts` and `src/components/payment/`
- **Database Services**: Located in `src/services/database.ts`
- **Authentication**: Context in `src/contexts/AuthContext.tsx`
- **Customization Flow**: Starts in `src/components/customization/CustomizationForm.tsx`
- **Admin Dashboard**: Available at `/admin` route

## Security Features

- **Row Level Security**: All database tables protected with RLS
- **Secure Payments**: PCI-compliant Stripe integration (demo mode)
- **Environment Variables**: Sensitive data stored securely
- **Authentication**: Supabase auth with email verification
- **CORS Protection**: Proper CORS headers on all API endpoints

## Production Considerations

### For Live Deployment
1. **Stripe Setup**: Replace test keys with live Stripe keys
2. **Webhook Configuration**: Set up Stripe webhooks for payment confirmations
3. **Together AI Credits**: Ensure sufficient API credits for AI generation
4. **Database Scaling**: Monitor Supabase usage and upgrade plan as needed
5. **Error Monitoring**: Implement error tracking (Sentry, etc.)

### Performance Optimizations
- Image optimization and CDN integration
- Database query optimization
- Caching strategies for frequently accessed data
- Progressive loading for large product catalogs

## Support

For issues with integrations:

1. **Together AI**: Check API key and account credits
2. **Stripe**: Verify webhook endpoints and test mode
3. **Supabase**: Ensure database migrations are applied
4. **Network**: Check connectivity for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Built with ❤️ using Bolt.new**
