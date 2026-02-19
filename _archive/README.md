# 📚 Archive Index

This folder contains previous versions and experimental builds of GLITCH·PEACE that served as blueprints for the current implementation.

**Total Archive Size**: ~1.2GB
**Last Updated**: February 19, 2026

---

## 📦 Archive Contents

### Extracted Folders

#### `GLITCH-PEACE-COMPLETE/` (200KB)
**Version**: Complete Edition  
**Purpose**: Final comprehensive package with all systems  
**Key Features**:
- 17 tile types with full behaviors
- 10 original dreamscapes
- Recovery tools (7 tools)
- Boss system
- 15 archetypes
- Pattern recognition framework

**Files**:
- `src/main.js` - Complete standalone implementation
- `src/core/utils.js` - Utility functions
- `src/core/constants.js` - Full constant definitions
- `COMPLETE-README.md` - Feature checklist

**Use For**:
- Boss system implementation
- Recovery tool templates
- Dreamscape definitions
- Complete feature reference

---

#### `GLITCH-PEACE-MEGA-FINAL/` (360KB)
**Version**: Mega Final with 31+ Play Modes  
**Purpose**: Maximum feature density experiment  
**Key Features**:
- 31+ play modes (including 3D-style modes)
- 12 cosmology realms
- Advanced enemy AI (8 behaviors)
- Extended progression systems

**Files**:
- Located in `GLITCH-PEACE-MEGA/` subfolder
- Multiple system files

**Use For**:
- Play mode configurations
- Cosmology realm details
- Enemy AI behavior templates
- Advanced mechanics

---

#### `GLITCH-PEACE-V5-FINAL/` (456KB)
**Version**: V5 Final Build  
**Purpose**: Stable v5 with complete menu system  
**Key Features**:
- Full menu system
- Emotional + temporal integration
- Tutorial system
- Save/load functionality

**Files**:
- `src/` folder with complete implementation
- `BUILD-INSTRUCTIONS.md`
- `PROJECT-STATUS.md`
- `QUICKSTART.md`

**Use For**:
- Menu system reference
- Build process
- Integration patterns

---

#### `gp-v5-YOUR-BUILD/` (168KB)
**Version**: V5 Your Build  
**Purpose**: User's customized v5 build  
**Key Features**:
- 4 gameplay paths (Arcade, Recovery, Explorer, Ritual)
- Realm system
- Complete menu system
- Tutorial (10 pages)

**Files**:
- `README.md` - Feature list
- `src/` folder
- `index.html`

**Use For**:
- Gameplay path configurations
- Tutorial content
- Menu layouts

---

#### `glitch-peace-v5/` (605MB) ⚠️ LARGE
**Version**: V5 Full with Dependencies  
**Purpose**: Complete v5 with all libraries  
**Key Features**:
- Complete source code
- Matter.js physics engine (optional)
- Three.js 3D rendering (optional)
- Full dependency tree

**Files**:
- Full `src/` implementation
- `matter.js/` folder (physics library)
- `public/` assets
- Complete npm packages

**Use For**:
- Reference implementation
- Library integration examples
- Complete feature set

**⚠️ Warning**: Contains 605MB of dependencies. Use selectively.

---

#### `glitch-peace-v5 - Copy/` (605MB) ⚠️ LARGE
**Version**: V5 Duplicate  
**Purpose**: Backup copy of v5  
**Status**: Duplicate of above

**Recommendation**: Can be removed or archived separately.

---

### Compressed Archives (.tar.gz files)

#### `GLITCH-PEACE-COMPLETE-FINAL.tar.gz` (36KB)
Compressed version of COMPLETE folder.

#### `GLITCH-PEACE-MEGA-FINAL.tar.gz` (72KB)
Compressed version of MEGA-FINAL folder.

#### `GLITCH-PEACE-V5-FINAL (1).tar.gz` (60KB)
Alternative v5 final build archive.

#### `glitch-peace-v5.tar.gz` (28KB)
Compressed v5 core files.

#### `glitch-peace-v5-FINAL.tar.gz` (32KB)
Final v5 compressed archive.

#### `gp-v5-YOUR-BUILD.tar.gz` (28KB)
Compressed YOUR BUILD version.

