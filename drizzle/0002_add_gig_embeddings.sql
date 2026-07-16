-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE IF NOT EXISTS gig_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE UNIQUE,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS gig_embeddings_gig_idx ON gig_embeddings(gig_id);
CREATE INDEX IF NOT EXISTS gig_embeddings_vector_idx ON gig_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RPC function for similarity search
CREATE OR REPLACE FUNCTION search_gigs_by_embedding(
  query_embedding vector(768),
  match_count int DEFAULT 10
)
RETURNS TABLE (
  gig_id uuid,
  similarity float,
  title text,
  description text,
  category text,
  price bigint,
  provider_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id as gig_id,
    1 - (ge.embedding <=> query_embedding) as similarity,
    g.title,
    g.description,
    g.category,
    g.price,
    p.name as provider_name
  FROM gig_embeddings ge
  JOIN gigs g ON g.id = ge.gig_id
  JOIN profiles p ON p.id = g.provider_id
  WHERE g.status = 'approved'
  ORDER BY ge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
