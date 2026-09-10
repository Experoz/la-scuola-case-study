'use strict';

(function () {
  if (!window.LaScuolaUI) return;

  const { courses, categories } = window.LaScuolaData;
  const { escapeHtml } = window.LaScuolaUI;

  let activeCategory = 'kids';
  let courseStart = 0;
  let selectedCourseId = courses[0].id;

  function getCategoryCourseNumber(course) {
    const list = courses.filter(item => item.category === course.category);
    const index = list.findIndex(item => item.id === course.id);
    return String(index + 1).padStart(2, '0');
  }

  function renderFilters() {
    document.querySelector('#course-filters').innerHTML = categories.map(category => `
      <button type="button" data-category="${category.id}" class="${activeCategory === category.id ? 'active' : ''}" aria-pressed="${activeCategory === category.id}" aria-controls="course-cards">${category.label}</button>
    `).join('');
  }

  function renderCourseDetail() {
    const course = courses.find(item => item.id === selectedCourseId)
      || courses.find(item => item.category === activeCategory);

    document.querySelector('#course-detail').innerHTML = `
      <span class="detail-number">${getCategoryCourseNumber(course)}</span>
      <p class="kicker">Corso selezionato</p>
      <h3>${escapeHtml(course.title)}</h3>
      <p>${escapeHtml(course.description)}</p>
      <small>${escapeHtml(course.meta)}</small>
      <a class="pill light" href="#orari">Consulta gli orari <span>→</span></a>
    `;
  }

  function renderCourses() {
    const list = courses.filter(course => course.category === activeCategory);
    const visible = [list[courseStart], list[(courseStart + 1) % list.length]];

    document.querySelector('#course-cards').innerHTML = visible.map(course => `
      <button type="button" class="course-card ${selectedCourseId === course.id ? 'selected' : ''}" data-course="${course.id}" aria-pressed="${selectedCourseId === course.id}" aria-controls="course-detail" aria-label="Mostra la descrizione di ${escapeHtml(course.title)}">
        <span class="card-number">${getCategoryCourseNumber(course)}</span>
        <img src="assets/images/${course.image}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/images/sections/scuola.jpeg'">
        <span class="course-overlay">
          <small>${escapeHtml(course.audience)}</small>
          <strong>${escapeHtml(course.title)}</strong>
          <em>Scopri il corso →</em>
        </span>
      </button>
    `).join('') + `
      <div class="course-controls">
        <button type="button" data-move="-1" aria-label="Corsi precedenti">←</button>
        <span>${String(courseStart + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}</span>
        <button type="button" data-move="1" aria-label="Corsi successivi">→</button>
      </div>
    `;

    renderCourseDetail();
  }

  document.addEventListener('click', event => {
    const category = event.target.closest('[data-category]');
    if (category) {
      activeCategory = category.dataset.category;
      courseStart = 0;
      selectedCourseId = courses.find(course => course.category === activeCategory).id;
      renderFilters();
      renderCourses();
      return;
    }

    const course = event.target.closest('[data-course]');
    if (course) {
      selectedCourseId = course.dataset.course;
      renderCourses();
      return;
    }

    const move = event.target.closest('[data-move]');
    if (move) {
      const list = courses.filter(course => course.category === activeCategory);
      courseStart = (courseStart + Number(move.dataset.move) + list.length) % list.length;
      selectedCourseId = list[courseStart].id;
      renderCourses();
    }
  });

  renderFilters();
  renderCourses();
})();
