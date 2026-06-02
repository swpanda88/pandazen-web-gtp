document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initClientsScreen();
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const screens = document.querySelectorAll('.screen');
    const breadcrumb = document.getElementById('breadcrumb-current');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update Active Nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Show target screen
            const target = item.getAttribute('data-target');
            screens.forEach(s => s.classList.remove('active'));
            document.getElementById(`screen-${target}`).classList.add('active');

            // Update Breadcrumb & Title
            const titleText = item.textContent.trim();
            breadcrumb.textContent = titleText;
            document.title = `CleanOps AG - ${titleText}`;
        });
    });
}

let currentClientId = 'c_1';
let currentPropertyId = 'p_1';

function initClientsScreen() {
    renderClientContext();
    renderProperties();
    renderWorkspace();
}

function renderClientContext() {
    const client = window.mockData.clients.find(c => c.id === currentClientId);
    if (!client) return;

    document.getElementById('client-name-header').textContent = client.name;
    document.getElementById('client-status').textContent = client.status;

    const statusChip = document.getElementById('client-status');
    statusChip.className = `chip ${client.status === 'Lead' ? 'blue' : 'green'}`;

    document.getElementById('client-tags').textContent = client.tags.join(', ');

    document.getElementById('client-phone').textContent = client.phone;
    document.getElementById('client-email').textContent = client.email;
    document.getElementById('client-balance').textContent = `£${client.balance.toFixed(2)}`;
    document.getElementById('client-notes').textContent = client.notes || 'No internal notes.';
}

function renderProperties() {
    const container = document.getElementById('property-list-container');
    container.innerHTML = '';

    const properties = window.mockData.properties.filter(p => p.clientId === currentClientId);

    if (properties.length === 0) {
        container.innerHTML = '<div class="empty-state">No properties found.</div>';
        return;
    }

    properties.forEach(prop => {
        const card = document.createElement('div');
        card.className = `property-card ${prop.id === currentPropertyId ? 'selected' : ''}`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <h3 style="margin:0">${prop.name}</h3>
                ${prop.isActive ? '<span class="chip green">Active</span>' : '<span class="chip amber">Inactive</span>'}
            </div>
            <p style="font-size: 13px;">${prop.address}</p>
            <p class="text-subtle" style="font-size: 12px; margin-top: 8px;">${prop.type}</p>
        `;
        card.addEventListener('click', () => {
            currentPropertyId = prop.id;
            renderProperties(); // Re-render to update selected state
            renderWorkspace();
        });
        container.appendChild(card);
    });
}

function renderWorkspace() {
    const prop = window.mockData.properties.find(p => p.id === currentPropertyId);
    const workspaceTitle = document.getElementById('workspace-title');
    const tbody = document.getElementById('workspace-work-body');

    if (!prop) {
        workspaceTitle.textContent = 'Select a Property';
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No property selected</td></tr>';
        return;
    }

    workspaceTitle.textContent = `Workspace: ${prop.address.split(',')[0]}`;
    tbody.innerHTML = '';

    const relatedJobs = window.mockData.workItems.jobs.filter(j => j.propertyId === prop.id);
    const relatedQuotes = window.mockData.workItems.quotes.filter(q => q.propertyId === prop.id);
    const relatedInvoices = window.mockData.workItems.invoices.filter(i => i.propertyId === prop.id);

    const allWork = [
        ...relatedJobs.map(j => ({ type: 'Job', ...j, detail: j.nextVisit })),
        ...relatedQuotes.map(q => ({ type: 'Quote', ...q, detail: `£${q.amount.toFixed(2)}` })),
        ...relatedInvoices.map(i => ({ type: 'Invoice', ...i, detail: `£${i.amount.toFixed(2)}` }))
    ];

    if (allWork.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No active work items for this property.</td></tr>';
        return;
    }

    allWork.forEach(item => {
        let statusClass = 'chip ';
        if (['Active', 'Paid'].includes(item.status)) statusClass += 'green';
        else if (['Draft', 'Requires Scheduling'].includes(item.status)) statusClass += 'amber';
        else statusClass += 'blue';

        if (item.status === 'Overdue') statusClass = 'chip amber'; // Or red

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.type}</strong></td>
            <td>${item.title}</td>
            <td><span class="${statusClass}">${item.status}</span></td>
            <td class="text-subtle">${item.detail}</td>
        `;
        tbody.appendChild(tr);
    });

    // Add access notes as a row if present
    if (prop.accessNotes) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>Access Notes</strong></td>
            <td colspan="3" class="text-subtle">${prop.accessNotes}</td>
        `;
        tbody.appendChild(tr);
    }
}

// Global UI Handlers
window.showToast = function(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
};
