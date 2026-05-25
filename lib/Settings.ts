// types/Settings.ts
export interface ISettings {
  lightLogoUrl?: string | null;
  darkLogoUrl?: string | null;
  logoWidth: string | null;
  logoHeight: string | null;
  siteTitle?: string;
  siteDescription?: string;
  supportEmail?: string;
  footerDescription?: string;
  footerPhone?: string;
  footerEmail?: string;
  footerName?: string;
  socialLinks?: {
    platform: string;
    iconUrl: string;
    url: string;
  }[];
}
