# 📥 GLITCH·PEACE Installation Guide

**How to download and run the game on your computer**

---

## 🚀 Quick Start (3 Steps)

### 1. Clone or Download
```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git
cd glitch-peace-vite
```

**Or download ZIP:**
1. Go to https://github.com/jessidono24-cmyk/glitch-peace-vite
2. Click green "Code" button
3. Click "Download ZIP"
4. Extract to desired location
5. Open terminal in that folder

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Game
```bash
npm run dev
```

Opens at: **http://localhost:3000/**

---

## 📋 Prerequisites

### Required Software:
- **Node.js** 16.x or higher ([Download](https://nodejs.org/))
- **npm** 8.x or higher (comes with Node.js)
- **Git** (for cloning) ([Download](https://git-scm.com/))

### Check Your Versions:
```bash
node --version    # Should show v16.x or higher
npm --version     # Should show 8.x or higher
git --version     # Should show any version
```

---

## 💻 Platform-Specific Instructions

### Windows

**Using PowerShell or CMD:**
```bash
# Clone repository
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git

# Navigate to folder
cd glitch-peace-vite

# Install dependencies
npm install

# Run game
npm run dev
```

**If you don't have Git:**
1. Download ZIP from GitHub
2. Extract to `C:\Users\YourName\glitch-peace-vite`
3. Open PowerShell in that folder (Shift + Right Click → "Open PowerShell here")
4. Run `npm install` then `npm run dev`

### Mac

**Using Terminal:**
```bash
# Install Xcode Command Line Tools (if needed)
xcode-select --install

# Clone repository
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git

# Navigate to folder
cd glitch-peace-vite

# Install dependencies
npm install

# Run game
npm run dev
```

### Linux

**Using Terminal:**
```bash
# Install Git (if needed)
sudo apt install git    # Ubuntu/Debian
sudo yum install git    # Fedora/RedHat

# Clone repository
git clone https://github.com/jessidono24-cmyk/glitch-peace-vite.git

# Navigate to folder
cd glitch-peace-vite

# Install dependencies
npm install

# Run game
npm run dev
```

---

## 🎮 Playing the Game

### After Running `npm run dev`

You'll see:
```
VITE v7.3.1  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Open your browser to http://localhost:3000/**

### Grid Mode (Default)
1. Click **NEW GAME**
2. Select a dreamscape (The Rift or The Lodge)
3. **Move**: WASD or Arrow keys
4. **Collect**: Green peace nodes (◈)
5. **Avoid**: Red hazard tiles (!)
6. **Pause**: ESC key

### Shooter Mode (NEW!)
1. During gameplay, press **M** key
2. **Move**: WASD keys
3. **Aim**: Move mouse
4. **Shoot**: Hold left mouse button
5. **Switch Weapon**: Press 1, 2, 3, or 4
6. **Switch Back**: Press M again for grid mode

---

## 🏗️ Production Build

To create optimized files for deployment:

```bash
npm run build
```

**Output:**
- Creates `dist/` folder
- `dist/index.html` - Entry file (4.19 KB)
- `dist/assets/` - Optimized JavaScript (69.11 KB, 21.96 KB gzipped)

**To test the build:**
```bash
npm run preview
```

---

## 🌐 Network Access (Optional)

To play on other devices on your local network:

```bash
npm run dev -- --host
```

Then access from:
- **Phone**: http://192.168.1.XXX:3000/
- **Tablet**: http://192.168.1.XXX:3000/
- **Another Computer**: http://192.168.1.XXX:3000/

(Replace XXX with your actual local IP)

**Find your IP:**
- Windows: `ipconfig`
- Mac/Linux: `ifconfig` or `ip addr`

---

## 🛠️ Troubleshooting

### "npm: command not found"
**Problem**: Node.js not installed  
**Solution**: Download and install from https://nodejs.org/  
**Verify**: Run `node --version` after installing

### "git: command not found"
**Problem**: Git not installed  
**Solution**: 
- Windows: Download from https://git-scm.com/
- Mac: Run `xcode-select --install`
- Linux: `sudo apt install git` or `sudo yum install git`

### Port 3000 already in use
**Problem**: Another app using port 3000  
**Solution**: Use a different port:
```bash
npm run dev -- --port 3001
```

Or find and stop the process:
- Windows: `netstat -ano | findstr :3000` then `taskkill /PID xxxx /F`
- Mac/Linux: `lsof -ti:3000 | xargs kill`

### Dependencies won't install
**Problem**: npm cache or network issues  
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete old files
rm -rf node_modules package-lock.json

# Try again
npm install
```

### Game shows blank screen
**Problem**: Build or browser issue  
**Solution**:
1. Check browser console (F12) for errors
2. Try incognito/private mode
3. Clear browser cache (Ctrl+F5)
4. Try different browser (Chrome, Firefox)
5. Verify Node.js version: `node --version` (needs 16+)

### Hot reload not working
**Problem**: File watching issue  
**Solution**:
```bash
# Stop server (Ctrl+C)
# Restart
npm run dev
```

### Build fails
**Problem**: Vite build error  
**Solution**:
```bash
# Reinstall dependencies
npm install

# Try build again
npm run build
```

---

## 📊 System Requirements

### Minimum:
- **CPU**: Any modern processor
- **RAM**: 2GB
- **Storage**: 200MB free space
- **OS**: Windows 10, macOS 10.14+, Ubuntu 18.04+
- **Node.js**: 16.x or higher
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended:
- **CPU**: Dual-core or better
- **RAM**: 4GB or more
- **Storage**: 500MB free space
- **Node.js**: 18.x or 20.x LTS
- **Browser**: Latest Chrome or Firefox

---

## 📁 Project Structure After Install

```
glitch-peace-vite/
├── node_modules/           (~100MB - dependencies)
├── dist/                   (after build - production files)
├── src/                    (source code)
│   ├── core/              (game engine)
│   ├── gameplay-modes/    (grid & shooter)
│   ├── ui/                (menus, HUD)
│   ├── systems/           (emotional, temporal)
│   └── main.js            (entry point)
├── public/                 (static assets)
├── docs/                   (documentation)
├── package.json            (dependencies)
├── vite.config.js          (build config)
├── index.html              (HTML entry)
├── README.md               (project overview)
├── INSTALLATION.md         (this file)
├── STATUS.md               (current status)
└── ROADMAP.md              (future plans)
```

---

## 🔧 Available Commands

```bash
# Development
npm run dev      # Start dev server (hot reload)

# Production
npm run build    # Build for production
npm run preview  # Preview production build

# Information
node --version   # Check Node.js version
npm --version    # Check npm version
npm list         # List installed packages

# Troubleshooting
npm cache clean --force        # Clear npm cache
rm -rf node_modules            # Remove dependencies
npm install                     # Reinstall dependencies
```

---

## 📈 Installation Stats

| Item | Details |
|------|---------|
| **Repository Size** | ~15 MB |
| **After npm install** | ~115 MB (includes node_modules) |
| **Install Time** | ~10 seconds (fast connection) |
| **Build Time** | ~350ms |
| **Production Size** | 73 KB (22 KB gzipped) |
| **Browser Load Time** | <1 second |
| **Dependencies** | 47 packages |
| **Vulnerabilities** | 0 |

---

## ✅ Installation Verification

After installation, verify everything works:

```bash
# 1. Check Node.js
node --version
# Should show v16.x or higher

# 2. Check npm
npm --version
# Should show 8.x or higher

# 3. Check dependencies
npm list --depth=0
# Should show all packages

# 4. Test build
npm run build
# Should complete in <1 second

# 5. Run dev server
npm run dev
# Should start without errors
```

---

## 🎯 First-Time Setup Checklist

- [ ] Install Node.js (if needed)
- [ ] Install Git (if needed)
- [ ] Clone or download repository
- [ ] Open terminal in project folder
- [ ] Run `npm install`
- [ ] Wait for installation (~10 seconds)
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000/
- [ ] See main menu
- [ ] Click NEW GAME
- [ ] Test grid mode (WASD)
- [ ] Press M for shooter mode
- [ ] Verify smooth gameplay

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check Documentation:**
   - STATUS.md - Current project status
   - ROADMAP.md - Feature plans
   - README.md - Quick overview

2. **Browser Console:**
   - Press F12 in browser
   - Check Console tab for errors
   - Look for red error messages

3. **Report Issues:**
   Include:
   - Your operating system
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Complete error message
   - What you were trying to do
   - What happened vs. what you expected

---

## 🎊 You're Ready!

Once installed, you have:
- ✅ Complete game with 2 gameplay modes
- ✅ Grid-based roguelike (13 variations)
- ✅ Twin-stick shooter mode
- ✅ Hot reload development
- ✅ Production build capability
- ✅ All features working

**Enjoy playing GLITCH·PEACE!** 🎮✨

---

## 🔄 Updating to Latest Version

To get the latest updates:

```bash
# Navigate to project folder
cd glitch-peace-vite

# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Run game
npm run dev
```

---

**Last Updated**: February 19, 2026  
**Version**: 1.0.0  
**Status**: Phase 1 & 2 Complete ✅
