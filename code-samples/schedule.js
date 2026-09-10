'use strict';

(function () {
  if (!window.LaScuolaUI) return;

  const { scheduleItems, levelOrder, siteConfig } = window.LaScuolaData;
  const { escapeHtml, whatsappIcon, individualWhatsappUrl } = window.LaScuolaUI;

  let selectedScheduleId = scheduleItems[0].id;
  let selectedScheduleSlot = null;

  function groupName(item, slot) {
    const value = slot.toLowerCase();
    if (value.includes('intermedio/avanzato')) return 'Intermedio / Avanzato';
    if (value.includes('primi passi') || value.includes(' base')) return 'Principianti / Base';
    if (value.includes('avanzato')) return 'Avanzato';
    if (value.includes('intermedio')) return 'Intermedio';
    if (value.includes(' open')) return 'Open';
    if (value.includes('6–8')) return '6–8 anni';
    if (value.includes('9–11')) return '9–11 anni';
    if (value.includes('12–16') || value.includes('12–18')) return '12–16 anni';
    if (value.includes('adulti') || value.includes('over 16')) return 'Adulti';
    return 'Orario unico';
  }

  function groupedSlots(item, slots) {
    const groups = {};
    slots.forEach(slot => (groups[groupName(item, slot)] ??= []).push(slot));
    return Object.entries(groups).sort(([a], [b]) => levelOrder.indexOf(a) - levelOrder.indexOf(b));
  }

  function bookingWhatsappUrl(item, slot) {
    const [when, ...details] = slot.split(' · ');
    const message = [
      siteConfig.trialBookingIntro,
      `Attività: ${item.title}`,
      `Giorno e orario: ${when}`,
      details.length ? `Dettagli: ${details.join(' · ')}` : '',
      'Nome:'
    ].filter(Boolean).join('\n');

    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  function renderSchedule() {
    const item = scheduleItems.find(schedule => schedule.id === selectedScheduleId) || scheduleItems[0];
    document.querySelector('#schedule-title').textContent = item.title;

    if (item.contactOnly) {
      document.querySelector('#schedule-levels').innerHTML = '<p>Lezioni personalizzate su appuntamento.</p>';
      document.querySelector('#schedule-booking').innerHTML = `
        <a class="pill schedule-whatsapp" href="${individualWhatsappUrl}" target="_blank" rel="noreferrer">${whatsappIcon} Contattaci per prenotare <span>→</span></a>
      `;
      return;
    }

    const groups = groupedSlots(item, item.slots);

    document.querySelector('#schedule-levels').innerHTML = groups.map(([level, slots]) => `
      <section class="schedule-level">
        <h4>${escapeHtml(level)}</h4>
        <div class="schedule-rows">
          ${slots.map(slot => {
            const [when, ...details] = slot.split(' · ');
            const space = when.indexOf(' ');
            const day = when.slice(0, space);
            const time = when.slice(space + 1);
            const selected = selectedScheduleSlot === slot;
            return `
              <button type="button" class="schedule-row ${selected ? 'selected' : ''}" data-slot="${encodeURIComponent(slot)}" aria-pressed="${selected}">
                <span>${day.slice(0, 3).toUpperCase()}</span>
                <span>${escapeHtml(details.join(' · ') || item.title)}</span>
                <strong>${time}</strong>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    `).join('');

    document.querySelector('#schedule-booking').innerHTML = selectedScheduleSlot
      ? `<a class="pill schedule-whatsapp" href="${bookingWhatsappUrl(item, selectedScheduleSlot)}" target="_blank" rel="noreferrer">${whatsappIcon} Prenota questa prova <span>→</span></a>`
      : '<span class="pill schedule-whatsapp is-disabled" aria-disabled="true">Seleziona un orario</span>';
  }

  document.addEventListener('click', event => {
    const schedule = event.target.closest('[data-schedule]');
    if (schedule) {
      selectedScheduleId = schedule.dataset.schedule;
      selectedScheduleSlot = null;
      renderSchedule();
      return;
    }

    const slot = event.target.closest('[data-slot]');
    if (slot) {
      selectedScheduleSlot = decodeURIComponent(slot.dataset.slot);
      renderSchedule();
    }
  });

  renderSchedule();
})();
