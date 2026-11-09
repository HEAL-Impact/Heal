import ResourceDetailClient from './ResourceDetailClient';

// Static params for build-time generation (Server Component)
export async function generateStaticParams() {
  // Define all possible resource IDs that should be pre-generated
  const resourceIds = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    'kenya-befrienders',
    'kenya-eplus',
    'kenya-redcross',
    'kenya-mental-health',
    'kenya-police',
    'kenya-childline',
    'kenya-gender-violence',
    'kenya-samaritans'
  ];

  return resourceIds.map((id) => ({
    id: id,
  }));
}

// Main page component (Server Component)
export default function ResourceDetailPage() {
  return <ResourceDetailClient />;
}