// Light / Dark Theme Helper for Tharaa
export type Theme = 'light' | 'dark';

export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem('tharaa_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Strictly default to Light Theme as requested
  } catch {
    return 'light';
  }
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem('tharaa_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch (e) {
    console.error(e);
  }
}

// Global active currency helper
export type Currency = 'KWD' | 'SAR' | 'AED';

export function getActiveCurrency(): Currency {
  try {
    const saved = localStorage.getItem('tharaa_currency');
    if (saved === 'KWD' || saved === 'SAR' || saved === 'AED') return saved;
  } catch {}
  return 'KWD';
}

export function setActiveCurrency(currency: Currency) {
  try {
    localStorage.setItem('tharaa_currency', currency);
    window.dispatchEvent(new Event('tharaa_currency_change'));
  } catch {}
}
