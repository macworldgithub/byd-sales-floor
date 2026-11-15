# Harmony further updates in Sales Floor

Parity with the CRM changes requested in `Harmony_CRM_Delivery_Centre_Further_Updates.md`:

- Customer card → Delivery → **Sold · send to Delivery** now searches dealership inventory by VIN, stock number or model, with server pagination and an explicit **TBA · VIN to be advised** choice. Handoff sends an authoritative inventory reference or `vin_tba: true`; TBA does not invent a factory order.
- A **Post-delivery calls** banner below the header shows due day-3 reminders assigned to the salesperson (managers have their existing site scope). The dialog records required call notes, outcome and text action, offers a phone link, optional explicit SMS, and the linked Delivery profile.
- CRM and Sales Floor share the existing reminder records and completion history. Completing a reminder in either app removes it from both on the next refresh; this does not enroll customers or send a second automated sequence.
- These features use `/customer-delivery/inventory` and `/customer-delivery/post-delivery-followups`, so a Sales Floor account does not need CRM platform access. Site and salesperson permissions stay enforced by the shared backend.
- The Delivery worker recognizes both CRM and Sales Floor salesperson accounts when assigning new reminders. Customer SMS scheduling remains centralized in Delivery Centre, with the existing private-customer, fleet/demo exclusion and opt-out rules.

Sales Floor's mobile header also omits a redundant site selector for a single assigned site and constrains text/selector widths.

Validation: production build and TypeScript checks; shared backend API suite including real middleware with a Sales Floor-only account; delivery worker assignment tests; desktop/mobile browser checks of reminder notes/text actions, inventory search/pagination and selected-VIN/TBA handoffs. Synthetic browser texts use mocked responses.
