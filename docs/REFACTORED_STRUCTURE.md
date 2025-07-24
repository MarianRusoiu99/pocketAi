# PocketBase + Rivet Integration - Refactored Structure

## 🎯 Overview

This refactored structure provides a clean, modular approach to integrating Rivet AI workflows with PocketBase. The architecture follows PocketBase's JavaScript constraints while creating a maintainable and scalable codebase.

## 🏗️ New Project Structure

```
pocket/
├── backend/
│   ├── pb_hooks/                    # PocketBase JavaScript hooks
│   │   ├── main.pb.js              # Main entry point (routes & hooks)
│   │   └── lib/                    # Modular business logic
│   │       ├── rivet-core.js       # Core Rivet workflow execution
│   │       ├── api-routes.js       # API route definitions
│   │       ├── response-helpers.js # Standardized API responses
│   │       └── db-helpers.js       # Database operation utilities
│   ├── pb_data/                    # PocketBase data & types
│   ├── package.json                # Dependencies (@ironclad/rivet-cli)
│   └── pocketbase                  # PocketBase binary
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── story-generator/    # React story generation UI
│   │   └── pages/
│   │       └── stories/            # Stories page
│   └── package.json
├── rivet/
│   └── ai.rivet-project           # Rivet workflow definitions
└── scripts/                       # Development scripts
```

## 🚀 Key Improvements

### 1. Modular Architecture
- **Separated Concerns**: Each module has a single responsibility
- **Reusable Components**: Shared utilities across different handlers
- **Easy Testing**: Individual modules can be tested independently

### 2. Rivet Integration (`lib/rivet-core.js`)
- **Centralized Workflow Execution**: Single point for all Rivet operations
- **Input Validation**: Built-in validation for story generation parameters
- **Error Handling**: Comprehensive error handling with detailed logging
- **Health Monitoring**: Built-in health checks for Rivet service

### 3. API Structure (`lib/api-routes.js`)
- **RESTful Design**: Clean, consistent API endpoints
- **Batch Processing**: Support for multiple story generation
- **Development Tools**: Testing and configuration endpoints

### 4. Response Standardization (`lib/response-helpers.js`)
- **Consistent Format**: All API responses follow the same structure
- **Error Categories**: Different error types with appropriate HTTP codes
- **Metadata Support**: Rich response metadata for debugging

### 5. Database Integration (`lib/db-helpers.js`)
- **Automatic Processing**: Stories auto-processed on creation
- **Result Storage**: Rivet results stored with metadata
- **Data Cleanup**: Automatic cleanup of old records

## 📋 Available API Endpoints

### Story Generation
- `POST /api/stories/generate` - Generate single story
- `POST /api/stories/generate/batch` - Generate multiple stories (max 10)

### Health & Monitoring  
- `GET /api/health` - System health check
- `GET /api/rivet/health` - Rivet service health
- `GET /api/config` - Configuration information

### Development & Testing
- `GET /api/test` - Basic functionality test
- `POST /api/rivet/test` - Rivet workflow test

## 🔧 Configuration

### Environment Variables
The system uses these configuration options (in `lib/rivet-core.js`):

```javascript
config: {
    projectPath: '../rivet/ai.rivet-project',
    defaultTimeout: 30000,
    maxRetries: 3,
    graphs: {
        storyGeneration: 'uLDGWIiCbhJiXnUV_JLQf'
    }
}
```

### PocketBase Collections
The system expects a `stories` collection with these fields:

**Input Fields:**
- `story_instructions` (text) - Story generation instructions
- `primary_characters` (text) - Main character descriptions
- `secondary_characters` (text) - Supporting character descriptions  
- `n_chapters` (number) - Number of chapters (1-20)
- `l_chapter` (number) - Words per chapter (50-2000)

**Rivet Processing Fields:**
- `rivet_processed` (bool) - Whether Rivet has processed this story
- `rivet_execution_id` (text) - Unique execution identifier
- `rivet_result` (json) - Generated story content
- `rivet_error` (text) - Error message if processing failed
- `execution_time` (number) - Processing time in milliseconds
- `processed_at` (date) - Processing timestamp
- `status` (select) - `pending`, `completed`, `failed`

