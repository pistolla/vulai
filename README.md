# Unill Sports - Next.js React TypeScript Application

A modern, interactive university sports website built with Next.js, React, TypeScript, and TailwindCSS.

## Features

- **Interactive Sports Discovery**: Filter and search through 12+ university sports programs
- **Live Match Tracking**: Real-time updates and live scores for ongoing matches
- **Team Management**: Comprehensive team rosters with detailed player profiles
- **Schedule System**: Interactive calendar with match schedules and results
- **Data Visualization**: Charts and statistics for team performance
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Purple & Yellow Theme**: Modern, vibrant color scheme throughout the application

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom purple and yellow theme
- **Animations**: Anime.js, Typed.js, Splitting.js
- **Data Visualization**: ECharts.js
- **Particle Effects**: p5.js
- **Image Carousels**: Splide.js

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd unill-sports-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── components/
│   └── Layout.tsx          # Main layout component with navigation
├── pages/
│   ├── index.tsx           # Homepage with hero and sports showcase
│   ├── sports.tsx          # Sports details and information
│   ├── schedule.tsx        # Match schedules and results
│   ├── teams.tsx           # Team rosters and player profiles
│   └── _app.tsx            # Next.js app wrapper
├── data/
│   └── sports.ts           # Sports data and mock information
├── types/
│   └── index.ts            # TypeScript interfaces and types
├── styles/
│   └── globals.css         # Global styles and animations
└── public/
    └── resources/          # Images and static assets
```

## Key Features Implementation

### Interactive Components
- **Sports Filter**: Real-time filtering by team/individual sports
- **Search Functionality**: Search across sports, teams, and players
- **Live Updates**: Simulated live match scoring updates
- **Calendar Integration**: Interactive calendar with match details
- **Player Modals**: Detailed player information popups

### Animations & Effects
- **Particle Background**: Dynamic p5.js particle system
- **Text Animations**: Typed.js typewriter effects
- **Hover Effects**: 3D transforms and shadow effects
- **Loading States**: Smooth transitions and loading indicators

### Data Management
- **TypeScript Types**: Strongly typed data structures
- **Mock Data**: Comprehensive sports, team, and player information
- **State Management**: React hooks for local state management
- **Charts & Graphs**: ECharts.js for data visualization

## Customization

### Theme Colors
The application uses a purple and yellow theme configured in `tailwind.config.js`:

- Primary Purple: `#a855f7` (unill-purple-500)
- Secondary Yellow: `#f59e0b` (unill-yellow-500)
- Gradients: Purple to Yellow combinations

### Adding New Sports
1. Add sport data to `src/data/sports.ts`
2. Update the sports grid in `src/pages/index.tsx`
3. Add sport-specific equipment and rules in `src/pages/sports.tsx`

### Modifying Animations
- Global animations are defined in `src/styles/globals.css`
- Component-specific animations use Anime.js and CSS transitions
- Particle effects can be customized in the Layout component

## Deployment

The application is ready for deployment to Vercel, Netlify, or any Next.js-compatible hosting platform.

### Vercel Deployment
1. Connect your repository to Vercel
2. Configure build settings (default Next.js settings work)
3. Deploy with automatic CI/CD

### Static Export
For static hosting:
```bash
npm run build
npm run export
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

Built with ❤️ for university athletics
