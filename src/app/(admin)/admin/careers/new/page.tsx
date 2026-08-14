import { ModelForm, type FieldConfig } from '../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g. Senior Software Engineer',
    required: true,
  },
  {
    name: 'department',
    label: 'Department',
    type: 'text',
    placeholder: 'e.g. Engineering',
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'e.g. Kathmandu, Nepal',
  },
  {
    name: 'employmentType',
    label: 'Employment Type',
    type: 'select',
    options: [
      { label: 'Full-Time', value: 'Full-Time' },
      { label: 'Part-Time', value: 'Part-Time' },
      { label: 'Contract', value: 'Contract' },
      { label: 'Internship', value: 'Internship' },
      { label: 'Remote', value: 'Remote' },
    ],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'richtext',
  },
  {
    name: 'requirements',
    label: 'Requirements',
    type: 'richtext',
  },
  {
    name: 'applyEmail',
    label: 'Apply Email',
    type: 'text',
    placeholder: 'e.g. careers@danphehealth.com',
    validate: (value: unknown) => {
      if (value && typeof value === 'string' && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Invalid email format';
      }
      return undefined;
    },
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    defaultValue: 'OPEN',
    options: [
      { label: 'Open', value: 'OPEN' },
      { label: 'Closed', value: 'CLOSED' },
    ],
  },
];

export default function NewJobPage() {
  return (
    <ModelForm
      title="Job"
      fields={fields}
      apiBase="/api/jobs"
      listHref="/admin/careers"
    />
  );
}
