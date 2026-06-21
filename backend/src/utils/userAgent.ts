const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

const DESKTOP_UA_REGEX =
  /Windows NT|Macintosh|X11|CrOS|Linux(?!.*Android)/i;

export function isMobileUserAgent(userAgent: string | undefined): boolean {
  if (!userAgent) return false;

  // Render health-checks y similares no tienen User-Agent móvil,
  // pero deben poder acceder a la API.
  if (userAgent.includes('render') || userAgent.includes('curl') || userAgent.includes('Postman')) {
    return true;
  }

  if (MOBILE_UA_REGEX.test(userAgent)) {
    return true;
  }

  if (DESKTOP_UA_REGEX.test(userAgent) && !MOBILE_UA_REGEX.test(userAgent)) {
    return false;
  }

  return MOBILE_UA_REGEX.test(userAgent);
}
