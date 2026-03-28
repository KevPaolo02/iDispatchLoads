# iDispatchLoads.com Product Map

## Project

We are not building random pages. We are building a staged logistics product that evolves in 3 versions:

- `VERSION 1 = LEAD MACHINE`
- `VERSION 2 = DISPATCH CRM`
- `VERSION 3 = PLATFORM`

The key rule:

Build Version 1 in a way that naturally grows into Version 2 and later Version 3.
Do not build throwaway work.
Do not overbuild too early.
Do not prioritize marketplace/load board features yet.

## 1. Product Vision

iDispatchLoads.com is a dispatch-focused business for owner-operators and small fleets.

The immediate goal is not to build a giant platform.
The immediate goal is to get qualified leads, convert them into dispatch clients, and create a clean foundation for operations and future scale.

The business ladder is:

Traffic
-> Landing page
-> Lead capture
-> Sales conversations
-> Driver onboarding
-> Dispatch operations
-> Internal CRM
-> Driver/client portal
-> Optional load board / platform

So the product must be built in phases.

## 2. Core Strategy

Version 1 is the revenue engine.
Version 2 is the operational engine.
Version 3 is the scale engine.

That means:

V1 gets attention and captures qualified leads.
V2 organizes the business so leads, drivers, loads, brokers, tasks, and documents are handled efficiently.
V3 turns the business into a scalable system with portals, workflows, and possibly marketplace/load board functionality.

Do not treat V1 as "just a website."
Treat it as the first layer of the full product.

## 3. Version 1 — Lean MVP / Lead Machine

Primary goal:
Generate qualified owner-operator leads and start revenue.

Target audience:
Owner-operators and small fleets looking for dispatch services.

Main outcome of V1:
A high-converting website that speaks directly to owner-operators and captures lead data into a structured backend.

V1 must include:

### A. Marketing Site

- Home
- Services
- How It Works
- Contact

### B. Conversion-Focused Homepage

The homepage must be written for owner-operators, not for everyone.
The message should focus on:

- saving time
- getting better rates
- staying consistently loaded
- reducing broker call stress
- having dedicated dispatch support

### C. Homepage Sections

- Hero with pain-driven headline and strong CTA
- Benefits / value proposition
- Services overview
- How it works (simple 3-step process)
- Testimonials / trust signals
- Contact / lead form
- Footer branding: "Powered by ColCore.co" (subtle, professional)

### D. Lead Capture System

The form should not only send email.
It should store structured lead data in a database.

Suggested lead fields:

- name
- phone
- email
- truck type
- preferred lanes
- optional notes
- source / campaign metadata if available

### E. Basic Analytics

Track:

- page visits
- CTA clicks
- form submissions

What V1 should NOT include:

- complex user accounts
- dashboards for customers
- load board / marketplace
- advanced automation
- broker portal
- full carrier portal

V1 should be fast, clean, and focused on converting leads.

## 4. Version 2 — Revenue-Focused Dispatch CRM

Primary goal:
Run dispatch operations efficiently once leads start coming in.

V2 is internal-facing first.
It is not a giant external platform yet.

Main outcome of V2:
An internal dashboard / CRM that helps manage the dispatch business without chaos.

V2 must include:

### A. Authentication and Roles

- admin
- dispatcher
- possibly support role later

### B. Core CRM Dashboard Areas

- Leads
- Drivers
- Trucks / equipment
- Brokers
- Loads
- Documents
- Tasks / reminders
- Notes / communication history

### C. Lead Pipeline

Statuses like:

- new
- contacted
- qualified
- onboarded
- lost

### D. Driver / Carrier Records

Store:

- contact details
- MC / DOT if needed
- truck/equipment type
- preferred lanes
- notes
- status

### E. Load Management

Track:

- broker
- origin
- destination
- rate
- status
- assigned driver
- notes
- timestamps

### F. Documents

Upload/manage:

- W9
- insurance
- MC authority docs
- rate confirmations
- PODs
- other compliance records

### G. Basic Reporting

- active leads
- onboarded drivers
- booked loads
- revenue
- pending follow-ups

What V2 should NOT include yet:

