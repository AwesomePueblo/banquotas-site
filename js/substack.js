// Substack newsletter integration
// After creating your publication on substack.com, update SUBSTACK_URL below
// if your publication slug is not "banquotas".
(function () {
  const SUBSTACK_URL = 'https://twosuitdonny.substack.com';
  const FEED_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';
  const MAX_POSTS = 3;

  function renderSignup() {
    const container = document.getElementById('substack-signup');
    if (!container) return;

    const iframe = document.createElement('iframe');
    iframe.src = SUBSTACK_URL + '/embed';
    iframe.className = 'substack-embed';
    iframe.title = 'Subscribe to the BanQuotas newsletter';
    iframe.loading = 'lazy';
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    container.appendChild(iframe);
  }

  function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
  }

  function renderFeed() {
    const container = document.getElementById('substack-feed');
    if (!container) return;

    fetch(FEED_PROXY + encodeURIComponent(SUBSTACK_URL + '/feed'))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.status !== 'ok' || !data.items || data.items.length === 0) return;

        const heading = document.createElement('h3');
        heading.textContent = 'Latest from the newsletter';
        container.appendChild(heading);

        const list = document.createElement('div');
        list.className = 'substack-posts';

        data.items.slice(0, MAX_POSTS).forEach(function (item) {
          const card = document.createElement('a');
          card.className = 'substack-post';
          card.href = item.link;
          card.target = '_blank';
          card.rel = 'noopener';

          const title = document.createElement('h4');
          title.textContent = item.title;

          const date = document.createElement('span');
          date.className = 'substack-post-date';
          date.textContent = new Date(item.pubDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          });

          const excerpt = document.createElement('p');
          const text = stripHtml(item.description);
          excerpt.textContent = text.length > 160 ? text.slice(0, 160).trim() + '…' : text;

          card.appendChild(title);
          card.appendChild(date);
          card.appendChild(excerpt);
          list.appendChild(card);
        });

        container.appendChild(list);

        const more = document.createElement('a');
        more.className = 'substack-more';
        more.href = SUBSTACK_URL;
        more.target = '_blank';
        more.rel = 'noopener';
        more.textContent = 'View all posts on Substack';
        container.appendChild(more);
      })
      .catch(function () {
        // Publication may not exist yet or the feed proxy is unavailable;
        // leave the feed area empty so the page still looks clean.
      });
  }

  function init() {
    renderSignup();
    renderFeed();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
