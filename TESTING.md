# Unit Testing Guide - Digital Life Organizer

## Overview
This project includes comprehensive unit tests for both backend (Node.js/Express) and frontend (JavaScript) components.

## Project Structure
```
backend/
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Jest setup file
├── package.json            # Backend dependencies (includes jest, supertest)
└── src/
    ├── __tests__/          # Backend tests
    │   ├── auth.middleware.test.js      # Tests for auth middleware
    │   ├── auth.routes.test.js          # Tests for auth routes (register, login)
    │   ├── tasks.routes.test.js         # Tests for task routes (CRUD)
    │   └── db.connection.test.js        # Tests for database connection
    ├── controllers/
    ├── routes/
    ├── middleware/
    └── config/

frontend/
├── jest.config.js          # Jest configuration
├── .babelrc                # Babel configuration
├── package.json            # Frontend dependencies (includes jest)
└── js/
    ├── __tests__/          # Frontend tests
    │   ├── api.test.js          # Tests for API utilities
    │   ├── auth.test.js         # Tests for authentication functions
    │   ├── tasks.test.js        # Tests for task management
    │   ├── ui.test.js           # Tests for UI utilities
    │   └── dashboard.test.js    # Tests for dashboard functions
    ├── api.js
    ├── auth.js
    ├── tasks.js
    ├── ui.js
    └── dashboard.js
```

## Running Tests

### Backend Tests
```bash
# Navigate to backend directory
cd backend

# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Frontend Tests
```bash
# Navigate to frontend directory
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Run All Tests at Once
```bash
# From project root
npm test --workspace=backend
npm test --workspace=frontend
```

## Test Coverage

### Backend Tests (23 test suites)

#### 1. **Auth Middleware Tests** (`src/__tests__/auth.middleware.test.js`)
- ✅ Rejects request with no token
- ✅ Rejects malformed authorization header
- ✅ Accepts valid JWT token
- ✅ Rejects expired token
- ✅ Rejects token with invalid signature
- ✅ Allows authorized roles
- ✅ Denies unauthorized roles
- ✅ Handles multiple roles
- ✅ Denies if user not present

#### 2. **Auth Routes Tests** (`src/__tests__/auth.routes.test.js`)
- ✅ Register new user successfully
- ✅ Reject duplicate email
- ✅ Reject missing required fields
- ✅ Force role to newcomer for invalid role
- ✅ Login user with valid credentials
- ✅ Reject invalid password
- ✅ Reject non-existent user
- ✅ Reject missing credentials

#### 3. **Tasks Routes Tests** (`src/__tests__/tasks.routes.test.js`)
- ✅ Fetch tasks for authenticated user
- ✅ Require authentication
- ✅ Filter by search query
- ✅ Filter by status (completed/pending)
- ✅ Support pagination
- ✅ Create new task
- ✅ Require title for task creation
- ✅ Update task
- ✅ Return 404 for non-existent task updates
- ✅ Delete task
- ✅ Return 404 for non-existent task deletions

#### 4. **Database Connection Tests** (`src/__tests__/db.connection.test.js`)
- ✅ Database module imports correctly
- ✅ Pool object exports with query method
- ✅ Handle query errors gracefully
- ✅ Schema file exists

### Frontend Tests (26 test suites)

#### 1. **API Tests** (`js/__tests__/api.test.js`)
- ✅ Make GET request without token
- ✅ Include authorization token when available
- ✅ Send JSON body for POST requests
- ✅ Show/hide loader during request
- ✅ Handle error responses
- ✅ Handle network errors
- ✅ Handle non-JSON responses

#### 2. **Auth Tests** (`js/__tests__/auth.test.js`)
- ✅ Save token and user to localStorage
- ✅ Save complex user objects
- ✅ Retrieve user from localStorage
- ✅ Return null if no user stored
- ✅ Handle invalid JSON gracefully
- ✅ Clear localStorage on logout
- ✅ Redirect to index.html after logout
- ✅ Redirect admin to admin.html
- ✅ Redirect newcomer to newcomer.html
- ✅ Redirect unknown role to newcomer page

