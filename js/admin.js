/* =========================================================
   AURELIA DENTAL STUDIO — admin.js
   Requires js/supabase-config.js loaded first (defines supabaseClient)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const appointmentsBody = document.getElementById('appointmentsBody');
  const emptyState = document.getElementById('emptyState');
  const filterPills = document.querySelectorAll('.filter-pill');

  let allAppointments = [];
  let activeFilter = 'all';
  let realtimeChannel = null;

  /* ---------- Auth gate ---------- */
  function showDashboard() {
    loginView.classList.add('d-none');
    dashboardView.classList.remove('d-none');
    loadAppointments();
    subscribeRealtime();
  }

  function showLogin() {
    dashboardView.classList.add('d-none');
    loginView.classList.remove('d-none');
    if (realtimeChannel) {
      supabaseClient.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  }

  async function checkSession() {
    const { data } = await supabaseClient.auth.getSession();
    if (data && data.session) {
      showDashboard();
    } else {
      showLogin();
    }
  }
  checkSession();

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    loginError.classList.add('d-none');

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      loginError.textContent = error.message || 'Incorrect email or password.';
      loginError.classList.remove('d-none');
      return;
    }
    loginForm.reset();
    showDashboard();
  });

  logoutBtn.addEventListener('click', async function () {
    await supabaseClient.auth.signOut();
    showLogin();
  });

  /* ---------- Load + render appointments ---------- */
  async function loadAppointments() {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load appointments:', error);
      return;
    }
    allAppointments = data || [];
    renderStats();
    renderTable();
  }

  refreshBtn.addEventListener('click', loadAppointments);

  function renderStats() {
    document.getElementById('statTotal').textContent = allAppointments.length;
    document.getElementById('statPending').textContent = allAppointments.filter(a => a.status === 'pending').length;
    document.getElementById('statConfirmed').textContent = allAppointments.filter(a => a.status === 'confirmed').length;
    document.getElementById('statCancelled').textContent = allAppointments.filter(a => a.status === 'cancelled').length;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  function renderTable() {
    const rows = allAppointments.filter(a => activeFilter === 'all' || a.status === activeFilter);

    if (rows.length === 0) {
      appointmentsBody.innerHTML = '';
      emptyState.classList.remove('d-none');
      return;
    }
    emptyState.classList.add('d-none');

    appointmentsBody.innerHTML = rows.map(a => `
      <tr data-id="${a.id}">
        <td>${escapeHtml(a.full_name)}</td>
        <td>
          <div>${escapeHtml(a.phone)}</div>
          <div class="cell-muted">${escapeHtml(a.email)}</div>
        </td>
        <td>
          <div>${formatDate(a.appt_date)}</div>
          <div class="cell-muted">${escapeHtml(a.appt_time)}</div>
        </td>
        <td>${escapeHtml(a.service)}</td>
        <td>
          <span class="status-badge ${a.status}">${a.status}</span>
          <select class="status-select mt-2 d-block status-control" data-id="${a.id}">
            <option value="pending" ${a.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${a.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td class="cell-muted">${formatDateTime(a.created_at)}</td>
        <td>
          <button class="icon-btn delete-btn" data-id="${a.id}" aria-label="Delete appointment">
            <i class="bi bi-trash3"></i>
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.status-control').forEach(sel => {
      sel.addEventListener('change', onStatusChange);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', onDelete);
    });
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  /* ---------- Status update ---------- */
  async function onStatusChange(e) {
    const id = e.target.dataset.id;
    const newStatus = e.target.value;
    const { error } = await supabaseClient.from('appointments').update({ status: newStatus }).eq('id', id);
    if (error) {
      console.error('Failed to update status:', error);
      alert('Could not update status — please try again.');
      return;
    }
    const appt = allAppointments.find(a => a.id === id);
    if (appt) appt.status = newStatus;
    renderStats();
    renderTable();
  }

  /* ---------- Delete ---------- */
  async function onDelete(e) {
    const id = e.currentTarget.dataset.id;
    if (!confirm('Delete this appointment request? This cannot be undone.')) return;

    const { error } = await supabaseClient.from('appointments').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete appointment:', error);
      alert('Could not delete — please try again.');
      return;
    }
    allAppointments = allAppointments.filter(a => a.id !== id);
    renderStats();
    renderTable();
  }

  /* ---------- Filters ---------- */
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      renderTable();
    });
  });

  /* ---------- Realtime (auto-refresh when a new request comes in) ---------- */
  function subscribeRealtime() {
    if (realtimeChannel) return;
    realtimeChannel = supabaseClient
      .channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        loadAppointments();
      })
      .subscribe();
  }

});
