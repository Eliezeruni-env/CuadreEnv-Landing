import './styles.css';

// ==========================================================================
// Theme Management (Modo Oscuro / Modo Claro)
// ==========================================================================
const THEME_STORAGE_KEY = 'cuadreenv_landing_theme';

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function updateLogos(theme) {
  const isLight = theme === 'light';
  const logoWhite = '/brand/cuadreEnv-logo-white.png';
  const logoOriginal = '/brand/cuadreEnv-logo.png';

  const logoNav = document.getElementById('brand-logo-nav');
  if (logoNav) {
    logoNav.src = isLight ? logoOriginal : logoWhite;
    logoNav.srcset = isLight ? `${logoOriginal} 1x, ${logoOriginal} 2x` : `${logoWhite} 1x, /brand/cuadreEnv-logo-white@2x.png 2x`;
  }

  const logoMobile = document.getElementById('brand-logo-mobile');
  if (logoMobile) {
    logoMobile.src = isLight ? logoOriginal : logoWhite;
  }

  const logoFooter = document.getElementById('brand-logo-footer');
  if (logoFooter) {
    logoFooter.src = isLight ? logoOriginal : logoWhite;
    logoFooter.srcset = isLight ? `${logoOriginal} 1x, ${logoOriginal} 2x` : `${logoWhite} 1x, /brand/cuadreEnv-logo-white@2x.png 2x`;
  }

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', isLight ? '#f8fafc' : '#070d18');
  }
}

function applyTheme(theme, save = false) {
  document.documentElement.setAttribute('data-theme', theme);
  updateLogos(theme);
  if (save) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

// Inicializar tema inmediatamente
const currentTheme = getPreferredTheme();
applyTheme(currentTheme, false);

// Escuchar cambios de preferencia del sistema si el usuario no ha forzado uno
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark', false);
    }
  });
}

// Configurar listeners de botones de toggle
function toggleTheme() {
  const active = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(active, true);
}

const themeToggleNav = document.getElementById('theme-toggle');
if (themeToggleNav) themeToggleNav.addEventListener('click', toggleTheme);

const themeToggleMobile = document.getElementById('theme-toggle-mobile');
if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

// ==========================================================================
// 1. Navbar Scroll Effect & Scroll Progress
// ==========================================================================
const nav = document.getElementById('nav');
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');

function updateScrollUI() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = docHeight > 0 ? (scrollTop / docHeight) : 0;

  if (scrollProgress) {
    scrollProgress.style.transform = `scaleX(${scrolled})`;
  }

  if (nav) {
    if (scrollTop > 20) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  if (backToTop) {
    if (scrollTop > 400) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  }
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==========================================================================
// 2. Mobile Menu Toggle
// ==========================================================================
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ==========================================================================
// 3. Scroll Reveal Animations (IntersectionObserver)
// ==========================================================================
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
  );

  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-visible'));
}

// ==========================================================================
// 4. Counter Animation for Stats
// ==========================================================================
const counters = document.querySelectorAll('.counter');
if ('IntersectionObserver' in window && counters.length > 0) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = Number(el.getAttribute('data-to') || 0);
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => counterObserver.observe(c));
}

function animateCounter(el, target, duration = 1200) {
  let start = 0;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutQuad
    const eased = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(eased * target);
    el.textContent = String(current);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = String(target);
    }
  }

  requestAnimationFrame(step);
}

// ==========================================================================
// 5. Interactive Module Tabs
// ==========================================================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabBtns.forEach((b) => {
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });
    tabPanels.forEach((p) => {
      p.hidden = true;
      p.classList.remove('is-entering');
    });

    btn.setAttribute('aria-selected', 'true');
    btn.removeAttribute('tabindex');

    const panelId = btn.getAttribute('aria-controls');
    if (panelId) {
      const targetPanel = document.getElementById(panelId);
      if (targetPanel) {
        targetPanel.hidden = false;
        targetPanel.classList.add('is-entering');
      }
    }
  });
});

