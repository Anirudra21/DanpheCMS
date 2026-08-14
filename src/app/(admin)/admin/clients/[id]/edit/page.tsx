import { ModelForm, type FieldConfig } from '../../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'e.g. Kathmandu Medical College',
    required: true,
  },
  {
    name: 'logoUrl',
    label: 'Logo',
    type: 'image',
    folder: 'clients',
  },
  {
    name: 'showOnHomepage',
    label: 'Show on Homepage',
    type: 'checkbox',
    defaultValue: true,
  },
  {
    name: 'isPublished',
    label: 'Published',
    type: 'checkbox',
    defaultValue: false,
  },
  {
    name: 'order',
    label: 'Display Order',
    type: 'number',
    defaultValue: 0,
    min: 0,
    description: 'Lower numbers appear first.',
  },
];

export default function EditClientLogoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ModelForm
      title="Client Logo"
      fields={fields}
      apiBase="/api/client-logos"
      listHref="/admin/clients"
      id={params.then(p => p.id)}
    />
  );
}