## 🛠️ Development Workflow

### 1. Backend Development
```bash
cd backend
npm install
npm run serve:dev
```

### 2. Frontend Development  
```bash
cd client
npm install
npm run dev
```

### 3. Testing the Integration
```bash
# Test basic functionality
curl http://localhost:8090/api/test

# Test Rivet health
curl http://localhost:8090/api/rivet/health

# Generate a story
curl -X POST http://localhost:8090/api/stories/generate \
  -H "Content-Type: application/json" \
  -d '{
    "story_instructions": "Write a fun adventure story",
    "primary_characters": "Alex the brave explorer", 
    "secondary_characters": "Luna the wise owl",
    "n_chapters": 3,
    "l_chapter": 200
  }'
```

## 🎨 Frontend Integration

The new React component (`story-generator`) provides:
- **Interactive Form**: Easy story parameter input
- **Real-time Feedback**: Loading states and execution times
- **Error Handling**: Clear error messages and troubleshooting
- **Health Monitoring**: Built-in Rivet health checks

## 🔄 PocketBase Event Hooks

The system includes several automated behaviors:

### Story Creation Hook
- Automatically processes new stories with Rivet
- Updates records with processing results
- Never blocks story creation if Rivet fails

### Record Enrichment Hook  
- Adds computed fields (age, parsed JSON)
- Enhances data before sending to clients

### Cleanup Hook
- Periodically removes old records (30+ days)
- Runs randomly to distribute load

## 📊 Monitoring & Logging

### Structured Logging
All operations include structured logging with prefixes:
- `[INIT]` - Application initialization
- `[API]` - API request handling
- `[Rivet]` - Rivet workflow execution
- `[DB]` - Database operations
- `[HOOK]` - PocketBase event hooks

### Health Checks
- System health endpoint shows overall status
- Rivet health endpoint tests CLI availability
- Execution metadata tracks performance

## 🚀 Deployment

### Production Setup
1. **Build Frontend**: `cd client && npm run build`
2. **Install Dependencies**: `cd backend && npm install --production`
3. **Run PocketBase**: `./pocketbase serve --http=0.0.0.0:8090`

### Environment Considerations
- Ensure `@ironclad/rivet-cli` is globally available
- Configure proper file permissions for Rivet project files
- Set up proper logging and monitoring
- Consider rate limiting for story generation endpoints

## 🔧 Extending the System

### Adding New Rivet Workflows
1. **Add Graph ID** to `rivet-core.js` config
2. **Create Wrapper Function** in `rivet-core.js`
3. **Add API Route** in `api-routes.js`  
4. **Update Frontend** with new form/UI

### Adding New Collections
1. **Create Collection** in PocketBase admin
2. **Add Helper Functions** in `db-helpers.js`
3. **Register Event Hooks** in `main.pb.js`
4. **Create API Endpoints** in `api-routes.js`

## 🐛 Troubleshooting

### Common Issues

**Rivet CLI Not Found**
```bash
npm install -g @ironclad/rivet-cli
# or locally: npm install @ironclad/rivet-cli
```

**Module Load Errors**
- Check file paths in `require()` statements
- Ensure all files have proper `module.exports`

**PocketBase Hook Errors**
- Check PocketBase logs in development mode
- Verify collection schemas match expected fields
- Test individual modules with `/api/test` endpoint

### Debug Mode
Run PocketBase with `--dev` flag for detailed logging:
```bash
npm run serve:dev
```

## 🔮 Future Improvements

1. **WebSocket Integration**: Real-time story generation progress
2. **Caching Layer**: Cache generated stories to reduce processing
3. **Queue System**: Background job processing for large batches
4. **Analytics Dashboard**: Story generation metrics and insights
5. **User Management**: Multi-user story generation with authentication
6. **Template System**: Pre-defined story templates
7. **Export Options**: PDF, EPUB, and other format exports

---

This refactored structure provides a solid foundation for scaling your PocketBase + Rivet integration while maintaining code quality and developer experience.