// ==========================================================================
// 6. Infinite Marquee Duplicate Track
// ==========================================================================
const marqueeTrack = document.getElementById('marquee-track');
if (marqueeTrack) {
  marqueeTrack.innerHTML += marqueeTrack.innerHTML;
}

// Set Current Year in Footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// ==========================================================================
// 7. Multi-Step Form Logic (3 Steps + API Submit)
// ==========================================================================
const form = document.getElementById('lead-form');
const stepper = document.getElementById('stepper');
const steps = document.querySelectorAll('.form-step');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnSubmit = document.getElementById('btn-submit');
const stepCount = document.getElementById('step-count');
const formNav = document.getElementById('form-nav');
const formAlert = document.getElementById('form-status');
const formAlertText = document.getElementById('form-status-text');
const formSuccess = document.getElementById('form-success');
const btnReset = document.getElementById('btn-reset');

let currentStep = 1;
const totalSteps = 3;

function updateStepUI() {
  steps.forEach((st) => {
    const s = Number(st.getAttribute('data-step'));
    if (s === currentStep) {
      st.hidden = false;
      st.classList.add('is-entering');
    } else {
      st.hidden = true;
      st.classList.remove('is-entering');
    }
  });

  // Update Stepper List
  if (stepper) {
    const items = stepper.querySelectorAll('li');
    items.forEach((item, idx) => {
      const stepIdx = idx + 1;
      item.classList.remove('is-current', 'is-done');
      if (stepIdx === currentStep) {
        item.classList.add('is-current');
      } else if (stepIdx < currentStep) {
        item.classList.add('is-done');
      }
    });
  }

  // Nav buttons
  if (stepCount) {
    stepCount.textContent = `Paso ${currentStep} de ${totalSteps}`;
  }

  if (btnPrev) {
    btnPrev.hidden = currentStep === 1;
  }

  if (currentStep === totalSteps) {
    if (btnNext) btnNext.hidden = true;
    if (btnSubmit) btnSubmit.hidden = false;
  } else {
    if (btnNext) btnNext.hidden = false;
    if (btnSubmit) btnSubmit.hidden = true;
  }

  clearAlert();
}

function clearFieldErrors(stepEl) {
  const fields = stepEl.querySelectorAll('.field');
  fields.forEach((f) => {
    f.classList.remove('has-error');
    const err = f.querySelector('.field-error');
    if (err) err.textContent = '';
  });
}

function showFieldError(fieldId, message) {
  const inputEl = document.getElementById(fieldId);
  if (!inputEl) return;
  const fieldEl = inputEl.closest('.field');
  if (fieldEl) {
    fieldEl.classList.add('has-error');
    const err = fieldEl.querySelector('.field-error');
    if (err) err.textContent = message;
  }
}

function showAlert(message) {
  if (formAlert && formAlertText) {
    formAlertText.textContent = message;
    formAlert.classList.add('is-visible');
  }
}

function clearAlert() {
  if (formAlert && formAlertText) {
    formAlert.classList.remove('is-visible');
    formAlertText.textContent = '';
  }
}

function validateStep(step) {
  const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  if (!stepEl) return true;
  clearFieldErrors(stepEl);
  let valid = true;

  if (step === 1) {
    const fullName = (document.getElementById('fullName')?.value || '').trim();
    const email = (document.getElementById('email')?.value || '').trim();
    const phone = (document.getElementById('phone')?.value || '').trim();

    if (fullName.length < 3) {
      showFieldError('fullName', 'Por favor ingresa tu nombre completo.');
      valid = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRe.test(email)) {
      showFieldError('email', 'Ingresa un correo electrónico válido.');
      valid = false;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      showFieldError('phone', 'Ingresa un número telefónico válido (mínimo 10 dígitos).');
      valid = false;
    }
  } else if (step === 2) {
    const companyName = (document.getElementById('companyName')?.value || '').trim();
    const businessType = document.querySelector('input[name="businessType"]:checked');

    if (companyName.length < 2) {
      showFieldError('companyName', 'Ingresa el nombre de tu empresa o negocio.');
      valid = false;
    }

    if (!businessType) {
      const typeError = document.getElementById('businessType-error');
      if (typeError) {
        typeError.textContent = 'Selecciona el tipo de negocio principal.';
        typeError.style.display = 'block';
      }
      valid = false;
    } else {
      const typeError = document.getElementById('businessType-error');
      if (typeError) typeError.style.display = 'none';
    }
  } else if (step === 3) {
    const consent = document.getElementById('consent');
    if (consent && !consent.checked) {
      const consentErr = document.getElementById('consent-error');
      if (consentErr) {
        consentErr.textContent = 'Debes aceptar la autorización para contactarte.';
        consentErr.style.display = 'block';
      }
      valid = false;
    } else {
      const consentErr = document.getElementById('consent-error');
      if (consentErr) consentErr.style.display = 'none';
    }
  }

  return valid;
}

