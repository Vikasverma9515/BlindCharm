import { Loader2, Save } from 'lucide-react'

interface UserProfile {
  [key: string]: any
}

interface EditSectionProps {
  section: {
    id: string;
    title: string;
    fields: string[];
  };
  formData: Partial<UserProfile>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onArrayChange: (field: keyof UserProfile, value: string) => void;
  onSubmit: (cleanedData: Partial<UserProfile>) => void;
  loading: boolean;
}

function EditSection({ section, formData, onChange, onArrayChange, onSubmit, loading }: EditSectionProps) {
  // Custom handler for nested location fields
  const handleLocationChange = (field: 'city' | 'country', value: string) => {
    const updatedLocation = {
      ...formData.location,
      [field]: value,
    }
    onChange({
      target: {
        name: 'location',
        value: updatedLocation,
      }
    } as any)
  }

  const renderField = (field: string) => {
    switch (field) {
      case 'username':
      case 'full_name':
      case 'email':
        return (
          <input
            type="text"
            name={field}
            value={formData[field] || ''}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={`Enter your ${field.replace('_', ' ')}`}
          />
        );

      case 'gender':
        return (
          // In your profile form component
<select
  name="gender"
  value={formData.gender?.toLowerCase() || ''}
  onChange={onChange}
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
>
  <option value="">Select gender</option>
  <option value="male">Male</option>
  <option value="female">Female</option>
  <option value="other">Other</option>
</select>
        );

      case 'dob':
        return (
          <input
            type="date"
            name="dob"
            value={formData.dob || ''}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        );

      case 'bio':
        return (
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={onChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Tell us about yourself..."
          />
        );

      case 'height':
        return (
          <input
            type="number"
            name="height"
            value={formData.height || ''}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Height in cm"
          />
        );

      // Array fields
      case 'interests':
      case 'hobbies':
      case 'languages':
      case 'personality_tags':
      case 'lifestyle_tags':
      case 'looking_for':
      case 'dealbreakers':
        return (
          <input
            type="text"
            value={formData[field]?.join(', ') || ''}
            onChange={(e) => onArrayChange(field as keyof UserProfile, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={`Enter ${field.replace('_', ' ')} (comma-separated)`}
          />
        );

      case 'occupation':
      case 'education':
        return (
          <input
            type="text"
            name={field}
            value={formData[field] || ''}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={`Enter your ${field}`}
          />
        );

      case 'location':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              value={formData.location?.city || ''}
              onChange={e => handleLocationChange('city', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="City"
            />
            <input
              type="text"
              name="country"
              value={formData.location?.country || ''}
              onChange={e => handleLocationChange('country', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Country"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Clean and submit form data
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedData = Object.fromEntries(
      Object.entries(formData)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => {
          // Handle arrays
          if (Array.isArray(value)) {
            return [key, value.filter(Boolean)];
          }
          // Handle objects (like location)
          if (typeof value === 'object' && value !== null) {
            return [key, Object.fromEntries(
              Object.entries(value).filter(([_, v]) => v !== null && v !== undefined)
            )];
          }
          return [key, value];
        })
    );

    onSubmit(cleanedData);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {section.fields.map(field => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 capitalize">
            {field.replace('_', ' ')}
          </label>
          {renderField(field)}
        </div>
      ))}

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default EditSection;