- open public marketplace
- complicated real-time chat
- overengineered client self-service
- giant automation layer before workflow is proven

V2 should make the actual business easier to run.

## 5. Version 3 — Platform / Scale Layer

Primary goal:
Turn the dispatch operation into a scalable logistics platform.

This only makes sense after V1 and V2 create real data and proven workflows.

Possible V3 components:

- Driver portal
- Dispatcher/admin workspace
- Broker or shipper portal (optional)
- Self-serve onboarding
- Load matching or load board
- Messaging / notifications
- Document center
- Billing / invoicing
- Reporting dashboards
- API / webhook integrations
- Multi-organization permissions if needed

Important:
A load board is not an early feature.
It is a late-stage feature.
A load board only matters if there is enough supply, enough demand, and enough fresh data to make it useful.

V3 should be built only after operational and data foundations are solid.

## 6. Architecture Principle

Build once, evolve forward.

The codebase should support all 3 versions without needing a full rewrite.

Suggested app structure:

```text
/app
  /(marketing)   -> public site for Version 1
  /(dashboard)   -> internal CRM for Version 2
  /(portal)      -> future platform features for Version 3

/components
  /marketing
  /dashboard
  /shared

/lib
  /db
  /auth
  /api
  /services
  /utils
```

The project should keep a clean separation between:

- public marketing experience
- internal operations dashboard
- future portal/platform features

## 7. Data Model Principle

Design the backend around business objects, not around pages.

Core entities we should plan for from the beginning:

- users
- roles
- leads
- drivers
- carriers
- trucks
- brokers
- loads
- documents
- tasks
- communications
- notes

Even if some are not fully used in V1, the data model should anticipate them.

V1 data should become V2 operational data.
Example:
A lead in Version 1 can later become a driver/carrier record in Version 2.

## 8. User Flow / Business Flow

Main business flow:

Visitor lands on site
-> reads owner-operator focused message
-> submits form
-> lead is stored in database
-> internal follow-up happens
-> lead becomes qualified
-> lead becomes onboarded driver
-> driver gets loads
-> load activity is tracked
-> data builds future platform intelligence

This is the full funnel.
Version 1 starts the funnel.
Version 2 manages the funnel.
Version 3 scales the funnel.

## 9. Current Stage

We are currently in Version 1.

More specifically:
We have already started the homepage and hero messaging.
We are in the conversion-focused landing page stage.

That means the immediate priority is:

1. finalize homepage messaging
2. finalize key homepage sections
3. build structured lead capture backend
4. deploy site
5. connect domain
6. start generating leads

We are NOT building the CRM yet.
We are NOT building the load board yet.
We are building V1 with V2/V3 awareness.

## 10. Immediate Build Priorities

Please treat these as the active priorities right now:

Priority 1:
Refine the public landing page for owner-operators

Priority 2:
Ensure homepage includes:

- strong hero
- clear benefits
- services
- how it works
- testimonials / trust
- dispatch-specific form

Priority 3:
Build form submission flow:
Form -> API route / server action -> database

Priority 4:
Store lead data in structured tables, not only email

Priority 5:
Keep the codebase organized so dashboard and portal layers can be added later

## 11. Tone / Design Direction

The design should feel:

- clean
- premium
- direct
- trustworthy
- conversion-focused
- logistics-specific
- modern but not overdesigned

The copy should not sound generic corporate.
It should sound like it understands owner-operator pain:

- chasing brokers
- wasting time
- low-paying loads
- inconsistency
- paperwork/admin burden

The CTA should be strong and practical.
Examples:

- Get a Dispatcher Today
- Start With a Dispatcher
- Let Us Handle the Dispatching

Footer should include subtle branding:
Powered by ColCore.co

## 12. Final Rules

Important rules for all implementation decisions:

- Revenue first
- Simplicity first
- Structured data from day one
- Reusable components
- Do not overbuild
- Do not skip layers
- Build Version 1 as the first layer of the full product, not as a disconnected marketing site
- Every feature added now should either help conversions immediately or support future evolution into CRM/platform logic

Please use this conceptual map as the source of truth for the project direction.
