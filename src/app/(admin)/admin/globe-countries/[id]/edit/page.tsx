import { ModelForm, type FieldConfig } from '../../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'countryName',
    label: 'Country Name',
    type: 'text',
    placeholder: 'e.g. Nepal',
    required: true,
  },
  {
    name: 'latitude',
    label: 'Latitude',
    type: 'number',
    placeholder: 'e.g. 28.39',
    required: true,
    min: -90,
    max: 90,
    description: 'Decimal degrees, -90 to 90. Nepal ≈ 28.39',
  },
  {
    name: 'longitude',
    label: 'Longitude',
    type: 'number',
    placeholder: 'e.g. 84.12',
    required: true,
    min: -180,
    max: 180,
    description: 'Decimal degrees, -180 to 180. Nepal ≈ 84.12',
  },
  {
    name: 'hospitalCount',
    label: 'Hospital / Partner Count',
    type: 'number',
    placeholder: 'e.g. 60',
    min: 0,
    description: 'Number of hospitals or partners in this country.',
  },
  {
    name: 'displayLabel',
    label: 'Display Label',
    type: 'text',
    placeholder: 'e.g. 60+ Hospitals',
    description: 'Label shown on the globe marker. Falls back to "X+ Hospitals" if empty.',
  },
  {
    name: 'isHighlighted',
    label: 'Highlighted (Primary Country)',
    type: 'checkbox',
    description: 'Only one country should be highlighted (e.g. Nepal HQ). Gets a larger, pulsing marker.',
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    defaultValue: true,
    description: 'Inactive countries are hidden from the public globe.',
  },
  {
    name: 'order',
    label: 'Display Order',
    type: 'number',
    defaultValue: 0,
    min: 0,
    description: 'Lower numbers appear first in the sidebar list.',
  },
];

export default function EditGlobeCountryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ModelForm
      title='Globe Country'
      fields={fields}
      apiBase='/api/globe-countries'
      listHref='/admin/globe-countries'
      id={params.then(p => p.id)}
    />
  );
}
