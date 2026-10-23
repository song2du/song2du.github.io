// The visitor's light/dark choice, saved in localStorage and applied as <html data-theme>.
// Until they choose, the site follows the system setting.
export const THEME_STORAGE_KEY = "theme";

// Runs in <head> before first paint so a saved choice never flashes the other theme.
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
