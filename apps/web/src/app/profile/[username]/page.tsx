import { PublicProfileContainer } from '@/widgets/profile/ui/PublicProfileContainer';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  return <PublicProfileContainer username={username} />;
}
