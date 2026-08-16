import { ModelForm, type FieldConfig } from '../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'e.g. Apollo Hospitals',
    required: true,
  },
  {
    name: 'logoUrl',
    label: 'Logo Image',
    type: 'image',
    folder: 'clients',
    description: 'Client logo image.',
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
];

export default function NewClientLogoPage() {
  return (
    <ModelForm
      title="Client Logo"
      fields={fields}
      apiBase="/api/client-logos"
      listHref="/admin/clients"
    />
  );
}
