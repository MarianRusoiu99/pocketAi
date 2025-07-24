# PocketBase Collection Setup Guide

This guide helps you create the required PocketBase collections for the Rivet integration.

## Stories Collection

### Access PocketBase Admin
1. Start your PocketBase server: `npm run serve:dev`
2. Open http://localhost:8090/_/ in your browser
3. Log in with your admin credentials

### Create the Stories Collection

1. **Navigate to Collections**
   - Click on "Collections" in the left sidebar
   - Click "New collection" button

2. **Basic Settings**
   - **Name**: `stories`
   - **Type**: Base collection
   - **List rule**: Leave empty (public read) or set auth rules as needed
   - **View rule**: Leave empty (public read) or set auth rules as needed  
   - **Create rule**: Leave empty (public create) or set auth rules as needed
   - **Update rule**: Leave empty (public update) or set auth rules as needed
   - **Delete rule**: Leave empty (public delete) or set auth rules as needed

3. **Add Fields**

   Click "Add field" for each of the following:

   #### Input Fields (for story generation)
   
   **story_instructions**
   - Type: Text
   - Name: `story_instructions`
   - Options: 
     - Max length: 2000
     - Required: ✓

   **primary_characters**
   - Type: Text  
   - Name: `primary_characters`
   - Options:
     - Max length: 1000
     - Required: ✓

   **secondary_characters**
   - Type: Text
   - Name: `secondary_characters` 
   - Options:
     - Max length: 1000
     - Required: ✗

   **n_chapters**
   - Type: Number
   - Name: `n_chapters`
   - Options:
     - Min: 1
     - Max: 20
     - Required: ✓

   **l_chapter**
   - Type: Number
   - Name: `l_chapter`
   - Options:
     - Min: 50
     - Max: 2000
     - Required: ✓

   #### Processing Result Fields (managed by hooks)

   **rivet_processed**
   - Type: Bool
   - Name: `rivet_processed`
   - Options:
     - Required: ✗

   **rivet_execution_id**
   - Type: Text
   - Name: `rivet_execution_id`
   - Options:
     - Max length: 100
     - Required: ✗

   **rivet_result**
   - Type: JSON
   - Name: `rivet_result`
   - Options:
     - Required: ✗

   **rivet_error**
   - Type: Text
   - Name: `rivet_error`
   - Options:
     - Max length: 5000
     - Required: ✗

   **execution_time**
   - Type: Number
   - Name: `execution_time`
   - Options:
     - Min: 0
     - Required: ✗

   **processed_at**
   - Type: Date
   - Name: `processed_at`
   - Options:
     - Required: ✗

   **status**
   - Type: Select (single)
   - Name: `status`
   - Options:
     - Values: `pending`, `completed`, `failed`
     - Max select: 1
     - Required: ✓
     - Default: `pending`

4. **Save the Collection**
   - Click "Save" to create the collection

## Verification

### Test Collection Creation
Once created, you can test the collection:

```bash
# Test creating a story record
curl -X POST http://localhost:8090/api/collections/stories/records \
  -H "Content-Type: application/json" \
  -d '{
    "story_instructions": "Write a simple test story",
    "primary_characters": "Test character",
    "n_chapters": 1,
    "l_chapter": 100,
    "status": "pending"
  }'
```

### Check Auto-Processing
After creating a record, check the PocketBase logs to see if the auto-processing hook runs:

```bash
# In your terminal running PocketBase, you should see:
# [HOOK] New story record created: RECORD_ID
# [HOOK] Auto-processing story with Rivet...
# [Rivet] Executing workflow: uLDGWIiCbhJiXnUV_JLQf
# [HOOK] Story auto-processing completed: success/failed
```

## Collection Schema Export

For backup or deployment, you can export your collection schema:

1. Go to "Collections" → "stories"
2. Click the "⋮" menu next to the collection name
3. Select "Export"
4. Save the JSON file for backup

## Alternative: Import Schema

If you prefer to import the schema, save this as `stories_collection.json`:

```json
{
  "id": "stories",
  "name": "stories", 
  "type": "base",
  "system": false,
  "schema": [
    {
      "id": "story_instructions",
      "name": "story_instructions",
      "type": "text",
      "system": false,
      "required": true,
      "options": {
        "min": null,
        "max": 2000,
        "pattern": ""
      }
    },
    {
      "id": "primary_characters", 
      "name": "primary_characters",
      "type": "text",
      "system": false,
      "required": true,
      "options": {
        "min": null,
        "max": 1000,
        "pattern": ""
      }
    },
    {
      "id": "secondary_characters",
      "name": "secondary_characters", 
      "type": "text",
      "system": false,
      "required": false,
      "options": {
        "min": null,
        "max": 1000,
        "pattern": ""
      }
    },
    {
      "id": "n_chapters",
      "name": "n_chapters",
      "type": "number",
      "system": false,
      "required": true,
      "options": {
        "min": 1,
        "max": 20
      }
    },
    {
      "id": "l_chapter",
      "name": "l_chapter", 
      "type": "number",
      "system": false,
      "required": true,
      "options": {
        "min": 50,
        "max": 2000
      }
    },
    {
      "id": "rivet_processed",
      "name": "rivet_processed",
      "type": "bool",
      "system": false,
      "required": false,
      "options": {}
    },
    {
      "id": "rivet_execution_id",
      "name": "rivet_execution_id",
      "type": "text", 
      "system": false,
      "required": false,
      "options": {
        "min": null,
        "max": 100,
        "pattern": ""
      }
    },
    {
      "id": "rivet_result",
      "name": "rivet_result",
      "type": "json",
      "system": false, 
      "required": false,
      "options": {}
    },
    {
      "id": "rivet_error",
      "name": "rivet_error",
      "type": "text",
      "system": false,
      "required": false,
      "options": {
        "min": null,
        "max": 5000,
        "pattern": ""
      }
    },
    {
      "id": "execution_time",
      "name": "execution_time",
      "type": "number",
      "system": false,
      "required": false,
      "options": {
        "min": 0,
        "max": null
      }
    },
    {
      "id": "processed_at", 
      "name": "processed_at",
      "type": "date",
      "system": false,
      "required": false,
      "options": {
        "min": "",
        "max": ""
      }
    },
    {
      "id": "status",
      "name": "status",
      "type": "select",
      "system": false,
      "required": true,
      "options": {
        "maxSelect": 1,
        "values": ["pending", "completed", "failed"]
      }
    }
  ],
  "indexes": [],
  "listRule": "",
  "viewRule": "",
  "createRule": "", 
  "updateRule": "",
  "deleteRule": "",
  "options": {}
}
```

Then import it through the PocketBase admin interface:
1. Go to "Collections"
2. Click "Import collections"
3. Upload the JSON file

## Troubleshooting

### Collection Not Found Errors
If you get "collection not found" errors:
1. Verify the collection name is exactly `stories`
2. Check that the collection was created successfully
3. Restart PocketBase after collection creation

### Permission Errors
If you get permission errors:
1. Check the collection rules (List, View, Create, Update, Delete)
2. Consider starting with empty rules (public access) for testing
3. Add authentication rules later as needed

### Field Type Errors
If you get field type errors:
1. Verify all field names match exactly (case-sensitive)
2. Check field types are correct (text, number, bool, json, date, select)
3. Ensure required fields are marked correctly

---

Once the collection is set up, your Rivet integration will automatically process stories and store results in the database!
