window.CLEANOPS_DATA = {
  navItems: [
    { id: "home", label: "Home", icon: "H" },
    { id: "schedule", label: "Schedule", icon: "S" },
    { id: "clients", label: "Clients", icon: "C" },
    { id: "requests", label: "Requests", icon: "R" },
    { id: "quotes", label: "Quotes", icon: "Q" },
    { id: "jobs", label: "Jobs", icon: "J" },
    { id: "invoices", label: "Invoices", icon: "I" },
    { id: "team", label: "Team", icon: "T", divider: true },
    { id: "reports", label: "Reports", icon: "R" },
    { id: "settings", label: "Settings", icon: "G" },
    { id: "mobile", label: "Mobile", icon: "M", divider: true },
    { id: "portal", label: "Client Portal", icon: "P" }
  ],

  metrics: [
    { label: "Today's visits", value: "18", chip: "12 confirmed", tone: "success" },
    { label: "Quotes awaiting", value: "7", chip: "3 follow-ups", tone: "warning" },
    { label: "Ready to invoice", value: "9", chip: "GBP 1,840", tone: "info" },
    { label: "Open issues", value: "2", chip: "1 urgent", tone: "danger" }
  ],

  workQueue: [
    { action: "Confirm access details", client: "Flat 4, Camden", due: "Today 15:00", status: "Waiting", tone: "warning" },
    { action: "Send quote follow-up", client: "W Amman", due: "Today", status: "Quote sent", tone: "info" },
    { action: "Create invoice", client: "ABC Offices", due: "Now", status: "Completed", tone: "success" },
    { action: "Review complaint", client: "John Smith", due: "Today", status: "Open", tone: "danger" }
  ],

  routeVisits: [
    { time: "08:30", client: "John Smith", property: "24 Hill Road, SW12", service: "Regular domestic", status: "Confirmed", tone: "success" },
    { time: "10:30", client: "ABC Offices", property: "Unit 4, M1", service: "Commercial washrooms", status: "In progress", tone: "info" },
    { time: "13:00", client: "W Amman", property: "Flat 4, NW1", service: "End-of-tenancy", status: "Access check", tone: "warning" },
    { time: "16:30", client: "Riverside Blocks", property: "Block B, SE1", service: "Communal areas", status: "Key held", tone: "success" }
  ],

  selectedClient: {
    name: "John Smith",
    status: "Lead",
    source: "Website enquiry",
    email: "john.smith@example.test",
    phone: "07700 900123",
    balance: "GBP 0.00",
    lastCommunication: "No client communications sent yet",
    tags: ["Domestic", "SW12", "Weekly potential"],
    internalNote: "Interested in weekly cleaning after initial deep clean. Prefers Friday mornings.",
    properties: [
      {
        id: "PROP-1007",
        name: "24 Hill Road",
        address: "24 Hill Road, London SW12",
        type: "Domestic house",
        layout: "3 bedrooms, 2 bathrooms",
        access: "Client home during first visit",
        risk: "Dog in property, friendly but excitable",
        service: "Regular domestic clean",
        cadence: "Weekly, Friday morning preferred",
        nextAction: "Create quote for first deep clean"
      },
      {
        id: "PROP-1011",
        name: "Garden Studio",
        address: "Rear studio, 24 Hill Road, London SW12",
        type: "Small studio",
        layout: "1 room, 1 shower room",
        access: "Side gate, code not collected",
        risk: "Separate alarm zone",
        service: "Ad hoc deep clean",
        cadence: "As requested",
        nextAction: "Confirm access before quoting"
      }
    ],
    activeWork: [
      { type: "Request", title: "Weekly domestic clean", status: "Quote required", tone: "warning" },
      { type: "Quote", title: "Initial deep clean", status: "Draft", tone: "info" },
      { type: "Task", title: "Call to confirm products", status: "Today", tone: "success" }
    ],
    billingHistory: [
      { invoice: "No billing history", detail: "This client has not been billed yet", amount: "GBP 0.00" }
    ]
  },

  requests: [
    { number: "REQ-1042", client: "W Amman", service: "End-of-tenancy", property: "Flat 4, Camden", preferred: "5 Jun", status: "Quote required", owner: "Office", tone: "warning" },
    { number: "REQ-1041", client: "Northside Lettings", service: "Deep clean", property: "Flat 8, Finchley", preferred: "7 Jun", status: "Awaiting info", owner: "Amy", tone: "info" },
    { number: "REQ-1040", client: "Olivia Carter", service: "Regular domestic", property: "Family home, Durham", preferred: "Any Friday", status: "New", owner: "Office", tone: "success" },
    { number: "REQ-1039", client: "Riverside Blocks", service: "Communal areas", property: "Block B, SE1", preferred: "Monthly", status: "Converted", owner: "Sam", tone: "success" },
    { number: "REQ-1038", client: "Price checker", service: "Oven clean", property: "Outside service area", preferred: "Tomorrow", status: "Declined", owner: "Office", tone: "danger" }
  ],

  quotes: [
    { number: "Q-2088", client: "W Amman", property: "Flat 4, Camden", service: "End-of-tenancy", total: "GBP 420", status: "Sent", validUntil: "9 Jun", tone: "info" },
    { number: "Q-2087", client: "ABC Offices", property: "Unit 4, M1", service: "Commercial contract", total: "GBP 1,250/mo", status: "Viewed", validUntil: "12 Jun", tone: "warning" },
    { number: "Q-2086", client: "Olivia Carter", property: "Family home", service: "Regular domestic", total: "GBP 62/visit", status: "Approved", validUntil: "18 Jun", tone: "success" },
    { number: "Q-2085", client: "Harris", property: "2-bed flat", service: "Deep clean", total: "GBP 260", status: "Converted", validUntil: "Completed", tone: "success" },
    { number: "Q-2084", client: "Old lead", property: "Unknown", service: "Carpet clean", total: "GBP 140", status: "Declined", validUntil: "Expired", tone: "danger" }
  ],

  jobLanes: [
    {
      title: "Scheduled",
      jobs: [
        { title: "Smith weekly clean", meta: "24 Hill Road, SW12", service: "Regular domestic", date: "Tue 08:30", status: "Confirmed", tone: "success" },
        { title: "ABC Offices", meta: "Unit 4, M1", service: "Commercial contract", date: "Mon-Fri evenings", status: "Recurring", tone: "info" }
      ]
    },
    {
      title: "In progress",
      jobs: [
        { title: "Flat 4 EOT", meta: "Camden, NW1", service: "End-of-tenancy", date: "Started 10:12", status: "Photos required", tone: "warning" }
      ]
    },
    {
      title: "Ready to invoice",
      jobs: [
        { title: "Patel deep clean", meta: "3-bed terrace", service: "Deep clean", date: "Completed yesterday", status: "Ready", tone: "success" },
        { title: "Harris oven clean", meta: "2-bed flat", service: "Specialist clean", date: "Completed", status: "Ready", tone: "success" }
      ]
    },
    {
      title: "Issues",
      jobs: [
        { title: "John Smith", meta: "24 Hill Road", service: "Domestic clean", date: "Complaint opened", status: "Open", tone: "danger" }
      ]
    }
  ],

  scheduleDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  scheduleRows: [
    {
      time: "08:00",
      visits: [
        { client: "Smith", property: "24 Hill Road", service: "Domestic weekly", tone: "success" },
        { client: "ABC Offices", property: "Unit 4", service: "Commercial", tone: "info" },
        null,
        { client: "Harris", property: "2-bed flat", service: "Fortnightly", tone: "success" },
        null
      ]
    },
    {
      time: "10:00",
      visits: [
        null,
        { client: "Flat 4", property: "Camden", service: "Access missing", tone: "warning" },
        { client: "M Patel", property: "3-bed terrace", service: "Deep clean", tone: "success" },
        null,
        { client: "Office A", property: "Washrooms", service: "Commercial", tone: "info" }
      ]
    },
    {
      time: "13:00",
      visits: [
        { client: "End tenancy", property: "Ealing", service: "Deposit unpaid", tone: "warning" },
        null,
        null,
        { client: "Inspection", property: "Supervisor", service: "Quality check", tone: "info" },
        null
      ]
    },
    {
      time: "16:00",
      visits: [
        null,
        { client: "Evening office", property: "M1", service: "Key held", tone: "success" },
        null,
        null,
        { client: "Communal", property: "SE1", service: "Block B", tone: "success" }
      ]
    }
  ],

  invoices: [
    { number: "INV-3044", client: "ABC Offices", amount: "GBP 1,250", due: "14 Jun", status: "Sent", action: "View", tone: "info" },
    { number: "INV-3043", client: "Harris", amount: "GBP 78", due: "1 Jun", status: "Overdue", action: "Remind", tone: "danger" },
    { number: "INV-3042", client: "Patel", amount: "GBP 260", due: "Paid", status: "Paid", action: "Receipt", tone: "success" },
    { number: "INV-3041", client: "W Amman", amount: "GBP 210", due: "Draft", status: "Draft", action: "View", tone: "warning" }
  ],

  team: [
    { name: "Amy", role: "Supervisor, North London", status: "Available", tone: "success", initials: "AM" },
    { name: "Marta", role: "Cleaner, domestic and EOT", status: "On visit", tone: "info", initials: "MA" },
    { name: "Daniel", role: "Cleaner, commercial sites", status: "Timesheet missing", tone: "warning", initials: "DA" },
    { name: "Sam", role: "Office administrator", status: "Available", tone: "success", initials: "SA" }
  ],

  reportMetrics: [
    { label: "Quote conversion", value: "68%", chip: "+8%", tone: "success" },
    { label: "Revenue per labour hour", value: "GBP 38", chip: "Stable", tone: "info" },
    { label: "Revisit rate", value: "2.4%", chip: "Low", tone: "success" },
    { label: "Average collection", value: "5d", chip: "Watch", tone: "warning" }
  ],

  serviceRevenue: [
    { service: "Regular domestic", jobs: "142", revenue: "GBP 9,840", hours: "312", signal: "Good", tone: "success" },
    { service: "End-of-tenancy", jobs: "18", revenue: "GBP 7,620", hours: "166", signal: "Review", tone: "warning" },
    { service: "Commercial", jobs: "44", revenue: "GBP 7,400", hours: "198", signal: "Good", tone: "success" }
  ],

  settings: [
    { title: "Company", rows: [["Trading name", "PandaZen"], ["Currency", "GBP"], ["VAT", "Placeholder only"]] },
    { title: "Services", rows: [["Domestic regular", "Active"], ["End-of-tenancy", "Active"], ["Commercial", "Active"]] },
    { title: "Templates", rows: [["Quote templates", "6"], ["Reminder templates", "8"], ["Completion messages", "3"]] },
    { title: "Permissions", rows: [["Owner", "Full access"], ["Cleaner", "Assigned work only"], ["Sensitive access", "Reveal logged"]] }
  ],

  mobileVisits: [
    { time: "08:30", client: "Smith", service: "Regular domestic", property: "SW12", status: "Confirmed", tone: "success" },
    { time: "11:00", client: "Flat 4", service: "End-of-tenancy", property: "Camden", status: "Photos required", tone: "warning" },
    { time: "16:30", client: "ABC Offices", service: "Commercial evening", property: "M1", status: "Key held", tone: "info" }
  ],

  portal: {
    client: "John Smith",
    property: "24 Hill Road",
    upcoming: "Tuesday 9 June, arrival 08:30-09:30",
    quote: "Deep clean quote Q-2088 for GBP 420",
    balance: "GBP 0.00",
    receipt: "INV-3042"
  }
};
