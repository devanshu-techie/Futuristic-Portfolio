// Admin sign-in, forgot-password and reset flows.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  async function post(url, body) {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok !== false, data };
  }
  function show(form, msg, ok = false) {
    const a = $('[data-alert]', form);
    a.textContent = msg;
    a.classList.toggle('ok', ok);
    a.hidden = !msg;
  }
  function busy(btn, on) { btn.disabled = on; btn.setAttribute('aria-busy', String(on)); }

  const login = $('[data-login-form]');
  if (login) {
    $('[data-pw-toggle]')?.addEventListener('click', (ev) => {
      const pw = $('#pw');
      const showing = pw.type === 'text';
      pw.type = showing ? 'password' : 'text';
      ev.currentTarget.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
    login.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const btn = $('button[type="submit"]', login);
      const email = login.email.value.trim();
      const password = login.password.value;
      if (!email || !password) { show(login, 'Enter your email and password.'); return; }
      busy(btn, true);
      show(login, '');
      try {
        const { ok, data } = await post('/api/admin/login', { email, password });
        if (!ok) { show(login, data.error || 'Sign-in failed. Try again.'); login.password.select(); return; }
        location.href = '/admin/dashboard';
      } catch { show(login, 'You seem to be offline. Try again.'); } finally { busy(btn, false); }
    });
    $('[data-forgot]')?.addEventListener('click', async (ev) => {
      const btn = ev.currentTarget;
      busy(btn, true);
      try {
        const { data } = await post('/api/admin/forgot', {});
        show(login, data.message || 'If that account exists, a reset link has been sent.', true);
      } catch { show(login, 'You seem to be offline. Try again.'); } finally { busy(btn, false); }
    });
  }

  const reset = $('[data-reset-form]');
  if (reset) {
    reset.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const btn = $('button[type="submit"]', reset);
      if (reset.password.value !== reset.password2.value) { show(reset, 'The two passwords do not match.'); return; }
      busy(btn, true);
      try {
        const { ok, data } = await post('/api/admin/reset', { token: reset.token.value, password: reset.password.value });
        if (!ok) { show(reset, data.error || 'The password could not be saved.'); return; }
        location.href = '/admin/login?notice=reset';
      } catch { show(reset, 'You seem to be offline. Try again.'); } finally { busy(btn, false); }
    });
  }
})();
