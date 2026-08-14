import { ModelForm, type FieldConfig } from '../../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g. OPD Management',
    required: true,
  },
  {
    name: 'slug',
    label: 'Slug',
    type: 'slug',
    slugFrom: 'title',
  },
  {
    name: 'shortDescription',
    label: 'Short Description',
    type: 'textarea',
    placeholder: 'Brief description shown in cards and listings.',
    rows: 2,
  },
  {
    name: 'body',
    label: 'Body Content',
    type: 'richtext',
    placeholder: 'Full description of this solution…',
  },
  {
    name: 'iconUrl',
    label: 'Icon Image',
    type: 'image',
    folder: 'solutions',
    description: 'Square icon used in cards and module grid.',
  },
  {
    name: 'heroImageUrl',
    label: 'Hero Image',
    type: 'image',
    folder: 'solutions',
    description: 'Wide banner image for the solution detail page.',
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

export default function EditSolutionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ModelForm
      title="Solution"
      fields={fields}
      apiBase="/api/solutions"
      listHref="/admin/solutions"
      id={params.then(p => p.id)}
      arrayFields={[
        {
          name: 'features',
          label: 'Features',
          subFields: [
            {
              name: 'label',
              label: 'Feature',
              type: 'text',
              placeholder: 'e.g. Token & Queue Management',
              required: true,
            },
          ],
        },
      ]}
    />
  );
}
