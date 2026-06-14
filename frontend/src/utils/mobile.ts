const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

const DESKTOP_UA_REGEX =
  /Windows NT|Macintosh|X11|CrOS|Linux(?!.*Android)/i;

export function isMobileDevice(): boolean {
  const ua = navigator.userAgent;

  if (MOBILE_UA_REGEX.test(ua)) {
    return true;
  }

  if (DESKTOP_UA_REGEX.test(ua) && !MOBILE_UA_REGEX.test(ua)) {
    return false;
  }

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  return isTouchDevice && isSmallScreen;
}
