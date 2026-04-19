
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Saved images table
CREATE TABLE public.saved_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  texts JSONB DEFAULT '{}',
  customizations JSONB DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_id TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images" ON public.saved_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public images viewable by all" ON public.saved_images FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own images" ON public.saved_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own images" ON public.saved_images FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own images" ON public.saved_images FOR UPDATE USING (auth.uid() = user_id);

-- Storage bucket for saved images
INSERT INTO storage.buckets (id, name, public) VALUES ('saved-images', 'saved-images', true);

CREATE POLICY "Anyone can view saved images" ON storage.objects FOR SELECT USING (bucket_id = 'saved-images');
CREATE POLICY "Auth users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'saved-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'saved-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
