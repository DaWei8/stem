-- Migration: 20260523000000_add_is_rejected_to_chat_messages.sql
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_rejected BOOLEAN DEFAULT false;
