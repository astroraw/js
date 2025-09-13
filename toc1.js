(function(win, doc) {

  const script = doc.currentScript;
  const loc = win.location;
  const storage = win.localStorage;

  const defaults = {
    // ... (rest of the default settings)
  };

  const queryStringParser = win.q2o;

  // Usa Object.assign o el operador spread para fusionar configuraciones
  let settings = Object.assign({}, defaults, queryStringParser(script.src));

  // O con operador spread
  // let settings = { ...defaults, ...queryStringParser(script.src) };

  // Simplificación de funciones auxiliares
  const el = (ement, content, attr) => {
    const element = doc.createElement(ement);
    if (content) {
      element.innerHTML = content;
    }
    if (attr) {
      for (const i in attr) {
        if (attr[i] === false) continue;
        element.setAttribute(i, attr[i]);
      }
    }
    return element;
  };

  const on = (el, ev, fn) => el.addEventListener(ev, fn);

  // ... (otras funciones como detach, param, blogger, etc. se simplifican de forma similar)

  const fire = () => {
    if (!script.id) {
      script.id = settings.name + '-js';
    }
    script.classList.add(settings.name + '-js');

    // Carga del CSS, si se prefiere mantener la carga externa
    const { css, container: c, name, url } = settings;
    if (css && !doc.getElementById(name + '-css')) {
      load(typeof css === 'string' ? css : canon(script.src, 'css'), () => {
        // ...
      }, {
        class: name + '-css',
        id: name + '-css'
      });
    }

    // Carga de categorías
    load(blogger(url) + param({ ...settings.query, callback: `_${fn}` }), () => {
      // ...
    });
  };

  // ... (rest of the code)

})(window, document);
