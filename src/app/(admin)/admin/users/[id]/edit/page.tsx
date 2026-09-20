import React from 'react';
import { ModelForm, type FieldConfig } from '../../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'e.g. John Doe',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'e.g. john@example.com',
    required: true,
    disabled: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'text',
    placeholder: 'Leave blank to keep current password',
    required: false,
    description: 'Leave blank to keep current password',
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    options: [
      { label: 'Super Admin', value: 'SUPER_ADMIN' },
      { label: 'Editor', value: 'EDITOR' },
    ],
  },
];

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsCopy = React.use(params);
  const id = paramsCopy.id;

  return (
    <ModelForm
      title="User"
      fields={fields}
      apiBase='/api/users'
      listHref='/admin/users'
      id={id}
    />
  );
}
