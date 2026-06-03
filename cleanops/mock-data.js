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
    id: "client-john-smith",
    initials: "JS",
    name: "John Smith",
    status: "Lead",
    statusTone: "info",
    source: "Website enquiry",
    email: "john.smith@example.test",
    phone: "07700 900123",
    balance: "GBP 0.00",
    mainProperty: "24 Hill Road",
    area: "London SW12",
    activeSummary: "Quote required",
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
        parking: "Resident bay nearby, confirm permit",
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
        parking: "Street parking",
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

  clients: [
    {
      id: "client-john-smith",
      initials: "JS",
      display_name: "John Smith",
      name: "John Smith",
      company: "",
      client_type: "individual",
      company_name: "",
      first_name: "John",
      last_name: "Smith",
      status: "lead",
      statusTone: "info",
      lead_source: "website_enquiry",
      email: "john.smith@example.test",
      phone: "07700 900123",
      balance: "GBP 0.00",
      mainProperty: "24 Hill Road",
      area: "London SW12",
      activeSummary: "Quote required",
      lastCommunication: "No contact yet",
      internalNote: "Interested in weekly cleaning after initial deep clean. Prefers Friday mornings.",
      internal_notes: "Interested in weekly cleaning after initial deep clean. Prefers Friday mornings.",
      billingAddress: "24 Hill Road, London SW12",
      properties: [
        {
          id: "PROP-1007",
          client_id: "client-john-smith",
          label: "24 Hill Road",
          name: "24 Hill Road",
          address: "24 Hill Road, London SW12",
          area: "London",
          postcode: "SW12",
          property_type: "domestic_house",
          bedrooms: "3",
          bathrooms: "2",
          default_service_type: "regular_domestic_clean",
          default_cadence: "weekly",
          preferred_day: "friday",
          preferred_time_window: "morning",
          access_method: "client_home",
          parking: "permit_required",
          pets_present: "dog",
          cleaning_products: "pandazen_provides",
          vacuum_hoover: "client_provides",
          mop: "pandazen_brings",
          property_notes: "Client usually home for first visit. Dog present, friendly but excitable.",
          cleaning_notes: "Prefers attention on kitchen and bathrooms.",
          next_action: "Create quote for first deep clean"
        },
        {
          id: "PROP-1011",
          client_id: "client-john-smith",
          label: "Garden Studio",
          name: "Garden Studio",
          address: "Rear studio, 24 Hill Road, London SW12",
          area: "London",
          postcode: "SW12",
          property_type: "studio_annexe",
          bedrooms: "studio",
          bathrooms: "1",
          default_service_type: "deep_clean",
          default_cadence: "as_requested",
          preferred_day: "flexible",
          preferred_time_window: "flexible",
          access_method: "to_arrange",
          parking: "street_parking",
          pets_present: "unknown",
          cleaning_products: "to_confirm",
          vacuum_hoover: "to_confirm",
          mop: "to_confirm",
          property_notes: "Side gate access. Code not collected yet.",
          cleaning_notes: "Studio clean only when requested.",
          next_action: "Confirm access before quoting"
        }
      ],
      activeWork: [
        { type: "Request", title: "Weekly domestic clean", status: "Quote required", tone: "warning" },
        { type: "Quote", title: "Initial deep clean", status: "Draft", tone: "info" },
        { type: "Task", title: "Call to confirm products", status: "Today", tone: "success" }
      ],
      requests: [
        { number: "REQ-1044", title: "Weekly domestic clean", status: "Quote required", tone: "warning", propertyId: "PROP-1007" }
      ],
      quotes: [
        { number: "Q-2091", title: "Initial deep clean", total: "GBP 260", status: "Draft", tone: "info", propertyId: "PROP-1007" }
      ],
      jobs: [],
      invoices: [],
      billingHistory: [
        { invoice: "No billing history", detail: "This client has not been billed yet", amount: "GBP 0.00" }
      ]
    },
    {
      id: "client-olivia-carter",
      initials: "OC",
      display_name: "Olivia Carter",
      name: "Olivia Carter",
      company: "",
      client_type: "individual",
      company_name: "",
      first_name: "Olivia",
      last_name: "Carter",
      status: "active_client",
      statusTone: "success",
      lead_source: "referral",
      email: "olivia.carter@example.test",
      phone: "07700 900214",
      balance: "GBP 0.00",
      mainProperty: "Family home, Durham",
      area: "Durham",
      activeSummary: "Weekly clean",
      lastCommunication: "2 days ago",
      internalNote: "Prefers eco products. Friday clean normally works best.",
      internal_notes: "Prefers eco products. Friday clean normally works best.",
      billingAddress: "Family home, Durham",
      properties: [
        {
          id: "PROP-2001",
          client_id: "client-olivia-carter",
          label: "Family home",
          name: "Family home",
          address: "Family home, Durham",
          area: "Durham",
          postcode: "Durham",
          property_type: "domestic_house",
          bedrooms: "4",
          bathrooms: "2",
          default_service_type: "regular_domestic_clean",
          default_cadence: "weekly",
          preferred_day: "friday",
          preferred_time_window: "morning",
          access_method: "client_home",
          parking: "driveway",
          pets_present: "cat",
          cleaning_products: "mixed_specific_products_required",
          vacuum_hoover: "client_provides",
          mop: "client_provides",
          property_notes: "Client usually home. Cat indoors, keep front door closed.",
          cleaning_notes: "Eco products preferred.",
          next_action: "Confirm next Friday visit"
        }
      ],
      activeWork: [
        { type: "Job", title: "Weekly domestic clean", status: "Active", tone: "success" }
      ],
      requests: [],
      quotes: [],
      jobs: [
        { number: "JOB-1442", title: "Weekly domestic clean", status: "Active", tone: "success", propertyId: "PROP-2001" }
      ],
      invoices: [],
      billingHistory: [
        { invoice: "No open balance", detail: "Latest invoice paid", amount: "GBP 0.00" }
      ]
    },
    {
      id: "client-abc-offices",
      initials: "AO",
      display_name: "ABC Offices",
      name: "ABC Offices",
      company: "ABC Offices Ltd",
      client_type: "company",
      company_name: "ABC Offices Ltd",
      first_name: "",
      last_name: "",
      status: "commercial",
      statusTone: "info",
      lead_source: "manual",
      email: "ops@abcoffices.example.test",
      phone: "020 7946 0123",
      balance: "GBP 125.00",
      mainProperty: "Unit 4",
      area: "M1 business park",
      activeSummary: "Active job",
      lastCommunication: "Today",
      internalNote: "Evening access through building manager. Monthly washroom consumables review.",
      internal_notes: "Evening access through building manager. Monthly washroom consumables review.",
      billingAddress: "Unit 4, M1 business park",
      properties: [
        {
          id: "PROP-3001",
          client_id: "client-abc-offices",
          label: "Unit 4",
          name: "Unit 4",
          address: "Unit 4, M1 business park",
          area: "M1 business park",
          postcode: "M1",
          property_type: "commercial_office",
          bedrooms: "not_applicable",
          bathrooms: "not_applicable",
          default_service_type: "commercial_clean",
          default_cadence: "weekly",
          preferred_day: "flexible",
          preferred_time_window: "evening",
          access_method: "key_held",
          parking: "staff_bays",
          pets_present: "not_applicable",
          cleaning_products: "pandazen_provides",
          vacuum_hoover: "pandazen_brings",
          mop: "pandazen_brings",
          property_notes: "Key held in lockbox. Building manager confirms evening access.",
          cleaning_notes: "Washrooms and common areas. Consumables reviewed monthly.",
          next_action: "Invoice consumables top-up"
        }
      ],
      activeWork: [
        { type: "Job", title: "Commercial contract", status: "Recurring", tone: "info" },
        { type: "Invoice", title: "Consumables top-up", status: "Due", tone: "warning" }
      ],
      requests: [],
      quotes: [],
      jobs: [
        { number: "JOB-1204", title: "Commercial contract", status: "Recurring", tone: "info", propertyId: "PROP-3001" }
      ],
      invoices: [
        { number: "INV-3048", title: "Consumables top-up", amount: "GBP 125.00", status: "Sent", tone: "info" }
      ],
      billingHistory: [
        { invoice: "INV-3048", detail: "Consumables top-up sent today", amount: "GBP 125.00" }
      ]
    },
    {
      id: "client-harris",
      initials: "HA",
      display_name: "Harris",
      name: "Harris",
      company: "",
      client_type: "individual",
      company_name: "",
      first_name: "Harris",
      last_name: "",
      status: "prospect",
      statusTone: "warning",
      lead_source: "phone",
      email: "harris@example.test",
      phone: "07700 900545",
      balance: "GBP 0.00",
      mainProperty: "2-bed flat",
      area: "Ealing",
      activeSummary: "Request open",
      lastCommunication: "5 days ago",
      internalNote: "Asked for one-off deep clean price. Needs follow-up before weekend.",
      internal_notes: "Asked for one-off deep clean price. Needs follow-up before weekend.",
      billingAddress: "2-bed flat, Ealing",
      properties: [
        {
          id: "PROP-4001",
          client_id: "client-harris",
          label: "2-bed flat",
          name: "2-bed flat",
          address: "2-bed flat, Ealing",
          area: "Ealing",
          postcode: "Ealing",
          property_type: "flat_apartment",
          bedrooms: "2",
          bathrooms: "unknown",
          default_service_type: "to_confirm",
          default_cadence: "to_confirm",
          preferred_day: "to_confirm",
          preferred_time_window: "to_confirm",
          access_method: "to_arrange",
          parking: "paid_parking",
          pets_present: "unknown",
          cleaning_products: "to_confirm",
          vacuum_hoover: "to_confirm",
          mop: "to_confirm",
          property_notes: "Client to confirm access.",
          cleaning_notes: "Cleaning scope belongs in the request once created.",
          next_action: "Create request with service scope"
        }
      ],
      activeWork: [
        { type: "Request", title: "Deep clean enquiry", status: "Open", tone: "warning" }
      ],
      requests: [
        { number: "REQ-1045", title: "Deep clean enquiry", status: "Open", tone: "warning", propertyId: "PROP-4001" }
      ],
      quotes: [],
      jobs: [],
      invoices: [],
      billingHistory: [
        { invoice: "No billing history", detail: "Prospect has not been billed", amount: "GBP 0.00" }
      ]
    }
  ],

  requests: [
    {
      id: "request-1046",
      number: "REQ-1046",
      title: "Weekly clean enquiry",
      client_id: "client-olivia-carter",
      property_id: "PROP-2001",
      request_type: "regular_domestic_clean",
      status: "new_enquiry",
      source: "website_enquiry",
      received_at: "Today",
      updated_at: "Today",
      next_action: "Contact customer",
      customer_message: "We are looking for a weekly domestic clean on Fridays if you have space. Eco products preferred.",
      service_summary: "Regular weekly domestic clean enquiry for a family home. Confirm rooms, preferred products, and start date before quote.",
      short_scoping_note: "Likely recurring domestic quote, but call first to confirm room priorities and whether an initial deep clean is needed.",
      preferred_cadence: "weekly",
      how_soon: "next_week",
      preferred_day: "friday",
      preferred_time_window: "morning",
      intake_property_type: "domestic_house",
      approx_size: "large",
      bedrooms: "4",
      bathrooms: "2",
      pets_present: "cat",
      parking: "driveway",
      main_priorities: ["kitchen", "bathrooms", "floors"],
      photos_helpful: "yes",
      cleaning_products: "mixed_specific_products_required",
      vacuum_hoover: "client_provides",
      mop: "client_provides",
      cleaning_products_state: "suggested",
      setup_confirmed: false,
      quote_readiness: "needs_contact",
      assessment_required: "optional",
      assessment_state: "suggested",
      estimated_regular_duration_minutes: 180,
      regular_duration_state: "suggested",
      estimated_initial_duration_minutes: 300,
      initial_duration_state: "suggested",
      estimated_team_size: 1,
      team_size_state: "suggested",
      initial_clean_required: "yes",
      initial_clean_state: "suggested",
      pricing_basis: "fixed_per_visit",
      pricing_basis_state: "suggested",
      quote_considerations: ["eco_products_preferred", "photos_requested", "initial_deep_clean"],
      scope_confidence: "medium",
      property_notes: "Client usually home. Cat indoors, keep front door closed.",
      cleaning_notes: "Eco products preferred.",
      internal_notes: "Referral lead. Good fit for recurring route.",
      owner: "Office"
    },
    {
      id: "request-1045",
      number: "REQ-1045",
      title: "Deep clean before guests",
      client_id: "client-john-smith",
      property_id: "PROP-1007",
      request_type: "deep_clean",
      status: "assessment_needed",
      source: "website_enquiry",
      received_at: "Yesterday",
      updated_at: "Yesterday",
      next_action: "Book visit",
      customer_message: "We have family visiting and would like a deep clean before they arrive. Friday morning would be ideal.",
      service_summary: "Deep clean request before guest visit. Assess whether weekly domestic follow-up is wanted after first clean.",
      short_scoping_note: "Book assessment or photo review before quote. Customer timing sounds tight, so confirm quote scope before sending.",
      preferred_cadence: "one_off",
      how_soon: "this_week",
      preferred_day: "friday",
      preferred_time_window: "morning",
      intake_property_type: "domestic_house",
      approx_size: "medium",
      bedrooms: "3",
      bathrooms: "2",
      pets_present: "dog",
      parking: "permit_required",
      main_priorities: ["kitchen", "bathrooms", "floors", "dusting"],
      photos_helpful: "requested",
      cleaning_products: "pandazen_provides",
      vacuum_hoover: "client_provides",
      mop: "pandazen_brings",
      cleaning_products_state: "confirmed",
      setup_confirmed: false,
      quote_readiness: "needs_assessment",
      assessment_required: "yes",
      assessment_state: "confirmed",
      estimated_regular_duration_minutes: 180,
      regular_duration_state: "suggested",
      estimated_initial_duration_minutes: 300,
      initial_duration_state: "suggested",
      estimated_team_size: 1,
      team_size_state: "suggested",
      initial_clean_required: "yes",
      initial_clean_state: "suggested",
      pricing_basis: "one_off_fixed",
      pricing_basis_state: "suggested",
      quote_considerations: ["photos_requested", "initial_deep_clean", "parking_permit_needed"],
      scope_confidence: "medium",
      property_notes: "Client home for first visit. Dog present, friendly but excitable.",
      cleaning_notes: "Focus on kitchen, bathrooms, and hallway floors.",
      internal_notes: "Potential recurring weekly lead after initial clean.",
      owner: "Amy"
    },
    {
      id: "request-1044",
      number: "REQ-1044",
      title: "Office cleaning quote",
      client_id: "client-abc-offices",
      property_id: "PROP-3001",
      request_type: "commercial_clean",
      status: "quote_required",
      source: "manual",
      received_at: "2 days ago",
      updated_at: "Today",
      next_action: "Prepare quote",
      customer_message: "Please price evening office cleaning and washroom support for Unit 4.",
      service_summary: "Commercial clean quote for weekly evening office service with washroom/common area focus.",
      short_scoping_note: "Assessment complete. Quote as monthly commercial contract with optional consumables line item.",
      preferred_cadence: "weekly",
      how_soon: "next_week",
      preferred_day: "flexible",
      preferred_time_window: "evening",
      intake_property_type: "commercial_office",
      approx_size: "commercial_medium",
      bedrooms: "not_applicable",
      bathrooms: "not_applicable",
      pets_present: "not_applicable",
      parking: "staff_bays",
      main_priorities: ["washrooms", "common_areas"],
      photos_helpful: "no",
      cleaning_products: "pandazen_provides",
      vacuum_hoover: "pandazen_brings",
      mop: "pandazen_brings",
      cleaning_products_state: "confirmed",
      setup_confirmed: true,
      quote_readiness: "ready_to_quote",
      assessment_required: "completed",
      assessment_state: "confirmed",
      estimated_regular_duration_minutes: 120,
      regular_duration_state: "confirmed",
      estimated_initial_duration_minutes: null,
      initial_duration_state: "not_estimated",
      estimated_team_size: 2,
      team_size_state: "confirmed",
      initial_clean_required: "not_applicable",
      initial_clean_state: "confirmed",
      pricing_basis: "monthly_contract",
      pricing_basis_state: "confirmed",
      quote_considerations: ["commercial_consumables_option", "key_holder_access"],
      scope_confidence: "high",
      property_notes: "Key held in lockbox. Building manager confirms evening access.",
      cleaning_notes: "Washrooms and common areas. Consumables reviewed monthly.",
      internal_notes: "Commercial quote should include consumables option.",
      owner: "Sam"
    },
    {
      id: "request-1043",
      number: "REQ-1043",
      title: "End of tenancy clean",
      client_id: "client-harris",
      property_id: "PROP-4001",
      request_type: "end_of_tenancy",
      status: "waiting_customer",
      source: "phone",
      received_at: "5 days ago",
      updated_at: "2 days ago",
      next_action: "Confirm access",
      customer_message: "Need a price for an end of tenancy clean on a two-bed flat. Access is not confirmed yet.",
      service_summary: "End of tenancy enquiry. Confirm access, layout, and whether oven/windows are included before quote.",
      short_scoping_note: "Not quote-ready. Confirm access, bathroom count, photos, and whether oven/windows are expected.",
      preferred_cadence: "one_off",
      how_soon: "to_confirm",
      preferred_day: "to_confirm",
      preferred_time_window: "to_confirm",
      intake_property_type: "flat_apartment",
      approx_size: "medium",
      bedrooms: "2",
      bathrooms: "unknown",
      pets_present: "unknown",
      parking: "paid_parking",
      main_priorities: ["move_out_standard", "oven"],
      photos_helpful: "yes",
      cleaning_products: "to_confirm",
      vacuum_hoover: "to_confirm",
      mop: "to_confirm",
      cleaning_products_state: "to_confirm",
      setup_confirmed: false,
      quote_readiness: "missing_scope",
      assessment_required: "to_confirm",
      assessment_state: "to_confirm",
      estimated_regular_duration_minutes: null,
      regular_duration_state: "not_estimated",
      estimated_initial_duration_minutes: null,
      initial_duration_state: "not_estimated",
      estimated_team_size: null,
      team_size_state: "not_estimated",
      initial_clean_required: "to_confirm",
      initial_clean_state: "to_confirm",
      pricing_basis: "to_confirm",
      pricing_basis_state: "to_confirm",
      quote_considerations: ["photos_requested", "access_to_confirm", "oven_windows_to_confirm"],
      scope_confidence: "low",
      property_notes: "Client to confirm access.",
      cleaning_notes: "Cleaning scope belongs in this request before quoting.",
      internal_notes: "Follow up before weekend.",
      owner: "Office"
    }
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
    selectedDayIndex: 2,
    days: [
      { index: 0, short: "Mon", label: "Mon 8", date: "2026-06-08", weekend: false },
      { index: 1, short: "Tue", label: "Tue 9", date: "2026-06-09", weekend: false },
      { index: 2, short: "Wed", label: "Wed 10", date: "2026-06-10", weekend: false, today: true },
      { index: 3, short: "Thu", label: "Thu 11", date: "2026-06-11", weekend: false },
      { index: 4, short: "Fri", label: "Fri 12", date: "2026-06-12", weekend: false },
      { index: 5, short: "Sat", label: "Sat 13", date: "2026-06-13", weekend: true },
      { index: 6, short: "Sun", label: "Sun 14", date: "2026-06-14", weekend: true }
    ],
    scheduledVisits: [
      {
          id: "sv-1001",
          type: "Request / enquiry",
          statusGroup: "Scheduled",
          dayIndex: 2,
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
          type: "Quote / assessment",
          statusGroup: "Scheduled",
          dayIndex: 3,
        start: "11:30",
        duration: 60,
        client: "Mrs. Elaine Patterson",
        property: "14 Oak Lane, Durham",
        service: "Quote assessment",
        team: "Marta + Daniel",
        status: "Scheduled",
        tone: "info",
        warnings: [],
          completed: false,
          map: { x: 57, y: 44 }
        },
        {
          id: "sv-1007",
          type: "Cleaning visit",
          statusGroup: "Scheduled",
          dayIndex: 3,
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
          type: "Issue / revisit",
          statusGroup: "Issue / warning",
          dayIndex: 4,
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
          type: "Request / enquiry",
          statusGroup: "Scheduled",
          dayIndex: 4,
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
          type: "Commercial / special",
          statusGroup: "Issue / warning",
          dayIndex: 5,
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
          type: "Task / reminder",
          statusGroup: "Completed",
          dayIndex: 0,
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
          type: "Task / reminder",
          statusGroup: "Overdue",
          dayIndex: 1,
        start: "15:00",
        duration: 60,
        client: "Olivia Carter",
        property: "Family home, Durham",
        service: "Call before quote",
        team: "Unassigned",
        status: "Overdue",
        tone: "danger",
        warnings: ["Unassigned"],
        completed: false,
        map: { x: 35, y: 64 }
      }
    ],
    unscheduled: [
      {
        id: "uv-2001",
        type: "Request / enquiry",
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
        type: "Cleaning visit",
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
        type: "Issue / revisit",
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
      { day: 1, count: 2, text: "2 visits", type: "Cleaning visit" },
      { day: 2, count: 1, text: "Assessment", type: "Quote / assessment" },
      { day: 4, count: 3, text: "3 visits", type: "Cleaning visit" },
      { day: 8, count: 1, text: "Follow-up", type: "Task / reminder" },
      { day: 9, count: 2, text: "2 visits", type: "Cleaning visit" },
      { day: 11, count: 1, text: "Request", type: "Request / enquiry" },
      { day: 12, count: 2, text: "2 visits", type: "Cleaning visit" },
      { day: 13, count: 1, text: "Issue", type: "Issue / revisit" },
      { day: 14, count: 3, text: "3 visits", type: "Cleaning visit" },
      { day: 17, count: 2, text: "Quotes", type: "Quote / assessment" },
      { day: 21, count: 1, text: "Deep clean", type: "Cleaning visit" },
      { day: 24, count: 2, text: "Commercial", type: "Commercial / special" },
      { day: 28, count: 1, text: "Revisit", type: "Issue / revisit" }
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
