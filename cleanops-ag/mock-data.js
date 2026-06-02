window.mockData = {
    clients: [
        {
            id: 'c_1',
            name: 'Sarah Jenkins',
            status: 'Active Client',
            email: 'sarah.j@example.com',
            phone: '07700 900123',
            tags: ['VIP', 'Weekly'],
            notes: 'Prefers morning visits. Allergic to strong citrus scents.',
            balance: 120.00
        },
        {
            id: 'c_2',
            name: 'TechFlow Ltd',
            status: 'Lead',
            email: 'admin@techflow.co.uk',
            phone: '020 7946 0888',
            tags: ['Commercial'],
            notes: 'Looking for daily office cleaning.',
            balance: 0.00
        }
    ],
    properties: [
        {
            id: 'p_1',
            clientId: 'c_1',
            name: 'Home',
            address: '14 Birch Road, Wimbledon, SW19 4LZ',
            type: 'Residential',
            accessNotes: 'Key under the ceramic frog next to the front door.',
            isActive: true
        },
        {
            id: 'p_2',
            clientId: 'c_1',
            name: 'Rental Flat',
            address: 'Flat 3, 22 High St, SW15 1PT',
            type: 'Residential',
            accessNotes: 'Coordinate with letting agent for keys.',
            isActive: false
        },
        {
            id: 'p_3',
            clientId: 'c_2',
            name: 'HQ',
            address: 'Floor 3, The Shard, London SE1 9SG',
            type: 'Commercial',
            accessNotes: 'Sign in at ground floor reception. Needs ID.',
            isActive: true
        }
    ],
    workItems: {
        jobs: [
            { id: 'j_1', propertyId: 'p_1', title: 'Weekly Domestic Clean', status: 'Active', frequency: 'Weekly', nextVisit: 'Tomorrow, 09:00 AM' },
            { id: 'j_2', propertyId: 'p_3', title: 'Initial Deep Clean', status: 'Requires Scheduling', frequency: 'One-off', nextVisit: 'Unscheduled' }
        ],
        quotes: [
            { id: 'q_1', propertyId: 'p_2', title: 'End of Tenancy Clean', status: 'Awaiting Response', amount: 350.00, date: '2 days ago' },
            { id: 'q_2', propertyId: 'p_3', title: 'Daily Office Clean', status: 'Draft', amount: 1200.00, date: 'Today' }
        ],
        invoices: [
            { id: 'inv_1', propertyId: 'p_1', title: 'May Cleaning Services', status: 'Overdue', amount: 120.00, date: '15 May' },
            { id: 'inv_2', propertyId: 'p_1', title: 'April Cleaning Services', status: 'Paid', amount: 120.00, date: '15 Apr' }
        ]
    }
};
