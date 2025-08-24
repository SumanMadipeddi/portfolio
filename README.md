# Portfolio Project Template

A modern, responsive portfolio website template built with React, TypeScript, and Tailwind CSS.

## Features

- Responsive design with mobile-first approach
- Dark/light theme toggle
- Smooth animations and transitions
- Modern UI components using shadcn/ui
- Optimized performance with Vite
- Professional portfolio sections (Hero, About, Projects, Skills, Contact)

## Technologies Used

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **UI Components**: shadcn/ui, Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **State Management**: React hooks

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd portfolio-project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── sections/       # Page sections (Hero, About, Projects, etc.)
│   └── ui/            # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
└── assets/             # Static assets (images, etc.)
```

## Customization

### Content Updates
- Update personal information in `src/components/sections/`
- Modify the hero section in `HeroSection.tsx`
- Update project details in `ProjectsSection.tsx`
- Customize skills in `SkillsSection.tsx`
- Modify contact information in `ContactSection.tsx`

### Styling
- Modify colors and themes in `tailwind.config.ts`
- Update CSS animations in `src/App.css`
- Customize component styles in individual section files

### Adding New Sections
- Create new components in `src/components/sections/`
- Import and add them to `src/pages/Index.tsx`
- Update navigation if needed

## Deployment

Build the project for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Firebase Hosting

## Contributing

This is a template project. Feel free to:
- Fork and customize for your own portfolio
- Submit improvements as pull requests
- Use as a starting point for other projects

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues, please open an issue in the repository.