#### 3. **Tasks Tests** (`js/__tests__/tasks.test.js`)
- ✅ Initialize task state with defaults
- ✅ Update state on search
- ✅ Update state on status filter
- ✅ Update pagination state
- ✅ Render task list
- ✅ Display empty message when no tasks
- ✅ Display completed status correctly
- ✅ Disable previous button on first page
- ✅ Disable next button on last page
- ✅ Enable both buttons on middle page
- ✅ Update page info text
- ✅ Build API queries with correct parameters
- ✅ Build search query correctly
- ✅ Handle pagination in API call
- ✅ Open edit modal with task data
- ✅ Clear edit form on cancel
- ✅ Validate title is not empty on save
- ✅ Allow save with valid title

#### 4. **UI Tests** (`js/__tests__/ui.test.js`)
- ✅ Show/hide loader
- ✅ Display success toast
- ✅ Display error toast
- ✅ Display warning toast
- ✅ Auto-dismiss toast after timeout
- ✅ Clear previous toast before showing new one
- ✅ Show modal element
- ✅ Hide modal element
- ✅ Close modal on backdrop click
- ✅ Validate email format
- ✅ Reject invalid email format
- ✅ Validate required fields
- ✅ Validate minimum length
- ✅ Validate maximum length
- ✅ Add CSS class to element
- ✅ Remove CSS class from element
- ✅ Toggle CSS class
- ✅ Update element text content
- ✅ Set element HTML

#### 5. **Dashboard Tests** (`js/__tests__/dashboard.test.js`)
- ✅ Check if user is authenticated
- ✅ Redirect to login if not authenticated
- ✅ Load user data on init
- ✅ Fetch dashboard stats
- ✅ Fetch recent tasks
- ✅ Handle API errors gracefully
- ✅ Display task summary
- ✅ Display recent tasks list
- ✅ Show empty state when no tasks
- ✅ Have logout button
- ✅ Clear user data on logout
- ✅ Redirect to home page on logout
- ✅ Have navigation menu

## Test Framework Details

### Backend (Jest + Supertest)
- **Jest**: JavaScript testing framework with excellent Node.js support
- **Supertest**: HTTP assertion library for testing Express routes
- Environment: Node.js running tests in isolation

### Frontend (Jest + jsdom)
- **Jest**: JavaScript testing framework with jsdom support
- **jsdom**: Simulates a DOM environment for testing browser APIs
- **Babel**: Transpiles modern JavaScript for test compatibility

## Key Testing Patterns

### 1. Mocking Database
```javascript
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));
```

### 2. Testing Protected Routes
```javascript
const validToken = jwt.sign({...}, JWT_SECRET);
const res = await request(app)
  .get('/api/tasks')
  .set('Authorization', `Bearer ${validToken}`);
```

### 3. Testing Form Validation
```javascript
it('should validate required fields', () => {
  const isValid = form.title && form.description;
  expect(isValid).toBe(false);
});
```

### 4. Testing localStorage
```javascript
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
```

## Continuous Integration

### Adding to CI/CD Pipeline (GitHub Actions)
Create `.github/workflows/test.yml`:
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm install
      
      - name: Run frontend tests
        run: cd frontend && npm test
```

## Coverage Goals
- **Backend**: Aim for 80%+ coverage
- **Frontend**: Aim for 70%+ coverage (due to DOM-heavy code)

Run `npm run test:coverage` to generate coverage reports.

## Best Practices
1. **Isolation**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests with setup, action, verification
4. **Mock External Dependencies**: Database, API calls, localStorage
5. **Test All Paths**: Happy path, error cases, edge cases

## Troubleshooting

### Tests failing with "Cannot find module"
```bash
# Ensure all dependencies are installed
npm install

# Clear Jest cache
npx jest --clearCache
```

### CORS errors in tests
- Tests run in isolation with mocked network calls
- No actual HTTP requests should be made
- Use `jest.mock()` for external dependencies

### localStorage not working in tests
- jsdom provides localStorage mock by default
- Mock it explicitly if needed:
```javascript
global.localStorage = { getItem: jest.fn(), ... }
```

## Resources
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Library](https://testing-library.com/)

## Contact & Support
For questions about tests, refer to the specific test file comments or review the test cases.
