# Sensory Dashboard - Complete Project Guide

## 📋 Table of Contents
1. [What Happened So Far](#what-happened-so-far)
2. [The Problem We Hit](#the-problem-we-hit)
3. [What Is This App](#what-is-this-app)
4. [Technical Architecture](#technical-architecture)
5. [What Needs To Be Done Next](#what-needs-to-be-done-next)
6. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
7. [How To Run The App](#how-to-run-the-app)

---

## What Happened So Far

### ✅ Completed:
1. **Created project structure** in `C:\Projects\MusicDance\sensory-dashboard\`
2. **Set up configuration files**:
   - `package.json` - Node.js dependencies and scripts
   - `tsconfig.json` - TypeScript configuration
   - `next.config.ts` - Next.js configuration
   - `tailwind.config.ts` - Tailwind CSS styling config
   - `postcss.config.mjs` - PostCSS for Tailwind processing
   - `eslint.config.mjs` - Code linting rules
   - `.gitignore` - Git ignore rules
3. **Created basic app structure**:
   - `app/layout.tsx` - Root layout with metadata
   - `app/page.tsx` - Home page (placeholder)
   - `app/globals.css` - Global styles with dark theme
4. **Created folder structure**:
   - `/app` - Next.js App Router pages
   - `/components/audio` - Audio mixer components
   - `/components/visualizer` - Visual effect components
   - `/components/ui` - Shared UI components
   - `/lib` - Utility functions and core logic
   - `/public/audio` - Audio file storage

### ❌ Not Completed:
- **npm install** - Dependencies are NOT installed yet
- **All the actual functionality** - No audio engine, no visualizer, no UI components yet

---

## The Problem We Hit

### 🚨 The `&` Character Issue

The original directory was `C:\Projects\Music&Dance\` but the **`&` character breaks npm on Windows**.

**Why?** Windows command line treats `&` as a special character that chains commands. So when npm tried to run scripts, it parsed the path as:
```
C:\Projects\Music    (first part)
&                    (command separator)
Dance\...            (second part - invalid)
```

**Solution:** Moved the project to `C:\Projects\MusicDance\` (no ampersand).

### Current Status:
- ✅ Project files are in `C:\Projects\MusicDance\sensory-dashboard\`
- ❌ Dependencies need to be installed
- ❌ Old directory (`Music&Dance`) still exists but should be ignored

---

## What Is This App

### 🎯 Core Concept: The "Focus Mixer"

A web app that lets users create their perfect focus environment by mixing:
1. **Layered Audio** - 3 independent audio channels with volume control
2. **Ambient Visuals** - Subtle, mesmerizing background animations
3. **Presets** - Save and load favorite combinations
4. **Timer** - Focus sessions with auto-fade

### Why It's Useful:
People with ADHD, anxiety, or sensory processing needs often need specific audio/visual input to focus or calm down. This app gives them fine-grained control over their sensory environment.

### Example Use Cases:
- **"Deep Work"** preset: Brown noise (loud) + Keyboard typing (quiet) + Particle visualizer
- **"Anxiety Cooldown"** preset: Rain (medium) + Campfire (quiet) + Gradient wave (subtle)
- **"Cafe Focus"** preset: Coffee shop chatter (medium) + Lo-fi beat (quiet) + No visualizer

---

## Technical Architecture

### Technology Stack:
- **Framework:** Next.js 15+ (React 19, App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand (lightweight)
- **Animation:** Framer Motion
- **Audio:** Web Audio API (native browser, no libraries needed)
- **Graphics:** HTML Canvas 2D API

### Why These Choices?

#### Next.js
- Modern React framework
- Built-in routing, optimization, and TypeScript support
- Easy deployment to Vercel
- Great developer experience

#### Web Audio API (No External Library)
- **Native browser API** - no dependencies needed
- Extremely powerful for audio mixing
- Low latency, high quality
- Supports:
  - Multiple audio channels with independent gain nodes
  - Real-time volume control
  - Cross-fading
  - Procedural sound generation (noise)

#### Canvas 2D (Not WebGL)
- Simpler for 2D particle effects
- Lower learning curve
- Good enough performance for subtle animations
- Easier to keep the visuals "subtle" (we don't want flashy 3D)

#### Zustand (Not Redux)
- Lightweight (1KB)
- Simple API
- Perfect for managing audio state across components
- No boilerplate

---

## What Needs To Be Done Next

### Phase 1: Install Dependencies ⏱️ ~2 minutes
```bash
cd C:\Projects\MusicDance\sensory-dashboard
npm install
```

This installs:
- `react` & `react-dom` - UI framework
- `next` - Framework
- `zustand` - State management
- `framer-motion` - Animations
- `typescript` - Type safety
- `tailwindcss` - Styling
- All dev dependencies

### Phase 2: Build Audio Engine Core ⏱️ ~30 minutes

**File:** `lib/audio-engine.ts`

**Purpose:** Wrapper around Web Audio API to handle:
- Initialize AudioContext (browser's audio processing engine)
- Create 3 audio channel nodes with gain controls
- Load audio files from `/public/audio/`
- Play/pause/stop controls
- Volume control per channel
- Master volume control

**Key Concepts:**
```typescript
// Web Audio API structure we'll build:
AudioContext
  ├─ Channel 1 (Noise Floor)
  │   ├─ AudioBuffer (brown/pink/white noise)
  │   └─ GainNode (volume control)
  │
  ├─ Channel 2 (Ambient)
  │   ├─ AudioBuffer (rain/cafe/library)
  │   └─ GainNode (volume control)
  │
  ├─ Channel 3 (Rhythmic)
  │   ├─ AudioBuffer (binaural/ASMR/lo-fi)
  │   └─ GainNode (volume control)
  │
  └─ Master GainNode → Speakers
```

**What This Does:**
- Each channel can play a different sound
- Each channel has its own volume slider (GainNode)
- All channels mix together before going to speakers
- This is the "magic" - layering sounds at different volumes

---

### Phase 3: Generate Procedural Noise ⏱️ ~20 minutes

**File:** `lib/noise-generators.ts`

**Purpose:** Generate brown/pink/white noise programmatically (no audio files needed).

**Why?**
- Noise files are large (MB)
- We can generate infinite, high-quality noise in real-time
- Uses math to create random waveforms

**Math Behind It:**
```typescript
// White Noise: Completely random values
for (let i = 0; i < bufferSize; i++) {
  buffer[i] = Math.random() * 2 - 1; // Range: -1 to 1
}

// Brown Noise: Random walk (smoother, deeper)
let lastValue = 0;
for (let i = 0; i < bufferSize; i++) {
  lastValue += (Math.random() * 2 - 1) * 0.02;
  lastValue *= 0.99; // Decay to prevent drift
  buffer[i] = lastValue;
}

// Pink Noise: In between (balanced frequency spectrum)
// More complex algorithm using filtering
```

---

### Phase 4: Build UI Components ⏱️ ~1 hour

#### Component 1: `components/audio/AudioChannel.tsx`
**What It Does:** Single audio channel control

**UI Elements:**
- Dropdown selector (brown noise / pink noise / white noise)
- Volume slider (0-100%)
- Mute/unmute button
- Visual level meter (shows current volume)

**Props:**
```typescript
interface AudioChannelProps {
  channelId: number;
  title: string;
  sounds: string[]; // ["Brown Noise", "Pink Noise", "White Noise"]
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onSoundSelect: (sound: string) => void;
}
```

#### Component 2: `components/audio/AudioMixer.tsx`
**What It Does:** Container for all 3 channels

**UI Layout:**
```
┌──────────────────────────────────┐
│  Channel 1: Noise Floor          │
│  [Brown Noise ▼] ──●──── 🔇     │
│                                  │
│  Channel 2: Ambient              │
│  [Rain ▼]        ─●───── 🔇     │
│                                  │
│  Channel 3: Rhythmic             │
│  [ASMR ▼]        ───────● 🔇    │
│                                  │
│  Master Volume: ────●────        │
│  [▶ Play] [⏸ Pause]             │
└──────────────────────────────────┘
```

**State Management (Zustand):**
```typescript
interface AudioStore {
  channel1: { sound: string; volume: number; muted: boolean };
  channel2: { sound: string; volume: number; muted: boolean };
  channel3: { sound: string; volume: number; muted: boolean };
  masterVolume: number;
  isPlaying: boolean;

  setChannelVolume: (channel: number, volume: number) => void;
  toggleMute: (channel: number) => void;
  play: () => void;
  pause: () => void;
}
```

---

### Phase 5: Build Visualizer ⏱️ ~45 minutes

**File:** `components/visualizer/Visualizer.tsx`

**What It Does:** Canvas-based particle effect that runs in the background

**Technical Approach:**
```typescript
// Canvas setup
const canvas = useRef<HTMLCanvasElement>(null);
const ctx = canvas.getContext('2d');

// Particle system
interface Particle {
  x: number;        // X position
  y: number;        // Y position
  vx: number;       // X velocity (speed)
  vy: number;       // Y velocity
  size: number;     // Particle size
  opacity: number;  // Transparency
}

// Animation loop
function animate() {
  // Clear canvas
  ctx.fillStyle = 'rgba(10, 10, 10, 0.05)'; // Fade trail
  ctx.fillRect(0, 0, width, height);

  // Update and draw each particle
  particles.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Draw particle
    ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animate); // 60 FPS
}
```

**Key Requirements:**
- **Low contrast** - subtle colors (gray/white on dark background)
- **Slow movement** - particles drift, don't zoom
- **Full screen** - covers entire background
- **Toggle-able** - can turn off completely
- **Opacity control** - user can make it more/less visible

---

### Phase 6: Preset System ⏱️ ~30 minutes

**File:** `lib/presets.ts`

**What It Does:** Save/load mixer configurations

**Data Structure:**
```typescript
interface Preset {
  id: string;
  name: string;
  channel1: { sound: string; volume: number; muted: boolean };
  channel2: { sound: string; volume: number; muted: boolean };
  channel3: { sound: string; volume: number; muted: boolean };
  visualizerEnabled: boolean;
  visualizerOpacity: number;
  createdAt: string;
}
```

**Storage:** localStorage (browser-based, no backend needed)

**Functions:**
```typescript
// Save current state as preset
function savePreset(name: string, state: AudioStore): void {
  const preset = { id: uuid(), name, ...state, createdAt: new Date() };
  const presets = getPresets();
  presets.push(preset);
  localStorage.setItem('sensory-presets', JSON.stringify(presets));
}

// Load preset and apply to audio engine
function loadPreset(presetId: string): void {
  const presets = getPresets();
  const preset = presets.find(p => p.id === presetId);
  if (preset) {
    applyPresetToAudioEngine(preset);
  }
}
```

**Default Presets:**
```typescript
const DEFAULT_PRESETS = [
  {
    name: "Deep Work",
    channel1: { sound: "Brown Noise", volume: 80, muted: false },
    channel2: { sound: "Keyboard ASMR", volume: 20, muted: false },
    channel3: { sound: "Silent", volume: 0, muted: true },
    visualizerEnabled: true,
    visualizerOpacity: 30,
  },
  {
    name: "Calm Focus",
    channel1: { sound: "Pink Noise", volume: 40, muted: false },
    channel2: { sound: "Rain", volume: 70, muted: false },
    channel3: { sound: "Campfire", volume: 30, muted: false },
    visualizerEnabled: true,
    visualizerOpacity: 20,
  },
  {
    name: "Cafe Vibes",
    channel1: { sound: "White Noise", volume: 20, muted: false },
    channel2: { sound: "Coffee Shop", volume: 60, muted: false },
    channel3: { sound: "Lo-Fi Beat", volume: 40, muted: false },
    visualizerEnabled: false,
    visualizerOpacity: 0,
  },
];
```

---

### Phase 7: Timer Component ⏱️ ~30 minutes

**File:** `components/Timer.tsx`

**What It Does:** Focus timer with audio auto-fade

**Features:**
- Duration presets: 15, 25, 45, 60 minutes (or custom)
- Start/pause/reset controls
- Countdown display
- Auto-fade volume at completion (gradual, not abrupt)
- Optional notification/sound when done

**Auto-Fade Logic:**
```typescript
// When timer hits 0, fade audio over 10 seconds
function fadeOut() {
  const startVolume = audioEngine.masterVolume;
  const fadeSteps = 100; // 100 steps over 10 seconds
  const stepDuration = 100; // 100ms per step

  let currentStep = 0;
  const fadeInterval = setInterval(() => {
    currentStep++;
    const newVolume = startVolume * (1 - currentStep / fadeSteps);
    audioEngine.setMasterVolume(newVolume);

    if (currentStep >= fadeSteps) {
      clearInterval(fadeInterval);
      audioEngine.pause();
    }
  }, stepDuration);
}
```

**UI:**
```
┌────────────────┐
│  Timer         │
│  ────────────  │
│     25:00      │  ← Big, readable
│                │
│  [▶ Start]     │
│  [⏸ Pause]     │
│  [↻ Reset]     │
│                │
│  Presets:      │
│  [15m] [25m]   │
│  [45m] [60m]   │
└────────────────┘
```

---

### Phase 8: Main App Integration ⏱️ ~20 minutes

**File:** `app/page.tsx`

**What It Does:** Combine all components into the final UI

**Layout:**
```
┌─────────────────────────────────────┐
│  [Visualizer - Full Background]    │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  FOCUS MIXER                 │  │
│  │  ──────────────────────────  │  │
│  │                              │  │
│  │  [AudioMixer - 3 channels]   │  │
│  │                              │  │
│  │  [Timer - 25:00]             │  │
│  │                              │  │
│  │  [Presets Dropdown]          │  │
│  │  ▼ Deep Work                 │  │
│  │                              │  │
│  │  [Hide Controls] ←           │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Key Features:**
- Visualizer runs full-screen behind everything
- Mixer UI floats on top (semi-transparent dark card)
- "Hide Controls" button to remove UI for distraction-free mode
- Keyboard shortcuts (e.g., Space = play/pause)

---

### Phase 9: Audio File Sourcing ⏱️ ~Variable

**Challenge:** We need high-quality, loopable audio files

**Options:**

#### Option 1: Procedural (Already Covered)
- ✅ Brown/Pink/White Noise - generated in code

#### Option 2: Creative Commons Sources
Free, royalty-free audio from:
- **Freesound.org** - Community sound library
- **BBC Sound Effects** - Free archive
- **YouTube Audio Library** - Free music/sounds
- **Zapsplat** - Free sound effects

**What We Need:**
- Rain sounds (seamless loop)
- Cafe/coffee shop ambience
- Library sounds (quiet)
- Campfire crackling
- Keyboard typing (ASMR)
- Lo-fi beat (instrumental, no vocals)
- Binaural beats (can generate these too)

**File Format:** MP3 or OGG, 10-30 minute loops

#### Option 3: Generate More Sounds
Can programmatically generate:
- Binaural beats (two slightly different frequencies = beat)
- Simple lo-fi beats (drum samples + timing)

---

### Phase 10: Polish & Testing ⏱️ ~1 hour

1. **Test all features:**
   - Each channel plays correctly
   - Volume sliders work smoothly
   - Mute works
   - Preset saving/loading works
   - Timer auto-fade works
   - Visualizer doesn't lag

2. **Performance optimization:**
   - Ensure Canvas rendering at 60 FPS
   - No audio crackling/popping
   - Low CPU usage

3. **Accessibility:**
   - Keyboard navigation
   - Screen reader support for controls
   - High contrast mode option

4. **Mobile considerations:**
   - Touch-friendly sliders
   - Background audio (tricky on mobile)
   - Battery impact

5. **UI Polish:**
   - Smooth transitions
   - Loading states
   - Error handling (if audio fails to load)

---

## How To Run The App

### First Time Setup:
```bash
# Navigate to project
cd C:\Projects\MusicDance\sensory-dashboard

# Install dependencies (DO THIS FIRST!)
npm install

# Start development server
npm run dev
```

### Every Time After:
```bash
cd C:\Projects\MusicDance\sensory-dashboard
npm run dev
```

### Open in Browser:
Visit: `http://localhost:3000`

### Build for Production:
```bash
npm run build
npm start
```

### Deploy to Vercel (Free):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## File Structure Summary

```
sensory-dashboard/
├── app/
│   ├── layout.tsx          ✅ Root layout (done)
│   ├── page.tsx            ⏳ Main page (needs components)
│   └── globals.css         ✅ Global styles (done)
│
├── components/
│   ├── audio/
│   │   ├── AudioChannel.tsx    ❌ Single channel control
│   │   └── AudioMixer.tsx      ❌ 3-channel mixer
│   ├── visualizer/
│   │   └── Visualizer.tsx      ❌ Canvas particle effect
│   ├── ui/
│   │   └── (shared components) ❌ Buttons, sliders, etc.
│   ├── Timer.tsx               ❌ Focus timer
│   └── PresetManager.tsx       ❌ Preset UI
│
├── lib/
│   ├── audio-engine.ts         ❌ Web Audio API wrapper
│   ├── noise-generators.ts     ❌ Procedural noise
│   ├── presets.ts              ❌ Preset save/load
│   └── store.ts                ❌ Zustand state
│
├── public/
│   └── audio/                  ❌ Audio loop files
│       ├── rain.mp3
│       ├── cafe.mp3
│       ├── campfire.mp3
│       └── etc.
│
├── package.json            ✅ Dependencies (done)
├── tsconfig.json           ✅ TypeScript config (done)
├── tailwind.config.ts      ✅ Tailwind config (done)
├── next.config.ts          ✅ Next.js config (done)
└── .gitignore              ✅ Git ignore (done)
```

**Legend:**
- ✅ = Complete
- ⏳ = Partially complete
- ❌ = Not started

---

## Estimated Time to Complete

| Phase | Task | Time |
|-------|------|------|
| 1 | Install dependencies | 2 min |
| 2 | Audio engine core | 30 min |
| 3 | Noise generators | 20 min |
| 4 | UI components | 1 hour |
| 5 | Visualizer | 45 min |
| 6 | Preset system | 30 min |
| 7 | Timer | 30 min |
| 8 | Main app integration | 20 min |
| 9 | Audio file sourcing | Variable |
| 10 | Polish & testing | 1 hour |
| **TOTAL** | | **~5-6 hours** |

---

## Next Steps

### Immediate (Do This Now):
1. Open terminal
2. Run: `cd C:\Projects\MusicDance\sensory-dashboard`
3. Run: `npm install`
4. Wait for install to complete
5. Come back and we'll start building the audio engine

### After That:
Follow the phases in order (2 → 10). Each phase builds on the previous one.

---

## Questions?

If anything is unclear, ask about:
- **How Web Audio API works** (I can explain the audio graph concept)
- **How Canvas animations work** (I can explain requestAnimationFrame)
- **How state management works** (I can explain Zustand)
- **Any specific technical concept**

Ready to continue? Let's install dependencies and start building! 🚀
