# Landing Page - Standalone App

This is a standalone landing page application built with Next.js. It runs independently on port 3001.

## Quick Start

### Installation

```bash
cd landing-page
npm install
```

### Development

```bash
npm run dev
```

The landing page will be available at `http://localhost:3001`

### Build

```bash
npm run build
npm start
```

## Project Structure

```
landing-page/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── button.tsx  # Button component
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   └── screens/
│       └── LandingPage/    # Landing page component
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

## Features

- ✨ Responsive design (mobile, tablet, desktop)
- 🎨 Tailwind CSS styling
- 🚀 Next.js 15+ with App Router
- 📱 Mobile menu with smooth transitions
- 🛒 Shopping cart icon placeholder
- 🔐 User authentication UI
- 🎯 Multiple sections (Hero, Features, CTA, Footer)

## Customization

### Update Logo
Replace the image URL in the header and footer components with your own logo.

### Update Colors
Modify the Tailwind color classes in components:
- Primary color: `#f0ff7f` (light yellow)
- Secondary color: `#004d84` (dark blue)

### Update Content
Edit the content in `src/screens/LandingPage/LandingPage.tsx`

## Dependencies

- **Next.js**: React framework
- **React**: UI library
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Framer Motion**: Animations (optional)

## Port Configuration

The app is configured to run on **port 3001** by default. To change this, modify the scripts in `package.json`:

```json
"dev": "next dev -p YOUR_PORT"
```

## Notes

- This is a standalone app that doesn't require the main Dreamxstore project
- All resources (components, styles) are self-contained
- Can be deployed independently to Vercel, Netlify, or any Node.js hosting
