# 🔧 GLITCH·PEACE Troubleshooting Guide

## Common Installation Issues

### ❌ Issue: "Cannot find module vite" Error

**Error Message:**
```
Error: Cannot find module 'C:\New folder\vite\bin\vite.js'
or
Error: Cannot find module vite
```

**Causes:**
1. Folder path contains spaces (e.g., "New folder")
2. npm install didn't complete properly
3. node_modules not in correct location

**Solutions:**

#### Option 1: Rename Folder (RECOMMENDED) ✅
1. Rename your folder to remove spaces:
   - `C:\New folder\` → `C:\NewFolder\`
   - `C:\My Projects\` → `C:\MyProjects\`
2. Delete `node_modules` folder if it exists
3. Run `npm install` again
4. Run `npm run dev`

#### Option 2: Use Pre-Built Version (EASIEST) ⭐
**No npm needed!**
1. Navigate to the `dist/` folder
2. Double-click `index.html`
3. Game opens in browser immediately
4. No installation, no dependencies!

#### Option 3: Clean Reinstall
```bash
# Delete node_modules if it exists
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Reinstall everything
npm install

# Try running
npm run dev
```

#### Option 4: Use npx Directly
Instead of `npm run dev`, try:
```bash
npx vite
```

Instead of `npm run build`, try:
```bash
npx vite build
```

---

## ❌ Issue: npm install Only Installs 14-15 Packages

**Expected:** Should install ~80+ packages (vite and all its dependencies)

**Problem:** Repository has node_modules files in wrong location

**Solution:**
1. Download fresh from GitHub (don't use old download)
2. OR delete these files from root if present:
   - `vite`, `vite.cmd`, `vite.ps1`
   - `rollup`, `rollup.cmd`, `rollup.ps1`
   - `esbuild`, `esbuild.cmd`, `esbuild.exe`, `esbuild.ps1`
   - `nanoid`, `picocolors` files
   - `async/`, `bin/`, `lib/` folders (if not your code)
3. Run `npm install` again

---

## ❌ Issue: npm install Fails Completely

**Error:** "npm ERR!" messages

**Solutions:**

1. **Check Node.js Version:**
   ```bash
   node --version
   ```
   - Need Node.js 18+ (you have 24.13.1 ✅)

2. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

3. **Use Different Package Manager:**
   ```bash
   # Try yarn instead
   npm install -g yarn
   yarn install
   yarn dev
   ```

4. **Clear Everything:**
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

---

## ❌ Issue: Game Won't Run in Browser

**Symptoms:** Blank screen, console errors

**Solutions:**

1. **Check Browser Compatibility:**
   - Chrome 90+ ✅
   - Firefox 88+ ✅
   - Safari 14+ ✅
   - Edge 90+ ✅

2. **Open Browser Console:**
   - Press F12 or Ctrl+Shift+I
   - Check Console tab for errors
   - Share error messages for help

3. **Try Different Browser:**
   - Download Chrome if current browser has issues
   - Test in incognito/private mode

4. **Check File Paths:**
   - Make sure you opened `dist/index.html` not `index.html` in root
   - Path should be: `your-folder/dist/index.html`

---

## ❌ Issue: "Permission Denied" Errors

**Error:** "EACCES: permission denied"

**Solutions:**

1. **Don't Use sudo (on Mac/Linux):**
   ```bash
   # Wrong: sudo npm install
   # Right: npm install
   ```

2. **Check Folder Permissions:**
   - Extract to a location where you have write access
   - Your user directory is usually safe
   - Avoid system directories like C:\Program Files

3. **Run as Administrator (Windows):**
   - Right-click Command Prompt or PowerShell
   - Choose "Run as Administrator"
   - Navigate to folder and try again

---

## ❌ Issue: npm run dev Opens Wrong Port

**Expected:** Should open on port 5173

**Problem:** Port already in use

**Solutions:**

1. **Kill Existing Process:**
   ```bash
   # Windows
   netstat -ano | findstr :5173
   taskkill /PID [process_id] /F
   
   # Mac/Linux
   lsof -ti:5173 | xargs kill -9
   ```

2. **Use Different Port:**
   ```bash
   npx vite --port 3000
   ```

---

## ❌ Issue: Build Creates Empty dist/ Folder

**Problem:** Build seems to work but dist/ is empty or incomplete

**Solutions:**

1. **Check for Errors:**
   ```bash
   npm run build 2>&1 | tee build.log
   ```
   Look for any errors in output

2. **Clean and Rebuild:**
   ```bash
   rm -rf dist
   npm run build
   ```

3. **Check Disk Space:**
   - Make sure you have at least 100MB free

---

## 🎮 Game-Specific Issues

### Controls Not Working

**Grid Mode:**
- WASD or Arrow Keys to move
- Shift to toggle Matrix A/B
- J for Archetype Power
- Q for Freeze
- R for Glitch Pulse
- C for Containment
- Escape to pause

**Shooter Mode:**
- WASD to move
- Mouse to aim
- Click to shoot
- Escape to pause

**Mode Switching:**
- Press M on title screen to toggle between Grid and Shooter modes

### Performance Issues

**Slow Framerate:**
1. Close other browser tabs
2. Update graphics drivers
3. Try different browser
4. Disable browser extensions
5. Check CPU usage (close other programs)

---

## 📝 Getting Help

### Before Asking for Help:

1. ✅ Check this troubleshooting guide
2. ✅ Read INSTALLATION.md
3. ✅ Try the pre-built version (dist/index.html)
4. ✅ Check browser console for errors (F12)
5. ✅ Note your:
   - Operating System (Windows/Mac/Linux)
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Browser and version
   - Exact error messages

### Where to Get Help:

- GitHub Issues: https://github.com/jessidono24-cmyk/glitch-peace/issues
- Include all information from checklist above
- Screenshots of errors are helpful

---

## ✅ Quick Success Checklist

**For Players (No Development):**
- [ ] Extract ZIP file
- [ ] Navigate to `dist/` folder
- [ ] Open `index.html` in browser
- [ ] Play immediately!

**For Developers:**
- [ ] Folder name has no spaces
- [ ] Node.js 18+ installed
- [ ] Extracted to location with write access
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Game opens at http://localhost:5173

---

## 🆘 Still Having Issues?

**Try the nuclear option:**
1. Delete everything
2. Download fresh ZIP from GitHub
3. Extract to `C:\glitch-peace` (no spaces!)
4. Open `dist/index.html` in browser
5. **Just play the game!** (no npm needed)

**The pre-built version in `dist/` always works!** 🎮✨
