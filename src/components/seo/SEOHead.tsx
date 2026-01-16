import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'A-Z Enterprises';
const BASE_URL = 'https://summit-hive-booking-hub.lovable.app';
const DEFAULT_IMAGE = 'https://storage.googleapis.com/gpt-engineer-file-uploads/x1s1h5VC7lUIw9juXAA6RyWcS0o2/social-images/social-1767638102399-Enterprise Logo.jpg';

/**
 * SEOHead component for dynamic page-level SEO
 * Use on every page to set title, description, and structured data
 */
export function SEOHead({
  title,
  description,
  canonicalPath,
  type = 'website',
  image = DEFAULT_IMAGE,
  noIndex = false,
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonicalPath ? `${BASE_URL}/#${canonicalPath}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* No Index */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

/**
 * Pre-built JSON-LD schemas for common page types
 */
export const jsonLdSchemas = {
  localBusiness: (overrides?: Partial<Record<string, unknown>>) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'A-Z Enterprises',
    description: 'Private offices, coworking spaces, fitness center, event venue, and spa services in Wapakoneta, Ohio.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Wapakoneta',
      addressRegion: 'OH',
      addressCountry: 'US',
    },
    telephone: '+1-567-379-6340',
    email: 'info@az-enterprises.com',
    openingHours: 'Mo-Su 06:00-22:00',
    url: BASE_URL,
    ...overrides,
  }),

  coworkingSpace: (overrides?: Partial<Record<string, unknown>>) => ({
    '@context': 'https://schema.org',
    '@type': 'CoworkingSpace',
    name: 'The Hive by A-Z',
    description: 'Private offices, dedicated desks, and flexible day passes in Wapakoneta, Ohio.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Wapakoneta',
      addressRegion: 'OH',
      addressCountry: 'US',
    },
    telephone: '+1-567-379-6340',
    openingHours: 'Mo-Su 06:00-22:00',
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'High-Speed WiFi' },
      { '@type': 'LocationFeatureSpecification', name: 'Coffee Bar' },
      { '@type': 'LocationFeatureSpecification', name: '24/7 Access' },
      { '@type': 'LocationFeatureSpecification', name: 'Meeting Rooms' },
    ],
    ...overrides,
  }),

  officeSpace: (office: { name: string; description?: string; sqft?: number; capacity?: number }) => ({
    '@context': 'https://schema.org',
    '@type': 'OfficeBuilding',
    name: office.name,
    description: office.description,
    floorSize: office.sqft ? {
      '@type': 'QuantitativeValue',
      value: office.sqft,
      unitCode: 'FTK',
    } : undefined,
    maximumAttendeeCapacity: office.capacity,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Wapakoneta',
      addressRegion: 'OH',
      addressCountry: 'US',
    },
  }),
};
