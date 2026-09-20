import { getJobs } from '@/lib/queries';
import CareersContent from './CareersContent';

export default async function CareersPage() {
  const jobs = await getJobs('OPEN');

  const mapped = jobs.map((j) => ({
    title: j.title,
    department: j.department,
    location: j.location,
    employmentType: j.employmentType,
    applyEmail: j.applyEmail,
    description: j.description,
    postedAt: j.postedAt
      ? j.postedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '',
  }));

  return <CareersContent jobs={mapped} />;
}
