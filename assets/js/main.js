(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     深浅色主题
     ---------------------------------------------------------- */
  var themeToggle = document.querySelector('[data-theme-toggle]');

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try {
        localStorage.setItem('affinity-theme', theme);
      } catch (error) {
        /* 浏览器禁用本地存储时，主题仍然可以临时切换 */
      }
    }
    if (themeToggle) {
      var isDark = theme === 'dark';
      themeToggle.setAttribute('aria-label', isDark ? '切换到浅色模式' : '切换到深色模式');
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('title', isDark ? '切换到浅色模式' : '切换到深色模式');
    }
  }

  applyTheme(root.getAttribute('data-theme') || 'light', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* 用户没有手动选择过时，跟随系统主题变化 */
  var colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  var onSchemeChange = function (event) {
    var saved = null;
    try {
      saved = localStorage.getItem('affinity-theme');
    } catch (error) {
      saved = null;
    }
    if (!saved) {
      applyTheme(event.matches ? 'dark' : 'light', false);
    }
  };
  if (typeof colorScheme.addEventListener === 'function') {
    colorScheme.addEventListener('change', onSchemeChange);
  }

  /* ----------------------------------------------------------
     手机端菜单
     ---------------------------------------------------------- */
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var siteNav = document.getElementById('site-nav');

  function closeMenu() {
    if (!header || !menuToggle) return;
    header.removeAttribute('data-menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开菜单');
    document.body.classList.remove('menu-open');
  }

  if (header && menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      var open = header.getAttribute('data-menu-open') === 'true';
      if (open) {
        closeMenu();
      } else {
        header.setAttribute('data-menu-open', 'true');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', '关闭菜单');
        document.body.classList.add('menu-open');
      }
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', function (event) {
      if (header.getAttribute('data-menu-open') === 'true' && !header.contains(event.target)) {
        closeMenu();
      }
    });

    var desktop = window.matchMedia('(min-width: 901px)');
    if (typeof desktop.addEventListener === 'function') {
      desktop.addEventListener('change', function (event) {
        if (event.matches) closeMenu();
      });
    }
  }

  /* ----------------------------------------------------------
     阅读进度、页头状态、回到顶部
     ---------------------------------------------------------- */
  var progressBar = document.querySelector('[data-reading-progress]');
  var backToTop = document.querySelector('[data-back-to-top]');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle('is-scrolled', y > 12);
    }

    if (progressBar) {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var progress = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
      progressBar.style.transform = 'scaleX(' + progress + ')';
    }

    if (backToTop) {
      backToTop.classList.toggle('is-visible', y > 720);
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     复制文章链接
     ---------------------------------------------------------- */
  var copyButton = document.querySelector('[data-copy-link]');

  if (copyButton) {
    copyButton.addEventListener('click', function () {
      var url = copyButton.getAttribute('data-url') || window.location.href;
      var label = copyButton.querySelector('[data-copy-label]');
      var original = label ? label.textContent : '';

      function done(message) {
        if (!label) return;
        label.textContent = message;
        copyButton.classList.add('is-copied');
        window.setTimeout(function () {
          label.textContent = original;
          copyButton.classList.remove('is-copied');
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          done('链接已复制');
        }).catch(function () {
          done('复制失败，请手动复制');
        });
        return;
      }

      var textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        done('链接已复制');
      } catch (error) {
        done('复制失败，请手动复制');
      }
      document.body.removeChild(textarea);
    });
  }
})();