#### `gp-v5-ULTIMATE-WITH-13-MODES.tar.gz` (52KB)
Archive with 13 play modes implementation.

#### `glitch-peace-vite.zip` (16KB)
Minimal vite setup archive.

---

## 🎯 Feature Mining Guide

### For Recovery Tools
**Source**: `GLITCH-PEACE-COMPLETE/`
**Look At**:
- Recovery tool implementations
- Session management
- Cessation machine features

### For Learning Modules
**Source**: Design specs in docs, not yet in archives
**Need To**: Create from scratch based on blueprint

### For Boss System
**Source**: `GLITCH-PEACE-COMPLETE/`
**Look At**:
- Boss encounter mechanics
- Multi-phase system
- Boss AI patterns

### For Dreamscapes
**Source**: `GLITCH-PEACE-COMPLETE/`
**Look At**:
- 10 dreamscape definitions
- Dreamscape-specific mechanics
- Visual themes

### For Cosmology Integration
**Source**: `GLITCH-PEACE-MEGA-FINAL/`
**Look At**:
- 12 cosmology realm definitions
- Realm-specific mechanics
- Tradition integration

### For Play Modes
**Source**: `gp-v5-ULTIMATE-WITH-13-MODES.tar.gz`
**Look At**:
- 13 mode configurations
- Mode-specific rules
- Balance parameters

### For Advanced Enemy AI
**Source**: `GLITCH-PEACE-MEGA-FINAL/`
**Look At**:
- 8 behavior types
- AI state machines
- Behavior selection logic

---

## 🗂️ Recommended Organization

### Keep Extracted
- `GLITCH-PEACE-COMPLETE/` - Primary reference
- `GLITCH-PEACE-MEGA-FINAL/` - Secondary reference
- `gp-v5-YOUR-BUILD/` - Tertiary reference
- `GLITCH-PEACE-V5-FINAL/` - Quaternary reference

### Archive or Remove
- `glitch-peace-v5/` - 605MB, can extract specific files as needed
- `glitch-peace-v5 - Copy/` - Duplicate, can remove
- All `.tar.gz` files - Already extracted, can remove or archive externally

### Space Savings
Removing duplicates and compressed archives could save ~1.2GB

---

## 📋 Extraction Commands

If you need to extract additional archives:

```bash
# Extract tar.gz files
tar -xzf GLITCH-PEACE-COMPLETE-FINAL.tar.gz
tar -xzf GLITCH-PEACE-MEGA-FINAL.tar.gz
tar -xzf gp-v5-ULTIMATE-WITH-13-MODES.tar.gz

# Extract zip files
unzip glitch-peace-vite.zip
```

---

## 🔍 Search Guide

### Find specific features:
```bash
# Search for recovery tools
grep -r "recovery\|impulse\|consequence\|relapse" _archive/GLITCH-PEACE-COMPLETE/

# Search for boss system
grep -r "boss\|multi-phase\|encounter" _archive/GLITCH-PEACE-COMPLETE/

# Search for learning modules
grep -r "learning\|language\|math\|memory\|IQ\|EQ" _archive/

# Search for dreamscapes
grep -r "dreamscape\|mountain\|courtyard\|summit" _archive/GLITCH-PEACE-COMPLETE/
```

---

## ⚠️ Important Notes

1. **Don't copy wholesale**: Extract specific patterns and adapt to current architecture
2. **Check dependencies**: Archives may use different library versions
3. **Test integration**: Always test after merging archive code
4. **Preserve attribution**: Note source archive in code comments
5. **Update documentation**: Document what was merged and why

---

## 📝 Version History

### V5 Evolution
1. **V5 Base** - Initial emotional/temporal integration
2. **V5 YOUR BUILD** - User customization
3. **V5 FINAL** - Stable release
4. **COMPLETE** - All features comprehensive
5. **MEGA-FINAL** - Maximum feature density
6. **ULTIMATE** - 13 modes specialized

### Current Version
**V1.0 BASE LAYER** - Rebuilt from archives with clean architecture

---

## 🎯 Next Steps

1. Extract specific implementations from COMPLETE
2. Adapt to current architecture
3. Test integration
4. Document source
5. Remove or archive processed files

---

**Maintainer**: Development Team  
**Last Review**: February 19, 2026  
**Next Review**: After each archive extraction
