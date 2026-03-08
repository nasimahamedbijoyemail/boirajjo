import { forwardRef } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  type?: string;
}

const BASE_URL = 'https://boirajjo.lovable.app';
const DEFAULT_TITLE = 'Boi Rajjo | Campus Book Marketplace';
const DEFAULT_DESC = 'Buy and sell used academic books with trusted campus students in Bangladesh. Browse Nilkhet shops, request books, and connect via WhatsApp.';
const DEFAULT_OG = `${BASE_URL}/og-image.png`;

export const SEOHead = forwardRef<HTMLDivElement, SEOHeadProps>(({
  title,
  description = DEFAULT_DESC,
  path = '/',
  ogImage = DEFAULT_OG,
  type = 'website',
}, _ref) => {
  const fullTitle = title ? `${title} | Boi Rajjo` : DEFAULT_TITLE;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
});

SEOHead.displayName = 'SEOHead';
