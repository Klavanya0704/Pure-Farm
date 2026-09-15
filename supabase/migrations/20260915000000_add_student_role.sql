-- Migration: 20260915000000_add_student_role.sql
-- Description: Update profiles table check constraint to support 'student' role

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('farmer', 'buyer', 'student', 'admin', 'seller'));
