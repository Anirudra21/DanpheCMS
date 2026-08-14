'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ModelForm, type FieldConfig } from '../../_components/ModelForm';

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

function NewNavForm() {
  const searchParams = useSearchParams();
  const location = searchParams.get('location') || 'HEADER';
  const formFields = fields.map((f) =>
    f.name === 'location' ? { ...f, defaultValue: location } : f,
  );
  return (
    <ModelForm
      title="Nav Item"
      fields={formFields}
      apiBase="/api/navigation"
      listHref="/admin/navigation"
    />
  );
}

export default function NewNavigationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        </div>
      }
    >
      <NewNavForm />
    </Suspense>
  );
}
