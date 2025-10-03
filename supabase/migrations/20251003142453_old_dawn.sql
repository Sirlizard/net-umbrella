/*
  # Fix user signup database error

  1. Database Functions
    - Create or replace the handle_new_user function to properly handle user creation
    - Ensure the function runs with security definer privileges
    - Handle the user profile creation in a way that bypasses RLS during signup

  2. Triggers
    - Ensure the trigger fires after user creation in auth.users
    - The trigger should create the corresponding profile in public.users

  3. Security
    - The function runs with elevated privileges to bypass RLS during signup
    - Normal RLS policies still apply for regular operations
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();