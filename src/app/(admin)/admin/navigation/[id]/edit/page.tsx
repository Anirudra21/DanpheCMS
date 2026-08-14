import { ModelForm, type FieldConfig } from '../../../_components/ModelForm';

const locationOptions = [
  { label: 'Header', value: 'HEADER' },
  { label: 'Footer — Company', value: 'FOOTER_COMPANY' },
  { label: 'Footer — Solutions', value: 'FOOTER_SOLUTIONS' },
  { label: 'Footer — Information', value: 'FOOTER_INFO' },
];

const fields: FieldConfig[] = [
  { name: 'label', label: 'Label', type: 'text', placeholder: 'e.g. About Us', required: true },
  { name: 'url', label: 'URL', type: 'text', placeholder: 'e.g. /about', required: true },
  { name: 'location', label: 'Location', type: 'select', required: true, options: locationOptions },
  { name: 'order', label: 'Display Order', type: 'number', defaultValue: 0, min: 0 },
];

export default function EditNavigationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ModelForm
      title="Nav Item"
      fields={fields}
      apiBase="/api/navigation"
      listHref="/admin/navigation"
      id={params.then((p) => p.id)}
    />
  );
}
