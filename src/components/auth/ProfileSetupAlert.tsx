
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const ProfileSetupAlert = () => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Setup Information</AlertTitle>
      <AlertDescription>
        <p>The application is now using Supabase for the database and authentication.</p>
        <p className="mt-2">Tables created in Supabase:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li><strong>courses</strong> - Stores all course information</li>
          <li><strong>course_resources</strong> - Stores resources associated with courses</li>
          <li><strong>profiles</strong> - Stores user profile information</li>
        </ul>
        <p className="mt-2">A storage bucket named "course-content" has also been created for file uploads.</p>
      </AlertDescription>
    </Alert>
  );
};

export default ProfileSetupAlert;
