// chat.js - handle sending messages and retrieving history
document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const messagesEl = document.getElementById("messages");
  const loadBtn = document.getElementById("load-history");
  const clearBtn = document.getElementById("clear-history");
  const historyList = document.getElementById("history-list");

  function createEl(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else el.setAttribute(k, v);
    });
    children.forEach((c) =>
      typeof c === "string"
        ? el.appendChild(document.createTextNode(c))
        : el.appendChild(c)
    );
    return el;
  }

  function renderPrimitive(value) {
    const p = createEl("p", { class: "muted" }, [String(value)]);
    return p;
  }

  // Render primitive, arrays, and objects. For objects this returns a container
  // without creating additional nested "card" wrappers — the caller (section)
  // will decide card layout so each top-level section stays in its own card.
  function renderValue(value) {
    if (value === null || value === undefined) return renderPrimitive("");
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return renderPrimitive(value);
    }

    if (Array.isArray(value)) {
      const ul = createEl("ul", {});
      value.forEach((item) => {
        const li = createEl("li", {}, []);
        if (typeof item === "object") {
          // if object in array, render a small preformatted block
          li.appendChild(
            createEl(
              "pre",
              { style: "white-space:pre-wrap;font-size:0.9rem" },
              [JSON.stringify(item, null, 2)]
            )
          );
        } else {
          li.appendChild(document.createTextNode(String(item)));
        }
        ul.appendChild(li);
      });
      return ul;
    }

    // object: render as definition list (key: value) for compactness
    const dl = createEl("dl", {});
    Object.entries(value).forEach(([k, v]) => {
      const dt = createEl("dt", { style: "font-weight:600;margin-top:8px" }, [
        k.replace(/_/g, " "),
      ]);
      const dd = createEl("dd", {
        style: "margin:4px 0 8px 0;color:var(--muted)",
      });
      if (typeof v === "object") {
        // nested object or array: pretty-print
        if (Array.isArray(v)) dd.appendChild(renderValue(v));
        else
          dd.appendChild(
            createEl(
              "pre",
              { style: "white-space:pre-wrap;font-size:0.9rem" },
              [JSON.stringify(v, null, 2)]
            )
          );
      } else {
        dd.appendChild(renderPrimitive(v));
      }
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    return dl;
  }

  function renderStructuredResponse(dataObj, container) {
    // dataObj expected to be the 'data' object from the AI response
    if (!dataObj || typeof dataObj !== "object") {
      container.appendChild(renderPrimitive(JSON.stringify(dataObj)));
      return;
    }

    // Preferred order to show
    const order = [
      "market_research",
      "roadmap",
      "production",
      "sales",
      "marketing",
      "financials",
      "pricing_recommendation",
      "summary",
    ];

    const keys = Object.keys(dataObj);
    // helper to create a single card per top-level key
    function pushSection(key) {
      const section = createEl("section", { class: "card" });
      section.appendChild(createEl("h3", {}, [key.replace(/_/g, " ")]));
      const content = renderValue(dataObj[key]);
      section.appendChild(content);
      container.appendChild(section);
    }

    // render ordered keys first
    order.forEach((k) => {
      if (k in dataObj) pushSection(k);
    });

    // any remaining keys
    keys.forEach((k) => {
      if (!order.includes(k)) pushSection(k);
    });
  }

  async function appendUserMessage(text) {
    if (!messagesEl) return;
    const wrapper = createEl("div", { class: "msg You card" });
    wrapper.appendChild(createEl("strong", {}, ["You"]));
    wrapper.appendChild(createEl("div", { style: "margin-top:8px" }, [text]));
    messagesEl.appendChild(wrapper);
  }

  async function appendAIResponse(raw) {
    if (!messagesEl) return;
    const wrapper = createEl("div", { class: "msg AI" });
    // Determine structured payload
    let payload = null;
    if (raw && raw.success && raw.data) payload = raw.data;
    else if (raw && raw.data) payload = raw.data;
    else if (raw && raw.response && raw.response.data)
      payload = raw.response.data;
    else if (raw && raw.response) payload = raw.response;
    else payload = raw;

    // If payload is a string or primitive, render as text
    if (typeof payload === "string" || typeof payload === "number") {
      wrapper.appendChild(createEl("div", {}, [String(payload)]));
    } else {
      // render structured sections as cards inside wrapper
      renderStructuredResponse(payload, wrapper);
    }

    messagesEl.appendChild(wrapper);
  }

  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("message-input");
      const message = input.value.trim();
      if (!message) return;
      await appendUserMessage(message);
      input.value = "";

      try {
        const r = await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ message }),
        });
        const data = await r.json();
        if (!r.ok) throw data;
        await appendAIResponse(data);
      } catch (err) {
        const wrapper = createEl("div", { class: "msg Error" }, []);
        wrapper.appendChild(
          createEl("div", {}, [err.message || JSON.stringify(err)])
        );
        if (messagesEl) messagesEl.appendChild(wrapper);
      }
    });
  }

  if (loadBtn) {
    loadBtn.addEventListener("click", async () => {
      if (!messagesEl) return;
      messagesEl.innerHTML = "";
      try {
        const r = await fetch("/api/chat/history", {
          credentials: "same-origin",
        });
        const data = await r.json();
        if (!r.ok) throw data;
        const chats = data.chats || [];
        if (!chats.length) messagesEl.textContent = "No history";
        chats.forEach((c) => {
          // user prompt
          const pWrap = createEl("div", { class: "msg You card" });
          pWrap.appendChild(createEl("strong", {}, ["You"]));
          pWrap.appendChild(
            createEl("div", { style: "margin-top:8px" }, [c.prompt || ""])
          );
          messagesEl.appendChild(pWrap);

          // AI response
          appendAIResponse(c.response || c);
        });
      } catch (err) {
        messagesEl.textContent = err.message || JSON.stringify(err);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      try {
        const r = await fetch("/api/chat/clear", {
          method: "DELETE",
          credentials: "same-origin",
        });
        const data = await r.json();
        if (!r.ok) throw data;
        if (messagesEl) {
          messagesEl.innerHTML = "";
          messagesEl.textContent = "Cleared chat history";
        }
      } catch (err) {
        if (messagesEl)
          messagesEl.textContent = err.message || JSON.stringify(err);
      }
    });
  }

  // Support history page rendering
  if (historyList) {
    const refreshBtn = document.getElementById("refresh-history");
    async function loadHistoryList() {
      historyList.innerHTML = "";
      try {
        const r = await fetch("/api/chat/history", {
          credentials: "same-origin",
        });
        const data = await r.json();
        if (!r.ok) throw data;
        const chats = data.chats || [];
        if (!chats.length) {
          historyList.textContent = "No history";
          return;
        }
        chats.forEach((c) => {
          const item = createEl("div", { class: "card" });
          item.appendChild(createEl("h4", {}, [c.prompt || "Prompt"]));
          // container for structured response
          const respWrap = createEl("div", {});
          if (c.response) {
            // c.response may already be the aiResponse object used earlier
            let payload = c.response;
            if (payload && payload.success && payload.data)
              payload = payload.data;
            renderStructuredResponse(payload, respWrap);
          } else {
            respWrap.appendChild(
              createEl("pre", { style: "white-space:pre-wrap" }, [
                JSON.stringify(c, null, 2),
              ])
            );
          }
          item.appendChild(respWrap);
          historyList.appendChild(item);
        });
      } catch (err) {
        historyList.textContent = err.message || JSON.stringify(err);
      }
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", loadHistoryList);
    }

    // initial load
    loadHistoryList();
  }

  // Auto-load history if present in chat page
  const autoLoad = document.getElementById("messages");
  if (autoLoad) {
    const btn = document.getElementById("load-history");
    if (btn) btn.click();
  }
});
