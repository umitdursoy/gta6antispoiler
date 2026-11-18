(function() {
  chrome.storage.sync.get(['gtaProtectionEnabled'], function(result) {
    const isEnabled = result.gtaProtectionEnabled !== false;
    if (!isEnabled) return;

    // "GTA 6", "GTA VI", "Grand Theft Auto 6" ve "Grand Theft Auto VI" (boşluk, tire, alt çizgi varyasyonlarıyla) yakalar
    const gta6Regex = /(?:grand[\s\-_]*theft[\s\-_]*auto|gta)[\s\-_]*(6|vi)\b/i;

    // YouTube (Video + Shorts), Google, Reddit ve genel site ana kapsayıcıları
    const cardSelectors = [
      // YouTube Video ve Shorts Kartları (Güncel + Klasik)
      'ytd-rich-item-renderer',
      'ytd-video-renderer',
      'ytd-compact-video-renderer',
      'ytd-grid-video-renderer',
      'ytd-reel-item-renderer',
      'ytm-shorts-lockup-view-model',
      'ytm-shorts-lockup-view-model-v2',
      'yt-lockup-view-model',
      'ytd-playlist-renderer',
      'ytd-radio-renderer',

      // Google Arama Sonuçları
      'div.MjjYud',
      'div.N54PNb',
      'div.tF2Cxc',
      'div.g',
      'div.ULSxyf',
      'div.hlcw0c',
      'g-card',

      // Reddit
      'shreddit-post',
      'div.thing',
      'div[data-testid="post-container"]',

      // DuckDuckGo ve Genel Web
      'article[data-testid="result"]',
      'article',
      '.post',
      '.card'
    ].join(',');

    function hideContainer(el) {
      const youtubeWrapper = el.closest(
        'ytd-rich-item-renderer, ytm-shorts-lockup-view-model-v2, ytm-shorts-lockup-view-model, ytd-reel-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, yt-lockup-view-model'
      );
      const googleWrapper = el.closest('div.MjjYud, div.N54PNb, div.g, div.ULSxyf, g-card');
      
      const mainCard = youtubeWrapper || googleWrapper || el.closest(cardSelectors) || el.closest('li, tr, section') || el;

      const forbiddenIds = ['rso', 'search', 'contents', 'primary', 'page-manager'];
      if (mainCard && !forbiddenIds.includes(mainCard.id) && mainCard.tagName !== 'BODY' && mainCard.tagName !== 'YTD-APP') {
        if (!mainCard.dataset.gtaHidden) {
          mainCard.style.setProperty('display', 'none', 'important');
          mainCard.dataset.gtaHidden = 'true';
        }
      }
    }

    function hideTargetElements() {
      // 1. Doğrudan kartları tara
      document.querySelectorAll(cardSelectors).forEach(card => {
        if (card.dataset.gtaHidden) return;

        const hasMatchInText = gta6Regex.test(card.innerText || '');
        const hasMatchInCardAttr = gta6Regex.test(card.getAttribute('aria-label') || '');
        
        const hasMatchInChild = Array.from(card.querySelectorAll('a, img, h3, span, yt-formatted-string')).some(child => 
          gta6Regex.test(child.getAttribute('href') || '') || 
          gta6Regex.test(child.getAttribute('title') || '') ||
          gta6Regex.test(child.getAttribute('alt') || '') ||
          gta6Regex.test(child.getAttribute('aria-label') || '')
        );

        if (hasMatchInText || hasMatchInCardAttr || hasMatchInChild) {
          hideContainer(card);
        }
      });

      // 2. Serbest linkler, başlıklar ve aria-label etiketleri üzerinden ana kartı bul
      document.querySelectorAll('a, h1, h2, h3, h4, span, yt-formatted-string').forEach(el => {
        if (el.dataset.gtaHidden) return;

        const href = el.getAttribute('href') || '';
        const title = el.getAttribute('title') || '';
        const ariaLabel = el.getAttribute('aria-label') || '';

        if (
          (el.children.length === 0 && gta6Regex.test(el.innerText || '')) || 
          gta6Regex.test(href) || 
          gta6Regex.test(title) ||
          gta6Regex.test(ariaLabel)
        ) {
          hideContainer(el);
        }
      });
    }

    const observer = new MutationObserver(() => {
      hideTargetElements();
    });

    if (document.body) {
      hideTargetElements();
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        hideTargetElements();
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  });
})();