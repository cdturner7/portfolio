/*
 *******************************************************************************
 * Project: Portfolio Website  -  IntelliJ-styled shell behaviour
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
(function () {
    "use strict";

    var DEFAULT_FILE = "README.md";
    var LINE_HEIGHT = 21;

    var LS = {
        tabs: "ide.openTabs",
        active: "ide.activeTab",
        collapsed: "ide.collapsedFolders",
        width: "ide.projectWidth",
        panel: "ide.projectOpen",
        leftView: "ide.leftView",
        term: "ide.termOpen",
        termH: "ide.termHeight"
    };

    // -- dom ------------------------------------------------------------------
    var treeEl = document.getElementById("project-tree");
    var tabBar = document.getElementById("editor-tabs");
    var paneHost = document.getElementById("editor-panes");
    var welcome = document.getElementById("welcome-screen");
    var gutter = document.getElementById("gutter");
    var projectPanel = document.getElementById("ide-project");
    var resizer = document.getElementById("ide-resizer");
    var searchInput = document.getElementById("tb-search-input");
    var stLang = document.getElementById("st-lang");
    var stFile = document.getElementById("st-file");
    var seOverlay = document.getElementById("se-overlay");
    var seInput = document.getElementById("se-input");
    var seResults = document.getElementById("se-results");
    var seScope = document.getElementById("se-scope");

    // -- state --------------------------------------------------------------
    var fileIndex = {};                 // path -> {path,name,lang,icon}
    var state = { tabs: [], active: null };
    var contentLoaded = {};             // path -> true once fetched

    function readJSON(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) || fallback; }
        catch (e) { return fallback; }
    }
    function isTyping(el) {
        return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    }
    function escapeHtml(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
        });
    }

    // ----------------------------------------------------- syntax highlighting
    // A deliberately small tokeniser: enough to colour the JSON/code "files"
    // without pulling in a highlighting library. Emits <span class="hl-*">.
    var HL = {
        esc: function (s) {
            return s.replace(/[&<>]/g, function (c) {
                return c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;";
            });
        },
        // walk every match of `re`, passing the gaps between matches through `gap`
        run: function (src, re, onMatch, gap) {
            gap = gap || HL.esc;
            var out = "", last = 0, m;
            while ((m = re.exec(src))) {
                if (m.index > last) out += gap(src.slice(last, m.index));
                out += onMatch(m);
                last = re.lastIndex;
                if (m[0] === "") re.lastIndex++;          // guard against zero-width
            }
            return out + gap(src.slice(last));
        },
        json: function (src) {
            var re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],:])/g;
            return HL.run(src, re, function (m) {
                if (m[1] != null) {
                    return m[2] != null
                        ? '<span class="hl-key">' + HL.esc(m[1]) + '</span><span class="hl-punct">' + HL.esc(m[2]) + '</span>'
                        : '<span class="hl-str">' + HL.esc(m[1]) + '</span>';
                }
                if (m[3] != null) return '<span class="hl-lit">' + m[3] + '</span>';
                if (m[4] != null) return '<span class="hl-num">' + m[4] + '</span>';
                return '<span class="hl-punct">' + HL.esc(m[5]) + '</span>';
            });
        },
        generic: function (src, words) {
            var re = /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(0x[\da-fA-F]+|\d+(?:\.\d+)?)\b/g;
            var kw = new RegExp("\\b(?:" + words + ")\\b", "g");
            return HL.run(src, re, function (m) {
                if (m[1] != null) return '<span class="hl-com">' + HL.esc(m[1]) + '</span>';
                if (m[2] != null) return '<span class="hl-str">' + HL.esc(m[2]) + '</span>';
                return '<span class="hl-num">' + m[3] + '</span>';
            }, function (plain) {
                return HL.esc(plain).replace(kw, '<span class="hl-kw">$&</span>');
            });
        }
    };
    var HL_WORDS = {
        java: "abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|new|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|var|record|sealed|yield|true|false|null",
        bash: "cd|ls|cat|echo|export|grep|sudo|rm|mkdir|git|curl|npm|mvn|java|sh|source|if|then|fi|for|do|done|while|case|esac|function|return|exit|set|pwd|which|chmod"
    };

    function highlightCode(root) {
        var blocks = root.querySelectorAll('pre code[class*="language-"]');
        for (var i = 0; i < blocks.length; i++) {
            var el = blocks[i];
            if (el.dataset.hl) continue;
            var lang = (el.className.match(/language-([\w-]+)/) || [])[1];
            var src = el.textContent, html;
            if (lang === "json") html = HL.json(src);
            else if (lang === "java") html = HL.generic(src, HL_WORDS.java);
            else if (lang === "bash" || lang === "sh" || lang === "shell") html = HL.generic(src, HL_WORDS.bash);
            else continue;
            el.innerHTML = html;
            el.dataset.hl = "1";
        }
    }
    function save() {
        try {
            localStorage.setItem(LS.tabs, JSON.stringify(state.tabs.map(function (t) { return t.path; })));
            localStorage.setItem(LS.active, state.active || "");
        } catch (e) { /* storage may be unavailable */ }
    }

    // ----------------------------------------------------------------- tree
    function indexTree() {
        var files = treeEl.querySelectorAll(".tree-file");
        for (var i = 0; i < files.length; i++) {
            var d = files[i].dataset;
            fileIndex[d.path] = { path: d.path, name: d.name, lang: d.lang, icon: d.icon };
        }
    }

    function restoreCollapsed() {
        var collapsed = readJSON(LS.collapsed, null);
        if (!collapsed) return;                       // keep server defaults on first visit
        var rows = treeEl.querySelectorAll(".tree-folder > .tree-row");
        for (var i = 0; i < rows.length; i++) {
            var li = rows[i].parentElement;
            var name = rows[i].getAttribute("data-folder");
            li.classList.toggle("collapsed", collapsed.indexOf(name) !== -1);
        }
    }
    function persistCollapsed() {
        var collapsed = [];
        var folders = treeEl.querySelectorAll(".tree-folder");
        for (var i = 0; i < folders.length; i++) {
            if (folders[i].classList.contains("collapsed")) {
                var row = folders[i].querySelector(":scope > .tree-row");
                if (row) collapsed.push(row.getAttribute("data-folder"));
            }
        }
        try { localStorage.setItem(LS.collapsed, JSON.stringify(collapsed)); } catch (e) {}
    }

    treeEl.addEventListener("click", function (e) {
        var row = e.target.closest(".tree-row");
        if (!row) return;
        var li = row.parentElement;
        if (li.classList.contains("tree-folder")) {
            li.classList.toggle("collapsed");
            persistCollapsed();
        } else if (li.classList.contains("tree-file")) {
            openFile(li.getAttribute("data-path"));
        }
    });

    function renderTreeSelection() {
        var files = treeEl.querySelectorAll(".tree-file");
        for (var i = 0; i < files.length; i++) {
            files[i].classList.toggle("selected", files[i].getAttribute("data-path") === state.active);
        }
    }

    // ----------------------------------------------------------------- tabs
    function iconSpan(icon) {
        var s = document.createElement("span");
        s.className = "tree-icon icon-" + icon;
        return s;
    }

    function renderTabs() {
        tabBar.innerHTML = "";
        state.tabs.forEach(function (meta) {
            var tab = document.createElement("div");
            tab.className = "tab" + (meta.path === state.active ? " active" : "");
            tab.setAttribute("draggable", "true");
            tab.dataset.path = meta.path;

            tab.appendChild(iconSpan(meta.icon));

            var label = document.createElement("span");
            label.className = "tab-label";
            label.textContent = meta.name;
            tab.appendChild(label);

            var close = document.createElement("span");
            close.className = "tab-close";
            close.title = "Close";
            tab.appendChild(close);

            tabBar.appendChild(tab);
        });
        var activeEl = tabBar.querySelector(".tab.active");
        if (activeEl) activeEl.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    tabBar.addEventListener("click", function (e) {
        var tab = e.target.closest(".tab");
        if (!tab) return;
        if (e.target.classList.contains("tab-close")) {
            closeTab(tab.dataset.path);
        } else {
            setActive(tab.dataset.path);
        }
    });
    tabBar.addEventListener("mousedown", function (e) {
        if (e.button === 1) {                       // middle-click closes
            var tab = e.target.closest(".tab");
            if (tab) { e.preventDefault(); closeTab(tab.dataset.path); }
        }
    });

    // drag to reorder
    var dragPath = null;
    tabBar.addEventListener("dragstart", function (e) {
        var tab = e.target.closest(".tab");
        if (!tab) return;
        dragPath = tab.dataset.path;
        tab.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", dragPath); } catch (err) {}
    });
    tabBar.addEventListener("dragend", function () {
        dragPath = null;
        var t = tabBar.querySelectorAll(".tab");
        for (var i = 0; i < t.length; i++) t[i].classList.remove("dragging", "drag-over-left", "drag-over-right");
    });
    tabBar.addEventListener("dragover", function (e) {
        if (dragPath == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        var tab = e.target.closest(".tab");
        var all = tabBar.querySelectorAll(".tab");
        for (var i = 0; i < all.length; i++) all[i].classList.remove("drag-over-left", "drag-over-right");
        if (!tab || tab.dataset.path === dragPath) return;
        var rect = tab.getBoundingClientRect();
        var after = e.clientX > rect.left + rect.width / 2;
        tab.classList.add(after ? "drag-over-right" : "drag-over-left");
    });
    tabBar.addEventListener("drop", function (e) {
        if (dragPath == null) return;
        e.preventDefault();
        var tab = e.target.closest(".tab");
        if (!tab || tab.dataset.path === dragPath) return;
        var rect = tab.getBoundingClientRect();
        var after = e.clientX > rect.left + rect.width / 2;

        var from = state.tabs.findIndex(function (t) { return t.path === dragPath; });
        var moved = state.tabs.splice(from, 1)[0];
        var to = state.tabs.findIndex(function (t) { return t.path === tab.dataset.path; });
        if (after) to += 1;
        state.tabs.splice(to, 0, moved);
        renderTabs();
        save();
    });

    // --------------------------------------------------------- open / close
    function openFile(path) {
        var meta = fileIndex[path];
        if (!meta) return;
        if (!state.tabs.some(function (t) { return t.path === path; })) {
            state.tabs.push(meta);
        }
        setActive(path);
    }

    function setActive(path) {
        state.active = path;
        renderTabs();
        renderTreeSelection();
        showPane(path);
        updateStatus(path);
        refreshStructureIfVisible();
        save();
        var url = new URL(window.location.href);
        url.searchParams.set("file", path);
        window.history.replaceState(null, "", url);
    }

    function paneFor(path) {
        return paneHost.querySelector('[data-pane="' + path.replace(/"/g, '\\"') + '"]');
    }

    function showPane(path) {
        welcome.hidden = true;
        gutter.classList.remove("hidden");
        var kids = paneHost.children;
        for (var i = 0; i < kids.length; i++) kids[i].hidden = true;

        var pane = paneFor(path);
        if (!pane) {
            pane = document.createElement("div");
            pane.className = "editor-doc";
            pane.dataset.pane = path;
            pane.innerHTML = '<div class="doc-loading">Loading&hellip;</div>';
            paneHost.appendChild(pane);
        }
        pane.hidden = false;

        if (!contentLoaded[path]) {
            fetch("content?path=" + encodeURIComponent(path), { headers: { "X-Requested-With": "fetch" } })
                .then(function (r) {
                    if (!r.ok) throw new Error("HTTP " + r.status);
                    return r.text();
                })
                .then(function (html) {
                    contentLoaded[path] = true;
                    pane.innerHTML = html;
                    highlightCode(pane);
                    if (state.active === path) { updateGutter(); refreshStructureIfVisible(); }
                })
                .catch(function () {
                    pane.innerHTML = '<div class="doc-error">Could not load "' + path + '".</div>';
                });
        } else {
            updateGutter();
        }
    }

    function closeTab(path) {
        var i = state.tabs.findIndex(function (t) { return t.path === path; });
        if (i === -1) return;
        state.tabs.splice(i, 1);

        var pane = paneFor(path);
        if (pane) pane.remove();
        delete contentLoaded[path];

        if (state.active === path) {
            var next = state.tabs[i] || state.tabs[i - 1];
            if (next) setActive(next.path);
            else showWelcome();
        } else {
            renderTabs();
            save();
        }
    }

    function showWelcome() {
        state.active = null;
        welcome.hidden = false;
        gutter.classList.add("hidden");
        gutter.innerHTML = "";
        var kids = paneHost.children;
        for (var i = 0; i < kids.length; i++) kids[i].hidden = true;
        renderTabs();
        renderTreeSelection();
        updateStatus(null);
        refreshStructureIfVisible();
        save();
        var url = new URL(window.location.href);
        url.searchParams.delete("file");
        window.history.replaceState(null, "", url);
    }

    // ----------------------------------------------------------- status bar
    function updateStatus(path) {
        var meta = path ? fileIndex[path] : null;
        stLang.textContent = meta ? meta.lang : "—";
        stFile.textContent = meta ? meta.name : "no file";
    }

    // -------------------------------------------------------------- gutter
    function updateGutter() {
        var h = paneHost.scrollHeight;
        var count = Math.max(Math.ceil(h / LINE_HEIGHT), 40);
        var buf = "";
        for (var n = 1; n <= count; n++) buf += "<span>" + n + "</span>";
        gutter.innerHTML = buf;
    }
    var gutterTimer;
    window.addEventListener("resize", function () {
        clearTimeout(gutterTimer);
        gutterTimer = setTimeout(function () { if (state.active) updateGutter(); }, 120);
    });

    // ------------------------------------------------- project / structure
    var leftView = "project";                       // "project" | "structure"
    var structureTargets = [];
    var stripeProjectBtn = document.getElementById("stripe-project");
    var stripeStructureBtn = document.getElementById("stripe-structure");
    var structureList = document.getElementById("structure-list");

    function panelOpen() { return !document.body.classList.contains("project-collapsed"); }

    function syncStripe() {
        var open = panelOpen();
        stripeProjectBtn.classList.toggle("active", open && leftView === "project");
        stripeStructureBtn.classList.toggle("active", open && leftView === "structure");
    }

    function setProjectOpen(open) {
        document.body.classList.toggle("project-collapsed", !open);
        try { localStorage.setItem(LS.panel, open ? "1" : "0"); } catch (e) {}
        syncStripe();
    }

    function setLeftView(view) {
        leftView = view;
        document.getElementById("panel-title").textContent = view === "structure" ? "Structure" : "Project";
        document.getElementById("project-body").hidden = view !== "project";
        document.getElementById("structure-body").hidden = view !== "structure";
        try { localStorage.setItem(LS.leftView, view); } catch (e) {}
        if (view === "structure") buildStructure();
        syncStripe();
    }

    function toggleLeft(view) {
        if (panelOpen() && leftView === view) {
            setProjectOpen(false);
        } else {
            if (!panelOpen()) setProjectOpen(true);
            setLeftView(view);
        }
    }

    function buildStructure() {
        structureList.innerHTML = "";
        structureTargets = [];
        var pane = state.active ? paneFor(state.active) : null;
        var headings = pane ? pane.querySelectorAll("h1, h2, h3") : [];
        if (!headings.length) {
            var li = document.createElement("li");
            li.className = "structure-empty";
            li.textContent = state.active ? "No headings in this file" : "No file open";
            structureList.appendChild(li);
            return;
        }
        for (var i = 0; i < headings.length; i++) {
            var h = headings[i];
            structureTargets.push(h);
            var row = document.createElement("li");
            row.className = "structure-row lvl-" + h.tagName.charAt(1);
            row.dataset.i = i;
            var icon = document.createElement("span");
            icon.className = "structure-icon";
            var label = document.createElement("span");
            label.className = "structure-label";
            label.textContent = (h.textContent || "").trim();
            row.appendChild(icon);
            row.appendChild(label);
            structureList.appendChild(row);
        }
    }

    function refreshStructureIfVisible() {
        if (leftView === "structure") buildStructure();
    }

    structureList.addEventListener("click", function (e) {
        var row = e.target.closest(".structure-row");
        if (!row) return;
        var h = structureTargets[+row.dataset.i];
        if (!h) return;
        h.scrollIntoView({ behavior: "smooth", block: "start" });
        h.classList.remove("structure-flash");
        void h.offsetWidth;                        // restart the flash animation
        h.classList.add("structure-flash");
        setTimeout(function () { h.classList.remove("structure-flash"); }, 1200);
        var rows = structureList.querySelectorAll(".structure-row");
        for (var i = 0; i < rows.length; i++) rows[i].classList.toggle("selected", rows[i] === row);
    });

    stripeProjectBtn.addEventListener("click", function () { toggleLeft("project"); });
    stripeStructureBtn.addEventListener("click", function () { toggleLeft("structure"); });

    // resizer
    var resizing = false;
    resizer.addEventListener("pointerdown", function (e) {
        resizing = true;
        resizer.classList.add("dragging");
        resizer.setPointerCapture(e.pointerId);
    });
    resizer.addEventListener("pointermove", function (e) {
        if (!resizing) return;
        var left = projectPanel.getBoundingClientRect().left;
        var w = Math.min(Math.max(e.clientX - left, 160), 560);
        document.documentElement.style.setProperty("--project-width", w + "px");
    });
    resizer.addEventListener("pointerup", function (e) {
        resizing = false;
        resizer.classList.remove("dragging");
        resizer.releasePointerCapture(e.pointerId);
        var w = getComputedStyle(document.documentElement).getPropertyValue("--project-width").trim();
        try { localStorage.setItem(LS.width, w); } catch (err) {}
    });

    // ------------------------------------------------------------- toolbar
    function resetLayout() {
        [LS.tabs, LS.active, LS.collapsed, LS.width, LS.panel, LS.leftView, LS.term, LS.termH].forEach(function (k) {
            try { localStorage.removeItem(k); } catch (e) {}
        });
        window.location.href = window.location.pathname;
    }

    document.getElementById("tb-run").addEventListener("click", function () { openFile(DEFAULT_FILE); });
    document.getElementById("tb-menu").addEventListener("click", function () {
        setProjectOpen(document.body.classList.contains("project-collapsed"));
    });
    document.getElementById("tb-settings").addEventListener("click", resetLayout);

    // welcome quick links
    welcome.addEventListener("click", function (e) {
        var b = e.target.closest("[data-open]");
        if (b) openFile(b.getAttribute("data-open"));
    });

    // ------------------------------------------------------ search / filter
    function filterTree(q) {
        q = q.trim().toLowerCase();
        var files = treeEl.querySelectorAll(".tree-file");
        var folders = treeEl.querySelectorAll(".tree-folder");
        if (!q) {
            for (var i = 0; i < files.length; i++) files[i].style.display = "";
            for (var j = 0; j < folders.length; j++) folders[j].style.display = "";
            restoreCollapsed();
            return;
        }
        for (var f = 0; f < folders.length; f++) folders[f].classList.remove("collapsed");
        for (var k = 0; k < files.length; k++) {
            var hit = files[k].getAttribute("data-name").toLowerCase().indexOf(q) !== -1;
            files[k].style.display = hit ? "" : "none";
        }
        for (var g = folders.length - 1; g >= 0; g--) {
            var anyVisible = folders[g].querySelector('.tree-file:not([style*="display: none"])');
            folders[g].style.display = anyVisible ? "" : "none";
        }
    }
    searchInput.addEventListener("input", function () { filterTree(this.value); });
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            var first = treeEl.querySelector('.tree-file:not([style*="display: none"])');
            if (first) { openFile(first.getAttribute("data-path")); this.blur(); }
        } else if (e.key === "Escape") {
            this.value = ""; filterTree(""); this.blur();
        }
    });

    // -------------------------------------------------- search everywhere
    var seItems = [];
    var seActive = 0;
    var seActionsOnly = false;
    var lastShiftAt = 0;

    function seActionList() {
        var acts = [
            { label: "Toggle Project panel", key: "Alt+1", run: function () { toggleLeft("project"); } },
            { label: "Toggle Structure panel", key: "Alt+7", run: function () { toggleLeft("structure"); } },
            { label: "Open README.md", key: "", run: function () { openFile(DEFAULT_FILE); } },
            { label: "Reset layout", key: "", run: resetLayout }
        ];
        if (state.active) {
            acts.push({ label: "Close active tab", key: "Alt+W", run: function () { closeTab(state.active); } });
            acts.push({ label: "Close all tabs", key: "", run: function () {
                state.tabs.slice().forEach(function (t) { closeTab(t.path); });
            } });
        }
        return acts;
    }

    // subsequence match; returns a score and the matched indices, or null
    function fuzzy(query, text) {
        var q = query.toLowerCase(), t = text.toLowerCase();
        var qi = 0, streak = 0, score = 0, hits = [];
        for (var i = 0; i < t.length && qi < q.length; i++) {
            if (t.charAt(i) === q.charAt(qi)) {
                hits.push(i);
                streak++;
                score += 1 + streak;                                  // reward runs
                if (i === 0 || /[\/._\- ]/.test(t.charAt(i - 1))) score += 4;   // word start
                qi++;
            } else {
                streak = 0;
            }
        }
        if (qi < q.length) return null;
        return { score: score - (t.length - q.length) * 0.05, hits: hits };  // prefer shorter
    }

    function highlight(text, hits) {
        if (!hits || !hits.length) return escapeHtml(text);
        var out = "", h = 0;
        for (var i = 0; i < text.length; i++) {
            var ch = escapeHtml(text.charAt(i));
            if (h < hits.length && hits[h] === i) { out += "<b>" + ch + "</b>"; h++; }
            else out += ch;
        }
        return out;
    }

    function seRender(query) {
        var pool = [];
        if (!seActionsOnly) {
            Object.keys(fileIndex).forEach(function (p) {
                var m = fileIndex[p];
                pool.push({ icon: m.icon, label: m.name, sub: p, run: function () { openFile(p); } });
            });
        }
        seActionList().forEach(function (a) {
            pool.push({ icon: "action", label: a.label, sub: a.key, run: a.run });
        });

        var q = query.trim(), rows;
        if (!q) {
            rows = pool.slice(0, 40).map(function (e) { return { e: e, hits: [] }; });
        } else {
            rows = [];
            pool.forEach(function (e) {
                var byLabel = fuzzy(q, e.label);
                var bySub = e.sub ? fuzzy(q, e.sub) : null;
                if (!byLabel && !bySub) return;
                var useLabel = byLabel && (!bySub || byLabel.score >= bySub.score);
                rows.push({ e: e, hits: useLabel ? byLabel.hits : [], score: useLabel ? byLabel.score : bySub.score });
            });
            rows.sort(function (x, y) { return y.score - x.score; });
            rows = rows.slice(0, 20);
        }

        seItems = rows.map(function (r) { return r.e; });
        seActive = 0;
        if (!rows.length) {
            seResults.innerHTML = '<li class="se-empty">Nothing matches &ldquo;' + escapeHtml(q) + '&rdquo;</li>';
            return;
        }
        seResults.innerHTML = rows.map(function (r, i) {
            return '<li class="se-row' + (i === 0 ? " active" : "") + '" data-i="' + i + '">'
                + '<span class="tree-icon icon-' + (r.e.icon || "txt") + '"></span>'
                + '<span class="se-name">' + highlight(r.e.label, r.hits) + '</span>'
                + (r.e.sub ? '<span class="se-sub">' + escapeHtml(r.e.sub) + '</span>' : '')
                + '</li>';
        }).join("");
    }

    function seOpen(actionsOnly) {
        seActionsOnly = !!actionsOnly;
        seScope.textContent = seActionsOnly ? "Actions" : "All";
        seInput.placeholder = seActionsOnly ? "Find an action…" : "Search Everywhere…";
        seInput.value = "";
        seOverlay.hidden = false;
        seRender("");
        seInput.focus();
    }
    function seClose() {
        seOverlay.hidden = true;
        seInput.value = "";
    }
    function seMove(delta) {
        var rows = seResults.querySelectorAll(".se-row");
        if (!rows.length) return;
        rows[seActive].classList.remove("active");
        seActive = (seActive + delta + rows.length) % rows.length;
        rows[seActive].classList.add("active");
        rows[seActive].scrollIntoView({ block: "nearest" });
    }
    function seExec() {
        var item = seItems[seActive];
        seClose();
        if (item) item.run();
    }

    seInput.addEventListener("input", function () { seRender(this.value); });
    seInput.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); seMove(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); seMove(-1); }
        else if (e.key === "Enter") { e.preventDefault(); seExec(); }
        else if (e.key === "Escape") { e.preventDefault(); seClose(); }
    });
    seResults.addEventListener("mousemove", function (e) {
        var row = e.target.closest(".se-row");
        if (!row || +row.dataset.i === seActive) return;
        var rows = seResults.querySelectorAll(".se-row");
        if (rows[seActive]) rows[seActive].classList.remove("active");
        seActive = +row.dataset.i;
        row.classList.add("active");
    });
    seResults.addEventListener("click", function (e) {
        var row = e.target.closest(".se-row");
        if (!row) return;
        seActive = +row.dataset.i;
        seExec();
    });
    seOverlay.addEventListener("mousedown", function (e) {
        if (e.target === seOverlay) seClose();
    });

    // ----------------------------------------------------------- terminal
    var termPanel = document.getElementById("ide-bottom");
    var termEl = document.getElementById("term");
    var termOut = document.getElementById("term-output");
    var termInput = document.getElementById("term-input");
    var stripeTerminal = document.getElementById("stripe-terminal");
    var termHistory = [];
    var termHistIdx = 0;
    var termReady = false;

    // snapshot of `git log` - refreshed by hand when it drifts too far
    var GIT_LOG = [
        { h: "9eb80e4", d: "2026-09-01", s: "Syntax-highlight code panes; Skills.json is now real JSON" },
        { h: "6beda7c", d: "2026-09-01", s: "Add TODO backlog page; implement Search Everywhere (Double-Shift)" },
        { h: "74b4b53", d: "2026-08-27", s: "DEPLOY.md: record live URL/project and the run-from-portfolio/ gotcha" },
        { h: "31015d4", d: "2026-08-27", s: "Remove stock/Alpha Vantage feature; upgrade to Spring Boot 4.1.1" },
        { h: "646b1aa", d: "2026-08-27", s: "Add Cloud Run deployment setup" },
        { h: "8ba0731", d: "2026-08-26", s: "Reskin the site as the IntelliJ IDEA (New UI dark) IDE" }
    ];

    function termScroll() { termEl.scrollTop = termEl.scrollHeight; }
    function termWrite(html, cls) {
        var div = document.createElement("div");
        if (cls) div.className = cls;
        div.innerHTML = html;
        termOut.appendChild(div);
    }
    function termEcho(line) {
        termWrite('<span class="term-prompt">collin@portfolio:~$</span> <span class="cmd">' + escapeHtml(line) + '</span>');
    }
    function termResolve(arg) {
        if (!arg) return null;
        var a = arg.toLowerCase();
        var keys = Object.keys(fileIndex);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].toLowerCase() === a || fileIndex[keys[i]].name.toLowerCase() === a) return keys[i];
        }
        return null;
    }

    var TERM_CMDS = {
        help: function () {
            termWrite(
                "commands:\n" +
                "  help            this list\n" +
                "  whoami          the short version\n" +
                "  ls              list the project files\n" +
                "  cat &lt;file&gt;      print a file as plain text\n" +
                "  open &lt;file&gt;     open a file in the editor\n" +
                "  git log         recent commits\n" +
                "  resume          contact card + headline\n" +
                "  echo &lt;text&gt;     print text\n" +
                "  date            current date/time\n" +
                "  pwd             working directory\n" +
                "  clear           clear the terminal  (Ctrl+L)",
                "term-block muted"
            );
        },
        whoami: function () {
            termWrite(
                "collin - senior software &amp; application engineer, Burlington VT.\n" +
                "Java / Spring Boot, AWS migrations, regression testing, mentoring.",
                "term-block"
            );
        },
        pwd: function () { termWrite("/home/collin/portfolio"); },
        date: function () { termWrite(escapeHtml(new Date().toString())); },
        echo: function (args) { termWrite(escapeHtml(args.join(" "))); },
        ls: function () {
            var folders = {}, roots = [];
            Object.keys(fileIndex).forEach(function (k) {
                var slash = k.indexOf("/");
                if (slash === -1) roots.push(k);
                else folders[k.slice(0, slash)] = true;
            });
            var cells = Object.keys(folders).map(function (f) {
                return '<span class="accent">' + escapeHtml(f) + "/</span>";
            }).concat(roots.map(escapeHtml));
            termWrite(cells.join("   "), "term-block");
        },
        cat: function (args) {
            var key = termResolve(args[0]);
            if (!key) { termWrite("cat: " + escapeHtml(args[0] || "") + ": No such file or directory", "err"); return; }
            var box = document.createElement("div");
            box.className = "term-block muted";
            box.textContent = "loading…";
            termOut.appendChild(box);
            fetch("content?path=" + encodeURIComponent(key), { headers: { "X-Requested-With": "fetch" } })
                .then(function (r) { return r.text(); })
                .then(function (h) {
                    var tmp = document.createElement("div");
                    tmp.innerHTML = h;
                    var text = (tmp.textContent || "").replace(/\n{3,}/g, "\n\n").replace(/^\s+|\s+$/g, "");
                    box.className = "term-block";
                    box.textContent = text || "(empty)";
                    termScroll();
                })
                .catch(function () { box.className = "err"; box.textContent = "cat: could not read " + key; });
        },
        open: function (args) {
            var key = termResolve(args[0]);
            if (!key) { termWrite("open: " + escapeHtml(args[0] || "") + ": no such file", "err"); return; }
            openFile(key);
            termWrite('opened <span class="accent">' + escapeHtml(fileIndex[key].name) + "</span> in the editor", "muted");
        },
        resume: function () {
            termWrite(
                "Collin Turner - Senior Software &amp; Application Engineer\n" +
                "GLOBALFOUNDRIES · Essex Junction, VT · 2020-present\n\n" +
                '  email    <a href="mailto:collin.turn@gmail.com">collin.turn@gmail.com</a>\n' +
                '  github   <a href="https://github.com/cdturner7" target="_blank" rel="noopener">github.com/cdturner7</a>\n' +
                "  where    Burlington, VT\n\n" +
                "Run `open Experience.md` for the full history.",
                "term-block"
            );
        },
        clear: function () { termOut.innerHTML = ""; },
        git: function (args) {
            if (args[0] === "log") {
                termWrite(GIT_LOG.map(function (c) {
                    return '<span class="accent">' + c.h + "</span>  " + escapeHtml(c.s)
                        + ' <span class="muted">(' + c.d + ")</span>";
                }).join("\n"), "term-block");
            } else if (args[0] === "status") {
                termWrite("On branch main\nnothing to commit, working tree clean", "term-block muted");
            } else {
                termWrite("git: '" + escapeHtml(args[0] || "") + "' is not a command this shell knows", "err");
            }
        }
    };

    function termRun(line) {
        var parts = line.trim().split(/\s+/);
        var cmd = parts.shift();
        if (!cmd) return;
        termHistory.push(line);
        termHistIdx = termHistory.length;
        var fn = TERM_CMDS[cmd];
        if (fn) fn(parts);
        else termWrite(escapeHtml(cmd) + ": command not found - try `help`", "err");
    }

    function termBanner() {
        if (termReady) return;
        termReady = true;
        termWrite(
            "portfolio shell - a toy, but it types back.\n" +
            'Type <span class="accent">help</span> for commands.',
            "term-block muted"
        );
    }

    function setTermOpen(open) {
        termPanel.hidden = !open;
        stripeTerminal.classList.toggle("active", open);
        try { localStorage.setItem(LS.term, open ? "1" : "0"); } catch (e) {}
        if (open) {
            termBanner();
            termInput.focus();
            termScroll();
        }
    }

    stripeTerminal.addEventListener("click", function () { setTermOpen(termPanel.hidden); });
    document.getElementById("bottom-close").addEventListener("click", function () { setTermOpen(false); });

    termEl.addEventListener("mousedown", function (e) {
        if (e.target === termInput) return;
        setTimeout(function () { if (!String(window.getSelection())) termInput.focus(); }, 0);
    });
    termInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            var line = termInput.value;
            termEcho(line);
            termInput.value = "";
            termRun(line);
            termScroll();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (termHistIdx > 0) { termHistIdx--; termInput.value = termHistory[termHistIdx] || ""; }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (termHistIdx < termHistory.length - 1) { termHistIdx++; termInput.value = termHistory[termHistIdx] || ""; }
            else { termHistIdx = termHistory.length; termInput.value = ""; }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
            e.preventDefault();
            TERM_CMDS.clear();
        } else if (e.key === "Escape") {
            setTermOpen(false);
        }
    });

    var bottomResizer = document.getElementById("bottom-resizer");
    var termResizing = false;
    bottomResizer.addEventListener("pointerdown", function (e) {
        termResizing = true;
        bottomResizer.classList.add("dragging");
        bottomResizer.setPointerCapture(e.pointerId);
    });
    bottomResizer.addEventListener("pointermove", function (e) {
        if (!termResizing) return;
        var h = Math.min(Math.max(termPanel.getBoundingClientRect().bottom - e.clientY, 120),
                         Math.round(window.innerHeight * 0.7));
        document.documentElement.style.setProperty("--bottom-h", h + "px");
    });
    bottomResizer.addEventListener("pointerup", function (e) {
        termResizing = false;
        bottomResizer.classList.remove("dragging");
        bottomResizer.releasePointerCapture(e.pointerId);
        var h = getComputedStyle(document.documentElement).getPropertyValue("--bottom-h").trim();
        try { localStorage.setItem(LS.termH, h); } catch (err) {}
    });

    // ------------------------------------------------------------ keyboard
    document.addEventListener("keydown", function (e) {
        var mod = e.ctrlKey || e.metaKey;

        if (!seOverlay.hidden) return;                 // modal owns its keys while open

        // Search Everywhere: Shift pressed twice, or Ctrl/Cmd+Shift+A for actions only
        if (e.key === "Shift" && !e.repeat && !mod && !e.altKey && !isTyping(e.target)) {
            var now = Date.now();
            if (now - lastShiftAt < 400) { lastShiftAt = 0; seOpen(false); }
            else lastShiftAt = now;
            return;
        }
        lastShiftAt = 0;
        if (mod && e.shiftKey && e.key.toLowerCase() === "a") {
            e.preventDefault();
            seOpen(true);
            return;
        }

        // Alt+W, not Ctrl+W: browsers close their own tab on Ctrl+W regardless of preventDefault
        if (e.altKey && e.key.toLowerCase() === "w" && state.active) {
            e.preventDefault();
            closeTab(state.active);
        } else if (e.altKey && e.key === "1") {
            e.preventDefault();
            toggleLeft("project");
        } else if (e.altKey && e.key === "7") {
            e.preventDefault();
            toggleLeft("structure");
        } else if (e.altKey && e.key === "F12") {
            e.preventDefault();
            setTermOpen(termPanel.hidden);
        } else if (mod && e.shiftKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
            if (!state.tabs.length) return;
            e.preventDefault();
            var idx = state.tabs.findIndex(function (t) { return t.path === state.active; });
            idx = (idx + (e.key === "ArrowRight" ? 1 : -1) + state.tabs.length) % state.tabs.length;
            setActive(state.tabs[idx].path);
        }
    });

    // --------------------------------------------------------------- init
    function init() {
        indexTree();
        restoreCollapsed();

        var storedWidth = null;
        try { storedWidth = localStorage.getItem(LS.width); } catch (e) {}
        if (storedWidth) document.documentElement.style.setProperty("--project-width", storedWidth);

        var storedPanel = "1";
        try { storedPanel = localStorage.getItem(LS.panel); } catch (e) {}

        var storedView = null;
        try { storedView = localStorage.getItem(LS.leftView); } catch (e) {}
        leftView = storedView === "structure" ? "structure" : "project";
        setLeftView(leftView);
        setProjectOpen(storedPanel === null ? true : storedPanel === "1");

        var storedTermH = null;
        try { storedTermH = localStorage.getItem(LS.termH); } catch (e) {}
        if (storedTermH) document.documentElement.style.setProperty("--bottom-h", storedTermH);

        var termOpen = null;
        try { termOpen = localStorage.getItem(LS.term); } catch (e) {}
        if (termOpen === "1") setTermOpen(true);

        // restore open tabs
        var storedPaths = readJSON(LS.tabs, []);
        storedPaths.forEach(function (p) {
            if (fileIndex[p]) state.tabs.push(fileIndex[p]);
        });

        var params = new URLSearchParams(window.location.search);
        var wanted = params.get("file");
        var storedActive = null;
        try { storedActive = localStorage.getItem(LS.active); } catch (e) {}

        var target = null;
        if (wanted && fileIndex[wanted]) target = wanted;
        else if (storedActive && fileIndex[storedActive]) target = storedActive;
        else if (state.tabs.length) target = state.tabs[0].path;

        if (target) openFile(target);
        else if (!state.tabs.length) openFile(DEFAULT_FILE);
        else { renderTabs(); showWelcome(); }
    }

    init();
})();
