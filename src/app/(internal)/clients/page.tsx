import { getClientLogos } from '@/lib/queries';
import ClientsContent from './ClientsContent';

export default async function ClientsPage() {
  const clients = await getClientLogos({ published: true });

  const mapped = clients.map((c) => ({
    name: c.name,
    logoUrl: c.logoUrl,
  }));

  return <ClientsContent clients={mapped} />;
}
