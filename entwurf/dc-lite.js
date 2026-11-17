/* dc-lite: kleiner Renderer für die Entwurfsseiten (Vorlagen mit {{…}}, sc-for, sc-if) */
(function () {
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g, WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  function lookup(expr, scope) {
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
    var parts = expr.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function text(s, scope) {
    return s.replace(HOLE, function (_, e) { var v = lookup(e, scope); return v == null ? '' : String(v); });
  }
  function attrValue(s, scope) {
    var m = s.match(WHOLE);
    return m ? lookup(m[1], scope) : text(s, scope);
  }

  function build(node, scope, out) {
    if (node.nodeType === 3) { out.push(document.createTextNode(text(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-for') {
      var list = attrValue(node.getAttribute('list') || '', scope) || [], as = node.getAttribute('as') || 'item';
      list.forEach(function (item, i) {
        var s = Object.create(scope); s[as] = item; s.$index = i;
        node.childNodes.forEach(function (c) { build(c, s, out); });
      });
      return;
    }
    if (tag === 'sc-if') {
      if (attrValue(node.getAttribute('value') || '', scope)) node.childNodes.forEach(function (c) { build(c, scope, out); });
      return;
    }
    var el = document.createElementNS(node.namespaceURI, node.localName);
    el.__h = {};
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i], name = a.name;
      if (name.indexOf('hint-') === 0) continue;
      var v = attrValue(a.value, scope);
      if (/^on[a-z]+$/i.test(name)) { if (typeof v === 'function') el.__h[name.slice(2).toLowerCase()] = v; continue; }
      if (v === false || v == null) { if (/^aria-/.test(name)) el.setAttribute(name, 'false'); continue; }
      el.setAttribute(name, v === true ? (/^aria-/.test(name) ? 'true' : '') : String(v));
    }
    var kids = [];
    node.childNodes.forEach(function (c) { build(c, scope, kids); });
    kids.forEach(function (k) { el.appendChild(k); });
    out.push(el);
  }

  function dispatch(e) { var h = e.currentTarget.__h && e.currentTarget.__h[e.type]; if (h) h(e); }
  function bind(el) {
    if (!el.__bound) el.__bound = {};
    Object.keys(el.__h || {}).forEach(function (t) { if (!el.__bound[t]) { el.addEventListener(t, dispatch); el.__bound[t] = true; } });
  }

  function morph(parent, fresh) {
    for (var i = 0; i < fresh.length; i++) {
      var n = fresh[i], o = parent.childNodes[i];
      if (!o) { parent.appendChild(n); bindAll(n); continue; }
      if (o.nodeType !== n.nodeType || (n.nodeType === 1 && (o.localName !== n.localName || o.namespaceURI !== n.namespaceURI))) {
        parent.replaceChild(n, o); bindAll(n); continue;
      }
      if (n.nodeType === 3) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; continue; }
      for (var j = o.attributes.length - 1; j >= 0; j--) { var an = o.attributes[j].name; if (!n.hasAttribute(an)) o.removeAttribute(an); }
      for (var k = 0; k < n.attributes.length; k++) { var at = n.attributes[k]; if (o.getAttribute(at.name) !== at.value) o.setAttribute(at.name, at.value); }
      if (o.localName === 'input' && n.hasAttribute('value') && document.activeElement !== o) o.value = n.getAttribute('value');
      o.__h = n.__h; bind(o);
      morph(o, Array.prototype.slice.call(n.childNodes));
    }
    while (parent.childNodes.length > fresh.length) parent.removeChild(parent.lastChild);
  }
  function bindAll(el) { if (el.nodeType !== 1) return; bind(el); el.querySelectorAll('*').forEach(bind); }

  window.DCLogic = function (props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (o) { Object.assign(this.state, o); if (this.__render) this.__render(); };
  window.DCLogic.prototype.forceUpdate = function () { if (this.__render) this.__render(); };

  window.dcMount = function (Component, tplId, rootId) {
    var tpl = document.getElementById(tplId).content, root = document.getElementById(rootId);
    var comp = new Component({}), pending = false;
    comp.__render = function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var out = [];
        var scope = comp.renderVals();
        tpl.childNodes.forEach(function (c) { build(c, scope, out); });
        morph(root, out);
        if (window.dcAfter) window.dcAfter();
      });
    };
    var out = [], scope = comp.renderVals();
    tpl.childNodes.forEach(function (c) { build(c, scope, out); });
    morph(root, out);
  };
})();
