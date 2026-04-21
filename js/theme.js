const darkToggle = document.getElementById('darkToggle');

function pasThemaToe(theme) {
  const isDark = theme === 'dark';

  document.body.classList.toggle('dark-mode', isDark);
  document.body.classList.toggle('light-mode', !isDark);
}

function huidigThema() {
  return localStorage.getItem('theme') || 'light';
}

function toggleThema() {
  const nieuwThema = document.body.classList.contains('dark-mode')
    ? 'light'
    : 'dark';

  localStorage.setItem('theme', nieuwThema);
  pasThemaToe(nieuwThema);

  document.dispatchEvent(
    new CustomEvent('themechange', {
      detail: { theme: nieuwThema }
    })
  );
}

pasThemaToe(huidigThema());

if (darkToggle) {
  darkToggle.addEventListener('click', toggleThema);
}