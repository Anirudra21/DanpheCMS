import { getStats, getTeamMembers } from '@/lib/queries';
import CompanyContent from './CompanyContent';

export default async function CompanyPage() {
  const [allStats, teamMembers] = await Promise.all([
    getStats(),
    getTeamMembers(),
  ]);

  // Stats 4-7 for the company page (0-3 are hero stats)
  const stats = allStats.slice(4, 8).map((s) => ({
    value: s.value,
    label: s.label,
  }));

  const team = teamMembers.map((m) => ({
    name: m.name,
    title: m.title,
    photoUrl: m.photoUrl,
  }));

  return <CompanyContent stats={stats} team={team} />;
}
