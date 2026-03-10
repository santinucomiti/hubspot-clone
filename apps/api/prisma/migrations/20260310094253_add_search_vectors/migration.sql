ALTER TABLE "contacts" ADD COLUMN "search_vector" tsvector;
ALTER TABLE "companies" ADD COLUMN "search_vector" tsvector;

CREATE INDEX "contacts_search_vector_idx" ON "contacts" USING GIN ("search_vector");
CREATE INDEX "companies_search_vector_idx" ON "companies" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION contacts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW."firstName", '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW."lastName", '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION companies_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.domain, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "contacts"
  FOR EACH ROW EXECUTE FUNCTION contacts_search_vector_update();

CREATE TRIGGER companies_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "companies"
  FOR EACH ROW EXECUTE FUNCTION companies_search_vector_update();
