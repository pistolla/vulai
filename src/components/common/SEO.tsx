import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterHandle?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Uni Limelight Sports | Redefining University Athletics',
  description = 'The ultimate platform for university sports, connecting leagues, universities, teams, and fans in one unified digital ecosystem.',
  canonicalUrl = 'https://www.unilimelightsports.com',
  ogImage = 'https://www.unilimelightsports.com/images/meta-cover.jpg',
  ogType = 'website',
  twitterHandle = '@unilimelight',
}) => {
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content={twitterHandle} />
    </Head>
  );
};

export default SEO;
