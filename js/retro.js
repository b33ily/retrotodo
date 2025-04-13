// retro.js
document.addEventListener('DOMContentLoaded', () => {
  // Инициализация темы
  const currentTheme = localStorage.getItem('retroTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Кнопка переключения темы
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
    updateThemeIcon(currentTheme);
  }
  
  // Пасхалка
  const secretBtn = document.getElementById('secretBtn');
  if (secretBtn) {
    secretBtn.addEventListener('click', showEasterEgg);
  }
  
  // Симуляция загрузки
  simulateSystemLoad();
  
  // Проверка авторизации (если не на странице авторизации)
  if (!window.location.pathname.includes('auth.html')) {
    checkAuth();
  }
});

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('retroTheme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    const icon = theme === 'dark' ? 'fa-moon' : 'fa-sun';
    themeToggleBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    themeToggleBtn.title = theme === 'dark' ? 'Темная тема' : 'Светлая тема';
  }
}

function showEasterEgg() {
  const easterEgg = document.getElementById('easterEgg');
  if (easterEgg) {
    easterEgg.style.display = 'block';
    // Прокрутка к пасхалке
    easterEgg.scrollIntoView({ behavior: 'smooth' });
  }
}

function simulateSystemLoad() {
  const loader = document.getElementById('retroLoader');
  if (!loader) return;

  // Убедимся, что body остается прокручиваемым
  document.body.style.overflow = 'auto';
  
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.querySelector('.loading-progress');
  const messages = [
    "ИНИЦИАЛИЗАЦИЯ BIOS...",
    "ЗАГРУЗКА ПАМЯТИ...",
    "ПРОВЕРКА ДИСКЕТЫ...",
    "СИСТЕМА ГОТОВА"
  ];
  
  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) progress = 100;
    
    progressBar.style.width = `${progress}%`;
    if (progressText) {
      progressText.textContent = `${Math.floor(progress)}%`;
    }
    
    const messageElement = document.querySelector('.loading-message');
    if (messageElement) {
      const messageIndex = Math.min(
        Math.floor(progress / 30),
        messages.length - 1
      );
      messageElement.textContent = messages[messageIndex];
    }
    
    if (progress === 100) {
      clearInterval(loadInterval);
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
          document.body.classList.add('loaded');
        }, 500);
      }, 800);
    }
  }, 200);
}

function checkAuth() {
  if (window.location.pathname.includes('auth.html')) return;
  
  const user = localStorage.getItem('retroCurrentUser');
  if (!user) {
    window.location.href = 'auth.html';
  }
}

function logout() {
  localStorage.removeItem('retroCurrentUser');
  window.location.href = 'auth.html';
}

// Глобальные функции для использования в других файлах
window.showLoading = function(show, element) {
  const btn = element || document.activeElement;
  if (btn) {
    btn.disabled = show;
    const originalHTML = btn.innerHTML;
    if (show) {
      btn.dataset.originalHtml = originalHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ЗАГРУЗКА...';
    } else {
      btn.innerHTML = btn.dataset.originalHtml || originalHTML;
    }
  }
};

window.showAlert = function(message, type = 'info') {
  const colors = {
    info: 'var(--retro-blue)',
    success: 'var(--retro-green)',
    warning: 'var(--retro-yellow)',
    error: 'var(--retro-pink)'
  };
  
  const alert = document.createElement('div');
  alert.className = 'retro-alert';
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px;
    background: var(--retro-dark);
    border: 2px solid ${colors[type]};
    color: var(--retro-text);
    z-index: 1000;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
  `;
  
  alert.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fas ${type === 'info' ? 'fa-info-circle' : 
                     type === 'success' ? 'fa-check-circle' : 
                     type === 'warning' ? 'fa-exclamation-triangle' : 
                     'fa-times-circle'}" 
         style="color: ${colors[type]}; font-size: 1.2rem;"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => alert.remove(), 300);
  }, 3000);
};

// Добавляем стили для алертов
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);