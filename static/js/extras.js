(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const onView = (el, fn) => {
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    }, { threshold: 0.35 });
    io.observe(el);
  };
  function arch(host) {
    const IMG = "static/media/real_fr3_sr/semantic/gistact.jpg", IW = 1440, IH = 1080;
    const R = { cx: 0.513, cy: 0.627 };
    const tok = (x, y, cls, s, label = "") => `<g data-s="${s}"><rect class="tk ${cls}" x="${x}" y="${y}" width="34" height="34" rx="7"/>${label ? `<text class="tkl" x="${x + 17}" y="${y + 22}">${label}</text>` : ""}</g>`;
    const arrow = (d, s, cls = "") => `<path class="ar ${cls}" data-s="${s}" d="${d}" marker-end="url(#ah)"/>`;
    const GX = 16, GY = 12, cells = [];
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
      const dx = (i + 0.5) / GX - R.cx, dy = (j + 0.5) / GY - R.cy, v = Math.exp(-(dx * dx / 5e-3 + dy * dy / 8e-3));
      if (v > 0.1) cells.push(`<rect x="${(i / GX * 180).toFixed(1)}" y="${(j / GY * 135).toFixed(1)}" width="${(180 / GX - 1).toFixed(1)}" height="${(135 / GY - 1).toFixed(1)}" rx="1.5" style="fill-opacity:${(0.22 + 0.68 * v).toFixed(2)}"/>`);
    }
    const cx = R.cx * IW, cy = R.cy * IH;
    host.innerHTML = `<div class="scrollx">
<svg class="archsvg" viewBox="0 0 1000 470" role="img" aria-label="GistAct architecture: a VLM generates Language and Vision states, ends on an answer map, and an action expert that does not read the instruction acts on that answer.">
  <defs>
    <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5L1 9z" class="ahd"/></marker>
    <clipPath id="cpI"><rect width="180" height="135" rx="10"/></clipPath>
    <clipPath id="cpC"><rect width="58" height="44" rx="7"/></clipPath>
  </defs>

  <g data-s="1">
    <text class="lab" x="16" y="30">Camera view</text>
    <g transform="translate(16 40)"><g clip-path="url(#cpI)"><image href="${IMG}" width="180" height="135" preserveAspectRatio="xMidYMid slice"/></g><rect class="frame" width="180" height="135" rx="10"/></g>
    <rect class="box" x="16" y="190" width="180" height="34" rx="9"/><text class="bt" x="106" y="212">Robot state</text>
    <text class="lab" x="16" y="250">Instruction</text>
    <rect class="box" x="16" y="258" width="180" height="58" rx="9"/>
    <text class="q" x="106" y="282">\u201CPick up the one you\u2019d</text><text class="q" x="106" y="301">dip in chocolate.\u201D</text>
  </g>
  ${arrow("M198 108 C222 108 230 150 262 236", 1)}
  ${arrow("M198 207 C222 207 236 222 262 240", 1)}
  ${arrow("M198 287 C300 287 470 300 490 298", 1)}

  <rect class="vlm" x="236" y="214" width="524" height="116" rx="16"/>
  <text class="vt" x="254" y="238">VLM</text>
  ${[0, 1, 2, 3, 4].map((k) => tok(254 + k * 40, 262, "pre", "1 5")).join("")}
  <text class="tn" x="352" y="318" data-s="1 5">images, state, context</text>
  ${[0, 1, 2].map((k) => tok(474 + k * 40, 262, "ins", "1")).join("")}
  <text class="tn" x="531" y="318" data-s="1">instruction</text>
  ${tok(612, 262, "z", "2", "z\u2081")}${tok(656, 262, "z", "3", "z\u2082")}${tok(700, 262, "z end", "4", "END")}
  <text class="ty" x="629" y="318" data-s="2">L</text><text class="ty" x="673" y="318" data-s="3">V</text>
  <path class="fb" data-s="2 3" d="M638 262 C642 246 664 246 668 258" marker-end="url(#ah)"/>
  <path class="fb" data-s="3 4" d="M682 262 C686 246 708 246 712 258" marker-end="url(#ah)"/>

  <g data-s="2">
    <rect class="card2" x="330" y="124" width="270" height="70" rx="12"/>
    <text class="ct" x="344" y="146">Language state, semantic head</text>
    <text class="say" x="344" y="174">\u201CYou dip strawberries in chocolate.\u201D</text>
    <path class="ln" d="M629 262 L629 159 L600 159"/>
  </g>
  <g data-s="3">
    <rect class="card2" x="330" y="40" width="270" height="70" rx="12"/>
    <text class="ct" x="344" y="62">Vision state, region head</text>
    <g transform="translate(344 68)"><g clip-path="url(#cpC)"><svg width="58" height="44" viewBox="${cx - 100} ${cy - 76} 200 152" preserveAspectRatio="xMidYMid slice"><image href="${IMG}" width="${IW}" height="${IH}"/></svg></g><rect class="crop" width="58" height="44" rx="7"/></g>
    <text class="say" x="414" y="96">the strawberry</text>
    <path class="ln" d="M673 262 L673 75 L600 75"/>
  </g>

  <g data-s="4">
    <text class="lab" x="800" y="30">Answer: a goal map</text>
    <g transform="translate(800 40)"><g clip-path="url(#cpI)"><image href="${IMG}" width="180" height="135" preserveAspectRatio="xMidYMid slice" class="dimimg"/><g class="cells">${cells.join("")}</g></g><rect class="frame acc" width="180" height="135" rx="10"/></g>
    <rect class="notebg" x="806" y="153" width="88" height="18" rx="5"/><text class="note" x="850" y="166">illustration</text>
    ${arrow("M734 270 C770 270 776 150 798 132", "4")}
  </g>

  <g data-s="5">
    <rect class="ae" x="800" y="250" width="180" height="62" rx="14"/>
    <text class="aet" x="890" y="276">Action expert</text><text class="aes" x="890" y="297">flow matching</text>
    ${arrow("M890 178 L890 246", "5", "accd")}
    <text class="bias" x="882" y="217" text-anchor="end">attention bias</text>
    <path class="ar" d="M352 330 L352 362 L780 362 L780 296 L796 296" marker-end="url(#ah)"/>
    <text class="tn" x="566" y="382">reads only the tokens before the instruction</text>
    ${arrow("M890 314 L890 396", "5")}
    <rect class="box" x="800" y="400" width="180" height="50" rx="10"/>
    <path class="traj" d="M818 438 C842 438 846 414 870 418 S902 432 920 414"/><circle class="tj" cx="920" cy="414" r="3.5"/>
    <text class="bt" x="946" y="430">actions</text>
  </g>
</svg></div>
<ol class="steps" role="tablist" aria-label="How GistAct works">
  ${["Inputs", "Language state", "Vision state", "Answer", "Act"].map((t, i) => `<li><button type="button" role="tab" data-k="${i + 1}"><i>${i + 1}</i>${t}</button></li>`).join("")}
</ol>
<p class="stepcap" aria-live="polite"></p>`;
    const CAP = ["GistAct has two parts. A VLM thinks in a few latent states and ends on an answer marked in the image. An action expert acts on that answer.", "The VLM reads the camera views, the robot state and the instruction.", "A Language state is supervised with a sentence. Its semantic head predicts the sentence\u2019s SONAR embedding, which SONAR\u2019s decoder can turn back into text.", "A Vision state is supervised with an object\u2019s image region. Its region head predicts where the object is, and the prediction is fed back with the state.", "After END, the answer head marks what to act on: a goal map over the scene view. Think refreshes it every few decisions.", "The action expert never reads the instruction. It reads the images and robot state, and the answer biases its attention toward the marked cells. It predicts an action chunk at every decision."];
    const svg = $(".archsvg", host), cap = $(".stepcap", host), btns = [...host.querySelectorAll(".steps button")];
    let cur = 0, timer = null;
    const show = (k) => {
      cur = k;
      svg.classList.toggle("stepping", k > 0);
      svg.querySelectorAll("[data-s]").forEach((e) => e.classList.toggle("on", k > 0 && e.dataset.s.split(" ").includes(String(k))));
      btns.forEach((b, i) => {
        const on = i + 1 === k;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on);
      });
      cap.textContent = CAP[k];
    };
    btns.forEach((b, i) => b.addEventListener("click", () => {
      clearInterval(timer);
      show(cur === i + 1 ? 0 : i + 1);
    }));
    show(0);
    if (!REDUCED) onView(host, () => {
      let k = 1;
      show(k);
      timer = setInterval(() => {
        k++;
        if (k > 5) {
          clearInterval(timer);
          show(0);
        } else show(k);
      }, 2800);
    });
  }
  const tip = (host) => {
    const t = document.createElement("div");
    t.className = "ctip";
    t.hidden = true;
    host.append(t);
    return { show(ev, html) {
      t.innerHTML = html;
      t.hidden = false;
      const r = host.getBoundingClientRect(), w = t.offsetWidth;
      t.style.left = Math.min(r.width - w - 4, Math.max(4, ev.clientX - r.left + 14)) + "px";
      t.style.top = ev.clientY - r.top + 14 + "px";
    }, hide() {
      t.hidden = true;
    } };
  };
  function latency(host) {
    const G = [["Latent reasoning", [["GistAct", 149.5, 67.8, 1], ["LaRA-VLA", 129.7, 32.4], ["LaST\u2080", 352.2, 10.6], ["Fast-ThinkAct", 413, 8.4]]], ["Explicit reasoning", [["MolmoAct2-Think", 1426.8, 28.1], ["ECoT-Lite (CoT on)", 5530.5, 28.8], ["ERVLA (CoT on)", 15677.6, 26.6]]]];
    const W = 900, L = 170, RC = 92, X0 = 50, X1 = 3e4, rowH = 30, gH = 26, top = 30;
    const x = (ms) => L + (Math.log10(ms) - Math.log10(X0)) / (Math.log10(X1) - Math.log10(X0)) * (W - L - RC - 10);
    const fmt = (ms) => ms < 1e3 ? (ms / 1e3).toFixed(2) + " s" : (ms / 1e3).toFixed(1) + " s";
    let y = top, rows = "";
    for (const [g, list] of G) {
      rows += `<text class="cg" x="0" y="${y + 17}">${g}</text>`;
      y += gH;
      for (const [n, ms, sr, me] of list) {
        rows += `<g class="crow${me ? " me" : ""}" data-t="${esc(n)}: ${fmt(ms)} per decision, RoboSPA success ${sr}%"><rect class="hit" x="0" y="${y}" width="${W}" height="${rowH}"/>
          <text class="cn" x="${L - 12}" y="${y + 20}">${n}</text><rect class="bar" x="${L}" y="${y + 8}" width="${(x(ms) - L).toFixed(1)}" height="14" rx="4"/>
          <text class="cv" x="${(x(ms) + 8).toFixed(1)}" y="${y + 20}">${fmt(ms)}</text><text class="csr" x="${W - 6}" y="${y + 20}">${sr}%</text></g>`;
        y += rowH;
      }
      y += 8;
    }
    const ticks = [100, 1e3, 1e4].map((t) => `<line class="gl" x1="${x(t)}" x2="${x(t)}" y1="${top - 4}" y2="${y - 8}"/><text class="tick" x="${x(t)}" y="${y + 10}">${t / 1e3} s</text>`).join("");
    host.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${y + 18}" role="img" aria-label="Time per decision with reasoning on: GistAct 0.15 s, ERVLA with chain of thought 15.7 s.">
      <text class="ch" x="${W - 6}" y="16" text-anchor="end">RoboSPA success</text>${ticks}${rows}</svg>`;
    hover(host);
  }
  function pertask(host) {
    const D = [["Geometric attribute", [["Blocks area", 62.6, 64.2], ["Blocks height", 54.6, 73.8], ["Blocks length", 65.2, 66.8], ["Blocks size", 48, 69.4]]], ["Spatial distance", [["Blocks", 58.6, 58.8], ["Mixed objects A", 48, 51], ["Mixed objects B", 29.8, 53.4], ["Mugs", 60.8, 63.8], ["Pill bottles", 16.6, 76]]], ["Position index", [["Blocks", 88.4, 96], ["Cups", 22.4, 98.8], ["Mixed objects A", 76, 87.6], ["Mixed objects B", 72.2, 71.4], ["Rubik\u2019s cubes", 89.2, 97]]], ["Referential relation", [["Cans", 47.4, 52.8], ["Mixed objects A", 34.2, 33.6], ["Mixed objects B", 33.6, 36], ["Soaps", 69.6, 71.2], ["Tea box", 49.8, 53]]], ["Cross-view", [["Breads", 64.2, 75], ["Mixed objects A", 40.4, 54.2], ["Mixed objects B", 41, 57], ["Sauce can", 77.2, 89.8], ["Seals", 31, 75.8]]]];
    const W = 900, L = 150, RC = 120, rowH = 22, gH = 26, top = 34, x = (v) => L + v / 100 * (W - L - RC - 16);
    let y = top, rows = "";
    for (const [g, list] of D) {
      rows += `<text class="cg" x="0" y="${y + 17}">${g}</text>`;
      y += gH;
      for (const [n, a, b] of list) {
        const up = b >= a;
        rows += `<g class="crow" data-t="${esc(g)}, ${esc(n)}: answer only ${a}%, GistAct ${b}% (${up ? "+" : ""}${(b - a).toFixed(1)})"><rect class="hit" x="0" y="${y}" width="${W}" height="${rowH}"/>
          <text class="cn" x="${L - 12}" y="${y + 15}">${n}</text>
          <line class="db${up ? "" : " dn"}" x1="${x(a)}" x2="${x(b)}" y1="${y + 11}" y2="${y + 11}"/>
          <circle class="d0" cx="${x(a)}" cy="${y + 11}" r="5"/><circle class="d1" cx="${x(b)}" cy="${y + 11}" r="5.5"/>
          <text class="cv0" x="${W - RC + 44}" y="${y + 15}">${a.toFixed(1)}</text><text class="cv1" x="${W - 6}" y="${y + 15}">${b.toFixed(1)}</text></g>`;
        y += rowH;
      }
      y += 6;
    }
    const ticks = [0, 25, 50, 75, 100].map((t) => `<line class="gl" x1="${x(t)}" x2="${x(t)}" y1="${top - 4}" y2="${y - 6}"/><text class="tick" x="${x(t)}" y="${y + 12}">${t}%</text>`).join("");
    host.innerHTML = `<div class="lgd"><span><i class="k0"></i>Answer-only Think</span><span><i class="k1"></i>GistAct (multi-step Think)</span></div>
      <svg class="chart" viewBox="0 0 ${W} ${y + 20}" role="img" aria-label="RoboSPA success per task: GistAct is higher than answer-only Think on 22 of 24 tasks.">
      <text class="ch" x="${W - RC + 44}" y="16" text-anchor="end">Answer only</text><text class="ch" x="${W - 6}" y="16" text-anchor="end">GistAct</text>${ticks}${rows}</svg>`;
    hover(host);
  }
  function hover(host) {
    host.style.position = "relative";
    const t = tip(host);
    host.querySelectorAll(".crow").forEach((g) => {
      g.addEventListener("pointermove", (ev) => {
        host.querySelectorAll(".crow.hv").forEach((o) => o !== g && o.classList.remove("hv"));
        g.classList.add("hv");
        t.show(ev, esc(g.dataset.t));
      });
      g.addEventListener("pointerleave", () => {
        g.classList.remove("hv");
        t.hide();
      });
    });
  }
  function attn(host) {
    const D = window.GA_ATTN;
    if (!D || !D.length) return;
    const P = [["p", "Think\u2019s answer", "what Think marks"], ["off", "Expert attention, no bias", "\u03B2 = 0"], ["on", "Expert attention, with the answer", "as served"], ["add", "Added by the answer", "on minus off, positive part"]];
    host.innerHTML = `<div class="achips" role="tablist" aria-label="Episode">${D.map((d, i) => `<button type="button" role="tab" data-i="${i}">${esc(d.instr)}</button>`).join("")}</div>
      <div class="apanels">${P.map(([k, t, s]) => `<figure class="ap" data-k="${k}"><canvas width="640" height="480"></canvas><figcaption><b>${t}</b><span>${s}</span><em class="am"></em></figcaption></figure>`).join("")}</div>`;
    const css = getComputedStyle(document.documentElement), hex = (css.getPropertyValue("--mark").trim() || "#a8d65e").replace("#", "");
    const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const imgs = D.map((d) => {
      const im = new Image();
      im.src = d.img;
      return im;
    });
    const draw = (cv, im, g, vmax) => {
      const c = cv.getContext("2d"), W = cv.width, H = cv.height, [gh, gw] = [g.length, g[0].length];
      c.clearRect(0, 0, W, H);
      c.drawImage(im, 0, 0, W, H);
      c.fillStyle = "rgba(10,10,8,.66)";
      c.fillRect(0, 0, W, H);
      for (let r = 0; r < gh; r++) for (let q = 0; q < gw; q++) {
        const v = Math.max(0, g[r][q]) / vmax;
        if (v < 0.06) continue;
        c.fillStyle = `rgba(${rgb},${(0.06 + 0.9 * Math.pow(v, 1.1)).toFixed(3)})`;
        c.fillRect(q * W / gw + 1, r * H / gh + 1, W / gw - 2, H / gh - 2);
      }
    };
    const show = (i) => {
      const d = D[i], im = imgs[i];
      host.querySelectorAll(".achips button").forEach((b, j) => {
        b.classList.toggle("on", j === i);
        b.setAttribute("aria-selected", j === i);
      });
      const add = d.on.map((row, r) => row.map((v, q) => v - d.off[r][q]));
      const mx = (g) => Math.max(...g.flat()), shared = Math.max(mx(d.on), mx(d.off));
      const go = () => host.querySelectorAll(".ap").forEach((f) => {
        const k = f.dataset.k, g = k === "add" ? add : d[k];
        draw($("canvas", f), im, g, k === "p" ? mx(d.p) : k === "add" ? mx(add) : shared);
        $(".am", f).textContent = k === "off" ? `${Math.round(d.mOff * 100)}% on the scene grid` : k === "on" ? `${Math.round(d.mOn * 100)}% on the scene grid` : k === "add" ? `matches the answer, r = ${d.corr.toFixed(2)}` : "";
      });
      im.complete ? go() : im.addEventListener("load", go, { once: true });
    };
    host.querySelectorAll(".achips button").forEach((b) => b.addEventListener("click", () => show(+b.dataset.i)));
    show(0);
  }
  const run = () => {
    const a = $("#arch"), l = $("#latChart"), p = $("#taskChart"), t = $("#attnPanel");
    if (a) arch(a);
    if (l) latency(l);
    if (p) pertask(p);
    if (t) attn(t);
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", run) : run();
})();
