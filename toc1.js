(function(w,d){

  var script = d.currentScript || d.getElementsByTagName("script")[0],
      name   = "tabbed-toc",
      url    = (script.getAttribute("data-url") || w.location.origin).replace(/\/+$/,""),
      active = +script.getAttribute("data-active") || 0,
      recent = +script.getAttribute("data-recent") || 7;

  var container = d.createElement("div");
  container.className = name;
  container.innerHTML = '<h3 class="'+name+'-title">Tabla de Contenido</h3>'
                      + '<nav class="'+name+'-tabs"></nav>'
                      + '<section class="'+name+'-panels"></section>';

  var nav = container.querySelector("nav"),
      panels = container.querySelector("section");

  // JSONP helper
  function jsonp(src, cb) {
    var id = name + "_" + Date.now();
    w[id] = function(data){ cb(data); delete w[id]; s.remove(); };
    var s = d.createElement("script");
    s.src = src + (src.indexOf("?")>-1?"&":"?") + "alt=json&callback=" + id;
    d.head.appendChild(s);
  }

  // Render categories
  function loadCategories(feed) {
    var cats = (feed.category||[]).map(function(c){ return c.term; }).sort();
    cats.forEach(function(term,i){
      var a = d.createElement("a");
      a.textContent = term;
      a.href = url+"/search/label/"+encodeURIComponent(term);
      a.onclick = function(e){ e.preventDefault(); loadPosts(term); };
      nav.appendChild(a);

      var ol = d.createElement("ol");
      ol.setAttribute("data-term",term);
      panels.appendChild(ol);

      if(i===active){ loadPosts(term); }
    });
  }

  // Render posts by category
  function loadPosts(term) {
    var ol = panels.querySelector('[data-term="'+term+'"]');
    if(!ol) return;
    ol.innerHTML = "<li>Cargando…</li>";
    jsonp(url+"/feeds/posts/summary/-/"+encodeURIComponent(term), function(r){
      var entries = r.feed.entry||[];
      ol.innerHTML = "";
      entries.forEach(function(e,i){
        var link = (e.link||[]).filter(function(l){return l.rel=="alternate";})[0];
        if(!link) return;
        var li = d.createElement("li");
        li.innerHTML = '<a href="'+link.href+'">'+e.title.$t+(i<recent?" <sup>Nuevo!</sup>":"")+'</a>';
        ol.appendChild(li);
      });
    });
  }

  // Init: load main feed to get categories
  jsonp(url+"/feeds/posts/summary", function(r){
    loadCategories(r.feed||{});
    script.parentNode.insertBefore(container,script);
  });

})(window,document);
