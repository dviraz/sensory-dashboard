# Sensory Dashboard - Focus Mixer

A web app that helps you create your perfect focus environment by mixing layered audio with ambient visualizations.

## 🎯 What Is This?

The **Sensory Dashboard** (aka "Focus Mixer") is designed for people who need specific sensory input to focus, calm down, or manage sensory overload. It's particularly useful for people with ADHD, anxiety, or sensory processing needs.

### Core Features:
- **3-Channel Audio Mixer**: Layer brown noise, ambient sounds, and rhythmic elements with independent volume controls
- **Ambient Visualizer**: Subtle, non-distracting particle effects
- **Presets**: Save and load your favorite audio/visual combinations
- **Focus Timer**: Set a duration and auto-fade when time's up

## 📖 Documentation

**👉 See [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) for complete implementation details**

The guide includes:
- Complete technical architecture explanation
- Step-by-step implementation phases
- Code examples and explanations
- How Web Audio API works
- How to generate procedural noise
- Canvas animation techniques
- ~5-6 hour estimated completion time

## 🚀 Quick Start

### Install Dependencies:
```bash
npm install
```

### Run Development Server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Current Status

This project is in **initial setup phase**. The configuration and project structure are complete, but core features are not yet implemented.

### ✅ Completed:
- Next.js 15 + TypeScript setup
- Tailwind CSS styling configuration
- Project folder structure
- Comprehensive implementation guide

### 🚧 To Do:
- Audio engine (Web Audio API wrapper)
- Noise generators (brown/pink/white)
- UI components (mixer, channels, sliders)
- Canvas visualizer (particle system)
- Preset system (localStorage)
- Timer with auto-fade
- Audio file sourcing

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (React 19, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Animation**: Framer Motion
- **Audio**: Web Audio API (native)
- **Graphics**: HTML Canvas 2D API

## 📁 Project Structure

```
sensory-dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components (to be built)
│   ├── audio/              # Audio mixer components
│   ├── visualizer/         # Visual effects
│   └── ui/                 # Shared UI components
├── lib/                    # Utilities (to be built)
│   ├── audio-engine.ts     # Web Audio API wrapper
│   ├── noise-generators.ts # Procedural noise
│   ├── presets.ts          # Preset management
│   └── store.ts            # Zustand state
├── public/                 # Static assets
│   └── audio/              # Audio loop files
├── PROJECT_GUIDE.md        # Complete implementation guide
└── README.md               # This file
```

## 🤝 Contributing

This is a learning/personal project. Feel free to fork and adapt for your needs!

## 📄 License

MIT - See LICENSE file for details

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Ready to build?** Start with `PROJECT_GUIDE.md` for the full implementation roadmap!
