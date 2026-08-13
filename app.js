let db = null;
let currentClass = null;
let currentNode = null;
const examplesCache = new Map();
let expandedCategories = new Set();
const assetVersion = new URL(document.currentScript.src).searchParams.get("v") || "";

function versionedAsset(path) {
  if (!assetVersion) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${encodeURIComponent(assetVersion)}`;
}

const nav = document.querySelector("#nav");
const search = document.querySelector("#search");
const searchMeta = document.querySelector("#search-meta");
const page = document.querySelector("#page");
const version = document.querySelector("#version");


fetch("data/index.json")
  .then(r => { if (!r.ok) throw new Error(`Failed to load index.json: ${r.status}`); return r.json(); })
  .then(data => { db=data; version.textContent=`Nuke ${data.nuke?.string || ""} · ${data.nodes.length} nodes · schema ${data.schema_version}`; search.addEventListener("input",renderNav); window.addEventListener("popstate",()=>loadFromUrl(false)); loadFromUrl(false); })
  .catch(error => { page.innerHTML=`<pre class="code">${escapeHtml(String(error))}</pre>`; });

function currentRoute() { const url=new URL(window.location.href); return {node:url.searchParams.get("node"),category:url.searchParams.get("category")}; }
function nodeUrl(nodeClass,argName=null) { const url=new URL(window.location.href); url.search=""; url.searchParams.set("node",nodeClass); url.hash=argName?`arg-${argName}`:""; return `${url.pathname}${url.search}${url.hash}`; }
function categoryUrl(categoryPath) { const url=new URL(window.location.href); url.search=""; url.searchParams.set("category",categoryPath); url.hash=""; return `${url.pathname}${url.search}`; }
function homeUrl() { return new URL(window.location.href).pathname; }
function updateUrl(target,replace=false) { history[replace?"replaceState":"pushState"]({},"",target); }
function loadFromUrl(push=false) { const route=currentRoute(); if(route.node&&db.nodes.some(n=>n.class===route.node)) return loadNode(route.node,{push,preserveHash:true}); if(route.category) return renderCategoryPage(route.category,{push}); renderHome({push}); }

function renderHome({push=false}={}) { currentClass=null; currentNode=null; if(push) updateUrl(homeUrl()); renderNav(); const cats=topLevelCategories(); page.innerHTML=`<div class="breadcrumb"><span>Nuke Python Reference</span></div><h1>Nuke Python Reference</h1><div class="description">Browse nodes by category or use search to find node classes, arguments, knob types, values, and descriptions.</div><section class="section"><h2>Categories</h2><div class="category-card-grid">${cats.map(c=>`<a class="category-card" href="${escapeAttr(categoryUrl(c))}"><div class="category-card-title">${escapeHtml(c)}</div><div class="category-card-count">${nodesUnderPath(c).length} nodes</div></a>`).join("")}</div></section>`; }
function renderNav() { if(!db)return; const q=search.value.trim(); q?renderSearchResults(q):renderCategoryTree(); }
function firstPathSegment(path) { return String(path||"").split("/")[0]; }
function topLevelCategories() { return [...new Set(db.nodes.map(n=>firstPathSegment(n.menu_path||n.category||"Uncategorized")).filter(Boolean))].sort((a,b)=>a.localeCompare(b)); }
function nodesUnderPath(path) { const prefix=`${path}/`; return db.nodes.filter(n=>{const m=n.menu_path||""; return m===path||m.startsWith(prefix)||n.category===path;}); }

function renderCategoryTree() { searchMeta.textContent=`${db.nodes.length} nodes`; nav.innerHTML=""; const route=currentRoute(); const routeTop=route.category?firstPathSegment(route.category):null; for(const category of topLevelCategories()) { if(routeTop===category) expandedCategories.add(category); const group=document.createElement("div"); group.className="nav-group"; const row=document.createElement("div"); row.className="nav-category-row"; const toggle=document.createElement("button"); toggle.className="nav-category-toggle"; toggle.textContent=expandedCategories.has(category)?"▾":"▸"; toggle.onclick=e=>{e.stopPropagation(); expandedCategories.has(category)?expandedCategories.delete(category):expandedCategories.add(category); renderCategoryTree();}; const link=document.createElement("a"); link.className="nav-category-link"; link.href=categoryUrl(category); link.textContent=category; link.onclick=e=>{e.preventDefault();expandedCategories.add(category);renderCategoryPage(category,{push:true});}; row.append(toggle,link); group.appendChild(row); if(expandedCategories.has(category)) { const nodes=db.nodes.filter(n=>firstPathSegment(n.menu_path||n.category)===category).sort((a,b)=>a.display_name.localeCompare(b.display_name)); for(const node of nodes) { const b=document.createElement("button"); b.className="nav-button"+(node.class===currentClass?" active":""); b.textContent=node.display_name; b.title=node.display_name===node.class?node.class:`${node.display_name} · ${node.class}`; b.onclick=()=>loadNode(node.class,{push:true}); group.appendChild(b); } } nav.appendChild(group); } }

function includesCI(value, query) {
  return String(value ?? "").toLowerCase().includes(query);
}
function startsCI(value, query) {
  return String(value ?? "").toLowerCase().startsWith(query);
}
function exactCI(value, query) {
  return String(value ?? "").toLowerCase() === query;
}
function firstMatch(values, query, mode = "includes") {
  const fn = mode === "exact" ? exactCI : mode === "starts" ? startsCI : includesCI;
  return (values || []).find(v => fn(v, query));
}
function scoreNode(node, rawQuery) {
  const q = rawQuery.toLowerCase();
  const s = node.search || {};
  let score = 0;
  let reason = "";

  if (exactCI(node.class, q)) return {score: 1000, reason: "Class", value: node.class};
  if (exactCI(node.display_name, q)) return {score: 950, reason: "Node", value: node.display_name};

  let hit = firstMatch(s.names, q, "starts");
  if (hit) return {score: 850, reason: "Node", value: hit};

  hit = firstMatch(s.arguments, q, "exact");
  if (hit) return {score: 800, reason: "Argument", value: hit};

  hit = firstMatch(s.arguments, q, "starts");
  if (hit) return {score: 720, reason: "Argument", value: hit};

  hit = firstMatch(s.values, q, "exact");
  if (hit) return {score: 680, reason: "Value", value: hit};

  hit = firstMatch(s.labels, q, "starts");
  if (hit) return {score: 630, reason: "Label", value: hit};

  hit = firstMatch(s.knob_types, q, "starts");
  if (hit) return {score: 600, reason: "Knob type", value: hit};

  hit = firstMatch(s.python_types, q, "exact");
  if (hit) return {score: 560, reason: "Python type", value: hit};

  hit = firstMatch(s.names, q);
  if (hit) return {score: 520, reason: "Node", value: hit};

  hit = firstMatch(s.arguments, q);
  if (hit) return {score: 480, reason: "Argument", value: hit};

  hit = firstMatch(s.values, q);
  if (hit) return {score: 430, reason: "Value", value: hit};

  hit = firstMatch(s.menu_paths, q);
  if (hit) return {score: 360, reason: "Menu", value: hit};

  if (includesCI(node.description, q)) return {score: 180, reason: "Description", value: rawQuery};

  return {score: 0, reason: "", value: ""};
}
function renderSearchResults(query) { const results=db.nodes.map(node=>({node,...scoreNode(node,query)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.node.display_name.localeCompare(b.node.display_name)).slice(0,100); searchMeta.textContent=`${results.length}${results.length===100?"+":""} results`; nav.innerHTML=""; if(!results.length){nav.innerHTML='<div class="search-result-match">No matches</div>';return;} for(const item of results){const b=document.createElement("button");b.className="search-result";b.innerHTML=`<div class="search-result-name">${escapeHtml(item.node.display_name)}</div><div class="search-result-class">${escapeHtml(item.node.class)} · ${escapeHtml(item.node.category||"Uncategorized")}</div><div class="search-result-match">${escapeHtml(item.reason)}: <strong>${escapeHtml(item.value)}</strong></div>`;b.onclick=()=>loadNode(item.node.class,{push:true});nav.appendChild(b);} }

async function loadExamples(nodeClass) {
  const editorial = window.contentQualityExample?.(nodeClass);
  if (editorial) return {node:{class:nodeClass},status:"EDITORIAL",example_count:1,examples:[editorial]};
  if (window.contentQualitySuppressExamples?.(nodeClass)) return {node:{class:nodeClass},status:"SUPPRESSED",example_count:0,examples:[]};
  if (examplesCache.has(nodeClass)) return examplesCache.get(nodeClass);

  const response = await fetch(versionedAsset(`examples/nodes/${encodeURIComponent(nodeClass)}.json`));

  if (!response.ok) {
    const empty = {node:{class:nodeClass},status:"MISSING",example_count:0,examples:[]};
    examplesCache.set(nodeClass, empty);
    return empty;
  }

  const data = await response.json();
  examplesCache.set(nodeClass, data);
  return data;
}

async function loadNode(nodeClass,{push=false,preserveHash=false}={}) {
  const info=db.nodes.find(n=>n.class===nodeClass);
  if(!info)return;
  if(push)updateUrl(nodeUrl(nodeClass));

  const [nodeResponse, examples]=await Promise.all([
    fetch(`data/${info.file}`),
    loadExamples(nodeClass)
  ]);

  if(!nodeResponse.ok)throw new Error(`Failed to load ${info.file}: ${nodeResponse.status}`);
  const node=await nodeResponse.json();
  node.editorial_examples=examples;

  currentClass=nodeClass;
  currentNode=node;

  const top=firstPathSegment(node.navigation.menu_path||node.navigation.category);
  if(top)expandedCategories.add(top);

  renderNav();
  renderNodePage(node);

  if(preserveHash&&window.location.hash) {
    requestAnimationFrame(()=>{const row=document.querySelector(window.location.hash);row?.closest('details')?.setAttribute('open','');row?.scrollIntoView({block:"start"});});
  } else {
    window.scrollTo({top:0});
  }
}
function pathSegments(path) { const parts=String(path||"").split("/").filter(Boolean); return parts.map((label,i)=>({label,path:parts.slice(0,i+1).join("/")})); }
function nodeCategoryPath(menuPath) { const parts=String(menuPath||"").split("/").filter(Boolean); return parts.length>1 ? parts.slice(0,-1).join("/") : ""; }
function renderBreadcrumb(path,nodeLabel=null) { const parts=[`<a href="${escapeAttr(homeUrl())}" data-home="true">Reference</a>`]; for(const s of pathSegments(path))parts.push(`<a href="${escapeAttr(categoryUrl(s.path))}" data-category-path="${escapeAttr(s.path)}">${escapeHtml(s.label)}</a>`); if(nodeLabel)parts.push(`<span>${escapeHtml(nodeLabel)}</span>`); return `<div class="breadcrumb breadcrumb-links">${parts.join('<span class="crumb-sep">›</span>')}</div>`; }
function attachBreadcrumbHandlers() { page.querySelectorAll('[data-home]').forEach(a=>a.onclick=e=>{e.preventDefault();renderHome({push:true});}); page.querySelectorAll('[data-category-path]').forEach(a=>a.onclick=e=>{e.preventDefault();renderCategoryPage(a.dataset.categoryPath,{push:true});}); }
function childCategoryPaths(parentPath) { const prefix=`${parentPath}/`; const children=new Set(); for(const node of db.nodes){const m=node.menu_path||"";if(!m.startsWith(prefix))continue;const rest=m.slice(prefix.length);const first=rest.split("/")[0];if(first&&rest.includes("/"))children.add(`${parentPath}/${first}`);} return [...children].sort((a,b)=>a.localeCompare(b)); }
function directNodesForCategory(path) { const prefix=`${path}/`; return db.nodes.filter(node=>{const m=node.menu_path||"";if(!m.startsWith(prefix))return false;const rest=m.slice(prefix.length);return rest&&!rest.includes("/");}).sort((a,b)=>a.display_name.localeCompare(b.display_name)); }
function renderCategoryPage(categoryPath,{push=false}={}) {
  const exactLeaf = db.nodes.find(node => node.menu_path === categoryPath);
  if (exactLeaf) {
    return loadNode(exactLeaf.class, {push:true});
  }
  currentClass=null;currentNode=null;if(push)updateUrl(categoryUrl(categoryPath));expandedCategories.add(firstPathSegment(categoryPath));renderNav();const children=childCategoryPaths(categoryPath),direct=directNodesForCategory(categoryPath),all=nodesUnderPath(categoryPath),leaf=categoryPath.split("/").pop();page.innerHTML=`${renderBreadcrumb(categoryPath)}<h1>${escapeHtml(leaf)}</h1><div class="compact-meta">${all.length} nodes in this section</div>${children.length?`<section class="section"><h2>Subcategories</h2><div class="category-card-grid">${children.map(c=>`<a class="category-card" href="${escapeAttr(categoryUrl(c))}" data-category-path="${escapeAttr(c)}"><div class="category-card-title">${escapeHtml(c.split('/').pop())}</div><div class="category-card-count">${nodesUnderPath(c).length} nodes</div></a>`).join("")}</div></section>`:""}<section class="section"><h2>${children.length?"Nodes directly in this category":"Nodes"}</h2>${direct.length?`<div class="node-card-grid">${direct.map(renderNodeCard).join("")}</div>`:'<div class="source-note">No nodes are directly assigned to this level.</div>'}</section>`; attachBreadcrumbHandlers();page.querySelectorAll('[data-node-class]').forEach(a=>a.onclick=e=>{e.preventDefault();loadNode(a.dataset.nodeClass,{push:true});}); }
function renderNodeCard(node) { return `<a class="node-card" href="${escapeAttr(nodeUrl(node.class))}" data-node-class="${escapeAttr(node.class)}"><div class="node-card-title">${escapeHtml(node.display_name)}</div>${node.display_name!==node.class?`<div class="node-card-class">${escapeHtml(node.class)}</div>`:""}<div class="node-card-desc">${escapeHtml(node.description||"")}</div></a>`; }
function displayType(type) {
  return String(type || "")
    .replace(/\blist(?=\[)/gi, "")
    .replace(/\btuple(?=\[)/gi, "")
    .replace(/\s*\|\s*/g, " | ");
}
function renderSynopsis(node) { const order=window.contentQualitySynopsisArguments?.(node.identity.class,node.argument_order)||node.argument_order;const args=order.map(name=>node.arguments[name]).filter(Boolean);const rendered=args.map(arg=>`<span class="synopsis-arg"><a href="${escapeAttr(nodeUrl(node.identity.class,arg.name))}" data-arg="${escapeAttr(arg.name)}">${escapeHtml(arg.name)}</a>=<span>${escapeHtml(displayType(arg.python_type))}</span></span>`).join(", ");return `<div class="synopsis"><span class="syntax-module">nuke</span>.<span class="syntax-function">createNode</span>(<span class="syntax-string">"${escapeHtml(node.identity.class)}"</span>${rendered?", "+rendered:""})</div>`; }
function formatValue(value) {
  if (value === undefined || value === null) return "—";
  if (typeof value === "string") return JSON.stringify(value);
  return JSON.stringify(value);
}
function exampleChips(arg) {
  const values = arg.values?.values || [];
  if (!values.length) return `<span class="source-note">—</span>`;

  const visible = values.slice(0, 8);
  const extra = values.length - visible.length;
  return `<div class="example-values">${
    visible.map(v => `<span class="value-chip">${escapeHtml(formatValue(v))}</span>`).join("")
  }${extra > 0 ? `<span class="value-chip">+${extra} more</span>` : ""}</div>`;
}
function renderArguments(node) { const rows=node.argument_order.map(name=>{const arg=node.arguments[name],url=nodeUrl(node.identity.class,name);return `<div class="argument" id="arg-${escapeAttr(name)}"><div class="arg-name"><a href="${escapeAttr(url)}">${escapeHtml(name)}</a><a class="arg-link" href="${escapeAttr(url)}" title="Link to ${escapeAttr(name)}">#</a></div><div class="arg-type">${escapeHtml(displayType(arg.python_type||arg.knob_type||""))}</div><div class="arg-default">${escapeHtml(formatValue(arg.default?.value))}</div><div class="arg-examples">${exampleChips(arg)}</div><div class="arg-desc">${escapeHtml(arg.description?.text||"")}</div></div>`;}).join("");return `<details class="arguments-rollout"><summary>Arguments <span>${node.argument_order.length}</span></summary><div class="argument-list"><div class="argument header"><div>Argument</div><div>Python type</div><div>Default</div><div>Examples / values</div><div>Description</div></div>${rows}</div></details>`; }
function sanitizeHelpHtml(raw) {
  if (!raw) return "";
  const template = document.createElement("template");
  template.innerHTML = raw;
  const allowed = new Set(["P", "BR", "I", "EM", "B", "STRONG", "CODE"]);

  function clean(parent) {
    for (const child of [...parent.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE) {
        child.remove();
        continue;
      }
      if (!allowed.has(child.tagName)) {
        child.replaceWith(document.createTextNode(child.textContent || ""));
        continue;
      }
      for (const attr of [...child.attributes]) child.removeAttribute(attr.name);
      clean(child);
    }
  }

  clean(template.content);
  return template.innerHTML;
}
function highlightPython(code) {
  const escaped = escapeHtml(code);
  return escaped.split("\n").map(line => {
    const commentIndex = line.indexOf("#");
    let codePart = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
    let commentPart = commentIndex >= 0 ? line.slice(commentIndex) : "";

    const protectedKnobs = [];
    codePart = codePart.replace(/\["([^"]+?)"\]/g, (_, knobName) => {
      const token = `__KNOB_${String.fromCharCode(65 + protectedKnobs.length)}__`;
      protectedKnobs.push(`<span class="syntax-bracket">[</span><span class="syntax-knob">"${knobName}"</span><span class="syntax-bracket">]</span>`);
      return token;
    });

    const protectedStrings = [];
    codePart = codePart.replace(/"([^"]*)"/g, match => {
      const token = `__STR_${String.fromCharCode(65 + protectedStrings.length)}__`;
      protectedStrings.push(`<span class="syntax-string">${match}</span>`);
      return token;
    });

    codePart = codePart.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syntax-number">$1</span>');
    codePart = codePart.replace(/\b(True|False|None|if|else|for|while|in|def|return|import|from|as|try|except|with|lambda|print)\b/g, '<span class="syntax-keyword">$1</span>');
    codePart = codePart.replace(/\bnuke\b/g, '<span class="syntax-module">nuke</span>');
    codePart = codePart.replace(/\b(createNode|setValue|setValueAt|setInput|knobs|keys)\b/g, '<span class="syntax-function">$1</span>');

    protectedKnobs.forEach((markup, index) => {
      codePart = codePart.replace(`__KNOB_${String.fromCharCode(65 + index)}__`, markup);
    });
    protectedStrings.forEach((markup, index) => {
      codePart = codePart.replace(`__STR_${String.fromCharCode(65 + index)}__`, markup);
    });

    if (commentPart) commentPart = `<span class="syntax-comment">${commentPart}</span>`;
    return codePart + commentPart;
  }).join("\n");
}
function renderExamples(node) {
  const dataset=node.editorial_examples||{};
  const examples=dataset.examples||[];

  if(!examples.length) {
    return `<div class="no-examples">No editorial examples are available for this node yet.</div>`;
  }

  return examples.map(example=>`
    <div class="example-item">
      <div class="example-title">${escapeHtml(example.title||"Example")}</div>
      <pre class="code">${highlightPython(example.code||"")}</pre>
    </div>
  `).join("");
}
async function copyCodeText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea=document.createElement("textarea");textarea.value=text;textarea.style.position="fixed";textarea.style.opacity="0";document.body.appendChild(textarea);textarea.select();document.execCommand("copy");textarea.remove();
}
function attachCopyButtons() { page.querySelectorAll(".synopsis, pre.code").forEach(target=>{if(target.closest(".code-copy-wrap"))return;const wrap=document.createElement("div");wrap.className="code-copy-wrap";target.parentNode.insertBefore(wrap,target);wrap.appendChild(target);const button=document.createElement("button");button.type="button";button.className="code-copy-button";button.textContent="Copy";button.setAttribute("aria-label","Copy code");button.onclick=async()=>{try{await copyCodeText(target.innerText);button.textContent="Copied";}catch{button.textContent="Copy failed";}setTimeout(()=>button.textContent="Copy",1400);};wrap.appendChild(button);}); }
function renderNodePage(node) { const cls=node.identity.class,display=node.identity.display_name,category=node.navigation.category||"Uncategorized",menuPath=node.navigation.menu_path||category; page.innerHTML=`${renderBreadcrumb(nodeCategoryPath(menuPath),display)}<h1>${escapeHtml(display)}</h1><div class="class-line">${display!==cls?`Class: ${escapeHtml(cls)} · ${escapeHtml(node.creation.preferred)}`:escapeHtml(node.creation.preferred)}</div><div class="description">${sanitizeHelpHtml(node.description.text||"No description available.")}</div><section class="section"><h2>Synopsis</h2>${renderSynopsis(node)}</section><section class="section"><h2>Creation</h2><div class="creation-grid"><pre class="code">${highlightPython(node.creation.preferred)}</pre></div><div class="compact-meta">Category: ${escapeHtml(category)} · Inputs: ${escapeHtml(node.inputs.minimum)} min / ${escapeHtml(node.inputs.maximum)} max · Nuke ${escapeHtml(node.provenance.nuke_version?.string||"")}</div></section><section class="section">${renderArguments(node)}</section><section class="section"><h2>Examples</h2><div class="examples">${renderExamples(node)}</div></section>`; window.applyContentQuality?.(); attachCopyButtons(); attachBreadcrumbHandlers();page.querySelectorAll('[data-arg]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const arg=a.dataset.arg;updateUrl(nodeUrl(cls,arg));const row=document.getElementById(`arg-${arg}`);row?.closest('details')?.setAttribute('open','');row?.scrollIntoView({block:'start'});})); }
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
