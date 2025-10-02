/*
  # Create get_current_user_id RPC function

  1. New Functions
    - `get_current_user_id()` - Returns the current user's profile ID from the users table
  
  2. Security
    - Function is SECURITY DEFINER to access auth.uid()
    - Returns the user's profile ID based on their authentication ID
  
  3. Purpose
    - Allows the application to resolve the current user's profile ID
    - Used by friends and journals functionality to associate data with the correct user
*/

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM public.users WHERE auth_id = auth.uid();
  RETURN user_id;
END;
$$;