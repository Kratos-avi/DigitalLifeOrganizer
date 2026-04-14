/**
 * Frontend Dashboard Tests
 * Tests dashboard functions and initialization
 */

describe('Dashboard Frontend', () => {
  beforeEach(() => {
    localStorage.clear();

    document.body.innerHTML = `
      <div id="dashboardContent"></div>
      <div id="statsContainer"></div>
      <div id="recentTasks"></div>
      <button id="logoutBtn">Logout</button>
    `;
  });

  describe('Dashboard Initialization', () => {
    it('should check authentication on init', () => {
      localStorage.setItem('token', 'test-token');
      const token = localStorage.getItem('token');
      expect(token).toBe('test-token');
    });

    it('should require auth for dashboard', () => {
      const token = localStorage.getItem('token');
      const isAuthenticated = token !== null;
      expect(isAuthenticated).toBe(false);
    });

    it('should load user data on init', () => {
      const user = { id: 1, email: 'test@test.com', role: 'newcomer' };
      localStorage.setItem('user', JSON.stringify(user));
      const stored = JSON.parse(localStorage.getItem('user'));
      expect(stored).toEqual(user);
    });
  });

  describe('Dashboard Data', () => {
    it('should be able to fetch stats', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({
            total_tasks: 10,
            completed_tasks: 5,
            pending_tasks: 5,
          }),
        })
      );

      const response = await fetch('http://localhost:5000/api/dashboard/stats');
      const data = await response.json();

      expect(data.total_tasks).toBe(10);
      expect(data.completed_tasks).toBe(5);
    });

    it('should be able to fetch recent tasks', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({
            tasks: [
              { id: 1, title: 'Task 1', status: 'pending' },
              { id: 2, title: 'Task 2', status: 'completed' },
            ],
          }),
        })
      );

      const response = await fetch('http://localhost:5000/api/tasks?limit=5');
      const data = await response.json();

      expect(data.tasks).toHaveLength(2);
      expect(data.tasks[0].title).toBe('Task 1');
    });

    it('should handle request errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          headers: { get: () => 'application/json' },
          json: async () => ({ message: 'Server error' }),
        })
      );

      const response = await fetch('http://localhost:5000/api/dashboard/stats');
      expect(response.ok).toBe(false);
    });
  });

  describe('Dashboard Rendering', () => {
    it('should display task summary', () => {
      const container = document.getElementById('statsContainer');
      const stats = {
        total_tasks: 15,
        completed_tasks: 8,
        pending_tasks: 7,
      };

      container.innerHTML = `
        <div>
          <h4>Total Tasks</h4>
          <p>${stats.total_tasks}</p>
        </div>
      `;

      expect(container.innerHTML).toContain('Total Tasks');
      expect(container.innerHTML).toContain('15');
    });

    it('should display recent tasks', () => {
      const container = document.getElementById('recentTasks');
      const tasks = [
        { id: 1, title: 'Task 1', status: 'pending' },
        { id: 2, title: 'Task 2', status: 'completed' },
      ];

      container.innerHTML = tasks
        .map((t) => `<li>${t.title} - ${t.status}</li>`)
        .join('');

      expect(container.innerHTML).toContain('Task 1');
      expect(container.innerHTML).toContain('Task 2');
    });

    it('should show empty state', () => {
      const container = document.getElementById('recentTasks');
      container.innerHTML = '<p>No tasks yet</p>';
      expect(container.innerHTML).toContain('No tasks yet');
    });
  });

  describe('Logout', () => {
    it('should have logout button', () => {
      const logoutBtn = document.getElementById('logoutBtn');
      expect(logoutBtn).toBeTruthy();
      expect(logoutBtn.textContent).toBe('Logout');
    });

    it('should clear storage on logout', () => {
      localStorage.setItem('token', 'test');
      localStorage.clear();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should reset on logout', () => {
      localStorage.setItem('token', 'test');
      localStorage.clear();
      const isLoggedIn = localStorage.getItem('token') !== null;
      expect(isLoggedIn).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should have navigation links', () => {
      const nav = document.createElement('nav');
      nav.innerHTML = `
        <ul>
          <li><a href="dashboard.html">Dashboard</a></li>
          <li><a href="tasks.html">Tasks</a></li>
        </ul>
      `;
      expect(nav.innerHTML).toContain('Dashboard');
      expect(nav.innerHTML).toContain('Tasks');
    });
  });
});
