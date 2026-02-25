'use strict';

const PROFILE_KEY = 'gp_player_profile';

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') || {};
  } catch {
    return {};
  }
}

function writeProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

function hasAge(profile) {
  return typeof profile.ageGroup === 'string' && profile.ageGroup.trim().length > 0;
}

function hasLanguage(profile) {
  const hasNative = typeof profile.nativeLang === 'string' && profile.nativeLang.trim().length > 0;
  const hasTarget = typeof profile.targetLang === 'string' && profile.targetLang.trim().length > 0;
  return hasNative && hasTarget;
}

export function resolveInitialBootPhase() {
  const profile = readProfile();
  const complete = profile.onboardingDone === true;

  if (!complete) {
    if (!hasAge(profile)) return 'onboarding';
    if (!hasLanguage(profile)) return 'langopts';
    profile.onboardingDone = true;
    writeProfile(profile);
    return 'title';
  }

  return 'title';
}

export function clearOnboardingProfileKeys() {
  const profile = readProfile();
  profile.onboardingDone = false;
  profile.ageGroup = null;
  profile.diffTier = null;
  profile.nativeLang = null;
  profile.targetLang = null;
  writeProfile(profile);
  return ['onboardingDone', 'ageGroup', 'diffTier', 'nativeLang', 'targetLang'];
}
