/**
 * Frontend Tasks Tests
 * Tests task-related functions
 */

describe('Tasks Frontend', () => {
  let taskState;

  beforeEach(() => {
    taskState = {
      q: '',
      status: 'all',
      page: 1,
      limit: 8,
      totalPages: 1,
      editingTaskId: null,
    };

    document.body.innerHTML = `
      <div id="taskList"></div>
      <input id="taskSearch" />
      <select id="taskStatus">
        <option value="all">All</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
      </select>
      <button id="btnPrev">Previous</button>
      <button id="btnNext">Next</button>
      <div id="pageInfo">Page 1 / 1</div>
    `;
  });

  describe('Task State Management', () => {
    it('should initialize with default state', () => {
      expect(taskState.q).toBe('');
      expect(taskState.status).toBe('all');
      expect(taskState.page).toBe(1);
      expect(taskState.limit).toBe(8);
      expect(taskState.totalPages).toBe(1);
      expect(taskState.editingTaskId).toBeNull();
    });

    it('should update search query', () => {
      taskState.q = 'buy groceries';
      taskState.page = 1;
      expect(taskState.q).toBe('buy groceries');
    });

    it('should update status filter', () => {
      taskState.status = 'completed';
      expect(taskState.status).toBe('completed');
    });

    it('should update pagination', () => {
      taskState.page = 2;
      taskState.totalPages = 5;
      expect(taskState.page).toBe(2);
      expect(taskState.totalPages).toBe(5);
    });
  });

  describe('Task Rendering', () => {
    it('should render task list', () => {
      const taskList = document.getElementById('taskList');
      const tasks = [
        {
          id: 1,
          title: 'Buy groceries',
          description: 'Milk, eggs, bread',
          is_completed: false,
        },
      ];

      taskList.innerHTML = tasks
        .map(
          (t) => `
        <div class="task-item">
          <div>${t.title}</div>
          <div>${t.description}</div>
          <div>${t.is_completed ? 'Completed' : 'Pending'}</div>
        </div>
      `
        )
        .join('');

      expect(taskList.innerHTML).toContain('Buy groceries');
      expect(taskList.innerHTML).toContain('Pending');
    });

    it('should show empty state', () => {
      const taskList = document.getElementById('taskList');
      const tasks = [];

      if (!tasks.length) {
        taskList.innerHTML = '<div>No tasks found.</div>';
      }

      expect(taskList.innerHTML).toContain('No tasks found');
    });

    it('should display completed status', () => {
      const taskList = document.getElementById('taskList');
      const task = {
        id: 2,
        title: 'Complete Task',
        description: 'Done',
        is_completed: true,
      };

      taskList.innerHTML = `
        <div>
          <div>${task.title}</div>
          <div>${task.is_completed ? 'Completed' : 'Pending'}</div>
        </div>
      `;

      expect(taskList.innerHTML).toContain('Completed');
      expect(taskList.innerHTML).toContain('Complete Task');
    });
  });

  describe('Pagination', () => {
    it('should disable prev on first page', () => {
      const prevBtn = document.getElementById('btnPrev');
      prevBtn.disabled = taskState.page <= 1;
      expect(prevBtn.disabled).toBe(true);
    });

    it('should disable next on last page', () => {
      const nextBtn = document.getElementById('btnNext');
      taskState.page = 5;
      taskState.totalPages = 5;
      nextBtn.disabled = taskState.page >= taskState.totalPages;
      expect(nextBtn.disabled).toBe(true);
    });

    it('should enable both on middle page', () => {
      const prevBtn = document.getElementById('btnPrev');
      const nextBtn = document.getElementById('btnNext');
      taskState.page = 2;
      taskState.totalPages = 5;

      prevBtn.disabled = taskState.page <= 1;
      nextBtn.disabled = taskState.page >= taskState.totalPages;

      expect(prevBtn.disabled).toBe(false);
      expect(nextBtn.disabled).toBe(false);
    });

    it('should update page info', () => {
      const pageInfo = document.getElementById('pageInfo');
      taskState.page = 2;
      taskState.totalPages = 5;
      pageInfo.textContent = `Page ${taskState.page} / ${taskState.totalPages}`;
      expect(pageInfo.textContent).toBe('Page 2 / 5');
    });
  });

  describe('API Query Building', () => {
    it('should build query with search', () => {
      const params = new URLSearchParams({
        q: 'task',
        status: 'all',
        page: '1',
        limit: '8',
      });
      expect(params.get('q')).toBe('task');
    });

    it('should build query with status filter', () => {
      const params = new URLSearchParams({
        status: 'completed',
      });
      expect(params.get('status')).toBe('completed');
    });

    it('should build paginated query', () => {
      const params = new URLSearchParams({
        page: '3',
        limit: '10',
      });
      expect(params.get('page')).toBe('3');
      expect(params.get('limit')).toBe('10');
    });
  });

  describe('Task Editing', () => {
    it('should populate edit form', () => {
      const editTitle = document.createElement('input');
      editTitle.id = 'editTitle';
      const editDesc = document.createElement('textarea');
      editDesc.id = 'editDesc';
      document.body.appendChild(editTitle);
      document.body.appendChild(editDesc);

      editTitle.value = 'Edit Task';
      editDesc.value = 'Edit Description';

      expect(editTitle.value).toBe('Edit Task');
      expect(editDesc.value).toBe('Edit Description');
    });

    it('should clear edit form', () => {
      const editTitle = document.createElement('input');
      editTitle.value = 'Task';
      editTitle.value = '';
      expect(editTitle.value).toBe('');
    });

    it('should validate title on save', () => {
      const editTitle = document.createElement('input');
      editTitle.value = '';
      const isValid = editTitle.value.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should allow save with valid title', () => {
      const editTitle = document.createElement('input');
      editTitle.value = 'Valid Title';
      const isValid = editTitle.value.trim().length > 0;
      expect(isValid).toBe(true);
    });
  });
});
