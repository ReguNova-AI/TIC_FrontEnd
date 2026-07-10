import { useState, useEffect } from 'react';

// ─── Module-level state (single source of truth, no SWR needed) ───────────────
const initialState = {
  openedItem: 'dashboard',
  openedComponent: 'buttons',
  openedHorizontalItem: null,
  isDashboardDrawerOpened: false,
  isComponentDrawerOpened: true
};

let menuState = { ...initialState };
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((fn) => fn(menuState));
}

// ─── Public API (same surface as before — no call-site changes needed) ─────────
export const endpoints = {
  key: 'api/menu',
  master: 'master',
  dashboard: '/dashboard'
};

export function useGetMenuMaster() {
  const [state, setState] = useState(menuState);

  useEffect(() => {
    // Sync in case state changed between render and effect
    setState(menuState);
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);

  return { menuMaster: state, menuMasterLoading: false };
}

export function handlerDrawerOpen(isDashboardDrawerOpened) {
  menuState = { ...menuState, isDashboardDrawerOpened };
  notifyListeners();
}

export function handlerActiveItem(openedItem) {
  menuState = { ...menuState, openedItem };
  notifyListeners();
}