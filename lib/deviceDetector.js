import { UAParser } from "ua-parser-js";

export function getDeviceLabel(userAgent) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const os = result.os?.name || "Unknown OS";
  const browser = result.browser?.name || "Unknown Browser";
  const deviceType = result.device?.type;

  // SMART DEVICE NAME GENERATION
  let deviceName = "Desktop";

  if (deviceType === "mobile") {
    deviceName = `${os} Phone`;
  } else if (deviceType === "tablet") {
    deviceName = `${os} Tablet`;
  } else {
    deviceName = `${os} PC`;
  }

  return {
    deviceName,
    os,
    browser,
  };
}