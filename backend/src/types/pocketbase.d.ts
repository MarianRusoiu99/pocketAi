/**
 * Type definitions for PocketBase TypeScript hooks
 */

// Basic PocketBase types (simplified for our use case)
declare global {
  interface PocketBase {
    dao(): DAO;
    app: any;
    onBeforeServe(): EventHandler;
    onRecordAfterCreateRequest(collection: string): EventHandler;
    onRecordAfterUpdateRequest(collection: string): EventHandler;
    onRecordBeforeCreateRequest(collection: string): EventHandler;
    onRecordAuthRequest(collection: string): EventHandler;
  }

  interface DAO {
    findRecordById(collection: string, id: string): Record | null;
    findRecordsByFilter(
      collection: string, 
      filter: string, 
      sort?: string, 
      limit?: number, 
      offset?: number, 
      params?: Record<string, any>
    ): Record[];
    findFirstRecordByFilter(
      collection: string, 
      filter: string, 
      params?: Record<string, any>
    ): Record | null;
    findCollectionByNameOrId(nameOrId: string): Collection | null;
    saveRecord(record: Record): void;
  }

  interface Record {
    id: string;
    created: string;
    updated: string;
    getString(key: string): string;
    getInt(key: string): number;
    getDateTime(key: string): string;
    get(key: string): any;
    set(key: string, value: any): void;
    expandedOne(key: string): any;
    exportPlain(): Record<string, any>;
    originalCopy(): Record;
  }

  interface Collection {
    id: string;
    name: string;
    type: string;
  }

  interface EventHandler {
    add(handler: (e: RecordEvent) => void | Promise<void>): void;
  }

  interface RecordEvent {
    record: Record;
    httpContext?: any;
  }

  // Global PocketBase app instance
  var $app: PocketBase;

  // Constructor for new records
  var Record: new (collection: Collection) => Record;
}

export {};
