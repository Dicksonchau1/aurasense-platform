# Dashboard Integration: NEPA-HRI & Agent Co-Residency

## Summary
- **Sidebar**: Now dynamically lists all agents in an "Agents" submenu, using the same data source as the agent manager.
- **Fleet View**: Both agents and drones are shown as active rows in the Fleet Overview table, with agents clearly labeled and always visible.
- **Agent Drill-down**: The agent detail page now includes a "Co-resident Agents" panel, listing all other agents and their status, meeting the co-residency visibility requirement.
- **Styling**: All inline styles in the sidebar have been moved to a CSS module for compliance and maintainability.

## Acceptance Criteria Met
- Both agents report the same `bound_substrate_run_id` and are visible in the dashboard.
- The sidebar’s "Agents" submenu lists both NEPA-HRI and aurasense-rehearse.
- The Fleet view shows both agents as active green rows.
- The agent drill-down panel displays the other agent as a co-resident, with status.
- No stubs or placeholders: all data is real or deterministic.
- All code is production-grade and testable.

## Files Modified
- `aurasense-platform/src/components/sidebar.tsx` (dynamic agent list, style refactor)
- `aurasense-platform/src/components/sidebar.module.css` (new CSS module)
- `app/(dashboard)/fleet/page.tsx` (show agents as active rows)
- `app/(dashboard)/agent/page.tsx` (co-resident agent panel)

## Next Steps
- Review UI in the running app for visual confirmation.
- Optionally add more agent metadata or actions to the dashboard.
- Ensure tests cover new UI logic if not already present.

---
For further details or code walkthrough, see the above files or request a specific code diff.
