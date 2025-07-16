# Lulo Style App 👗✨

A modern fashion and style management application that helps users organize their wardrobe, create wishlist items, and connect with a style-focused community.

## 🌟 Features

### 👔 Closet Management
- **Digital Wardrobe**: Upload and organize your clothing items
- **AI Image Analysis**: Automatic categorization and tagging of clothing items using OpenAI
- **Smart Organization**: Filter and search through your closet items
- **Item Details**: Track purchase dates, prices, brands, and personal notes

### 💫 Wishlist System
- **Save Desired Items**: Keep track of items you want to purchase
- **Price Tracking**: Monitor price changes on wishlist items
- **Priority Management**: Organize items by importance and urgency

### 📚 Lookbook Creator
- **Style Combinations**: Create and save outfit combinations
- **Visual Planning**: Mix and match items from your closet
- **Inspiration Boards**: Curate looks for different occasions

### 🌐 Social Features
- **Community Connection**: Follow other users and discover new styles
- **Style Sharing**: Share your favorite outfits and looks
- **Activity Feed**: Stay updated with community fashion trends

### 🎯 Smart Features
- **Image Recognition**: AI-powered analysis of clothing items
- **Style Icons**: Discover and follow fashion inspiration
- **Lulo Points**: Gamified experience with rewards system

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI Integration**: OpenAI API for image analysis
- **State Management**: React Query (TanStack Query)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nickloopdsp/lulo.git
   cd lulo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_VISION_API_KEY=your_google_vision_api_key_here
   ```

4. **Initialize the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   # Using the development script
   chmod +x run-dev.sh
   ./run-dev.sh
   
   # Or manually
   PORT=5001 npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5001`

## 📁 Project Structure

```
lulo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages/routes
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── index.html
├── server/                # Express backend
│   ├── services/          # Business logic services
│   ├── routes.ts          # API route definitions
│   ├── db.ts             # Database configuration
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── drizzle/             # Database migrations
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio

## 🔑 Environment Variables

Create a `server/.env` file with the following variables:

```env
# Required: OpenAI API key for image analysis
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Google Vision API for enhanced image recognition
GOOGLE_VISION_API_KEY=your_google_vision_api_key_here

# Optional: Custom database URL (defaults to local SQLite)
DATABASE_URL=sqlite:lulo.db

# Optional: Custom port (defaults to 5001)
PORT=5001
```

## 🚀 Deployment

### Development
The app runs on port 5001 by default to avoid conflicts with other services.

### Production
1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI style recommendations
- [ ] Integration with e-commerce platforms
- [ ] Social marketplace features
- [ ] Style trend analytics
- [ ] Virtual try-on capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Powered by OpenAI for intelligent image analysis
- UI components from shadcn/ui
- Icons and design inspiration from the fashion community

---

**Made with ❤️ for fashion enthusiasts** 