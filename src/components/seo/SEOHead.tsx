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
const DEFAULT_TITLE = 'Boi Rajjo — Buy & Sell Used Books Online | Campus Book Marketplace';
const DEFAULT_DESC = 'Buy, sell & exchange used academic books with trusted campus students in Bangladesh. Order from Nilkhet book market online. Browse textbooks, novels & study materials at affordable prices.';
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
      <meta property="og:site_name" content="Boi Rajjo" />
      <meta property="og:locale" content="en_BD" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
});

SEOHead.displayName = 'SEOHead';