if (btnNext) {
  btnNext.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        currentStep++;
        updateStepUI();
      }
    } else {
      showAlert('Por favor completa los campos requeridos antes de continuar.');
    }
  });
}

if (btnPrev) {
  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateStepUI();
    }
  });
}

// Handle Form Submission
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(3)) {
      showAlert('Revisa las condiciones requeridas.');
      return;
    }

    clearAlert();
    const submitBtn = btnSubmit;
    const btnLabel = submitBtn?.querySelector('.btn-label');
    const originalText = btnLabel ? btnLabel.textContent : 'Enviar';

    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnLabel) btnLabel.innerHTML = '<span class="spinner"></span> Enviando...';
    }

    // Capture Form Data
    const formData = new FormData(form);
    const modules = formData.getAll('modules');
    const payload = {
      website: formData.get('website') || '', // honeypot
      fullName: (formData.get('fullName') || '').toString(),
      email: (formData.get('email') || '').toString(),
      phone: (formData.get('phone') || '').toString(),
      jobRole: (formData.get('jobRole') || '').toString(),
      companyName: (formData.get('companyName') || '').toString(),
      rnc: (formData.get('rnc') || '').toString(),
      businessType: (formData.get('businessType') || '').toString(),
      branches: (formData.get('branches') || '').toString(),
      registers: (formData.get('registers') || '').toString(),
      city: (formData.get('city') || '').toString(),
      modules: modules.map(String),
      currentSystem: (formData.get('currentSystem') || '').toString(),
      timeline: (formData.get('timeline') || '').toString(),
      contactPref: (formData.get('contactPref') || 'whatsapp').toString(),
      message: (formData.get('message') || '').toString(),
      consent: formData.get('consent') === 'on',
      utm: {
        source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
        referrer: document.referrer || '',
      },
    };

    try {
      const response = await fetch('https://cuadreenv-api-86ef5ddf9650.herokuapp.com/v1/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        // Success View
        form.hidden = true;
        if (formSuccess) {
          formSuccess.hidden = false;
          const successName = document.getElementById('success-name');
          if (successName) successName.textContent = payload.fullName.split(' ')[0] || 'gracias';

          const successChannel = document.getElementById('success-channel');
          if (successChannel) {
            const chanMap = { whatsapp: 'WhatsApp', llamada: 'llamada telefónica', email: 'correo electrónico' };
            successChannel.textContent = chanMap[payload.contactPref] || 'WhatsApp';
          }

          const successId = document.getElementById('success-id');
          if (successId && result.id) {
            successId.textContent = `#LEAD-${String(result.id).padStart(4, '0')}`;
          }

          formSuccess.focus();
        }
      } else {
        const errorMsg = result.message || 'Ocurrió un error al enviar tu solicitud. Intenta nuevamente.';
        showAlert(errorMsg);
      }
    } catch (err) {
      console.error('Lead submit error:', err);
      showAlert('No pudimos conectar con el servidor. Verifica tu conexión a internet.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnLabel) btnLabel.textContent = originalText;
      }
    }
  });
}

// Reset Form to submit another lead
if (btnReset && form && formSuccess) {
  btnReset.addEventListener('click', () => {
    form.reset();
    currentStep = 1;
    form.hidden = false;
    formSuccess.hidden = true;
    updateStepUI();
  });
}
