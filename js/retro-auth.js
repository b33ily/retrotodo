// retro-auth.js
document.addEventListener('DOMContentLoaded', () => {
  // Инициализация системы авторизации
  initAuthSystem();
});

// Инициализация системы авторизации
function initAuthSystem() {
  if (!document.getElementById('loginForm')) return;

  // Переключение между табами
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
      });
      
      document.getElementById(`${this.dataset.tab}Form`).classList.add('active');
    });
  });

  // Обработка формы входа
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
      showAlert('Заполните все поля!', 'error');
      return;
    }
    
    authenticateUser(email, password);
  });

  // Обработка формы регистрации
  document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    
    if (!username || !email || !password || !confirm) {
      showAlert('Заполните все поля!', 'error');
      return;
    }
    
    if (password !== confirm) {
      showAlert('Пароли не совпадают!', 'error');
      return;
    }
    
    if (password.length < 6) {
      showAlert('Пароль должен быть не менее 6 символов', 'error');
      return;
    }
    
    registerUser(username, email, password);
  });
}

// Аутентификация пользователя
function authenticateUser(email, password) {
  showLoading(true, document.querySelector('#loginForm button[type="submit"]'));
  
  // Эмуляция запроса к серверу
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('retroUsers')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('retroCurrentUser', JSON.stringify(user));
      showAlert('Вход выполнен успешно!', 'success');
      
      // Перенаправление на главную страницу
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      showAlert('Неверный логин или пароль', 'error');
    }
    
    showLoading(false, document.querySelector('#loginForm button[type="submit"]'));
  }, 1000);
}

// Регистрация нового пользователя
function registerUser(username, email, password) {
  showLoading(true, document.querySelector('#registerForm button[type="submit"]'));
  
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('retroUsers')) || [];
    
    if (users.some(u => u.email === email)) {
      showAlert('Пользователь с таким email уже существует', 'error');
      showLoading(false, document.querySelector('#registerForm button[type="submit"]'));
      return;
    }
    
    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      joinDate: new Date().toLocaleDateString('ru-RU'),
      level: 1,
      tasks: [],
      isAdmin: users.length === 0 // Первый пользователь становится админом
    };
    
    users.push(newUser);
    localStorage.setItem('retroUsers', JSON.stringify(users));
    localStorage.setItem('retroCurrentUser', JSON.stringify(newUser));
    localStorage.setItem('retroXP', '0');
    
    showAlert('Регистрация прошла успешно!', 'success');
    showLoading(false, document.querySelector('#registerForm button[type="submit"]'));
    
    // Перенаправление на главную страницу после регистрации
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }, 1000);
}