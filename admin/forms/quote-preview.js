(async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get("id");
  const shouldPrint = urlParams.get("print") === "true";

  const btnClose = document.getElementById("btn-close");
  const btnPrint = document.getElementById("btn-print");
  const loadingIndicator = document.getElementById("loading-indicator");
  const errorIndicator = document.getElementById("error-indicator");
  const errorMessage = document.getElementById("error-message");
  const quoteContent = document.getElementById("quote-content");

  // Setup navigation handlers
  if (btnClose) {
    btnClose.addEventListener("click", () => {
      window.close();
      // If window.close() was blocked by browser
      setTimeout(() => {
        const existing = btnClose.parentElement.querySelector(".close-warning");
        if (!existing) {
          const warning = document.createElement("span");
          warning.className = "close-warning";
          warning.style.fontSize = "0.85rem";
          warning.style.color = "var(--muted)";
          warning.style.alignSelf = "center";
          warning.style.marginRight = "12px";
          warning.textContent = "You can close this tab and return to the admin tab.";
          btnClose.parentElement.insertBefore(warning, btnClose);
        }
      }, 100);
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener("click", () => {
      window.print();
    });
  }

  if (!quoteId) {
    showError("No quote ID was provided in the URL query parameters.");
    return;
  }

  try {
    const response = await fetch(`/api/quotes/${quoteId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Quote document not found.");
      }
      throw new Error(`Failed to load quote details. Server returned status ${response.status}.`);
    }

    const data = await response.json();
    if (!data || !data.quote) {
      throw new Error("Quote payload was empty.");
    }

    renderQuote(data.quote);
  } catch (err) {
    showError(err.message);
  }

  function showError(msg) {
    if (loadingIndicator) loadingIndicator.hidden = true;
    if (errorIndicator) errorIndicator.hidden = false;
    if (errorMessage) errorMessage.textContent = msg;
    if (quoteContent) quoteContent.hidden = true;
  }

  function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function formatMoney(amountPence) {
    if (amountPence === undefined || amountPence === null) return "";
    return "£" + (Number(amountPence) / 100).toFixed(2);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderQuote(quote) {
    // Basic Meta
    document.getElementById("meta-ref").textContent = quote.displayReference || `Quote #${quote.id}`;
    document.getElementById("meta-date").textContent = formatDate(quote.updatedAt || quote.createdAt);
    document.getElementById("meta-valid").textContent = quote.validUntil ? formatDate(quote.validUntil) : "Not Specified";
    
    const statusNode = document.getElementById("meta-status");
    statusNode.textContent = quote.status;
    statusNode.className = `status-pill status-${String(quote.status).toLowerCase()}`;

    // Customer / Client info
    document.getElementById("client-name").textContent = quote.clientName || quote.customerName || "Valued Client";
    const areaNode = document.getElementById("client-area");
    if (quote.area) {
      areaNode.textContent = quote.area;
      areaNode.hidden = false;
    } else {
      areaNode.hidden = true;
    }

    // Work Details sections
    renderSection("section-scope", "doc-scope", quote.scopeOfWork);
    renderSection("section-included", "doc-included", quote.includedItems);
    renderSection("section-excluded", "doc-excluded", quote.excludedItems);
    renderSection("section-assumptions", "doc-assumptions", quote.assumptions);
    renderSection("section-client-notes", "doc-client-notes", quote.clientNotes);

    // Pricing items
    const tableBody = document.getElementById("pricing-table-body");
    tableBody.innerHTML = "";
    
    let priceLines = [];
    if (quote.priceLines) {
      try {
        priceLines = JSON.parse(quote.priceLines);
      } catch (e) {
        console.error("Failed to parse quote price lines:", e);
      }
    }

    if (Array.isArray(priceLines) && priceLines.length > 0) {
      priceLines.forEach(line => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${escapeHtml(line.description || "Service Item")}</td>
          <td class="amount-col">${escapeHtml(formatMoney(line.price))}</td>
        `;
        tableBody.appendChild(row);
      });
      document.getElementById("section-pricing-table").hidden = false;
    } else {
      document.getElementById("section-pricing-table").hidden = true;
    }

    // Summary block
    const hasTotal = quote.totalPrice !== undefined && quote.totalPrice !== null;
    const hasRecurring = quote.recurringPrice !== undefined && quote.recurringPrice !== null;

    if (hasTotal) {
      document.getElementById("doc-total").textContent = formatMoney(quote.totalPrice);
      document.getElementById("row-total").hidden = false;
    } else {
      document.getElementById("row-total").hidden = true;
    }

    if (hasRecurring) {
      // Get frequency if available, e.g. from frequency label or default to recurring
      let frequencyStr = "Recurring Fee";
      if (quote.frequency) {
        frequencyStr = `${quote.frequency.charAt(0).toUpperCase() + quote.frequency.slice(1)} Fee`;
      }
      document.querySelector("#row-recurring .label").textContent = frequencyStr + ":";
      document.getElementById("doc-recurring").textContent = formatMoney(quote.recurringPrice);
      document.getElementById("row-recurring").hidden = false;
    } else {
      document.getElementById("row-recurring").hidden = true;
    }

    // Toggle entire UI loading/content
    if (loadingIndicator) loadingIndicator.hidden = true;
    if (errorIndicator) errorIndicator.hidden = true;
    if (quoteContent) quoteContent.hidden = false;

    // Trigger printing if requested
    if (shouldPrint) {
      // A small delay lets any layout rendering finish cleanly
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }

  function renderSection(sectionId, elementId, value) {
    const section = document.getElementById(sectionId);
    const element = document.getElementById(elementId);
    if (section && element) {
      if (value && value.trim()) {
        element.textContent = value.trim();
        section.hidden = false;
      } else {
        section.hidden = true;
      }
    }
  }
})();
