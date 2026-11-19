(() => {
  "use strict";
  const D = window.GA_DATA, OV = window.GA_THINK || {}, GRASP = Object.assign({}, window.GA_GRASP || {}), REALB = window.GA_REALB || {}, FR3 = window.GA_FR3 || {};
  const R2 = window.GA_REAL2 || [], ED2 = window.GA_EDIT2 || [];
  const fr3 = (id, arm) => (FR3[id] || {})[arm] || null;
  const ovOf = (id) => FR3[id.split("/")[0]] && OV["fr3:" + id] || OV[id] || null;
  [...R2, ...ED2].forEach((e) => {
    const o = ovOf(e.id);
    if (o) e.think = Object.assign({}, e.think || {}, o);
  });
  Object.entries(FR3).forEach(([id, x]) => {
    if (x.ours && x.ours.grasp != null) GRASP[id] = x.ours.grasp;
    if (x.edit && x.edit.grasp != null) GRASP[id + "/edit"] = x.edit.grasp;
  });
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const markObj = (t) => esc(t).replace(/\*([^*]+)\*/g, '<em class="obj">$1</em>');
  const clamp = (x) => Math.max(0, Math.min(1, x)), ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const sentence = (s) => s ? (s[0].toUpperCase() + s.slice(1)).replace(/([^.?!])$/, "$1.") : "";
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ACC = "#a6dc4a";
  const readMark = () => {
    ACC = getComputedStyle(document.documentElement).getPropertyValue("--mark").trim() || ACC;
  };
  readMark();
  document.addEventListener("themechange", () => {
    readMark();
    PLAYERS.forEach((p) => p.tick && p.tick(0));
  });
  const byId = (list, id) => list.find((e) => e.id === id);
  const clipOf = (ep, arm) => ep && (fr3(ep.id, arm) || ep.clips.find((c) => c.arm === arm)) || null;
  const blArm = (id, arm) => {
    const f = fr3(id, arm);
    if (f) return f;
    const x = REALB[id];
    return !x ? null : Array.isArray(x) ? x.find((c) => c.arm === arm) || null : x[arm] || null;
  };
  const visible = (node, fn, threshold = 0.2) => new IntersectionObserver((en) => fn(en[0].isIntersecting), { threshold }).observe(node);
  const navA = $$(".nav .links a");
  const secIO = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) navA.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => secIO.observe(s));
  const revIO = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add("in");
      revIO.unobserve(en.target);
    }
  }), { rootMargin: "0px 0px -6% 0px" });
  $$(".rv").forEach((e) => REDUCED ? e.classList.add("in") : revIO.observe(e));
  setTimeout(() => {
    if (!scrollY) $$(".rv").forEach((e) => e.classList.add("in"));
  }, 4e3);
  const RANGE = fetch(location.href, { headers: { Range: "bytes=0-0" }, cache: "no-store" }).then((r) => r.status === 206).catch(() => false);
  const setSrc = (v, url) => {
    v.dataset.want = url;
    return RANGE.then((ok) => ok ? url : fetch(url).then((r) => {
      if (!r.ok) throw r.status;
      return r.blob();
    }).then((b) => URL.createObjectURL(b)).catch(() => url)).then((src) => {
      if (v.dataset.want !== url) {
        if (src.startsWith("blob:")) URL.revokeObjectURL(src);
        return;
      }
      v.src = src;
    });
  };
  const load = (v) => {
    if (!v.getAttribute("src") && !v.dataset.want && v.dataset.src) return setSrc(v, v.dataset.src);
    return Promise.resolve();
  };
  const drop = (v) => {
    const s = v.getAttribute("src") || "";
    delete v.dataset.want;
    v.pause();
    v.removeAttribute("src");
    v.load();
    if (s.startsWith("blob:")) URL.revokeObjectURL(s);
  };
  const play = (v) => {
    v.play().catch(() => {
    });
  };
  const TICKS = new Set();
  let lastT = performance.now(), rafT = 0;
  const step = () => {
    const t = performance.now(), dt = Math.min(100, t - lastT);
    lastT = t;
    TICKS.forEach((f) => f(dt));
  };
  const frame = () => {
    rafT = performance.now();
    step();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  setInterval(() => {
    if (performance.now() - rafT > 120) step();
  }, 40);
  const fitCanvas = (cv) => {
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1), w = Math.round(r.width * d), h = Math.round(r.height * d);
    if (w && (cv.width !== w || cv.height !== h)) {
      cv.width = w;
      cv.height = h;
    }
    return w > 0;
  };
  const cssPx = (ctx) => ctx.canvas.width / (ctx.canvas.clientWidth || ctx.canvas.width);
  function drawMark(ctx, W, H, g, a, bloom = 1, label = "", col = ACC, lw = 2.6) {
    if (!g || a <= 0) return;
    const d = cssPx(ctx), pad = 7 * d, sc = 1 + 0.6 * (1 - bloom), bw = Math.max(2 * (g.rx || 0.04) * W, 18 * d), bh = Math.max(2 * (g.ry || 0.04) * H, 18 * d);
    const w = (bw + 2 * pad) * sc, h = (bh + 2 * pad) * sc, x0 = g.cx * W - w / 2, y0 = g.cy * H - h / 2, L = Math.min(16 * d, Math.min(w, h) * 0.38);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const br = () => {
      ctx.beginPath();
      [[x0, y0, 1, 1], [x0 + w, y0, -1, 1], [x0, y0 + h, 1, -1], [x0 + w, y0 + h, -1, -1]].forEach(([x, y, sx, sy]) => {
        ctx.moveTo(x, y + sy * L);
        ctx.lineTo(x, y);
        ctx.lineTo(x + sx * L, y);
      });
      ctx.stroke();
    };
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = (lw + 2.9) * d;
    br();
    ctx.strokeStyle = col;
    ctx.lineWidth = lw * d;
    br();
    if (label) drawTag(ctx, W, H, x0, y0, h, d, label, col === ACC ? null : col);
    ctx.restore();
  }
  function drawTag(ctx, W, H, x, top, h, d, text, bg = null) {
    ctx.font = `600 ${16 * d}px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;
    const tw = ctx.measureText(text).width, px = 7 * d, bh = 24 * d, lw = tw + 2 * px, up = top - bh - 5 * d;
    const bx = Math.min(W - lw - 4 * d, Math.max(4 * d, x)), by = up >= 4 * d ? up : Math.min(H - bh - 4 * d, top + h + 5 * d);
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, tw + 2 * px, bh, 5 * d) : ctx.rect(bx, by, tw + 2 * px, bh);
    ctx.fillStyle = bg || ACC;
    ctx.fill();
    ctx.fillStyle = bg ? "#fff" : "#0f1600";
    ctx.textBaseline = "middle";
    ctx.fillText(text, bx + px, by + bh / 2 + d);
  }
  const segsOf = (th, grasp, names = []) => !th || !th.goal ? [] : [].concat(th.goal).map((q, i) => ({ t0: i ? q.t || 0 : 0, t1: q.until != null ? q.until : grasp, g: q, name: names[i] || "" }));
  const NAMES = { real_sem26_r0: ["strawberry"], real_pos06_r0: ["corn"], real_rank_indist_7390047_r0: ["tangerine", "tray"], real_sort_indist_7090001_r0: ["grapes", "lemon", "eggplant", "tangerine"], edit2_pos02_r0_lemon: ["strawberry"], "edit2_pos02_r0_lemon/edit": ["lemon"], robolab_lb_XrSmallestItemTask_ep1001: ["lychee", "bowl"], robolab_lb_XrSmallerThanTask_ep0: ["lemon", "lime"] };
  const gripOf = (id) => /^robolab/.test(id) ? { x: 0.655, y: 0.36 } : /^vlabench/.test(id) ? { x: 0.6, y: 0.3 } : /^robospa/.test(id) ? { x: 0.74, y: 0.2 } : { x: 0.67, y: 0.32 };
  const zoomWin = (zo) => {
    const w = 1 / zo.z;
    return { z: zo.z, x0: Math.max(0, Math.min(1 - w, zo.fx - w / 2)), y0: Math.max(0, Math.min(1 - w, zo.fy - w / 2)) };
  };
  const zmap = (Z, r) => {
    if (!Z || !r) return r;
    const o = Object.assign({}, r);
    ["cx", "x"].forEach((k) => {
      if (o[k] != null) o[k] = (o[k] - Z.x0) * Z.z;
    });
    ["cy", "y"].forEach((k) => {
      if (o[k] != null) o[k] = (o[k] - Z.y0) * Z.z;
    });
    ["rx", "ry"].forEach((k) => {
      if (o[k] != null) o[k] *= Z.z;
    });
    return o;
  };
  const gripAt = (g0, goal, grasp, t) => {
    if (!goal || !grasp) return g0;
    const k = ease(t / grasp);
    return { x: g0.x + (goal.cx - g0.x) * k, y: g0.y + (goal.cy - goal.ry - g0.y) * k };
  };
  const cropCss = (c, r, pad = 2.3) => {
    const W = c.w || 640, H = c.h || 480, hw = Math.max(r.rx * W, r.ry * H, 14) * pad, s = Math.min(2 * hw, W, H), L = clamp((r.cx * W - s / 2) / (W - s)), T = clamp((r.cy * H - s / 2) / (H - s));
    return `background-image:url('${c.poster}');background-size:${(W / s * 100).toFixed(1)}% ${(H / s * 100).toFixed(1)}%;background-position:${(L * 100).toFixed(1)}% ${(T * 100).toFixed(1)}%`;
  };
  const glowAt = (t, t1) => t1 == null ? 1 : clamp((t1 - t) / 0.45);
  const E = Infinity, OUT = { real_sem26_r0: { ours: 7.4, base: E, ervla: 12.6, lara: E }, real_pos06_r0: { ours: 7.5, base: E, ervla: E, lara: 5.8 }, real_rank_indist_7390047_r0: { ours: 10.1, base: 5.7, ervla: 12.8, lara: 12.1 }, real_sort_indist_7090001_r0: { ours: 43.2, base: E, ervla: 13.8, lara: 10 }, robolab_lb_XrSmallestItemTask_ep1001: { ours: 20.6, base: 11.4 }, robolab_lb_XrSmallerThanTask_ep0: { ours: 38, base: 43.5 } };
  const PICK = { real_sem26_r0: { t: 5.15, cx: 0.38, cy: 0.81, rx: 0.05, ry: 0.06, name: "eggplant" }, real_pos06_r0: { t: 5.15, cx: 0.4, cy: 0.8, rx: 0.045, ry: 0.06, name: "lemon" }, real_rank_indist_7390047_r0: { t: 4.48, cx: 0.46, cy: 0.59, rx: 0.045, ry: 0.06, name: "apple" }, real_sort_indist_7090001_r0: { t: 6.8, cx: 0.44, cy: 0.62, rx: 0.05, ry: 0.06, name: "cup" }, robospa_s06: { t: 14.6, cx: 0.57, cy: 0.42, rx: 0.07, ry: 0.12, name: "fan" }, robospa_s07: { t: 15.5, cx: 0.32, cy: 0.44, rx: 0.05, ry: 0.07, name: "fries" }, robospa_s01: { t: 17.5, cx: 0.52, cy: 0.34, rx: 0.05, ry: 0.06, name: "bell" }, vlabench_n01: { t: 7.5, cx: 0.44, cy: 0.44, rx: 0.05, ry: 0.08, name: "salad dressing" }, vlabench_n09: { t: 7.6, cx: 0.86, cy: 0.6, rx: 0.05, ry: 0.06, name: "landscape" }, vlabench_n06: { t: 7.5, cx: 0.37, cy: 0.72, rx: 0.09, ry: 0.17, name: "electronics book" }, robolab_lb_XrSmallestItemTask_ep1001: { t: 11, cx: 0.49, cy: 0.54, rx: 0.03, ry: 0.05, name: "Rubik\u2019s cube" }, robolab_lb_XrSmallerThanTask_ep0: { t: 43, cx: 0.51, cy: 0.43, rx: 0.03, ry: 0.05, name: "orange" } };
  const NEED = { real_sem26_r0: "Common sense: which food you dip in chocolate.", real_pos06_r0: "Counting: skip the first object from the left, take the next.", real_rank_indist_7390047_r0: "Comparing sizes: find the biggest fruit, then the next one.", real_sort_indist_7090001_r0: "Categories: fruit or vegetable, for every object.", robospa_s06: "Distance: rank the objects by how far they are from the sauce can.", robospa_s07: "Distance: rank the objects by how far they are from the fan.", robospa_s01: "Viewpoint: front and back are flipped from the robot\u2019s side.", vlabench_n01: "Common sense: the red burger topping is ketchup.", vlabench_n09: "Art knowledge: which painting is cubist.", vlabench_n06: "Book knowledge: which novel is magical realism.", robolab_lb_XrSmallestItemTask_ep1001: "Comparing sizes: the smallest of all the items.", robolab_lb_XrSmallerThanTask_ep0: "Comparing sizes: each fruit against the orange." };
  const ocOn = (v, t1) => (v.currentTime || 0) >= (t1 ?? E) || !!v.dataset.done;
  function scrubber(bar, dur, seek, hold, cur) {
    bar.tabIndex = 0;
    bar.setAttribute("role", "slider");
    bar.setAttribute("aria-label", "Seek");
    const at = (e) => {
      const r = bar.getBoundingClientRect();
      return clamp((e.clientX - r.left) / (r.width || 1)) * dur();
    };
    bar.addEventListener("pointerdown", (e) => {
      if (!dur()) return;
      e.preventDefault();
      try {
        bar.setPointerCapture(e.pointerId);
      } catch (x) {
      }
      bar.classList.add("drag");
      hold(true);
      seek(at(e));
    });
    bar.addEventListener("pointermove", (e) => {
      if (bar.classList.contains("drag")) seek(at(e));
    });
    const up = () => {
      if (!bar.classList.contains("drag")) return;
      bar.classList.remove("drag");
      hold(false);
    };
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((n) => bar.addEventListener(n, up));
    bar.addEventListener("keydown", (e) => {
      const d = dur(), k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d || !k) return;
      e.preventDefault();
      seek(Math.max(0, Math.min(d - 0.1, cur() + k)));
    });
  }
  function vbox(c, { tag = null, me = false, bar = false, oc = null } = {}) {
    const box = el("div", "vbox"), v = document.createElement("video"), cv = document.createElement("canvas"), rate = Math.min(2, c && c.rate || 1);
    Object.assign(v, { muted: true, playsInline: true, preload: "none" });
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.dataset.rate = rate;
    if (c && c.w && c.h) box.style.setProperty("--ar", `${c.w} / ${c.h}`);
    if (c && c.poster) v.poster = c.poster;
    if (c) v.dataset.src = c.src;
    if (c && c.zoom) {
      const Z = zoomWin(c.zoom);
      v.style.transformOrigin = "0 0";
      v.style.transform = `scale(${Z.z}) translate(${-100 * Z.x0}%, ${-100 * Z.y0}%)`;
    }
    box.append(v, cv);
    if (tag) box.append(el("span", "tag" + (me ? " me" : ""), tag));
    if (rate !== 1) box.append(el("span", "tag spd", rate + "\xD7"));
    if (oc) box.append(el("span", "ocb " + oc, oc === "ok" ? "<i>\u2713</i>Success" : "<i>\u2717</i>Fail"));
    const r = { box, v, cv, missing: false, bar: null, res: (on) => box.classList.toggle("oc-" + oc, !!on) };
    if (bar) {
      r.bar = el("div", "bar");
      box.append(r.bar);
      v.addEventListener("timeupdate", () => r.bar.style.setProperty("--p", v.duration ? v.currentTime / v.duration : 0));
    }
    const miss = () => {
      if (r.missing) return;
      r.missing = true;
      v.dataset.done = 1;
      box.classList.add("missing");
      v.dispatchEvent(new Event("missing"));
    };
    if (!c) miss();
    else v.addEventListener("error", miss);
    r.miss = miss;
    return r;
  }
  const T_IN = 350, T_IHOLD = 2e3, T_GLIDE = 550, T_STEP = 1300, T_BLOOM = 500, T_ANS = 1800, T_GAP = 2e3;
  const T_BIRTH = 450, T_DOTS = 250, T_DEC = 300, T_FLY = 450;
  const T_VSTEP = 900;
  const stepMs = (s) => !s.text ? T_VSTEP : Math.max(T_STEP, 700 + 23 * (s.text || "").length) + T_DOTS + T_DEC;
  const backOut = (x) => {
    x = clamp(x);
    const c = 0.8;
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  };
  const diffHtml = (was, now) => {
    const a = was.split(" "), b = now.split(" ");
    let i = 0, j = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
    return `${esc(a.slice(0, i).join(" "))} <s>${esc(a.slice(i, a.length - j).join(" "))}</s> <em>${esc(b.slice(i, b.length - j).join(" "))}</em> ${esc(b.slice(b.length - j).join(" "))}`;
  };
  const mergeLV = (st) => st.reduce((a, s) => {
    const q = a[a.length - 1];
    if (s.kind === "V" && !s.text && q && q.kind === "L" && q.cx == null) a[a.length - 1] = Object.assign({}, q, { kind: "LV", cx: s.cx, cy: s.cy, rx: s.rx, ry: s.ry });
    else a.push(s);
    return a;
  }, []);
  const PLAYERS = window.GA_PLAYERS = new Set();
  const built = () => window.GA_onBuild && window.GA_onBuild();
  function seq(host, { clip, think, grasp = null, instr = null, strip = [], tag = "GistAct", score = null, ctx = {}, cid = null, names = [], duo = null, okT = null, low = false, need = null }) {
    host.innerHTML = "";
    const Zw = clip && clip.zoom ? zoomWin(clip.zoom) : null, th = think || {}, steps = mergeLV(th.steps || []), g0 = zmap(Zw, th.grip || gripOf(ctx.ep || ""));
    const segs = segsOf(th, grasp, names).map((sg) => Object.assign(sg, { g: zmap(Zw, sg.g) }));
    const tI = instr ? T_IHOLD + T_GLIDE : 0;
    const at = [];
    let T = tI;
    steps.forEach((s, i) => {
      at.push(T);
      T += stepMs(s) + (i ? 0 : T_BIRTH);
    });
    const tThink = T, tPre = T + T_ANS;
    const ip = instr ? el("p", "instr", `<q>${esc(instr)}</q>`) : null, iq = ip && $("q", ip);
    if (ip) host.append(ip);
    if (need) host.append(el("p", "need", `<b>What it takes</b>${esc(need)}`));
    const grid = el("div", "pgrid" + (duo ? " duo" : strip.length ? " side" : "")), vb = vbox(clip, { tag: esc(tag) + (score != null ? ` <b>${score.toFixed(1)}%</b>` : ""), me: true, bar: true, oc: "ok" }), pan = el("div", "panel");
    const bl = duo ? vbox(duo.clip, { tag: esc(duo.name), oc: "bad" }) : null;
    if (duo) {
      const L = el("div", "dcol"), Rr = el("div", "dcol");
      L.append(bl.box, el("p", "dout", markObj(duo.note || "")));
      Rr.append(vb.box, el("p", "dout ok", markObj(duo.ok || "")));
      grid.append(L, Rr, pan);
    } else grid.append(vb.box, pan);
    host.append(grid);
    if (cid) pan.gaCid = cid + ".think";
    const ib = instr && !duo ? el("div", "ibeat", `<q>${esc(instr)}</q>`) : null, ibq = ib && $("q", ib);
    if (ib) grid.append(ib);
    let fitW = 0;
    const fitBeat = () => {
      const bx = vb.box;
      Object.assign(ib.style, { left: bx.offsetLeft + "px", top: bx.offsetTop + "px", width: bx.offsetWidth + "px", height: bx.offsetHeight + "px" });
      const w = bx.clientWidth;
      if (!w || w === fitW) return;
      fitW = w;
      ibq.style.transform = "";
      const phone = w < 600, lines = phone ? [2] : [1, 2], hi = phone ? 24 : 34, lo = phone ? 17 : 28;
      const fit = () => {
        for (const n of lines) for (let f = hi; f >= lo; f--) {
          ibq.style.fontSize = f + "px";
          if (ibq.offsetHeight <= n * f * 1.3 + 2) return;
        }
      };
      fit();
    };
    const bub = el("div", "bub"), bin = el("div", "in"), typ = el("span", "typing", "<i></i><i></i><i></i>");
    bub.append(bin, typ);
    const DS = [8, 11, 15], DGAP = 7, NEED2 = DS.reduce((a, d) => a + d, 0) + 4 * DGAP;
    const dots = DS.map((s) => {
      const d = el("span", "td");
      d.style.width = d.style.height = s + "px";
      vb.box.append(d);
      return d;
    });
    vb.box.append(bub);
    const crop = (r) => clip && clip.poster && r && r.cx != null ? `<span class="crop" style="${cropCss(clip, r)}"></span>` : "";
    const bubHtml = (k) => {
      const s = steps[k];
      return `${crop(s)}<div class="tx">${s.text ? `<p>${s.was ? diffHtml(s.was, s.text) : esc(s.text)}</p>` : ""}</div>`;
    };
    const tiles = strip.map((s) => {
      const m = el("div", "tile"), t = vbox(s.clip, { oc: "bad" });
      m.append(t.box, el("div", "nm", `<b>${esc(s.name)}</b>${s.score != null ? `<span>${s.score.toFixed(1)}%</span>` : ""}`), el("p", "", markObj(s.note || "")));
      return { m, t, t1: s.t };
    });
    const st = el("div", "strip n" + tiles.length);
    tiles.forEach((x) => st.append(x.m));
    if (cid && tiles.length) st.gaCid = cid + ".others";
    if (!duo && clip && clip.w && clip.h && clip.w / clip.h < 1.2) {
      vb.box.style.maxWidth = Math.round(560 * clip.w / clip.h) + "px";
      vb.box.style.justifySelf = "center";
    }
    const ctl = el("div", "ctl");
    const rep = el("button", ip ? "srep" : "", "\u21BA Replay");
    rep.type = "button";
    rep.onclick = () => jump(0);
    (ip || ctl).append(rep);
    const prow = el("div", "prow");
    prow.append(ctl);
    pan.append(prow);
    if (tiles.length) pan.append(st);
    const vids = [vb.v, ...bl ? [bl.v] : [], ...tiles.map((x) => x.t.v)];
    const p = { clock: 0, phase: -1, on: false, alive: true, key: "", bkey: "", wait: 0, host, ctx, vids, scrub: false };
    const sync = () => vids.forEach((v) => {
      if (p.on) load(v);
      v.playbackRate = +v.dataset.rate || 1;
      p.phase === 2 && p.on && !p.scrub && !v.dataset.done ? play(v) : v.pause();
    });
    const allDone = () => vids.every((v) => v.dataset.done);
    const finish = () => {
      if (allDone() && !p.wait && p.alive) p.wait = setTimeout(() => {
        p.wait = 0;
        jump(0);
      }, T_GAP);
    };
    vids.forEach((v) => {
      v.addEventListener("ended", () => {
        v.dataset.done = 1;
        finish();
      });
      v.addEventListener("missing", finish);
      v.addEventListener("loadeddata", () => {
        if (p.phase < 2) try {
          v.currentTime = 0;
        } catch (e) {
        }
      });
    });
    const reset = () => {
      clearTimeout(p.wait);
      p.wait = 0;
      p.clock = 0;
      p.phase = -1;
      p.key = "";
      fitW = 0;
      vids.forEach((v) => {
        if (!v.closest(".missing")) delete v.dataset.done;
        v.pause();
        try {
          v.currentTime = 0;
        } catch (e) {
        }
      });
    };
    const startAct = () => {
      p.phase = 2;
      p.clock = tPre;
      sync();
      if (vb.missing) p.wait = p.wait || setTimeout(() => {
        p.wait = 0;
        jump(0);
      }, 4e3);
    };
    function jump(i) {
      reset();
      if (i === 1) {
        p.clock = tI;
        p.phase = 0;
      }
      if (i === 2) {
        p.clock = tThink;
        p.phase = 1;
      }
      if (i === 3) startAct();
      sync();
      render();
    }
    p.seek = (t) => {
      clearTimeout(p.wait);
      p.wait = 0;
      p.phase = 2;
      p.clock = tPre;
      vids.forEach((v) => {
        if (!v.closest(".missing")) delete v.dataset.done;
        try {
          v.currentTime = v.duration ? Math.min(t, v.duration - 0.05) : t;
        } catch (e) {
        }
      });
      sync();
      render();
    };
    scrubber(vb.bar, () => vb.v.duration, p.seek, (on) => {
      p.scrub = on;
      sync();
    }, () => vb.v.currentTime);
    const SM = { l: null, t: null, last: 0, ci: -1, d: dots.map(() => ({})) };
    const keepOut = (BW, BH) => {
      const T2 = $$(".tag", vb.box).filter((t) => t.offsetWidth).map((t) => [t.offsetLeft - 8, t.offsetTop - 8, t.offsetWidth + 16, t.offsetHeight + 16]), R = [];
      const box = (r, up) => {
        const hx = Math.max(r.rx * BW, 14) + 10, hy = Math.max(r.ry * BH, 14) + 10;
        return [r.cx * BW - hx, r.cy * BH - hy - up, 2 * hx, 2 * hy + up];
      };
      steps.forEach((s) => {
        if (s.cx != null) R.push(box(zmap(Zw, s), 0));
      });
      (th.avoid || []).forEach((r) => R.push(box(zmap(Zw, r), 0)));
      const said = steps.map((s) => s.text || "").join(" ").toLowerCase();
      segs.forEach((sg, i) => {
        if (!i || sg.name && said.includes(sg.name.toLowerCase())) R.push(box(sg.g, 34));
      });
      return { T: T2, R };
    };
    const place = (BW, BH, bw, bh, gx, gy) => {
      const m = 16, lift = Math.max(NEED2, BH * 0.08), { T: TG, R } = keepOut(BW, BH), G = [gx - 26, gy - 26, 52, 52], under = Math.max(m, ...$$(".tag", vb.box).map((t) => t.offsetTop + t.offsetHeight + 12));
      const C = (low ? [[gx - bw * 0.5, BH - bh - m - 4], [m, BH - bh - m - 4], [BW - bw - m, BH - bh - m - 4]] : [[gx - bw * 0.8, gy - lift - bh], [gx - bw * 0.2, gy - lift - bh], [gx - bw * 0.8, under], [gx - bw * 0.2, under], [gx - NEED2 - bw, gy - bh * 0.6], [gx + NEED2, gy - bh * 0.6], [gx - bw * 0.8, gy + lift], [gx - bw * 0.2, gy + lift], [m, m], [BW - bw - m, m], [m, BH - bh - m], [BW - bw - m, BH - bh - m]]).map(([l, t]) => [Math.min(BW - bw - m, Math.max(m, l)), Math.min(BH - bh - m, Math.max(m, t))]);
      const ov = (l, t, [x, y, w, h]) => Math.max(0, Math.min(l + bw, x + w) - Math.max(l, x)) * Math.max(0, Math.min(t + bh, y + h) - Math.max(t, y)) / (bw * bh);
      const room = (l, t) => Math.hypot(Math.max(l - gx, 0, gx - l - bw), Math.max(t - gy, 0, gy - t - bh));
      const cost = ([l, t], i) => 300 * TG.reduce((o, r) => o + ov(l, t, r), 0) + 100 * R.reduce((o, r) => o + ov(l, t, r), 0) + 20 * ov(l, t, G) + 50 * clamp(1 - room(l, t) / NEED2) + (t + bh / 2) / BH + Math.hypot(l + bw / 2 - gx, t + bh / 2 - gy) / BW + i * 0.01;
      const cs = C.map(cost);
      let b = cs.indexOf(Math.min(...cs));
      if (SM.ci >= 0 && cs[SM.ci] <= cs[b] + 0.15) b = SM.ci;
      SM.ci = b;
      return C[b];
    };
    function bubble(t, k) {
      const BW = vb.box.clientWidth, BH = vb.box.clientHeight, u = p.clock - tThink;
      if (!(steps.length && BW && (p.phase === 0 || p.phase === 1 && u < T_FLY))) {
        vb.box.classList.remove("thinking");
        bub.style.opacity = 0;
        dots.forEach((d) => {
          d.style.opacity = 0;
        });
        SM.l = null;
        return;
      }
      const now = performance.now(), dt = Math.min(100, now - (SM.last || now)), first = SM.l == null;
      SM.last = now;
      const lag = (ms) => first ? 1 : 1 - Math.exp(-dt / ms), tt = p.clock - tI, fly = p.phase === 1 ? REDUCED ? 1 : ease(u / T_FLY) : 0;
      const s0 = segs[0], gp = gripAt(g0, s0 && s0.g, grasp || s0 && s0.t1, 0), gx = gp.x * BW, gy = gp.y * BH;
      const bw = bub.offsetWidth, bh = bub.offsetHeight;
      if (first) SM.ci = -1;
      const [L, T2] = place(BW, BH, bw, bh, gx, gy);
      if (first) {
        SM.l = L;
        SM.t = T2;
      } else {
        SM.l += (L - SM.l) * lag(140);
        SM.t += (T2 - SM.t) * lag(140);
      }
      const ox0 = gx < SM.l ? -1 : gx > SM.l + bw ? 1 : 0, oy0 = gy < SM.t ? -1 : gy > SM.t + bh ? 1 : 0, cc = ox0 && oy0 ? 9 : 0;
      const ex = ox0 < 0 ? SM.l - 4 + cc : ox0 > 0 ? SM.l + bw + 4 - cc : Math.min(SM.l + bw - 22, Math.max(SM.l + 22, gx)), ey = oy0 < 0 ? SM.t - 4 + cc : oy0 > 0 ? SM.t + bh + 4 - cc : Math.min(SM.t + bh - 12, Math.max(SM.t + 12, gy));
      const back = p.phase === 1 ? clamp(u / 400) : 0, dl = Math.hypot(ex - gx, ey - gy) || 1, sp = Math.max(1, dl / NEED2);
      let acc = DGAP;
      dots.forEach((d, i) => {
        const q = (acc + DS[i] / 2) * sp / dl * (1 - back), X = gx + (ex - gx) * q, Y = gy + (ey - gy) * q, D3 = SM.d[i];
        acc += DS[i] + DGAP;
        if (first || D3.x == null) {
          D3.x = X;
          D3.y = Y;
        } else {
          D3.x += (X - D3.x) * lag(90 + 70 * i);
          D3.y += (Y - D3.y) * lag(90 + 70 * i);
        }
        const pop = REDUCED ? 1 : backOut((tt - i * 120) / 220), sc2 = Math.max(0, pop) * (1 - back);
        d.style.left = D3.x + "px";
        d.style.top = D3.y + "px";
        d.style.opacity = sc2 > 0.02 ? 1 : 0;
        d.style.transform = `translate(-50%,-50%) translateY(${(1 - clamp(pop)) * 8}px) scale(${sc2})`;
      });
      const grow = REDUCED ? 1 : backOut((tt - 360) / 300), D2 = SM.d[2];
      const lt = k > 0 ? p.clock - at[k] : 1e9, bump = REDUCED || lt > 250 ? 1 : 1 - 0.04 * Math.sin(Math.PI * lt / 250), float = REDUCED || fly ? 0 : 2 * Math.sin(now / 1600);
      let tx = 0, ty = float, sc = Math.max(0, grow) * bump, ox = D2.x - SM.l, oy = D2.y - SM.t;
      if (p.phase === 1 && s0) {
        const cx = s0.g.cx * BW, cy = s0.g.cy * BH;
        tx = (cx - SM.l - bw / 2) * fly;
        ty = (cy - SM.t - bh / 2) * fly;
        sc = 1 - 0.88 * fly;
        ox = bw / 2;
        oy = bh / 2;
      }
      bub.style.left = SM.l + "px";
      bub.style.top = SM.t + "px";
      bub.style.transformOrigin = `${ox}px ${oy}px`;
      bub.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`;
      vb.box.classList.add("thinking");
      bub.style.opacity = p.phase === 1 ? 1 - fly * fly : grow > 0.02 ? 1 : 0;
      if (p.phase === 0 && k >= 0) {
        const lc = p.clock - at[k] - (k ? 0 : T_BIRTH), dd = REDUCED ? 1 : ease((lc - T_DOTS) / T_DEC), tx2 = $(".tx", bin), cr = $(".crop", bin);
        typ.style.opacity = REDUCED || lc >= T_DOTS ? 0 : clamp(lc / 120);
        if (tx2) {
          tx2.style.opacity = dd;
          tx2.style.filter = dd < 1 ? `blur(${(1 - dd) * 7}px)` : "";
        }
        if (cr) {
          cr.style.opacity = dd;
          cr.style.filter = dd < 1 ? `blur(${(1 - dd) * 5}px)` : "";
          cr.style.transform = dd < 1 ? `scale(${0.8 + 0.2 * dd})` : "";
        }
      } else typ.style.opacity = 0;
    }
    function render() {
      const t = vb.v.currentTime || 0, u = p.clock - tThink;
      let k = -1, g = 0, bloom = 1, mk = segs.length ? segs[0] : null;
      if (p.phase === 0 && steps.length) {
        k = steps.length - 1;
        while (k > 0 && at[k] > p.clock) k--;
      } else if (p.phase === 1) g = bloom = REDUCED ? 1 : ease((u - (steps.length ? 450 : 0)) / T_BLOOM);
      else if (p.phase === 2) segs.forEach((sg, i) => {
        const gl = Math.min(i ? clamp((t - sg.t0) / 0.4) : 1, glowAt(t, sg.t1));
        if (gl > 0) {
          g = gl;
          mk = sg;
        }
      });
      if (fitCanvas(vb.cv)) {
        const c = vb.cv.getContext("2d"), W = vb.cv.width, H = vb.cv.height;
        c.clearRect(0, 0, W, H);
        const fly = p.phase === 1 ? REDUCED ? 1 : ease(u / T_FLY) : 0, kk = p.phase === 0 ? k : p.phase === 1 && fly < 1 ? steps.length - 1 : -1;
        steps.forEach((s, j) => {
          if (j > kk || s.cx == null) return;
          const dd = REDUCED ? 1 : ease((p.clock - at[j] - (j ? 0 : T_BIRTH) - T_DOTS) / T_DEC);
          drawMark(c, W, H, zmap(Zw, s), (j === kk && p.phase === 0 ? dd : 0.4) * (1 - fly), dd, "", "#eef2ef", 1.8);
        });
        if (g > 0 && mk) drawMark(c, W, H, mk.g, g, bloom, mk.name);
      }
      if (duo) {
        const okT2 = duo.okT ?? (segs.length && segs[0].t1 != null ? segs[0].t1 + 0.3 : Infinity), [dB, dO] = grid.querySelectorAll(".dout");
        const onO = p.phase === 2 && (t >= okT2 || !!vb.v.dataset.done), onB = duo.t == null ? onO : p.phase === 2 && ocOn(bl.v, duo.t);
        dO.classList.toggle("on", onO);
        dB.classList.toggle("on", onB);
        vb.res(onO);
        bl.res(onB);
        if (duo.pick && fitCanvas(bl.cv)) {
          const x = bl.cv.getContext("2d"), W = bl.cv.width, H = bl.cv.height, ct = bl.v.currentTime || 0, k2 = duo.pick, u2 = ct - k2.t + 1;
          const a = p.phase === 2 ? clamp(u2 / 0.3) * clamp((1.9 - u2) / 0.4) : 0;
          x.clearRect(0, 0, W, H);
          drawMark(x, W, H, zmap(duo.clip && duo.clip.zoom ? zoomWin(duo.clip.zoom) : null, k2), a, ease(clamp(u2 / 0.4)), k2.name, getComputedStyle(document.documentElement).getPropertyValue("--bad").trim() || "#ff7b72");
        }
      } else {
        vb.res(p.phase === 2 && ocOn(vb.v, okT));
        tiles.forEach((x) => x.t.res(p.phase === 2 && ocOn(x.t.v, x.t1)));
      }
      if (ib) {
        const u2 = p.phase === -1 ? p.clock : 1e9, k2 = REDUCED ? u2 < T_IHOLD ? 0 : 1 : ease((u2 - T_IHOLD) / T_GLIDE), x = clamp((k2 - 0.8) / 0.2);
        if (u2 < 1e9) fitBeat();
        ib.style.opacity = u2 >= 1e9 ? 0 : (REDUCED ? 1 : ease(u2 / T_IN)) * (1 - x);
        ib.style.setProperty("--band", 1 - k2);
        if (u2 < 1e9 && k2 > 0) {
          ibq.style.transform = "";
          const a = ibq.getBoundingClientRect(), b = iq.getBoundingClientRect(), sc = parseFloat(getComputedStyle(iq).fontSize) / parseFloat(ibq.style.fontSize || 30);
          ibq.style.transform = `translate(${(b.left + b.width / 2 - a.left - a.width / 2) * k2}px, ${(b.top + b.height / 2 - a.top - a.height / 2) * k2}px) scale(${1 + (sc - 1) * k2})`;
        } else ibq.style.transform = "";
        iq.style.opacity = u2 >= 1e9 ? 1 : x;
      }
      if (p.phase === 0 && k >= 0 && "k" + k !== p.bkey) {
        p.bkey = "k" + k;
        bin.innerHTML = bubHtml(k);
      }
      if (p.phase < 0) p.bkey = "";
      bubble(t, k);
    }
    p.tick = (dt) => {
      if (!p.on || !p.alive) return;
      if (p.phase < 2) {
        p.clock += dt;
        if (p.phase === -1 && p.clock >= tI) p.phase = 0;
        if (p.phase === 0 && p.clock >= tThink) p.phase = 1;
        if (p.clock >= tPre) startAct();
      }
      render();
    };
    p.dispose = () => {
      p.alive = false;
      clearTimeout(p.wait);
      TICKS.delete(p.tick);
      PLAYERS.delete(p);
      io.disconnect();
      vids.forEach(drop);
    };
    const io = new IntersectionObserver((en) => {
      p.on = en[0].isIntersecting;
      sync();
    }, { threshold: 0.2 });
    io.observe(host);
    addEventListener("resize", render);
    TICKS.add(p.tick);
    PLAYERS.add(p);
    render();
    sync();
    built();
    return p;
  }
  function chips(host, labels, onPick, groups = null) {
    if (groups) host.classList.add("grouped");
    let box = host;
    const bts = labels.map((n, i) => {
      if (groups && groups[i] !== groups[i - 1]) {
        box = el("div", "grp");
        box.append(el("span", "gname", esc(groups[i])));
        host.append(box);
      }
      const b = el("button", "tab", n);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.onclick = () => {
        pick(i);
        const sc = b.parentElement, l = b.offsetLeft - sc.offsetLeft, r = l + b.offsetWidth, go = (x) => sc.scrollTo({ left: x, behavior: REDUCED ? "auto" : "smooth" });
        if (r > sc.scrollLeft + sc.clientWidth) go(r - sc.clientWidth + 24);
        else if (l < sc.scrollLeft) go(l < 140 ? 0 : l - 24);
      };
      box.append(b);
      return b;
    });
    function pick(i) {
      bts.forEach((b, j) => b.setAttribute("aria-selected", j === i ? "true" : "false"));
      onPick(i);
    }
    if (bts.length) pick(0);
    return pick;
  }
  (() => {
    const v = $("#teaser"), box = v.closest(".teaser"), so = $("source", v);
    v.dataset.src = so.src;
    so.remove();
    v.load();
    const P = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>', Z = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>';
    const ctl = el("div", "tctl", `<button type="button" class="tpp" aria-label="Pause">${Z}</button><div class="tbar"><b></b></div><span class="ttime">0:00</span>`);
    box.append(ctl);
    const pp = $(".tpp", ctl), bar = $(".tbar", ctl), fill = $("b", bar), tm = $(".ttime", ctl), fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    let userPaused = REDUCED, seen = false, wasOn = false;
    const want = () => seen && !userPaused;
    const upd = () => {
      pp.innerHTML = v.paused ? P : Z;
      pp.setAttribute("aria-label", v.paused ? "Play" : "Pause");
    };
    ["play", "pause"].forEach((n) => v.addEventListener(n, upd));
    pp.onclick = () => {
      userPaused = !v.paused;
      if (userPaused) v.pause();
      else load(v).then(() => play(v));
    };
    scrubber(bar, () => v.duration, (t) => {
      try {
        v.currentTime = t;
      } catch (x) {
      }
    }, (on) => {
      if (on) {
        wasOn = !v.paused;
        v.pause();
      } else if (wasOn) play(v);
    }, () => v.currentTime);
    bar.addEventListener("pointerdown", () => load(v), { capture: true });
    TICKS.add(() => {
      const d = v.duration || 0;
      if (!d) return;
      fill.style.width = (100 * v.currentTime / d).toFixed(2) + "%";
      const s = fmt(v.currentTime);
      if (tm.textContent !== s) tm.textContent = s;
    });
    let hide = 0;
    box.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      box.classList.add("show");
      clearTimeout(hide);
      hide = setTimeout(() => box.classList.remove("show"), 3e3);
    });
    visible(v, (on) => {
      seen = on;
      if (want()) load(v).then(() => play(v));
      else v.pause();
    }, 0.3);
    if (REDUCED) load(v);
    upd();
  })();
  const instrOf = (e) => sentence(e.instruction);
  const RACE_F = 2, RACE_FF = 30, RACE_HOLD = 5e3;
  const laneAt = (L, T) => {
    let c = 0, s = 0, k = -1;
    for (const [t, ms] of L.d) {
      if (T < c + t - s) return { k, sim: s + T - c };
      c += t - s;
      s = t;
      k++;
      if (T < c + ms) return { k, think: true, p: (T - c) / ms, sim: s, t0: c };
      c += ms;
    }
    return { k, sim: Math.min(L.dur, s + T - c), done: T >= c + L.dur - s };
  };
  const decSum = (L) => L.d.reduce((a, x) => a + x[1], 0), laneEnd = (L) => L.dur + decSum(L), decEnd = (L) => L.d[L.d.length - 1][0] + decSum(L);
  (() => {
    const RC = window.GA_RACE, host = $("#race");
    if (!RC) {
      host.closest(".sub").hidden = true;
      return;
    }
    const CT = RC.cot, ME = RC.ours, N = CT.d.length, tok1 = CT.d[0][2], tokAll = CT.d.reduce((a, x) => a + x[2], 0);
    const aEnd = laneEnd(CT), bEnd = laneEnd(ME), ffA = bEnd, ffB = decEnd(CT), tEnd = Math.max(aEnd, bEnd);
    const clock = el("div", "clock", '<span class="lab"></span><b></b>'), lab = $(".lab", clock), clk = $("b", clock);
    const lane = (name, sub, c, mine) => {
      const l = el("div", "lane" + (mine ? " me" : "")), vb = vbox(c, { oc: "ok" });
      l.append(el("div", "who", `<b>${name}</b><span class="lab">${sub}</span>`), vb.box, el("p", "st"));
      return { l, vb, v: vb.v, st: $(".st", l) };
    };
    const A = lane("Explicit Reasoning VLA", "writes out its reasoning", CT, false), B = lane("GistAct", "thinks in latent states", ME, true);
    [A.v, B.v].forEach((v) => {
      v.preload = "auto";
    });
    const hold = el("div", "hold", '<div class="hrow"><span class="hl">Reasoning\u2026</span><span class="dk"></span></div><div class="cotov"><p></p></div><div class="hrow tkr"><span class="tk"></span></div><i class="rbar"><b></b></i>');
    const ov = $(".cotov p", hold), dk = $(".dk", hold), tk = $(".tk", hold), rb = $(".rbar b", hold);
    A.vb.box.append(hold);
    const flash = el("span", "tflash");
    B.vb.box.append(flash);
    const num = (n) => n.toLocaleString("en-US");
    host.append(el("p", "instr", `<q>${esc(sentence(RC.instruction))}</q>`), clock, A.l, B.l, el("p", "tot", `Decision time <b>${decSum(CT).toFixed(0)}&nbsp;s</b> vs&nbsp;<b>${decSum(ME).toFixed(1)}&nbsp;s</b> \xB7 Text&nbsp;tokens <b>${num(tokAll)}</b> vs&nbsp;<b>none</b> (latent&nbsp;states)`));
    const fmtC = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
    const done = (s) => "Done in " + (s < 60 ? s.toFixed(1) + " s" : `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`);
    const set = (n, x) => {
      if (n.textContent !== x) n.textContent = x;
    };
    const S = { on: false, T: 0, wait: 0 };
    const seek = (v, t) => {
      if (!v.seeking && Math.abs(v.currentTime - t) > 0.04) try {
        v.currentTime = t;
      } catch (x) {
      }
    };
    const drive = (ln, L, st, ff) => {
      const v = ln.v;
      if (ln.vb.missing) return;
      if (st.done || st.think || ff) {
        if (!v.paused) v.pause();
        seek(v, st.done ? L.dur - 0.05 : ff && st.k >= 0 ? L.d[st.k][0] : st.sim);
        return;
      }
      v.playbackRate = RACE_F;
      if (Math.abs(v.currentTime - st.sim) > 0.35) seek(v, st.sim);
      if (v.paused) play(v);
    };
    const render = () => {
      const T = S.T, ff = T >= ffA && T < ffB, a = laneAt(CT, T), b = laneAt(ME, T);
      set(lab, ff ? `\u25B8\u25B8 ${RACE_FF}\xD7 clock` : `Shared clock \xB7 ${RACE_F}\xD7`);
      clock.classList.toggle("ff", ff);
      set(clk, fmtC(T));
      const first = !!a.think && a.k === 0, on = !a.done && (!!a.think || ff), pg = first ? clamp((T - a.t0) / CT.gen1) : a.think ? a.p : 1;
      const tokens = CT.d.slice(0, Math.max(0, a.k)).reduce((s, x) => s + x[2], 0) + (a.k >= 0 ? Math.round(CT.d[a.k][2] * pg) : 0);
      hold.classList.toggle("lite", !first);
      A.vb.box.classList.toggle("frozen", on);
      set(ov, first ? CT.text1.slice(0, Math.round(CT.text1.length * pg)) : "");
      set(dk, `decision ${Math.max(1, a.k + 1)} / ${N}`);
      set(tk, `${num(first ? Math.round(tok1 * pg) : tokens)} tokens`);
      rb.style.width = (100 * (a.think ? a.p : 1)).toFixed(1) + "%";
      const bd = b.k >= 0 ? ME.d[b.k] : null, since = bd ? T - (ME.d.slice(0, b.k).reduce((s, x) => s + x[1], 0) + bd[0]) : 99;
      if (bd) set(flash, `${bd[2] ? "Think" : "Decision"} \xB7 ${bd[1].toFixed(2)} s`);
      flash.style.opacity = !b.done && since < 2.4 ? 1 : 0;
      set(A.st, T >= aEnd ? done(aEnd) : on ? "Reasoning" : "Moving");
      A.vb.res(T >= aEnd);
      B.vb.res(b.done);
      set(B.st, b.done ? done(bEnd) : b.think ? "Thinking" : "Moving");
      [A, B].forEach((x) => x.st.classList.toggle("done", /^Done/.test(x.st.textContent)));
      return { a, b, ff };
    };
    const reset = () => {
      clearTimeout(S.wait);
      Object.assign(S, { T: 0, wait: 0 });
      [A.v, B.v].forEach((v) => {
        v.pause();
        try {
          v.currentTime = 0;
        } catch (x) {
        }
      });
      render();
    };
    TICKS.add((dt) => {
      if (!S.on || S.wait || ![A.vb, B.vb].every((q) => q.missing || q.v.readyState >= 2)) return;
      const ff = S.T >= ffA && S.T < ffB;
      const lag = !ff && [[A, CT], [B, ME]].some(([ln, L]) => {
        const s = laneAt(L, S.T);
        return !ln.vb.missing && !s.done && !s.think && !ln.v.paused && ln.v.currentTime < s.sim - 0.3;
      });
      if (!lag) S.T = Math.min(tEnd, S.T + (ff ? RACE_FF : RACE_F) * dt / 1e3);
      const r = render();
      drive(A, CT, r.a, r.ff);
      drive(B, ME, r.b, r.ff);
      if (S.T >= tEnd) S.wait = setTimeout(reset, RACE_HOLD);
    });
    reset();
    visible(host, (o) => {
      S.on = o;
      [A.v, B.v].forEach((v) => {
        if (o) load(v);
        else v.pause();
      });
    }, 0.3);
  })();
  const glyphL = (seed) => `<svg class="zg" viewBox="0 0 34 20" aria-hidden="true">${[0.55, 0.9, 0.35, 0.7, 1, 0.45, 0.8, 0.6].map((h, i) => {
    const v = 0.25 + 0.75 * ((h * 7 + seed * 0.37 + i * 0.13) % 1);
    return `<rect x="${(i * 4.4).toFixed(1)}" y="${(20 - 18 * v).toFixed(1)}" width="3" height="${(18 * v).toFixed(1)}" rx="1"/>`;
  }).join("")}</svg>`;
  const glyphV = (hot, n = 4) => `<svg class="zg" viewBox="0 0 22 22" aria-hidden="true">${Array.from({ length: n * n }, (_, i) => `<rect x="${(i % n * 5.6).toFixed(1)}" y="${(Math.floor(i / n) * 5.6).toFixed(1)}" width="4.6" height="4.6" rx="1" opacity="${hot.includes(i) ? 1 : 0.22}"/>`).join("")}</svg>`;
  const zchip = (kind, i, hot = []) => `<span class="zc ${kind}">${kind === "L" ? glyphL(i) : glyphV(hot)}<b>z<sub>${i}</sub></b><span class="k">${kind}</span></span>`;
  (() => {
    const host = $("#fig"), e = byId(R2, "real_pos06_r0"), c = e ? clipOf(e, "ours") : null, poster = c ? c.poster : "", ans = e && e.think ? [].concat(e.think.goal || [])[0] : null;
    const Z = [{ kind: "L", text: "I need the second object from the left." }, { kind: "L", text: "This lemon on the left is first." }, { kind: "V", cx: 0.384, cy: 0.785, rx: 0.037, ry: 0.065, hot: [9, 13] }, { kind: "L", text: "This corn next to it is second." }, { kind: "V", cx: 0.497, cy: 0.733, rx: 0.036, ry: 0.062, hot: [10, 14] }, { kind: "L", text: "So I want the corn." }];
    const ZV = Z.filter((s) => s.kind === "V");
    (e && e.think && e.think.steps || []).filter((s) => s.kind === "V").slice(0, ZV.length).forEach((s, i) => Object.assign(ZV[i], { cx: s.cx, cy: s.cy, rx: s.rx, ry: s.ry }));
    const col = (cls, lab, html) => el("div", "col " + cls, `<div class="lab">${lab}</div>${html}`);
    const img = (cls) => `<div class="img ${cls}"><img src="${poster}" alt=""><canvas></canvas></div>`;
    const rows = Z.map((s, i) => `<div class="zr" style="grid-row:${i + 1}">${zchip(s.kind, i + 1, s.hot)}</div><i class="dar" style="grid-row:${i + 1}"></i><div class="dz" style="grid-row:${i + 1}">${s.kind === "V" && c ? `<span class="crop" style="${cropCss(c, s)}"></span>` : ""}${s.text ? `<span>${s.text.length <= 20 ? esc(s.text).replace(/ /g, "&nbsp;") : esc(s.text)}</span>` : ""}</div>`).join("");
    const cols = [col("cin", "Input", img("in") + '<p class="q">\u201CPick up the second object from the left.\u201D</p>'), col("cth", "Think", `<div class="zgrid"><div class="dbox" style="grid-row:1/${Z.length + 1}"><span class="dtag">decoded for inspection</span></div>${rows}</div>`), col("cans", "Answer", img("out") + '<p class="q">The target, marked in the image.</p>'), col("cact", "Act", '<div class="img av"><video muted playsinline preload="none" aria-label="GistAct grasping the corn"></video></div><p class="q">0.15 s per decision</p>')];
    cols.forEach((x, i) => {
      host.append(x);
      if (i < 3) host.append(el("div", "arr", "\u2192"));
    });
    const zr = $$(".zr", host), dar = $$(".dar", host), dz = $$(".dz", host), cIn = $(".in canvas", host), cOut = $(".out canvas", host), A = ans || { cx: 0.5, cy: 0.5 };
    const cAns = $(".cans", host), cAct = $(".cact", host), dbox = $(".dbox", host), arr2 = host.children[3];
    const fend = el("span", "zc A fend", "<b>END</b>"), rep = el("button", "srep frep", "\u21BA Replay");
    rep.type = "button";
    host.append(fend, rep);
    const at = [];
    let T = 300;
    Z.forEach((s) => {
      at.push(T);
      T += stepMs(s);
    });
    const tE = T, tFly = tE + 650, tLand = tFly + T_FLY, tAct = tLand + T_ANS, tEnd = tAct + 400;
    const S = { on: false, t: REDUCED ? tEnd : -1, armed: false };
    const v = $(".av video", host);
    const canvas = (cv, fn) => {
      if (fitCanvas(cv)) {
        const x = cv.getContext("2d");
        x.clearRect(0, 0, cv.width, cv.height);
        fn(x, cv.width, cv.height);
      }
    };
    const style = (n, o) => Object.assign(n.style, o);
    const paint = () => {
      const t = Math.max(0, S.t);
      if (t >= tEnd) {
        [...zr, ...dar, ...dz, cAns, cAct, arr2].forEach((n) => n && style(n, { opacity: "", transform: "", clipPath: "", filter: "" }));
        fend.style.opacity = 0;
        canvas(cIn, () => {
        });
        canvas(cOut, (x, W, H) => drawMark(x, W, H, ans, 1, 1, NAMES.real_pos06_r0[0]));
        return;
      }
      Z.forEach((s, i) => {
        const u2 = t - at[i], pop = backOut(u2 / 250), dr = ease((u2 - 150) / 250), un = ease((u2 - 350) / 450);
        style(zr[i], { opacity: clamp(u2 / 120), transform: `scale(${0.6 + 0.4 * Math.max(0, pop)})` });
        style(dar[i], { clipPath: `inset(-8px ${(1 - dr) * 100}% -8px 0)` });
        style(dz[i], { opacity: un > 0 ? 1 : 0, clipPath: `inset(-6px ${(1 - un) * 100}% -6px 0)`, filter: un < 1 ? `blur(${(1 - un) * 6}px)` : "" });
      });
      const dim = (k) => 0.28 + 0.72 * k, fly = ease((t - tFly) / T_FLY), land = ease((t - tLand + 100) / T_BLOOM);
      style(cAns, { opacity: dim(ease((t - tFly) / 400)) });
      style(cAct, { opacity: dim(ease((t - tAct) / 400)) });
      canvas(cIn, (x, W, H) => Z.forEach((s, i) => {
        if (s.kind !== "V") return;
        const u2 = t - at[i] - 350, nx = i + 1 < Z.length ? at[i + 1] : tE;
        drawMark(x, W, H, s, clamp(u2 / 300) * (t < nx ? 1 : 0.45) * (1 - fly), ease(u2 / T_BLOOM), "", "#eef2ef", 1.8);
      }));
      canvas(cOut, (x, W, H) => drawMark(x, W, H, ans, land, land, NAMES.real_pos06_r0[0]));
      const hr = host.getBoundingClientRect(), one = arr2 && arr2.offsetWidth && matchMedia("(max-width:760px)").matches, a = (one ? arr2 : dbox).getBoundingClientRect(), o = $(".out", host).getBoundingClientRect();
      const x0 = a.left + a.width / 2 - hr.left, y0 = (one ? a.top + a.height / 2 : a.bottom) - hr.top, x1 = o.left + A.cx * o.width - hr.left, y1 = o.top + A.cy * o.height - hr.top;
      const u = t - tE, ep = backOut(u / 250);
      style(fend, { opacity: u < 0 ? 0 : clamp(u / 120) * (1 - clamp((fly - 0.7) / 0.3)), transform: `translate(-50%,-50%) translate(${x0 + (x1 - x0) * fly}px,${y0 + (y1 - y0) * fly}px) scale(${Math.max(0, ep) * (1 - 0.5 * fly)})` });
      if (one) arr2.style.opacity = u >= 0 && fly < 1 ? 0 : "";
    };
    const vplay = () => {
      if (S.on && S.t >= tEnd && c) load(v).then(() => {
        v.playbackRate = +v.dataset.rate;
        if (!REDUCED) play(v);
      });
      else v.pause();
    };
    TICKS.add((dt) => {
      if (!S.on || S.t < 0 || S.t >= tEnd) return;
      S.t = Math.min(tEnd, S.t + dt);
      paint();
      if (S.t >= tEnd) vplay();
    });
    const start = () => {
      S.t = 0;
      v.pause();
      paint();
    };
    rep.onclick = start;
    new IntersectionObserver((en) => {
      S.on = en[0].isIntersecting;
      if (S.on && !S.armed && !REDUCED) {
        S.armed = true;
        setTimeout(start, 500);
      }
      vplay();
    }, { threshold: 0.35 }).observe(host);
    $$("img", host).forEach((im) => im.addEventListener("load", paint));
    addEventListener("resize", paint);
    document.addEventListener("themechange", paint);
    paint();
    if (c) {
      const g = c.grasp != null ? c.grasp : GRASP[e.id] || 4, t0 = Math.max(0, g - 2.2), t1 = Math.min(c.dur || g + 2, g + 2);
      v.poster = poster;
      v.dataset.src = c.src;
      v.dataset.rate = Math.min(2, c.rate || 1);
      const go = () => {
        try {
          v.currentTime = t0;
        } catch (x) {
        }
      };
      v.addEventListener("loadedmetadata", go);
      v.addEventListener("timeupdate", () => {
        if (v.currentTime >= t1) go();
      });
      v.addEventListener("ended", () => {
        go();
        play(v);
      });
    }
  })();
  (() => {
    const host = $("#trainFig");
    if (!host) return;
    const e = byId(R2, "real_pos06_r0"), c = e ? clipOf(e, "ours") : null, crop = (r) => c ? `<span class="crop" style="${cropCss(c, r)}"></span>` : "";
    const grid = (hot, n) => `<span class="gm" style="--n:${n}">${Array.from({ length: n * n }, (_, i) => `<i${hot.includes(i) ? ' class="h"' : ""}></i>`).join("")}</span>`;
    const row = (state, target, tname, how, src) => `<div class="tr"><div class="ts">${state}</div><i class="tl">\u2248</i><div class="tg">${target}<span><b>${tname}</b><small>${how}</small></span></div><i class="tl">\u2190</i><div class="tsrc">${src}</div></div>`;
    host.innerHTML = '<div class="thd"><span>Think state</span><i></i><span>is trained to match</span><i></i><span>built from</span></div>' + row(zchip("L", 1), glyphL(9), "SONAR sentence embedding", "frozen SONAR encoder", "<q>Count the objects from the left.</q>") + row(zchip("V", 2, [9, 13]), grid([9, 13], 4), "Image region", "fed back as pooled frozen DINOv2 features", crop({ cx: 0.384, cy: 0.785, rx: 0.037, ry: 0.065 }) + "<span>the lemon\u2019s region</span>") + row('<span class="zc A"><b>END</b><span class="k">answer</span></span>', grid([20, 21, 26, 27], 6), "Goal map", "read out by the answer head", crop({ cx: 0.497, cy: 0.733, rx: 0.036, ry: 0.062 }) + "<span>the target\u2019s cell</span>") + '<p class="tfoot">At run time the states stay latent. A frozen SONAR decoder turns L states into sentences, and V states are drawn as regions, only for inspection.</p>';
  })();
  const TRACK = { Semantic: "Semantic", Position: "Position", Rank: "Size rank", Sort: "Sort" };
  const OKS = { real_sem26_r0: "Lifts the *strawberry*.", real_pos06_r0: "Lifts the *corn*.", real_rank_indist_7390047_r0: "Puts the *tangerine* on the tray.", real_sort_indist_7090001_r0: "Sorts all four: fruits in the bowl, vegetables on the tray." };
  const FAILS = { real_sem26_r0: { base: "Lifts the *eggplant*.", ervla: "Lifts the *red apple*.", lara: "Knocks over the strawberry, *lifts nothing*." }, real_pos06_r0: { base: "Lifts the *lemon*, the first one.", ervla: "Stops at the corn, *lifts nothing*.", lara: "Lifts the *grapes*." }, real_rank_indist_7390047_r0: { base: "Lifts the biggest fruit, the *apple*.", ervla: "Puts the *apple* on the tray.", lara: "Puts the tangerine *in the bowl*." }, real_sort_indist_7090001_r0: { base: "Puts the *cup* on the tray.", ervla: "Sorts the lemon, *then stops*.", lara: "Puts the lemon *on the tray*." } };
  (() => {
    const tracks = [0, 2, 1, 3].map((i) => R2[i]).filter(Boolean), host = $("#realPlayer"), avg = (m) => {
      const r = D.real.rows.find((x) => x.m === m);
      return r ? r.y[4] : null;
    };
    let cur = null;
    chips($("#realTabs"), tracks.map((e) => esc(TRACK[e.group] || e.group)), (i) => {
      const e = tracks[i];
      if (cur) cur.dispose();
      const strip = [["ERVLA", "ERVLA", blArm(e.id, "ervla"), "ervla"], ["LaRA", "LaRA-VLA", blArm(e.id, "lara"), "lara"]].map(([name, m, clip, arm]) => ({ name, clip, score: avg(m), note: (FAILS[e.id] || {})[arm] || "", t: (OUT[e.id] || {})[arm] }));
      const oc = OUT[e.id] || {}, duo = { name: "\u03C00.5", clip: clipOf(e, "base"), note: (FAILS[e.id] || {}).base || "", t: oc.base, ok: OKS[e.id] || "", okT: oc.ours, pick: PICK[e.id] };
      cur = seq(host, { clip: clipOf(e, "ours"), think: e.think, grasp: GRASP[e.id], instr: instrOf(e), strip, duo, need: NEED[e.id], ctx: { ep: e.id, task: TRACK[e.group] }, cid: "real", names: NAMES[e.id] });
    });
  })();
  (() => {
    const G0 = window.GA_RLB, RLB = (!G0 ? [] : Array.isArray(G0) ? G0 : Object.entries(G0).map(([id, r]) => Object.assign({ id }, r))).map((r, i) => {
      const C = r.clips || {}, arm = (...k) => {
        for (const x of k) {
          const c = C[x] || r[x];
          if (c) return typeof c === "string" ? { src: c } : c;
        }
        return null;
      };
      const ours = arm("gistact", "ours"), base = arm("pi05", "base"), o = r.pi05_outcome || r.pi05Outcome || base && (base.outcome_text || base.note) || r.outcome || "";
      const think = r.think || (r.steps || r.goal ? { steps: r.steps || [], goal: r.goal, avoid: r.avoid } : OV[r.id] || null);
      const oc = OUT[r.id] || {};
      return ours && { label: r.label || (r.short ? "RoboLab: " + r.short : "RoboLab " + (i + 1)), x: { id: r.id, clip: ours, think, ok: r.ok, okT: oc.ours, grasp: r.grasp ?? ours.grasp ?? null, instr: sentence(r.instruction || ""), strip: base ? [{ name: "\u03C00.5", clip: base, note: sentence(o), t: oc.base }] : [] } };
    }).filter(Boolean);
    const S2 = (window.GA_SIM2 || []).map((r) => [r.bench, r.label, { id: r.id, clip: r.clips.ours, think: { steps: r.steps, goal: r.goal, grip: r.grip }, ok: r.ok, okT: r.ok_t, grasp: r.grasp ?? null, instr: r.instruction, names: r.names, strip: r.clips.base ? [{ name: r.base_name, clip: r.clips.base, note: r.base_outcome, t: r.base_t }] : [] }]);
    const cap = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;
    const SIMS = [...S2.filter((x) => x[0] === "RoboSPA"), ...S2.filter((x) => x[0] === "VLABench"), ...RLB.filter((r) => r.x.strip.length).slice(0, 2).map((r) => ["RoboLab", cap(r.label.replace(/^RoboLab:\s*/, "").replace(/^the /, "").replace(" the ", " ")), r.x])];
    const host = $("#simPlayer");
    let cur = null, tablePick = null;
    chips($("#simTabs"), SIMS.map((s) => esc(s[1])), (i) => {
      const x = SIMS[i][2], tk = { RoboSPA: 0, VLABench: 1 }[SIMS[i][0]];
      if (tablePick && tk != null) tablePick(tk);
      $("#simTable").hidden = tk == null;
      if (cur) cur.dispose();
      const b0 = x.strip[0], names = x.names || NAMES[x.id] || [], nm2 = names[0];
      cur = seq(host, Object.assign({}, x, { ctx: { ep: x.id, task: SIMS[i][0] + ": " + SIMS[i][1] }, cid: "sim", low: true, names, need: NEED[x.id], strip: b0 ? [] : x.strip, duo: b0 ? Object.assign({ ok: x.ok || (nm2 ? `Picks the *${nm2}*.` : "Succeeds."), okT: x.okT, pick: PICK[x.id] }, b0) : null }));
    }, SIMS.map((s) => s[0]));
    const TABLES = { "RoboSPA spatial-24": { "groups": ["Geometric attribute", "Spatial distance", "Position index", "Referential relation", "Cross-view", "Overall"], "sub": ["SR", "ONTA"], "rows": [{ "g": "No reasoning" }, { "m": "MolmoAct2", "v": ["36.2", "8.1", "33.8", "15.8", "36.3", "24.1", "22.8", "\u22129.5", "30.8", "10.3", "32.0", "9.8"] }, { "m": "\u03C00.5", "v": ["50.6", "30.8", "42.3", "27.3", "28.5", "14.7", "31.5|u", "5.5|u", "48.9", "33.7", "40.4", "22.4"] }, { "m": "X-VLA", "v": ["36.8", "10.8", "37.2", "20.4", "18.9", "3.2", "22.6", "\u22128.0", "45.6", "29.8", "32.2", "11.2"] }, { "m": "Pointing-VLA", "v": ["52.2|u", "32.4|u", "44.8", "30.8", "29.2", "16.1", "31.1", "4.1", "56.7|u", "43.9|u", "42.8|u", "25.4|u"] }, { "g": "Explicit reasoning" }, { "m": "ECoT-Lite\xA7", "v": ["22.6", "\u22129.7", "36.7", "20.1", "34.9", "23.8", "14.4", "\u221220.8", "31.5", "11.3", "28.0", "4.9"] }, { "m": "ECoT-Lite (CoT on)", "v": ["20.0", "\u221213.1", "38.1", "21.7", "37.9|u", "27.0|u", "15.2", "\u221220.2", "32.6", "12.6", "28.8", "5.6"] }, { "m": "ERVLA\xA7", "v": ["22.7", "\u221211.0", "46.2|u", "32.3|u", "34.5", "21.0", "24.1", "\u22127.0", "41.8", "24.7", "33.9", "12.0"] }, { "m": "ERVLA (CoT on)", "v": ["20.5", "\u221214.5", "34.6", "17.0", "29.8", "15.3", "16.8", "\u221218.3", "31.5", "11.5", "26.6", "2.2"] }, { "m": "MolmoAct2-Think", "v": ["30.1", "\u22120.9", "33.8", "15.9", "34.3", "21.5", "22.2", "\u22129.6", "20.0", "\u22123.4", "28.1", "4.7"] }, { "g": "Latent reasoning" }, { "m": "Fast-ThinkAct", "v": ["7.1", "\u221234.7", "15.9", "\u22127.2", "10.2", "\u22128.1", "4.5", "\u221236.6", "4.4", "\u221223.4", "8.4", "\u221222.0"] }, { "m": "LaRA-VLA", "v": ["31.0", "1.8", "44.7", "30.1", "36.3", "23.8", "18.2", "\u221215.3", "32.1", "12.5", "32.4", "10.6"] }, { "m": "LaST0", "v": ["13.1", "\u221225.7", "16.6", "\u22125.8", "12.0", "\u22126.0", "2.8", "\u221238.7", "8.3", "\u221218.4", "10.6", "\u221218.9"] }, { "m": "GistAct", "v": ["68.6|b", "57.6|b", "60.6|b", "50.5|b", "90.2|b", "88.6|b", "49.3|b", "30.0|b", "70.4|b", "61.5|b", "67.8|b", "57.6|b"], "me": 1 }] }, "VLABench": { "groups": ["In-distribution", "Cross-category", "Common sense", "Semantic instruction", "Unseen texture", "Overall"], "sub": ["SR", "PS", "IS"], "rows": [{ "g": "No reasoning" }, { "m": "MolmoAct2", "v": ["58.2", "69.0", "76.8", "35.6", "50.4", "61.1|b", "30.4", "44.1", "56.8", "38.2", "49.9", "64.8", "54.4", "67.1", "75.4", "43.4", "56.1", "67.0"] }, { "m": "\u03C00.5", "v": ["43.6", "60.2", "66.6", "29.4", "44.9", "58.0", "26.0", "42.0", "52.2", "28.0", "46.9", "60.5", "37.2", "54.1", "62.7", "32.8", "49.6", "60.0"] }, { "m": "X-VLA", "v": ["53.6", "71.2", "83.4|b", "20.9", "27.2", "34.6", "29.0", "46.3", "62.6|u", "44.2", "63.1", "75.6|b", "44.2", "61.2", "77.2|u", "38.4", "53.8", "66.7"] }, { "m": "Pointing-VLA", "v": ["47.8", "60.7", "66.0", "35.9", "47.1", "57.8", "29.0", "42.8", "49.2", "34.8", "51.2", "60.6", "40.0", "55.9", "65.8", "37.5", "51.5", "59.9"] }, { "g": "Explicit reasoning" }, { "m": "ECoT-Lite\xA7", "v": ["47.2", "65.8", "78.6", "28.8", "43.8", "60.3|u", "28.1", "43.9", "57.9", "35.7", "53.4", "67.5", "46.9", "63.6", "77.2|u", "37.3", "54.1", "68.3"] }, { "m": "ECoT-Lite (CoT on)", "v": ["51.2", "67.2", "77.6", "31.0", "44.7", "57.0", "31.1", "46.8", "56.9", "31.7", "49.6", "68.5", "49.5", "64.3", "76.9", "38.9", "54.5", "67.4"] }, { "m": "ERVLA\xA7", "v": ["63.0", "77.3", "81.4|u", "50.2|u", "60.4|u", "59.8", "34.0", "49.6", "55.4", "47.4", "61.3", "70.2", "57.6", "73.5|u", "78.8|b", "50.4", "64.4", "69.1|b"] }, { "m": "ERVLA (CoT on)", "v": ["62.6", "77.8|u", "80.2", "51.3|b", "62.1|b", "60.2", "36.4", "50.9", "56.0", "52.8|u", "66.2|u", "71.8", "60.4|u", "74.9|b", "77.0", "52.7|u", "66.4|u", "69.0|u"] }, { "m": "MolmoAct2-Think", "v": ["63.4|u", "76.2", "79.2", "27.6", "42.7", "53.7", "39.6|u", "51.3|u", "54.8", "43.8", "57.1", "67.2", "58.8", "72.4", "78.8|b", "46.6", "59.9", "66.7"] }, { "g": "Latent reasoning" }, { "m": "Fast-ThinkAct", "v": ["19.6", "38.3", "64.0", "8.0", "22.5", "37.7", "11.8", "28.9", "53.1", "15.2", "33.8", "58.2", "13.0", "33.0", "58.8", "13.5", "31.3", "54.4"] }, { "m": "LaRA-VLA", "v": ["43.8", "63.1", "77.6", "21.3", "37.5", "48.9", "16.8", "33.5", "47.8", "15.2", "33.1", "54.4", "20.2", "38.1", "58.4", "23.5", "41.1", "57.4"] }, { "m": "LaST0", "v": ["21.2", "44.5", "65.6", "11.7", "27.8", "42.4", "9.2", "27.9", "49.0", "3.0", "13.8", "29.0", "8.2", "23.7", "45.4", "10.7", "27.5", "46.3"] }, { "m": "GistAct", "v": ["70.8|b", "79.7|b", "76.6", "39.0", "45.5", "47.8", "53.6|b", "62.6|b", "64.5|b", "68.0|b", "76.9|b", "73.5|u", "65.6|b", "74.9|b", "74.2", "59.4|b", "67.9|b", "67.3"], "me": 1 }] } };
    const cell = (v, ov, gs) => {
      const [x, m] = v.split("|");
      return `<td class="${[m === "b" ? "best" : m === "u" ? "sec" : "", ov ? "ov" : "", gs ? "gs" : ""].join(" ").trim()}">${x ? esc(x) : "n/a"}</td>`;
    };
    const ABBR = { SR: "Success rate (%)", ONTA: "Object-normalized target accuracy (%)", PS: "Progress score", IS: "Intention score" };
    const NOTES = { "RoboSPA spatial-24": "SR: success rate. ONTA: object-normalized target accuracy, SR corrected for chance given the number of candidate objects. Overall is the average over categories.", VLABench: "SR: success rate. PS: progress score, which credits partly completed tasks. IS: intention score, which credits moving toward the intended object. Overall is the average over tracks." };
    const nm = (m) => esc(m).replace("\xA7", "<sup>\xA7</sup>").replace("(CoT on)", "(CoT on)<sup>\u2020</sup>").replace("\u03C00.5", "\u03C0<sub>0.5</sub>").replace("LaST0", "LaST<sub>0</sub>");
    const tableHtml = (t) => {
      const n = t.sub.length, N = 1 + n * t.groups.length, ovAt = n * (t.groups.length - 1);
      return `<div class="tscroll"><table class="res big"><thead><tr><th rowspan="2">Method</th>${t.groups.map((g, i) => `<th colspan="${n}" class="gh gs${i === t.groups.length - 1 ? " ov" : ""}">${esc(g)}</th>`).join("")}</tr><tr>${t.groups.map((g, i) => t.sub.map((x, j) => `<th class="${[i === t.groups.length - 1 ? "ov" : "", j ? "" : "gs"].join(" ").trim()}"><abbr title="${ABBR[x] || ""}">${esc(x)}</abbr></th>`).join("")).join("")}</tr></thead><tbody>` + t.rows.map((r) => r.g ? `<tr class="grp"><td colspan="${N}">${esc(r.g)}</td></tr>` : `<tr class="${r.me ? "me" : ""}"><td>${nm(r.m)}</td>${r.v.map((v, j) => cell(v, j >= ovAt, j % n === 0)).join("")}</tr>`).join("") + "</tbody></table></div>";
    };
    const tw = $("#simTable");
    tw.innerHTML = '<div class="tabs ttabs" role="tablist" aria-label="Results table"></div><div class="tbody"></div><p class="tnote"><span class="tdef"></span> Bold: best. Underlined: second. <sup>\xA7</sup> Reasoning disabled at test time; CoT-on rows reason at every decision. <sup>\u2020</sup> ERVLA (CoT on) is the Explicit Reasoning VLA in the videos.</p>';
    tablePick = chips($(".ttabs", tw), Object.keys(TABLES).map(esc), (i) => {
      $(".tbody", tw).innerHTML = tableHtml(Object.values(TABLES)[i]);
      $(".tdef", tw).textContent = NOTES[Object.keys(TABLES)[i]];
      const sc = $(".tscroll", tw), end = () => sc.classList.toggle("end", sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4);
      sc.addEventListener("scroll", end, { passive: true });
      end();
    });
  })();
  (() => {
    const e = byId(ED2, "edit2_pos02_r0_lemon"), host = $("#steerPlayer");
    if (!e || !host) return;
    const thA = ovOf(e.id) || {}, thB = ovOf(e.id + "/edit") || {}, stB = (thB.steps || []).find((s) => s.was);
    if (!stB) return;
    const a = stB.was.split(" "), b = stB.text.split(" ");
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    const pre = esc(a.slice(0, i).join(" ")), post = esc(a.slice(i + 1).join(" "));
    const C = [{ lab: "As is", html: `${pre} <mark>${esc(a[i])}</mark> ${post}`, clip: clipOf(e, "ours"), goal: [].concat(thA.goal || [])[0], name: NAMES[e.id][0], grasp: GRASP[e.id] }, { lab: "Edited", html: `${pre} <s>${esc(a[i])}</s> <em>${esc(b[i])}</em> ${post}`, clip: clipOf(e, "edit"), goal: [].concat(thB.goal || [])[0], name: NAMES[e.id + "/edit"][0], grasp: GRASP[e.id + "/edit"] }];
    const instr = sentence(e.instruction), ip = el("p", "instr", `<q>${esc(instr)}</q>`);
    const rep = el("button", "srep", "\u21BA Replay");
    rep.type = "button";
    ip.append(rep);
    const duo = el("div", "duo2");
    duo.gaCid = "analysis.steer.think";
    C.forEach((c) => {
      c.col = el("div", "col2" + (c.lab === "Edited" ? " ed" : ""));
      c.vb = vbox(c.clip, { bar: true });
      c.out = el("p", "sout", "\u2713 Picks the " + esc(c.name) + ".");
      c.col.append(el("p", "th1", `<span class="lab">Think \xB7 ${c.lab}</span><span class="ln">${c.html}</span>`), c.vb.box, c.out);
      duo.append(c.col);
    });
    host.append(ip, duo);
    const T_A = T_IHOLD + 500, T_P = T_A + 1800, vids = C.map((c) => c.vb.v);
    const p = { clock: 0, phase: -1, on: false, wait: 0, host, ctx: { ep: e.id, task: "Steering" }, vids };
    const sync = () => vids.forEach((v) => {
      if (p.on) load(v);
      v.playbackRate = +v.dataset.rate || 1;
      p.phase === 2 && p.on && !v.dataset.done ? play(v) : v.pause();
    });
    const restart = () => {
      clearTimeout(p.wait);
      p.wait = 0;
      p.clock = 0;
      p.phase = -1;
      vids.forEach((v) => {
        delete v.dataset.done;
        v.pause();
        try {
          v.currentTime = 0;
        } catch (x) {
        }
      });
      sync();
    };
    vids.forEach((v) => v.addEventListener("ended", () => {
      v.dataset.done = 1;
      if (vids.every((q) => q.dataset.done) && !p.wait) p.wait = setTimeout(restart, T_GAP);
    }));
    rep.onclick = restart;
    C.forEach((c) => scrubber(c.vb.bar, () => c.vb.v.duration, (t) => {
      clearTimeout(p.wait);
      p.wait = 0;
      p.phase = 2;
      p.clock = T_P;
      vids.forEach((v) => {
        delete v.dataset.done;
        try {
          v.currentTime = v.duration ? Math.min(t, v.duration - 0.05) : t;
        } catch (x) {
        }
      });
      sync();
    }, (on) => {
      p.hold = on;
    }, () => c.vb.v.currentTime));
    TICKS.add((dt) => {
      if (!p.on) return;
      if (p.phase < 2) {
        p.clock += dt;
        p.phase = p.clock < T_A ? -1 : p.clock < T_P ? 1 : 2;
        if (p.phase === 2) sync();
      }
      const u = p.clock;
      C.forEach((c) => {
        const t = c.vb.v.currentTime || 0, g = p.phase === 1 ? REDUCED ? 1 : ease((u - T_A) / T_BLOOM) : p.phase === 2 ? glowAt(t, c.grasp) : 0;
        if (fitCanvas(c.vb.cv)) {
          const x = c.vb.cv.getContext("2d");
          x.clearRect(0, 0, c.vb.cv.width, c.vb.cv.height);
          drawMark(x, c.vb.cv.width, c.vb.cv.height, c.goal, g, p.phase === 1 ? g : 1, c.name);
        }
        c.out.classList.toggle("on", p.phase === 2 && (t >= c.grasp + 0.3 || !!c.vb.v.dataset.done));
      });
    });
    PLAYERS.add(p);
    visible(host, (o) => {
      p.on = o;
      sync();
    }, 0.2);
  })();
  $("#copyBib").addEventListener("click", (ev) => {
    navigator.clipboard && navigator.clipboard.writeText($("#bib").textContent);
    ev.target.textContent = "Copied";
    setTimeout(() => ev.target.textContent = "Copy", 1500);
  });
})();
