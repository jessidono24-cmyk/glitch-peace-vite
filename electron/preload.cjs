/**
 * electron/preload.js — Context bridge for GLITCH·PEACE renderer process.
 *
 * Exposes a minimal, typed API surface to the renderer via contextBridge.
 * The renderer calls window.glitchPeaceElectron.steam.*  to interact with
 * Steam (or the stubs in main.js when Greenworks is not yet installed).
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('glitchPeaceElectron', {
  /** Returns true when running inside Electron (vs. a plain browser). */
  isElectron: true,

  steam: {
    /**
     * Activate the Steam overlay.
     * @param {'friends'|'community'|'players'|'settings'|'officialgamegroup'|'stats'|'achievements'} dialog
     */
    activateOverlay: (dialog = 'friends') =>
      ipcRenderer.invoke('steam:activateOverlay', dialog),

    /**
     * Unlock a Steam achievement.
     * @param {string} achievementId  e.g. 'FIRST_TRANSMUTATION'
     */
    setAchievement: (achievementId) =>
      ipcRenderer.invoke('steam:setAchievement', achievementId),

    /** Get the Steam persona name of the current user. */
    getPersonaName: () =>
      ipcRenderer.invoke('steam:getPersonaName'),
  },
});
