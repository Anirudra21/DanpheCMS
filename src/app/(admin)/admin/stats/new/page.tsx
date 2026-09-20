import { ModelForm, type FieldConfig } from '../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'label',
    label: 'Label',
    type: 'text',
    placeholder: 'e.g. Hospitals Served',
    required: true,
  },
  {
    name: 'value',
    label: 'Value',
    type: 'text',
    placeholder: 'e.g. 500+',
    required: true,
  },
  {
    name: 'suffix',
    label: 'Suffix',
    type: 'text',
    placeholder: '+',
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

export default function NewStatPage() {
  return (
    <ModelForm
      title="Stat"
      fields={fields}
      apiBase="/api/stats"
      listHref="/admin/stats"
    />
  );
}
