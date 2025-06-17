// src/components/profile/ViewSection.tsx

interface UserProfile {
  [key: string]: any
}

interface ViewSectionProps {
  section: {
    id: string;
    title: string;
    fields: string[];
  };
  profile: UserProfile;
}

function ViewSection({ section, profile }: ViewSectionProps) {
  const renderField = (field: string) => {
    const value = profile[field];

    // Handle null, undefined, empty string, or empty array/object
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    ) {
      return <span className="text-gray-400">Not set</span>;
    }

    switch (field) {
      case 'interests':
      case 'hobbies':
      case 'languages':
      case 'personality_tags':
      case 'lifestyle_tags':
      case 'looking_for':
      case 'dealbreakers':
        return (
          <div className="flex flex-wrap gap-2">
            {(value as string[]).map((item, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        );

      case 'location':
        if (typeof value === 'object' && (value.city || value.country)) {
          return (
            <span>
              {[value.city, value.country].filter(Boolean).join(', ')}
            </span>
          );
        }
        return <span className="text-gray-400">Not set</span>;

      case 'dob':
        if (typeof value === 'string' && value) {
          const birthDate = new Date(value);
          if (!isNaN(birthDate.getTime())) {
            const age = new Date().getFullYear() - birthDate.getFullYear();
            return <span>{age} years old</span>;
          }
        }
        return <span className="text-gray-400">Not set</span>;

      case 'height':
        return <span>{value} cm</span>;

      default:
        return <span>{value}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {section.fields.map(field => (
        <div key={field}>
          <h3 className="text-sm font-medium text-gray-500 capitalize">
            {field.replace('_', ' ')}
          </h3>
          <div className="mt-1 text-gray-900">
            {renderField(field)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ViewSection;