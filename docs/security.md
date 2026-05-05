# Panda Zen Security Setup

The admin portal and API must be protected before real customer data is entered.

## Protect These Paths

Use Cloudflare Access to protect:

```text
/admin/*
/api/*
```

The public website stays open:

```text
/
/assets/*
```

## Recommended Access Policy

Allow only named emails:

```text
owner email
cleaner/admin email
```

Use email one-time PIN or Google login. The email accounts themselves should have 2FA enabled.

## Data Minimisation

Store only what Panda Zen needs to operate.

Leads:

```text
Name
Phone/email
Area
Service interest
Notes
```

Avoid storing full address or access notes at lead stage unless required.

Clients:

```text
Full address
Access notes only if needed
Pets
Product preferences
Surface notes
Cleaning plan
```

Cleaner view:

```text
Assigned jobs only
Address for the job
Essential access notes
Checklist
Special instructions
```

Do not show invoices, full lead history, or unnecessary admin notes to cleaner roles.

## Do Not Store Unless Necessary

Avoid storing:

```text
Alarm codes
Key safe codes
Detailed holiday dates
Bank details
Unnecessary family details
Sensitive personal notes
```

If key or alarm details become necessary, add a separate sensitive-notes design later rather than mixing them into ordinary notes.

## Public Enquiry Form Plan

When the public website form is wired to the database, split APIs like this:

```text
/api/public/enquiry   public, protected by Turnstile
/api/*                private, protected by Cloudflare Access
```

Until that split exists, keep `/api/*` protected by Cloudflare Access.

## Setup Steps In Cloudflare

1. Go to Zero Trust / Access / Applications.
2. Add an application for the Pages domain.
3. Add protected paths for `/admin/*` and `/api/*`.
4. Add an allow policy for approved emails only.
5. Test public website without login.
6. Test `/admin/` and `/api/leads` require login.
