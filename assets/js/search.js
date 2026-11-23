(function () {
  'use strict';

  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var clearButton = document.querySelector('[data-search-clear]');

  if (!form || !input || !results || !status) return;

  var index = null;
  var loadingPromise = null;
  var debounceTimer = null;

  function setStatus(message) {
    status.textContent = message;
  }

  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (loadingPromise) return loadingPromise;

    var base = typeof window.SITE_BASEURL === 'string' ? window.SITE_BASEURL : '';
    var indexUrl = window.SEARCH_INDEX_URL || (base + '/search.json');
    loadingPromise = fetch(indexUrl, { headers: { Accept: 'application/json' } })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        index = Array.isArray(data) ? data : [];
        return index;
      })
      .catch(function (error) {
        loadingPromise = null;
        throw error;
      });

    return loadingPromise;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function makeSnippet(text, query) {
    var plain = String(text || '').replace(/\s+/g, ' ').trim();
    if (!plain) return '';
    var lower = plain.toLowerCase();
    var position = lower.indexOf(query);
    if (position < 0) return plain.slice(0, 130) + (plain.length > 130 ? '…' : '');

    var start = Math.max(0, position - 36);
    var end = Math.min(plain.length, position + query.length + 96);
    return (start > 0 ? '…' : '') + plain.slice(start, end) + (end < plain.length ? '…' : '');
  }

  function highlight(text, query) {
    var wrapper = document.createElement('span');
    var source = String(text || '');
    var lower = source.toLowerCase();
    var position = lower.indexOf(query);

    if (position < 0) {
      wrapper.textContent = source;
      return wrapper;
    }

    wrapper.appendChild(document.createTextNode(source.slice(0, position)));
    var mark = document.createElement('mark');
    mark.textContent = source.slice(position, position + query.length);
    wrapper.appendChild(mark);
    wrapper.appendChild(document.createTextNode(source.slice(position + query.length)));
    return wrapper;
  }

  function render(resultsList, query) {
    results.innerHTML = '';

    resultsList.forEach(function (post) {
      var item = document.createElement('article');
      item.className = 'search-result';

      var heading = document.createElement('h2');
      var link = document.createElement('a');
      link.href = post.url;
      link.appendChild(highlight(post.title, query));
      heading.appendChild(link);

      var meta = document.createElement('p');
      meta.className = 'search-result__meta';
      meta.textContent = post.date + (post.tags && post.tags.length ? ' · ' + post.tags.join(' / ') : '');

      var snippet = document.createElement('p');
      snippet.className = 'search-result__snippet';
      snippet.appendChild(highlight(makeSnippet(post.content || post.excerpt || '', query), query));

      item.appendChild(heading);
      item.appendChild(meta);
      item.appendChild(snippet);
      results.appendChild(item);
    });
  }

  function performSearch(rawQuery) {
    var query = normalize(rawQuery);

    if (clearButton) clearButton.hidden = query.length === 0;

    if (!query) {
      results.innerHTML = '';
      setStatus('输入关键词，开始寻找。');
      return;
    }

    setStatus('正在翻找……');

    loadIndex().then(function (posts) {
      var matches = posts.filter(function (post) {
        var haystack = normalize([
          post.title,
          (post.tags || []).join(' '),
          post.excerpt,
          post.content
        ].join(' '));
        return haystack.indexOf(query) !== -1;
      });

      if (!matches.length) {
        results.innerHTML = '';
        setStatus('没有找到和「' + query + '」有关的文字。换一个词试试？');
        return;
      }

      render(matches.slice(0, 30), query);
      setStatus('找到 ' + matches.length + ' 篇相关文章' + (matches.length > 30 ? '，显示前 30 篇' : '') + '。');
    }).catch(function () {
      results.innerHTML = '';
      setStatus('搜索索引暂时没有加载成功，请刷新页面后再试。');
    });
  }

  function runFromInput() {
    var query = input.value;
    performSearch(query);

    var url = new URL(window.location.href);
    if (normalize(query)) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    window.clearTimeout(debounceTimer);
    runFromInput();
  });

  input.addEventListener('input', function () {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(runFromInput, 160);
  });

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      input.value = '';
      runFromInput();
      input.focus();
    });
  }

  var initialQuery = new URL(window.location.href).searchParams.get('q');
  if (initialQuery) {
    input.value = initialQuery;
    performSearch(initialQuery);
  }
})();
