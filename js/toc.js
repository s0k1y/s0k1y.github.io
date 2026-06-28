// 文章标题编号(根据实际层级,从最小层级开始为 1)
document.addEventListener('DOMContentLoaded', function () {
  var headings = document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5, .post-body h6');
  if (headings.length) {
    var minLevel = 6;
    headings.forEach(function (h) {
      var lv = parseInt(h.tagName[1]);
      if (lv < minLevel) minLevel = lv;
    });
    var counters = [0, 0, 0, 0, 0, 0];
    headings.forEach(function (h) {
      var idx = parseInt(h.tagName[1]) - 1;
      counters[idx]++;
      for (var i = idx + 1; i < 6; i++) counters[i] = 0;
      var parts = [];
      for (var j = minLevel - 1; j <= idx; j++) parts.push(counters[j]);
      h.setAttribute('data-number', parts.join('.') + '.');
    });
  }
});

// 文章目录滚动高亮与点击跳转
document.addEventListener('DOMContentLoaded', function () {
  var contentArea = document.querySelector('.content-area');
  var tocSidebar = document.querySelector('.toc-sidebar');
  if (!contentArea || !tocSidebar) return;

  var links = Array.prototype.slice.call(tocSidebar.querySelectorAll('.toc-link'));
  if (!links.length) return;

  var items = links.map(function (link) {
    var href = link.getAttribute('href');
    if (!href || href[0] !== '#') return null;
    var h = document.getElementById(decodeURIComponent(href.slice(1)));
    return h ? { heading: h, link: link, parent: link.parentElement } : null;
  }).filter(Boolean);
  if (!items.length) return;

  function updateActive() {
    var cTop = contentArea.getBoundingClientRect().top;
    var current = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].heading.getBoundingClientRect().top - cTop < 80) {
        current = items[i];
      } else {
        break;
      }
    }
    items.forEach(function (it) { it.parent.classList.remove('active'); });
    var target = current || items[0];
    target.parent.classList.add('active');
    // TOC 内滚动让当前项可见
    var lr = target.link.getBoundingClientRect();
    var sr = tocSidebar.getBoundingClientRect();
    if (lr.top < sr.top + 20 || lr.bottom > sr.bottom - 20) {
      tocSidebar.scrollTop += (lr.top - sr.top) - (sr.height - lr.height) / 2;
    }
  }

  var ticking = false;
  contentArea.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () { updateActive(); ticking = false; });
      ticking = true;
    }
  });

  // 点击跳转(相对于 content-area 滚动)
  tocSidebar.addEventListener('click', function (e) {
    var link = e.target.closest('.toc-link');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href[0] !== '#') return;
    e.preventDefault();
    var h = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!h) return;
    var cRect = contentArea.getBoundingClientRect();
    contentArea.scrollTop += h.getBoundingClientRect().top - cRect.top - 20;
  });

  updateActive();
});
