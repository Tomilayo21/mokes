import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getServerTranslations(locale: string, namespaces: string[] = ['common']) {
  return await serverSideTranslations(locale, namespaces);
}
