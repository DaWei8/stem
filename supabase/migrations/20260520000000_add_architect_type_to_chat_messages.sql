-- Migration: 20260520000000_add_architect_type_to_chat_messages.sql
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS architect_type TEXT NOT NULL DEFAULT 'identity';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_committed BOOLEAN DEFAULT false;
