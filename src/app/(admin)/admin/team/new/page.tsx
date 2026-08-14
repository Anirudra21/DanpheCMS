import { ModelForm, type FieldConfig } from '../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'e.g. Jane Doe',
    required: true,
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g. CEO & Founder',
  },
  {
    name: 'photoUrl',
    label: 'Photo',
    type: 'image',
    folder: 'team',
    description: 'Square headshot photo.',
  },
  {
    name: 'order',
    label: 'Display Order',
    type: 'number',
    defaultValue: 0,
    min: 0,
    description: 'Lower numbers appear first.',
  },
  {
    name: 'isPublished',
    label: 'Published',
    type: 'checkbox',
    defaultValue: false,
  },
];

export default function NewTeamMemberPage() {
  return (
    <ModelForm
      title="Team Member"
      fields={fields}
      apiBase="/api/team-members"
      listHref="/admin/team"
    />
  );
}
