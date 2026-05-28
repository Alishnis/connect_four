const COINS_KEY = "neongrid_coins";
const OWNED_SKINS_KEY = "neongrid_owned_skins";
const ACTIVE_SKIN_KEY = "neongrid_active_skin";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getLocalCoins(): number {
  if (!isBrowser()) return 0;
  const val = localStorage.getItem(COINS_KEY);
  return val ? parseInt(val, 10) : 0;
}

export function addLocalCoins(amount: number): number {
  const current = getLocalCoins();
  const next = current + amount;
  localStorage.setItem(COINS_KEY, String(next));
  return next;
}

export function setLocalCoins(amount: number): void {
  if (!isBrowser()) return;
  localStorage.setItem(COINS_KEY, String(amount));
}

export function getLocalOwnedSkins(): string[] {
  if (!isBrowser()) return ["classic"];
  const val = localStorage.getItem(OWNED_SKINS_KEY);
  if (!val) return ["classic"];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : ["classic"];
  } catch {
    return ["classic"];
  }
}

export function addLocalOwnedSkin(skinId: string): string[] {
  const owned = getLocalOwnedSkins();
  if (owned.includes(skinId)) return owned;
  const next = [...owned, skinId];
  localStorage.setItem(OWNED_SKINS_KEY, JSON.stringify(next));
  return next;
}

export function getLocalActiveSkin(): string {
  if (!isBrowser()) return "classic";
  return localStorage.getItem(ACTIVE_SKIN_KEY) ?? "classic";
}

export function setLocalActiveSkin(skinId: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(ACTIVE_SKIN_KEY, skinId);
}
