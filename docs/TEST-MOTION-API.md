# Motion API Test Commands

## Test your Motion API connection with these curl commands

### 1. First, test basic connection (list workspaces):
```bash
curl -X GET "https://api.usemotion.com/v1/workspaces" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Accept: application/json"
```

### 2. Create a test task (CORRECTED field names):
```bash
curl -X POST "https://api.usemotion.com/v1/tasks" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test Task from API",
    "workspaceId": "YOUR_WORKSPACE_ID_HERE",
    "projectId": "YOUR_PROJECT_ID_HERE",
    "description": "Testing Motion API integration",
    "dueDate": "2024-12-31T23:59:59Z",
    "duration": 30,
    "priority": "MEDIUM",
    "autoScheduled": {}
  }'
```

### 3. Create a minimal task (only required fields):
```bash
curl -X POST "https://api.usemotion.com/v1/tasks" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Minimal Test Task",
    "workspaceId": "YOUR_WORKSPACE_ID_HERE"
  }'
```

## Field Names Comparison

### ❌ OLD (INCORRECT) Field Names:
- `assignee_id` → Should be `assigneeId`
- `due_date` → Should be `dueDate`
- `start_date` → Doesn't exist in API
- `time_estimate` → Should be `duration`
- `auto_scheduled: true` → Should be `autoScheduled: {}` or `null`
- `is_pending` → Doesn't exist in API
- `hard_deadline` → Doesn't exist in API
- `custom_fields` → Doesn't exist (fields are added directly)

### ✅ NEW (CORRECT) Field Names:
- `assigneeId` - User ID to assign to
- `dueDate` - ISO 8601 datetime string
- `duration` - Number (minutes) or "NONE"/"REMINDER"
- `autoScheduled` - Object `{}` or `null`
- `priority` - "ASAP", "HIGH", "MEDIUM", or "LOW"
- `projectId` - Project ID
- `labels` - Array of label names
- `status` - Status ID

## Expected Response

### Success (200/201):
```json
{
  "id": "task_abc123",
  "name": "Test Task from API",
  "workspaceId": "workspace_xyz",
  "projectId": "project_123",
  "status": "TODO",
  "createdAt": "2024-01-01T00:00:00Z",
  ...
}
```

### Common Errors:
- **400**: Bad Request - Field names or values incorrect
- **401**: Unauthorized - API key invalid
- **404**: Not Found - Workspace/Project ID doesn't exist
- **422**: Unprocessable Entity - Missing required fields
- **429**: Rate Limited - Too many requests

## Debug Steps:

1. Open browser console (F12) before creating tasks
2. Look for console logs starting with:
   - "Sending task to Motion:"
   - "Using API Key:"
   - "Full request body:"
   - "Making POST request to:"
   - "Response status:"
   - "❌ Error creating task:" or "✅ Success creating task:"

3. Check the exact error message to identify the issue

## The Fix Applied:
Changed all field names from snake_case to camelCase to match Motion's API specification. The app should now successfully create tasks in your Motion account.