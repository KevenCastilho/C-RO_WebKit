/* docs-site — comportamento da documentação (vanilla JS): realce de código, copiar, TOC ativo, busca, inicialização dos exemplos. */
(function () {
  "use strict";
  var R = document.body.getAttribute("data-docs-root") || "";
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  /* realce mínimo: html / css / js */
  function hl(code, lang) {
    var t = code.textContent, out;
    if (lang === "html") {
      out = esc(t).replace(/(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?&gt;)/g, function (m, c, o, n, a, e) {
        if (c) return '<span class="tk-c">' + c + "</span>";
        a = a.replace(/([\w:-]+)(=)(&quot;[^&]*?&quot;|"[^"]*"|'[^']*')/g, '<span class="tk-a">$1</span>$2<span class="tk-s">$3</span>').replace(/(\s)([\w:-]+)(?=\s|$)/g, '$1<span class="tk-a">$2</span>');
        return '<span class="tk-t">' + o + n + "</span>" + a + '<span class="tk-t">' + e + "</span>";
      });
    } else if (lang === "css") {
      out = esc(t).replace(/(\/\*[\s\S]*?\*\/)|([^{}\/;]+)(\{)|([\w-]+)(\s*:)/g, function (m, c, sel, b, p, col) {
        return c ? '<span class="tk-c">' + c + "</span>" : sel ? '<span class="tk-t">' + sel + "</span>" + b : '<span class="tk-n">' + p + "</span>" + col;
      });
    } else if (lang === "js") {
      out = esc(t).replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(const|let|var|function|return|if|else|new|for|of|in|await|async|true|false|null)\b/g, function (m, c, s, k) {
        return c ? '<span class="tk-c">' + c + "</span>" : s ? '<span class="tk-s">' + s + "</span>" : '<span class="tk-k">' + k + "</span>";
      });
    } else return;
    code.innerHTML = out;
  }
  document.querySelectorAll(".bd-code").forEach(function (b) {
    var code = b.querySelector("code"), raw = code.textContent;
    hl(code, b.getAttribute("data-lang"));
    b.querySelector(".bd-copy").addEventListener("click", function (e) {
      var btn = e.currentTarget;
      function ok() { btn.textContent = "Copiado!"; setTimeout(function () { btn.textContent = "Copiar"; }, 1400); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(raw).then(ok, function () { fallback(raw); ok(); });
      else { fallback(raw); ok(); }
    });
  });
  function fallback(t) { var a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); } catch (e) {} a.remove(); }
  /* exemplos: links/forms de brinquedo não navegam; tooltips e popovers do Bootstrap ligam sozinhos */
  document.querySelectorAll(".bd-example").forEach(function (ex) {
    ex.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest('a[href="#"],a[href^="#"]:not([data-bs-toggle])'); if (a && ex.contains(a) && !a.hasAttribute("data-bs-target")) e.preventDefault(); });
    ex.addEventListener("submit", function (e) { e.preventDefault(); });
  });
  /* modal e offcanvas são position:fixed: dentro de uma janela do kit (clip-path = contexto de empilhamento) o fundo escuro ficava por cima deles; vão para o <body> como o Bootstrap recomenda */
  document.querySelectorAll(".modal, .offcanvas, .toast-container").forEach(function (m) { if (m.parentNode !== document.body) document.body.appendChild(m); });
  if (window.bootstrap) {
    document.querySelectorAll('.bd-example [data-bs-toggle="tooltip"]').forEach(function (e) { new bootstrap.Tooltip(e); });
    document.querySelectorAll('.bd-example [data-bs-toggle="popover"]').forEach(function (e) { new bootstrap.Popover(e); });
  }
  /* abrir a página em que já se está recarrega a mesma URL file:// e o Chrome acusa "Unsafe attempt to load URL" (origem file: é única): nesses casos só voltamos ao topo */
  function same(h) { return h.split("#")[0] === location.href.split("#")[0]; }
  function go(h) { if (same(h)) { ul.hidden = true; window.scrollTo(0, 0); } else location.href = h; }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("download") || e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var h = a.getAttribute("href");
    if (h && h.charAt(0) !== "#" && h.indexOf("#") < 0 && same(a.href)) { e.preventDefault(); window.scrollTo(0, 0); }
  });
  /* TOC ativo */
  var links = [].slice.call(document.querySelectorAll(".bd-toc a"));
  if (links.length && "IntersectionObserver" in window) {
    var map = {}; links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { links.forEach(function (a) { a.classList.remove("on"); }); var a = map[en.target.id]; if (a) a.classList.add("on"); } });
    }, { rootMargin: "-56px 0px -70% 0px" });
    document.querySelectorAll(".bd-content h2[id],.bd-content h3[id]").forEach(function (h) { io.observe(h); });
  }
  var act = document.querySelector(".bd-nav a.active"); if (act && act.scrollIntoView && document.querySelector(".bd-side")) { try { act.scrollIntoView({ block: "nearest" }); } catch (e) {} }
  /* busca */
  var q = document.getElementById("bd-q"), ul = document.getElementById("bd-results"), idx = null, loading = false;
  function load(cb) {
    if (idx) return cb();
    if (loading) return; loading = true;
    var s = document.createElement("script"); s.src = R + "assets/search-index.js"; s.onload = function () { idx = window.__DOCS_INDEX || []; cb(); }; document.head.appendChild(s);
  }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function search() {
    var v = norm(q.value.trim()); if (!v) { ul.hidden = true; return; }
    var terms = v.split(/\s+/), res = [];
    idx.forEach(function (p) {
      var t = norm(p.t), h = norm(p.h.join(" ")), x = norm(p.x), sc = 0;
      for (var i = 0; i < terms.length; i++) {
        var w = terms[i], s = (t.indexOf(w) >= 0 ? 10 : 0) + (h.indexOf(w) >= 0 ? 4 : 0) + (x.indexOf(w) >= 0 ? 1 : 0);
        if (!s) { sc = 0; break; } sc += s;
      }
      if (sc) res.push([sc, p]);
    });
    res.sort(function (a, b) { return b[0] - a[0]; });
    ul.innerHTML = res.slice(0, 10).map(function (r) { return '<li class="list-group-item"><a href="' + R + r[1].u + '">' + esc(r[1].t) + "<small>" + esc(r[1].g) + "</small></a></li>"; }).join("") || '<li class="list-group-item">Nada encontrado</li>';
    ul.hidden = false;
  }
  if (q) {
    q.addEventListener("input", function () { load(search); });
    q.addEventListener("keydown", function (e) { if (e.key === "Escape") { ul.hidden = true; q.blur(); } if (e.key === "Enter") { var a = ul.querySelector("a"); if (a) go(a.href); } });
    document.addEventListener("click", function (e) { if (!e.target.closest(".bd-search")) ul.hidden = true; });
    document.addEventListener("keydown", function (e) { if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); q.focus(); } });
  }
  /* voltar ao topo: botão fixo no canto inferior direito, só depois de rolar; data-cro-top = cursor "seta para cima" do kit */
  var up = document.createElement("button"); up.type = "button"; up.className = "cro-btn bd-totop"; up.setAttribute("data-cro-top", ""); up.setAttribute("aria-label", "Voltar ao topo"); up.hidden = true; up.textContent = "↑ Topo";
  document.body.appendChild(up);
  function upShow() { up.hidden = (window.pageYOffset || document.documentElement.scrollTop) < 400; }
  window.addEventListener("scroll", upShow, { passive: true }); upShow();
  up.addEventListener("click", function () { var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; window.scrollTo({ top: 0, behavior: rm ? "auto" : "smooth" }); });
})();
