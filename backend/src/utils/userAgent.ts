const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

const DESKTOP_UA_REGEX =
  /Windows NT|Macintosh|X11|CrOS|Linux(?!.*Android)/i;

export function isMobileUserAgent(userAgent: string | undefined): boolean {
  if (!userAgent) return false;

  if (MOBILE_UA_REGEX.test(userAgent)) {
    return true;
  }

  if (DESKTOP_UA_REGEX.test(userAgent) && !MOBILE_UA_REGEX.test(userAgent)) {
    return false;
  }

  return MOBILE_UA_REGEX.test(userAgent);
}
