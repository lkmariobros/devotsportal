-- Function to set a user's role to 'admin'
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
    RETURN FALSE;
  END IF;

  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;

  IF profile_exists THEN
    -- Update existing profile
    UPDATE public.profiles
    SET role = 'admin', updated_at = NOW()
    WHERE id = user_id;
  ELSE
    -- Create new profile
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (user_id, user_email, 'admin', NOW(), NOW());
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.set_user_as_admin TO authenticated;

-- Example usage:
-- SELECT set_user_as_admin('elson@devots.com.my');
-- SELECT set_user_as_admin('josephkwantum@gmail.com');
