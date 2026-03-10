export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  entityType: string;
  url: string;
}

export interface SearchResponse {
  contacts: SearchResultItem[];
  companies: SearchResultItem[];
  deals: SearchResultItem[];
  tickets: SearchResultItem[];
}
