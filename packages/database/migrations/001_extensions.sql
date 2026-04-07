-- VoterCore: Enable required PostgreSQL extensions
-- Run this FIRST in Supabase SQL Editor

create extension if not exists vector;        -- pgvector for embeddings
create extension if not exists pg_trgm;       -- trigram index for fuzzy text search
create extension if not exists unaccent;      -- accent-insensitive search
