/*! Tabbed TOC for Blogger (simplified ES6) */

((win, doc) => {
  const q2o = win.q2o;

  // Helpers
  const $ = (tag, html = "", attrs = {}) => {
    const el = doc.createElement(tag);
    if (html) el.innerHTML = html;
    Object.entries(attrs).forEach(([k, v]) => v !== false && el.setAttribute(k, v));
    return el;
  };

  const on = (el, ev, fn) => el.addEventListener(ev, fn);
  const off = (el, ev, fn) => el.removeEventListener(ev, fn);

  const insert = (parent, el, before = null) => el && parent.insertBefore(el, before);
  const remove = el => el?.parentNode?.removeChild(el);

  const canon = (url, ext = "") =>
    (url + "").split(/[?&#]/)[0].replace(/\/+$/, "").replace(/\.[\w-]+$/, ext ? "." + ext : "");

  const blogger = url =>
    /^\d+$/.test(url)
      ? `https://www.blogger.com/feeds/${url}/posts/summary`
      : canon(url) + "/feeds/posts/summary";

  const param = (o, sep = "&") =>
    "?" + Object.entries(o).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join(sep);

  // Core vars
  const script = doc.currentScript;
  const loc = win.location;
  const storage = win.localStorage;
  const defaults = {
    name: "tabbed-toc",
    url: loc.origin,
    css: true,
    sort: 1,
    active: 0,
    ad: true,
    load: 0,
    recent: 7,
    query: { alt: "json", orderby: "published", "max-results": 9999, "start-index": 1 },
    text: {
      title: "Table of Content",
      loading: "Loading…",
      recent: "<sup>New!</sup>",
      months: "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
      days: "Sun Mon Tue Wed Thu Fri Sat".split(" ")
    }
  };

  let settings = { ...defaults, ...q2o(script.src) };

  // Main container
  const container = $("div", `<h3 class="${settings.name}-title">${settings.text.title}</h3>`, {
    class: `${settings.name} ltr`,
    id: `${settings.name}:${Date.now()}`
  });

  const nav = $("nav", "", { class: `${settings.name}-tabs` });
  const panels = $("section", "", { class: `${settings.name}-panels` });
  insert(container, nav);
  insert(container, panels);

  // Load JSONP
  const jsonp = (url, cb) => {
    const id = settings.name + "-jsonp-" + Date.now();
    win[id] = data => {
      cb(data);
      delete win[id];
      remove(s);
    };
    const s = $("script", "", { src: url + (url.includes("?") ? "&" : "?") + "callback=" + id });
    insert(doc.head, s);
  };

  // Render categories
  const renderCategories = feed => {
    const cats = feed.category || [];
    cats.sort((a, b) => a.term.localeCompare(b.term));
    if (settings.sort === -1) cats.reverse();

    cats.forEach((cat, i) => {
      const term = cat.term;
      const tab = $("a", term, {
        class: `${settings.name}-tab`,
        href: canon(settings.url) + "/search/label/" + encodeURIComponent(term),
        "data-term": term
      });
      on(tab, "click", e => {
        e.preventDefault();
        renderPosts(term);
      });
      insert(nav, tab);
      insert(panels, $("ol", "", { class: `${settings.name}-panel`, "data-term": term }));
    });

    // Auto-click active tab
    const active = cats[settings.active]?.term;
    if (active) renderPosts(active);
  };

  // Render posts by category
  const renderPosts = term => {
    const panel = panels.querySelector(`[data-term="${term}"]`);
    if (!panel) return;
    panel.innerHTML = `<p>${settings.text.loading}</p>`;
    jsonp(blogger(settings.url) + "/-/" + encodeURIComponent(term) + param(settings.query), data => {
      const entries = data.feed?.entry || [];
      panel.innerHTML = "";
      entries.forEach((entry, i) => {
        const url = entry.link.find(l => l.rel === "alternate")?.href;
        if (!url) return;
        const li = $("li",
          `<h5><a href="${url}">${entry.title.$t}${i < settings.recent ? settings.text.recent : ""}</a></h5>`
        );
        insert(panel, li);
      });
    });
  };

  // Inject CSS
  if (settings.css && !doc.getElementById(settings.name + "-css")) {
    insert(doc.head, $("link", "", {
      id: settings.name + "-css",
      rel: "stylesheet",
      href: canon(script.src, "css")
    }));
  }

  // Fire init
  jsonp(blogger(settings.url) + param(settings.query), data => {
    renderCategories(data.feed || {});
    script.parentNode.insertBefore(container, script);
  });

})(window, document);
