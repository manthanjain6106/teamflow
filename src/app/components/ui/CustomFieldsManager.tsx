'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  User,
  Link,
  Palette,
  Star,
  X
} from 'lucide-react';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'user' | 'url' | 'rating';
  required: boolean;
  options?: string[];
  defaultValue?: any;
  description?: string;
}

interface CustomFieldsManagerProps {
  entityId: string;
  entityType: 'task' | 'list' | 'space';
  fields: CustomField[];
  values: Record<string, any>;
  onFieldsChange: (fields: CustomField[]) => void;
  onValuesChange: (values: Record<string, any>) => void;
  editable?: boolean;
}

export default function CustomFieldsManager({
  entityId,
  entityType,
  fields,
  values,
  onFieldsChange,
  onValuesChange,
  editable = true
}: CustomFieldsManagerProps) {
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [newField, setNewField] = useState<Partial<CustomField>>({
    name: '',
    type: 'text',
    required: false,
    options: []
  });

  const fieldTypes = [
    { id: 'text', name: 'Text', icon: Type, description: 'Single line text input' },
    { id: 'number', name: 'Number', icon: Hash, description: 'Numeric input' },
    { id: 'date', name: 'Date', icon: Calendar, description: 'Date picker' },
    { id: 'select', name: 'Dropdown', icon: CheckSquare, description: 'Single selection from options' },
    { id: 'multiselect', name: 'Multi-select', icon: CheckSquare, description: 'Multiple selections from options' },
    { id: 'checkbox', name: 'Checkbox', icon: CheckSquare, description: 'Yes/No boolean value' },
    { id: 'user', name: 'Person', icon: User, description: 'User selection' },
    { id: 'url', name: 'URL', icon: Link, description: 'Website link' },
    { id: 'rating', name: 'Rating', icon: Star, description: '1-5 star rating' }
  ];

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.id === type);
    const IconComponent = fieldType?.icon || Type;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleAddField = () => {
    if (!newField.name?.trim()) return;

    const field: CustomField = {
      id: `field_${Date.now()}`,
      name: newField.name,
      type: newField.type || 'text',
      required: newField.required || false,
      options: newField.options || [],
      description: newField.description
    };

    onFieldsChange([...fields, field]);
    setNewField({
      name: '',
      type: 'text',
      required: false,
      options: []
    });
    setShowAddField(false);
  };

  const handleUpdateField = (field: CustomField) => {
    const updatedFields = fields.map(f => f.id === field.id ? field : f);
    onFieldsChange(updatedFields);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = fields.filter(f => f.id !== fieldId);
    onFieldsChange(updatedFields);
    
    // Remove field value
    const updatedValues = { ...values };
    delete updatedValues[fieldId];
    onValuesChange(updatedValues);
  };

  const handleFieldValueChange = (fieldId: string, value: any) => {
    onValuesChange({
      ...values,
      [fieldId]: value
    });
  };

  const renderFieldInput = (field: CustomField) => {
    const value = values[field.id];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value ? Number(e.target.value) : null)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldValueChange(field.id, e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {field.name}
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Select {field.name.toLowerCase()}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      handleFieldValueChange(field.id, [...currentValues, option]);
                    } else {
                      handleFieldValueChange(field.id, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'url':
        return (
          <input
            type="url"
            value={value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()} URL`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleFieldValueChange(field.id, rating)}
                className={`p-1 rounded ${
                  (value || 0) >= rating 
                    ? 'text-yellow-400' 
                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                }`}
              >
                <Star className="h-5 w-5 fill-current" />
              </button>
            ))}
            {value && (
              <button
                onClick={() => handleFieldValueChange(field.id, null)}
                className="ml-2 text-gray-400 hover:text-gray-600 text-sm"
              >
                Clear
              </button>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );
    }
  };

  const renderFieldEditor = (field: Partial<CustomField>, isNew: boolean = false) => {
    const currentField = field;
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Name
          </label>
          <input
            type="text"
            value={currentField.name || ''}
            onChange={(e) => {
              if (isNew) {
                setNewField({ ...newField, name: e.target.value });
              } else {
                setEditingField({ ...editingField!, name: e.target.value });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder="Enter field name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Type
          </label>
          <select
            value={currentField.type || 'text'}
            onChange={(e) => {
              if (isNew) {
                setNewField({ ...newField, type: e.target.value as any });
              } else {
                setEditingField({ ...editingField!, type: e.target.value as any });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {fieldTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {(currentField.type === 'select' || currentField.type === 'multiselect') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Options (one per line)
            </label>
            <textarea
              value={(currentField.options || []).join('\n')}
              onChange={(e) => {
                const options = e.target.value.split('\n').filter(opt => opt.trim());
                if (isNew) {
                  setNewField({ ...newField, options });
                } else {
                  setEditingField({ ...editingField!, options });
                }
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="Option 1\nOption 2\nOption 3"
            />
          </div>
        )}

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentField.required || false}
              onChange={(e) => {
                if (isNew) {
                  setNewField({ ...newField, required: e.target.checked });
                } else {
                  setEditingField({ ...editingField!, required: e.target.checked });
                }
              }}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Required field
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={currentField.description || ''}
            onChange={(e) => {
              if (isNew) {
                setNewField({ ...newField, description: e.target.value });
              } else {
                setEditingField({ ...editingField!, description: e.target.value });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder="Field description"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Custom Fields</span>
        </h3>
        {editable && (
          <button
            onClick={() => setShowAddField(true)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add Field</span>
          </button>
        )}
      </div>

      {/* Existing Fields */}
      {fields.length > 0 && (
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getFieldIcon(field.type)}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                    {fieldTypes.find(ft => ft.id === field.type)?.name || field.type}
                  </span>
                </div>
                {editable && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingField(field)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {field.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {field.description}
                </p>
              )}

              {field.type !== 'checkbox' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderFieldInput(field)}
                </div>
              )}

              {field.type === 'checkbox' && (
                <div>
                  {renderFieldInput(field)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {fields.length === 0 && !showAddField && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No custom fields yet
          </p>
          {editable && (
            <button
              onClick={() => setShowAddField(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Field</span>
            </button>
          )}
        </div>
      )}

      {/* Add Field Modal */}
      {showAddField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Custom Field
              </h3>
              <button
                onClick={() => setShowAddField(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderFieldEditor(newField, true)}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddField(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddField}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                disabled={!newField.name?.trim()}
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Field Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Custom Field
              </h3>
              <button
                onClick={() => setEditingField(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderFieldEditor(editingField)}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateField(editingField)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                disabled={!editingField.name?.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}