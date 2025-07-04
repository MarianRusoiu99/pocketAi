import { ApiClient } from './ApiClient'

/**
 * Generic CRUD API base class
 * Provides common CRUD operations for any resource
 */
export default class CrudApi<T extends { id?: string }> {
  constructor(protected config: {
    url: string
  }) {}

  /**
   * Get a single item by ID
   */
  public get(id: string) {
    return ApiClient.get<T>(`${this.config.url}/${id}`)
  }

  /**
   * Get all items with optional query parameters
   */
  public list(queryParams?: Record<string, any>) {
    return ApiClient.get<{
      items: T[]
      totalCount: number
      currentPage: number
      totalPages: number
    }>(this.config.url, queryParams ? { queryParams } : {})
  }

  /**
   * Create a new item
   */
  public create(item: Omit<T, 'id'>) {
    return ApiClient.post<T>(this.config.url, { data: item })
  }

  /**
   * Update an existing item
   */
  public update(id: string, item: Partial<T>) {
    return ApiClient.put<T>(`${this.config.url}/${id}`, { data: item })
  }

  /**
   * Delete an item
   */
  public delete(id: string) {
    return ApiClient.delete<void>(`${this.config.url}/${id}`)
  }

  /**
   * Search items with pagination
   */
  public search(searchString: string, page: number = 1, pageSize: number = 10) {
    return ApiClient.get<{
      items: T[]
      totalCount: number
      currentPage: number
      totalPages: number
    }>(this.config.url, {
      queryParams: {
        search: encodeURIComponent(searchString.trim()),
        page: page.toString(),
        limit: pageSize.toString()
      }
    })
  }

  /**
   * Bulk create items
   */
  public bulkCreate(items: Omit<T, 'id'>[]) {
    return ApiClient.post<T[]>(`${this.config.url}/bulk`, { data: { items } })
  }

  /**
   * Bulk update items
   */
  public bulkUpdate(updates: Array<{ id: string } & Partial<T>>) {
    return ApiClient.put<T[]>(`${this.config.url}/bulk`, { data: { updates } })
  }

  /**
   * Bulk delete items
   */
  public bulkDelete(ids: string[]) {
    return ApiClient.delete<void>(`${this.config.url}/bulk`, { data: { ids } })
  }

  /**
   * Get item count
   */
  public count(filters?: Record<string, any>) {
    return ApiClient.get<{ count: number }>(`${this.config.url}/count`, {
      queryParams: filters
    })
  }

  /**
   * Check if item exists
   */
  public exists(id: string) {
    return ApiClient.get<{ exists: boolean }>(`${this.config.url}/${id}/exists`)
  }
}
