/* =========================================================
   AURELIA DENTAL STUDIO — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Sticky navbar shadow/border on scroll ---------- */
  const nav = document.getElementById('mainNav');
  function handleNavScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  handleNavScroll();
  window.addEventListener('scroll', handleNavScroll);

  /* ---------- Active nav link while scrolling ---------- */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link-aurelia');
  function setActiveLink() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  setActiveLink();
  window.addEventListener('scroll', setActiveLink);

  /* ---------- Animated Stats Counter (Signature Feature) ---------- */
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.target;
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          el.textContent = Math.floor(eased * target);
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = target;
          }
        }
        requestAnimationFrame(tick);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat').forEach(el => statsObserver.observe(el));

  /* ---------- Appointment Modal — Form Validation ---------- */
  const form = document.getElementById('appointmentForm');
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');

  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const defaultErrorText = formError ? formError.textContent.trim() : '';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('patientName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const date = document.getElementById('apptDate').value;
      const time = document.getElementById('apptTime').value;
      const service = document.getElementById('serviceType').value;

      const phoneOK = /^[0-9+\-\s]{7,15}$/.test(phone);
      const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      const isValid = name && phoneOK && emailOK && date && time && service;

      if (!isValid) {
        formError.textContent = defaultErrorText;
        formError.classList.remove('d-none');
        formSuccess.classList.add('d-none');
        return;
      }

      formError.classList.add('d-none');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      const { error } = await supabaseClient.from('appointments').insert([{
        full_name: name,
        phone: phone,
        email: email,
        appt_date: date,
        appt_time: time,
        service: service
      }]);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Appointment';
      }

      if (error) {
        console.error('Supabase insert error:', error);
        formError.textContent = 'Error: ' + (error.message || 'unknown error') + (error.hint ? ' (' + error.hint + ')' : '');
        formError.classList.remove('d-none');
        formSuccess.classList.add('d-none');
        return;
      }

      formSuccess.classList.remove('d-none');
      form.reset();

      setTimeout(() => {
        const modalEl = document.getElementById('appointmentModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        formSuccess.classList.add('d-none');
      }, 2200);
    });

    // Reset alerts each time the modal is reopened
    document.getElementById('appointmentModal').addEventListener('show.bs.modal', function () {
      formError.classList.add('d-none');
      formSuccess.classList.add('d-none');
    });
  }

  /* ---------- Before / After Draggable Slider (Bonus Signature Feature) ---------- */
  const baWrap = document.getElementById('baSlider');
  const baBeforeWrap = document.getElementById('baBeforeWrap');
  const baHandle = document.getElementById('baHandle');
  const baRange = document.getElementById('baRange');

  function setBaPosition(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    baBeforeWrap.style.width = clamped + '%';
    baHandle.style.left = clamped + '%';
    baRange.value = clamped;
  }

  if (baWrap) {
    baRange.addEventListener('input', () => setBaPosition(+baRange.value));

    let dragging = false;
    baWrap.addEventListener('pointerdown', () => { dragging = true; });
    window.addEventListener('pointerup', () => { dragging = false; });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const rect = baWrap.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setBaPosition(percent);
    });

    setBaPosition(50);
  }

});
