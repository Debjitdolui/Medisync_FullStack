/**
 * Represents a Spring Data Page response from the backend.
 * Matches the JSON structure of org.springframework.data.domain.Page<T>.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-indexed)
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string; // e.g. 'createdAt,desc'
}
