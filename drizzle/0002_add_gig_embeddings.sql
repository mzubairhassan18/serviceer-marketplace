-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE IF NOT EXISTS gig_embeddings (
  gig_id UUID PRIMARY KEY REFERENCES gigs(id) ON DELETE CASCADE,
  embedding vector(3072),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RPC function for similarity search
CREATE OR REPLACE FUNCTION match_gigs (
  query_embedding vector(3072),
  match_count int DEFAULT 10,
  similarity_threshold float DEFAULT 0.3
)
RETURNS TABLE (
  gig_id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  price_paisa BIGINT,
  provider_id UUID,
  similarity float
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id AS gig_id,
    g.title,
    g.description,
    g.category,
    g.price_paisa,
    g.provider_id,
    (1 - (ge.embedding <=> query_embedding)) AS similarity
  FROM gig_embeddings ge
  JOIN gigs g ON g.id = ge.gig_id
  WHERE g.status = 'approved'
    AND (1 - (ge.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY ge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
