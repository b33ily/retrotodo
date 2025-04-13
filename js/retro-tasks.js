// retro-tasks.js
document.addEventListener('DOMContentLoaded', () => {
  // Элементы интерфейса
  const taskFormContainer = document.getElementById('taskFormContainer');
  const toggleTaskFormBtn = document.getElementById('toggleTaskFormBtn');
  const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  const saveTaskBtn = document.getElementById('saveTaskBtn');
  const taskList = document.getElementById('taskList');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const clearAllBtn = document.getElementById('clearAllBtn');
  
  // Поля формы
  const taskTitle = document.getElementById('taskTitle');
  const taskDescription = document.getElementById('taskDescription');
  const taskDate = document.getElementById('taskDate');
  const taskTime = document.getElementById('taskTime');
  const taskPriority = document.getElementById('taskPriority');
  
  // Устанавливаем минимальную дату (сегодня)
  if (taskDate) {
    const today = new Date().toISOString().split('T')[0];
    taskDate.min = today;
  }
  
  // Загрузка задач из localStorage
  let tasks = JSON.parse(localStorage.getItem('retroTasks')) || [];
  
  // Показать/скрыть форму добавления задачи
  if (toggleTaskFormBtn) {
    toggleTaskFormBtn.addEventListener('click', () => {
      taskFormContainer.style.display = taskFormContainer.style.display === 'none' ? 'block' : 'none';
      if (taskFormContainer.style.display === 'block') {
        taskTitle.focus();
      }
    });
  }
  
  if (cancelTaskBtn) {
    cancelTaskBtn.addEventListener('click', () => {
      taskFormContainer.style.display = 'none';
      resetTaskForm();
    });
  }
  
  // Сброс формы
  function resetTaskForm() {
    if (taskTitle) taskTitle.value = '';
    if (taskDescription) taskDescription.value = '';
    if (taskDate) taskDate.value = '';
    if (taskTime) taskTime.value = '12:00';
    if (taskPriority) taskPriority.value = 'medium';
  }
  
  // Сохранение задачи
  if (saveTaskBtn) {
    saveTaskBtn.addEventListener('click', addTask);
  }
  
  function addTask() {
    const title = taskTitle.value.trim();
    if (!title) {
      showAlert('Введите название задачи!', 'error');
      taskTitle.focus();
      return;
    }
    
    const now = new Date();
    const task = {
      id: Date.now(),
      title,
      description: taskDescription.value.trim(),
      date: taskDate.value || now.toISOString().split('T')[0],
      time: taskTime.value || '12:00',
      priority: taskPriority.value,
      completed: false,
      createdAt: now.toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    resetTaskForm();
    taskFormContainer.style.display = 'none';
    
    showAlert('Задача добавлена!', 'success');
  }
  
  // Отображение задач
  function renderTasks(filter = 'all') {
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });
    
    if (filteredTasks.length === 0) {
      taskList.innerHTML = '<li class="no-tasks">Задачи не найдены</li>';
      updateStats();
      return;
    }
    
    // Сортируем по дате (сначала ближайшие)
    filteredTasks.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
    filteredTasks.forEach(task => {
      const taskItem = document.createElement('li');
      taskItem.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
      
      const taskDateObj = new Date(`${task.date}T${task.time}`);
      const now = new Date();
      const isOverdue = !task.completed && taskDateObj < now;
      
      taskItem.innerHTML = `
        <div class="task-main">
          <div class="task-checkbox">
            <input type="checkbox" ${task.completed ? 'checked' : ''} id="task-${task.id}">
            <label for="task-${task.id}"></label>
          </div>
          <div class="task-content">
            <div class="task-header">
              <h3 class="task-title">${task.title}</h3>
              <div class="task-meta">
                <span class="task-date">${formatDate(task.date, task.time)}</span>
                <span class="priority-badge ${task.priority}">${getPriorityLabel(task.priority)}</span>
                ${isOverdue ? '<span class="task-overdue">ПРОСРОЧЕНО</span>' : ''}
              </div>
            </div>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
          </div>
          <div class="task-actions">
            <button class="pixel-icon edit-btn" data-id="${task.id}" title="Редактировать">
              <i class="fas fa-edit"></i>
            </button>
            <button class="pixel-icon delete-btn" data-id="${task.id}" title="Удалить">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
      
      taskList.appendChild(taskItem);
    });
    
    updateStats();
    setupTaskEvents();
  }
  
  // Форматирование даты
  function formatDate(dateString, timeString) {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Метки приоритета
  function getPriorityLabel(priority) {
    const labels = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий'
    };
    return labels[priority];
  }
  
  // Настройка обработчиков событий
  function setupTaskEvents() {
    // Переключение статуса выполнения
    document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const taskId = parseInt(this.id.split('-')[1]);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = this.checked;
          saveTasks();
          renderTasks(document.querySelector('[data-filter].active')?.dataset?.filter || 'all');
          
          // Начисляем XP за выполнение задачи
          if (task.completed) {
            const currentXP = parseInt(localStorage.getItem('retroXP') || 0);
            const newXP = currentXP + 10;
            localStorage.setItem('retroXP', newXP);
            
            // Обновляем статистику в профиле
            if (window.updateAchievements) {
              window.updateAchievements();
            }
            
            showAlert(`+10 XP! Теперь у вас ${newXP} XP`, 'success');
          }
        }
      });
    });
    
    // Удаление задачи
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const taskId = parseInt(this.dataset.id);
        if (confirm('Удалить эту задачу?')) {
          tasks = tasks.filter(t => t.id !== taskId);
          saveTasks();
          renderTasks(document.querySelector('[data-filter].active')?.dataset?.filter || 'all');
          showAlert('Задача удалена', 'warning');
        }
      });
    });
    
    // Редактирование задачи
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const taskId = parseInt(this.dataset.id);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          taskTitle.value = task.title;
          taskDescription.value = task.description;
          taskDate.value = task.date;
          taskTime.value = task.time;
          taskPriority.value = task.priority;
          
          // Удаляем старую задачу
          tasks = tasks.filter(t => t.id !== taskId);
          
          taskFormContainer.style.display = 'block';
          taskTitle.focus();
          showAlert('Редактирование задачи', 'info');
        }
      });
    });
  }
  
  // Фильтрация задач
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks(btn.dataset.filter);
    });
  });
  
  // Очистка всех задач
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (tasks.length > 0 && confirm('Удалить все задачи?')) {
        tasks = [];
        saveTasks();
        renderTasks();
        showAlert('Все задачи удалены', 'warning');
      }
    });
  }
  
  // Сохранение задач
  function saveTasks() {
    localStorage.setItem('retroTasks', JSON.stringify(tasks));
    updateStats();
    
    // Обновляем статистику в профиле
    if (window.updateAchievements) {
      window.updateAchievements();
    }
  }
  
  // Обновление статистики
  function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    if (document.getElementById('totalCount')) {
      document.getElementById('totalCount').textContent = totalTasks;
    }
    
    if (document.getElementById('completedCount')) {
      document.getElementById('completedCount').textContent = completedTasks;
    }
    
    if (document.getElementById('userLevel')) {
      document.getElementById('userLevel').textContent = Math.floor(completedTasks / 5) + 1;
    }
    
    // Сохраняем общее количество задач для профиля
    localStorage.setItem('retroTasksCount', totalTasks);
  }
  
  // Первоначальная загрузка
  renderTasks();
});