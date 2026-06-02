window.CLEANOPS_DATA = {
  navItems: [
    { id: "home", label: "Home", icon: "home" },
    { id: "schedule", label: "Schedule", icon: "calendar" },
    { id: "clients", label: "Clients", icon: "user" },
    { id: "requests", label: "Requests", icon: "inbox" },
    { id: "quotes", label: "Quotes", icon: "document" },
    { id: "jobs", label: "Jobs", icon: "briefcase" },
    { id: "invoices", label: "Invoices", icon: "receipt" },
    { id: "team", label: "Team", icon: "users", divider: true },
    { id: "reports", label: "Reports", icon: "chart" },
    { id: "settings", label: "Settings", icon: "gear" },
    { id: "mobile", label: "Mobile", icon: "phone", divider: true },
    { id: "portal", label: "Client Portal", icon: "globe" }
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

  scheduleV0: {
    rangeLabel: "Jun 8 - Jun 14, 2026",
    selectedDayIndex: 3,
    days: [
      { index: 0, short: "Sun", label: "Sun 8", date: "2026-06-08", weekend: true },
      { index: 1, short: "Mon", label: "Mon 9", date: "2026-06-09", weekend: false },
      { index: 2, short: "Tue", label: "Tue 10", date: "2026-06-10", weekend: false },
      { index: 3, short: "Wed", label: "Wed 11", date: "2026-06-11", weekend: false, today: true },
      { index: 4, short: "Thu", label: "Thu 12", date: "2026-06-12", weekend: false },
      { index: 5, short: "Fri", label: "Fri 13", date: "2026-06-13", weekend: false },
      { index: 6, short: "Sat", label: "Sat 14", date: "2026-06-14", weekend: true }
    ],
    scheduledVisits: [
      {
        id: "sv-1001",
        type: "Requests",
        statusGroup: "Scheduled",
        dayIndex: 3,
        start: "10:00",
        duration: 120,
        client: "Crewmatic",
        property: "1002 43rd St SW, Fargo",
        service: "End-of-tenancy request",
        team: "Dan Leeman",
        status: "Scheduled",
        tone: "warning",
        warnings: ["Request"],
        completed: false,
        map: { x: 42, y: 38 }
      },
        {
          id: "sv-1002",
          type: "Visits",
          statusGroup: "Scheduled",
          dayIndex: 4,
        start: "11:30",
        duration: 60,
        client: "Mrs. Elaine Patterson",
        property: "14 Oak Lane, Durham",
        service: "Roof inspection clean",
        team: "Marta + Daniel",
        status: "Scheduled",
        tone: "success",
        warnings: [],
          completed: false,
          map: { x: 57, y: 44 }
        },
        {
          id: "sv-1007",
          type: "Visits",
          statusGroup: "Scheduled",
          dayIndex: 4,
          start: "12:00",
          duration: 120,
          client: "Harbour House",
          property: "3 River Walk, Durham",
          service: "Move-in sparkle clean",
          team: "Marta + Daniel",
          status: "Scheduled",
          tone: "success",
          warnings: [],
          completed: false,
          map: { x: 61, y: 48 }
        },
        {
          id: "sv-1003",
          type: "Visits",
          statusGroup: "Issue / warning",
          dayIndex: 5,
        start: "13:00",
        duration: 180,
        client: "Mr. Thomas Ritter",
        property: "9 Bridge Court, Durham",
        service: "Leak repair clean-up",
        team: "Team B",
        status: "Issue",
        tone: "danger",
        warnings: ["Access risk"],
          completed: false,
          map: { x: 68, y: 58 }
        },
        {
          id: "sv-1008",
          type: "Requests",
          statusGroup: "Scheduled",
          dayIndex: 5,
          start: "14:00",
          duration: 90,
          client: "Luna Apartments",
          property: "Flat 12, Claypath",
          service: "Check-out clean request",
          team: "Team B",
          status: "Scheduled",
          tone: "warning",
          warnings: ["Agent keys"],
          completed: false,
          map: { x: 72, y: 62 }
        },
      {
        id: "sv-1004",
        type: "Visits",
        statusGroup: "Issue / warning",
        dayIndex: 6,
        start: "09:00",
        duration: 150,
        client: "Bean & Books Cafe",
        property: "Skylight Repair, Durham",
        service: "Commercial deep clean",
        team: "Amy + Marta",
        status: "Warning",
        tone: "warning",
        warnings: ["Ladder access"],
        completed: false,
        map: { x: 76, y: 34 }
      },
      {
        id: "sv-1005",
        type: "Tasks",
        statusGroup: "Completed",
        dayIndex: 1,
        start: "08:30",
        duration: 90,
        client: "Northside Lettings",
        property: "Flat 8, Finchley",
        service: "Assessment follow-up",
        team: "Office",
        status: "Completed",
        tone: "info",
        warnings: [],
        completed: true,
        map: { x: 28, y: 50 }
      },
      {
        id: "sv-1006",
        type: "Reminders",
        statusGroup: "Unassigned",
        dayIndex: 2,
        start: "15:00",
        duration: 60,
        client: "Olivia Carter",
        property: "Family home, Durham",
        service: "Call before quote",
        team: "Unassigned",
        status: "Unassigned",
        tone: "info",
        warnings: ["No cleaner"],
        completed: false,
        map: { x: 35, y: 64 }
      }
    ],
    unscheduled: [
      {
        id: "uv-2001",
        type: "Requests",
        statusGroup: "Unassigned",
        client: "W Amman",
        property: "Flat 4, Camden",
        service: "End-of-tenancy clean",
        team: "Unassigned",
        duration: 150,
        status: "Quote required",
        tone: "warning",
        warnings: ["Access missing"]
      },
      {
        id: "uv-2002",
        type: "Visits",
        statusGroup: "Unassigned",
        client: "Riverside Blocks",
        property: "Block B, SE1",
        service: "Communal areas",
        team: "Team needed",
        duration: 90,
        status: "Unscheduled",
        tone: "info",
        warnings: []
      },
      {
        id: "uv-2003",
        type: "Tasks",
        statusGroup: "Issue / warning",
        client: "John Smith",
        property: "24 Hill Road, SW12",
        service: "Complaint revisit",
        team: "Supervisor",
        duration: 60,
        status: "Issue",
        tone: "danger",
        warnings: ["Quality follow-up"]
      }
    ],
      listGroups: [
        { label: "Overdue", ids: ["sv-1006"] },
        { label: "Today", ids: ["sv-1001", "sv-1002", "sv-1007"] },
        { label: "Tomorrow", ids: ["sv-1003", "sv-1008"] },
      { label: "This Week", ids: ["sv-1004", "sv-1005"] },
      { label: "Later", ids: [] }
    ],
    month: [
      { day: 1, count: 2, text: "2 visits" },
      { day: 2, count: 1, text: "Assessment" },
      { day: 4, count: 3, text: "3 visits" },
      { day: 8, count: 1, text: "Follow-up" },
      { day: 9, count: 2, text: "2 visits" },
      { day: 11, count: 1, text: "Request" },
      { day: 12, count: 2, text: "2 visits" },
      { day: 13, count: 1, text: "Issue" },
      { day: 14, count: 3, text: "3 visits" },
      { day: 17, count: 2, text: "Quotes" },
      { day: 21, count: 1, text: "Deep clean" },
      { day: 24, count: 2, text: "Commercial" },
      { day: 28, count: 1, text: "Revisit" }
    ]
  },

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
