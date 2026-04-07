-- VoterCore: Vector search RPC function for RAG queries
-- Run AFTER 002_tables.sql

create or replace function match_analyzed_posts(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  key_insight text,
  translation text,
  sentiment text,
  candidates_mentioned text[],
  analyzed_at timestamptz,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ap.id,
    ap.key_insight,
    ap.translation,
    ap.sentiment,
    ap.candidates_mentioned,
    ap.analyzed_at,
    1 - (ap.embedding <=> query_embedding) as similarity
  from analyzed_posts ap
  where ap.embedding is not null
    and 1 - (ap.embedding <=> query_embedding) > match_threshold
  order by ap.embedding <=> query_embedding
  limit match_count;
end;
$$;
