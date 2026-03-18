-- Admin Panel Setup
-- This script creates tables and functions for admin panel functionality

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table for global settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create user_blocks table for blocking users
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_by UUID NOT NULL REFERENCES auth.users(id),
    reason TEXT,
    blocked_until TIMESTAMP WITH TIME ZONE, -- NULL means permanent block
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create model_settings table for managing model availability
CREATE TABLE IF NOT EXISTS public.model_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id TEXT NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT true,
    reason TEXT, -- Reason for disabling
    disabled_by UUID REFERENCES auth.users(id),
    disabled_at TIMESTAMP WITH TIME ZONE,
    enabled_by UUID REFERENCES auth.users(id),
    enabled_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activity_log table for tracking user actions
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'login', 'chat', 'image_generation', 'video_generation', 'model_usage', etc.
    action_details JSONB, -- Additional details about the action
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_user_id ON public.user_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_is_active ON public.user_blocks(is_active);
-- Partial unique index to ensure only one active block per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_blocks_unique_active 
    ON public.user_blocks(user_id) 
    WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_model_settings_model_id ON public.model_settings(model_id);
CREATE INDEX IF NOT EXISTS idx_model_settings_is_enabled ON public.model_settings(is_enabled);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action_type ON public.user_activity_log(action_type);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins table
-- Only admins can view admins list
CREATE POLICY "Admins can view admins"
    ON public.admins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Only super admins can insert admins
CREATE POLICY "Super admins can insert admins"
    ON public.admins
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- Only super admins can update admins
CREATE POLICY "Super admins can update admins"
    ON public.admins
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- RLS Policies for system_settings
-- Only admins can view settings
CREATE POLICY "Admins can view system settings"
    ON public.system_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Only admins can update settings
CREATE POLICY "Admins can update system settings"
    ON public.system_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Only admins can insert settings
CREATE POLICY "Admins can insert system settings"
    ON public.system_settings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for user_blocks
-- Only admins can view blocks
CREATE POLICY "Admins can view user blocks"
    ON public.user_blocks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Only admins can block users
CREATE POLICY "Admins can block users"
    ON public.user_blocks
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Only admins can update blocks
CREATE POLICY "Admins can update user blocks"
    ON public.user_blocks
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for model_settings
-- Everyone can view enabled models (for public access)
CREATE POLICY "Everyone can view model settings"
    ON public.model_settings
    FOR SELECT
    USING (true);

-- Only admins can update model settings
CREATE POLICY "Admins can update model settings"
    ON public.model_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Only admins can insert model settings
CREATE POLICY "Admins can insert model settings"
    ON public.model_settings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for user_activity_log
-- Only admins can view activity logs
CREATE POLICY "Admins can view activity logs"
    ON public.user_activity_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- System can insert activity logs (for automatic logging)
CREATE POLICY "System can insert activity logs"
    ON public.user_activity_log
    FOR INSERT
    WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_admins_updated_at 
    BEFORE UPDATE ON public.admins 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON public.system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_blocks_updated_at 
    BEFORE UPDATE ON public.user_blocks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_settings_updated_at 
    BEFORE UPDATE ON public.model_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) 
VALUES 
    ('registration_enabled', 'true'::jsonb, 'Enable/disable user registration'),
    ('maintenance_mode', 'false'::jsonb, 'Enable/disable maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_blocks 
        WHERE user_id = user_uuid 
        AND is_active = true
        AND (blocked_until IS NULL OR blocked_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if registration is enabled
CREATE OR REPLACE FUNCTION is_registration_enabled()
RETURNS BOOLEAN AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT value INTO setting_value
    FROM public.system_settings
    WHERE key = 'registration_enabled';
    
    RETURN COALESCE((setting_value)::boolean, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if model is enabled
CREATE OR REPLACE FUNCTION is_model_enabled(model_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(
        (SELECT is_enabled FROM public.model_settings WHERE model_id = model_id_param),
        true -- Default to enabled if not in settings
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
