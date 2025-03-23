
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const ProfileSetupAlert = () => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Profile Setup Required</AlertTitle>
      <AlertDescription>
        <p>Your account has been created but profile setup is incomplete. This is likely because the database hasn't been fully configured.</p>
        <p className="mt-2 font-semibold">For administrators:</p>
        <p className="text-sm mt-1">
          Please create the following table in Supabase:
        </p>
        <pre className="text-xs bg-black/10 p-2 mt-1 rounded overflow-auto">
{`CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);
  
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);`}
        </pre>
      </AlertDescription>
    </Alert>
  );
};

export default ProfileSetupAlert;
