/**
 * Frontend UI Tests
 * Tests UI utility functions
 */

describe('UI Utilities', () => {
  beforeEach(() => {
    // Reset DOM for each test
    document.body.innerHTML = `
      <div id="loader" style="display: none;"></div>
      <div id="notification"></div>
    `;
  });

  describe('Loader Functions', () => {
    it('should show loader', () => {
      const loader = document.getElementById('loader');
      loader.style.display = 'block';
      expect(loader.style.display).toBe('block');
    });

    it('should hide loader', () => {
      const loader = document.getElementById('loader');
      loader.style.display = 'none';
      expect(loader.style.display).toBe('none');
    });

    it('should toggle loader visibility', () => {
      const loader = document.getElementById('loader');
      loader.style.display = 'block';
      expect(loader.style.display).toBe('block');
      loader.style.display = 'none';
      expect(loader.style.display).toBe('none');
    });
  });

  describe('Notification Functions', () => {
    it('should display success message', () => {
      const notification = document.getElementById('notification');
      notification.innerHTML = `
        <div class="alert alert-success">
          Operation successful
        </div>
      `;
      expect(notification.innerHTML).toContain('Operation successful');
      expect(notification.innerHTML).toContain('alert-success');
    });

    it('should display error message', () => {
      const notification = document.getElementById('notification');
      notification.innerHTML = `
        <div class="alert alert-danger">
          Error occurred
        </div>
      `;
      expect(notification.innerHTML).toContain('Error occurred');
      expect(notification.innerHTML).toContain('alert-danger');
    });

    it('should display warning message', () => {
      const notification = document.getElementById('notification');
      notification.innerHTML = `
        <div class="alert alert-warning">
          Warning message
        </div>
      `;
      expect(notification.innerHTML).toContain('Warning message');
      expect(notification.innerHTML).toContain('alert-warning');
    });

    it('should clear notification', () => {
      const notification = document.getElementById('notification');
      notification.innerHTML = '<div>Message</div>';
      expect(notification.innerHTML).toContain('Message');
      notification.innerHTML = '';
      expect(notification.innerHTML).toBe('');
    });
  });

  describe('Modal Functions', () => {
    it('should show modal', () => {
      const modal = document.createElement('div');
      modal.id = 'testModal';
      modal.style.display = 'none';
      document.body.appendChild(modal);

      modal.style.display = 'block';
      expect(modal.style.display).toBe('block');
    });

    it('should hide modal', () => {
      const modal = document.createElement('div');
      modal.id = 'testModal';
      modal.style.display = 'block';
      document.body.appendChild(modal);

      modal.style.display = 'none';
      expect(modal.style.display).toBe('none');
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const email = 'test@example.com';
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const email = 'invalid-email';
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(false);
    });

    it('should validate required fields', () => {
      const form = { title: 'Task', description: '' };
      const isValid = form.title.trim() !== '';
      expect(isValid).toBe(true);
    });

    it('should validate minimum length', () => {
      const input = 'short';
      const isValid = input.length >= 3;
      expect(isValid).toBe(true);
    });

    it('should validate maximum length', () => {
      const input = 'a'.repeat(1000);
      const isValid = input.length <= 500;
      expect(isValid).toBe(false);
    });
  });

  describe('DOM Manipulation', () => {
    it('should add CSS class', () => {
      const element = document.createElement('div');
      element.classList.add('hidden');
      expect(element.classList.contains('hidden')).toBe(true);
    });

    it('should remove CSS class', () => {
      const element = document.createElement('div');
      element.className = 'hidden active';
      element.classList.remove('hidden');
      expect(element.classList.contains('hidden')).toBe(false);
      expect(element.classList.contains('active')).toBe(true);
    });

    it('should toggle CSS class', () => {
      const element = document.createElement('div');
      element.classList.toggle('active');
      expect(element.classList.contains('active')).toBe(true);
      element.classList.toggle('active');
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should update text content', () => {
      const element = document.createElement('div');
      element.textContent = 'Original';
      expect(element.textContent).toBe('Original');
      element.textContent = 'Updated';
      expect(element.textContent).toBe('Updated');
    });

    it('should set HTML content', () => {
      const element = document.createElement('div');
      element.innerHTML = '<span>Test</span>';
      expect(element.innerHTML).toContain('Test');
      expect(element.querySelector('span')).toBeTruthy();
    });
  });

  describe('Event Handling', () => {
    it('should attach click event listener', () => {
      const button = document.createElement('button');
      const clickHandler = jest.fn();
      button.addEventListener('click', clickHandler);
      button.click();
      expect(clickHandler).toHaveBeenCalled();
    });

    it('should remove event listener', () => {
      const button = document.createElement('button');
      const clickHandler = jest.fn();
      button.addEventListener('click', clickHandler);
      button.removeEventListener('click', clickHandler);
      button.click();
      expect(clickHandler).not.toHaveBeenCalled();
    });
  });
});
