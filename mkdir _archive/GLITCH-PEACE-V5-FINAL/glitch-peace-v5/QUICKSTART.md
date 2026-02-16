# QUICKSTART GUIDE

Get GLITCH·PEACE v5 running in **5 minutes**.

---

## ✅ Step 1: Install Node.js (2 minutes)

1. Go to https://nodejs.org/
2. Download **LTS version** (v20.x)
3. Run installer (accept all defaults)
4. Verify installation:
   ```bash
   node --version
   # Should show: v20.x.x
   ```

---

## ✅ Step 2: Extract & Setup (1 minute)

1. Extract `glitch-peace-v5.zip`
2. Open terminal/command prompt in that folder
3. Run:
   ```bash
   npm install
   ```
   Wait for dependencies to install (~30 seconds)

---

## ✅ Step 3: Start Development Server (30 seconds)

```bash
npm run dev
```

You'll see:
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

**Open the Local URL in your browser** → Game starts!

---

## ✅ Step 4: Play!

**Controls:**
- **WASD** or **Arrow Keys** = Move
- **ESC** = Menu
- **Enter** = Start/Retry

**Goal:** Collect green ◈ tiles, avoid red hazards!

---

## 🔧 Common Issues

### "npm: command not found"
→ Node.js not installed. Go back to Step 1.

### Port 5173 already in use
```bash
# Kill existing process
npm run dev -- --port 5174
```

### Game won't load
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check browser console for errors (F12)

---

## 📱 Test on Phone

### Same WiFi Method (easiest):
1. Note the "Network" URL from Step 3
2. Open that URL on your phone
3. Game runs in mobile browser!

### Install as App:
1. Open game on phone
2. Browser menu → "Add to Home Screen"
3. Now it's an icon on your phone!

---

## 🏗️ Build Single HTML File

```bash
npm run build
```

Output: `dist/glitch-peace-v5.html`

**This is a single file you can:**
- Email to friends
- Upload to itch.io
- Put on your website
- Open offline

---

## 🎨 Customize

Edit files in `src/`:
- `main.js` - Game loop
- `core/constants.js` - Tile types, colors
- `core/emotional-engine.js` - Emotion system

Save → Browser auto-refreshes!

---

## 📚 Next Steps

1. **Read README.md** - Full documentation
2. **Read BUILD-INSTRUCTIONS.md** - Architecture guide
3. **Expand systems** - Add more dreamscapes, archetypes, etc.

---

## 🆘 Need Help?

**Check:**
1. Is Node.js v18+ installed? (`node --version`)
2. Did `npm install` finish successfully?
3. Any errors in terminal?
4. Any errors in browser console (F12)?

**Still stuck?**
- Check README.md "Troubleshooting" section
- Google the exact error message
- Most issues are npm/Node version related

---

## ✨ What You Have

**Currently Working:**
- ✅ Core game loop
- ✅ Grid-based movement
- ✅ Tile system (Peace, Despair, Terror, Insight)
- ✅ Emotional engine (distortion, coherence)
- ✅ Score tracking
- ✅ Level progression
- ✅ HP system
- ✅ White/cyan player (fixed identity)
- ✅ Responsive canvas
- ✅ Mobile support

**Ready to Add** (templates in BUILD-INSTRUCTIONS.md):
- Temporal system (lunar/week cycles)
- Archetype system
- Dream biomes
- Recovery tools
- Tutorial mode
- Full UI/menus
- Save system
- And much more!

---

**You're ready! Run `npm run dev` and start playing/building.** 🚀
