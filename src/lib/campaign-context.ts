/**
 * Central campaign context for AI assistant.
 * Aggregates all departmental data for LLM grounding.
 */

export function getFullCampaignContext(): string {
	return `
## CAMPAIGN INTELLIGENCE BRIEFING (2027 Kenyan General Election)

### COST OF LIVING CRISIS — TALKING POINTS
Source: VoterCore Internal Research, March 2027

**Rising Inflation & Basic Needs**
- Nairobi: Inflation at 8.5%, food prices up 12% YoY. Households spend 40% of income on essentials (maize, beans, fuel).
- Mombasa: 15% surge in imported goods (rice, cooking oil). 60% of families report "stretching meals" due to rising costs.

**Youth & Low-Income Struggles**
- Kisumu: 25% youth unemployment. 40% of students in public schools report inadequate school meals due to family budget cuts.
- Nakuru: Informal sector workers (30% of labor force) face 20% wage erosion vs. 10% inflation, eroding purchasing power.

**Healthcare & Education Burden**
- Eldoret: 50% of households delay medical care due to costs. Tuition fees for public universities rose 18% in 2027.
- Mombasa: 30% of families spend 50%+ of income on housing; rental prices up 25% since 2024.

**Campaign Solutions**
- Cap essential food prices at 10% above 2023 levels; expand subsidies for low-income families.
- Create 50,000 jobs in agriculture and tech hubs across Nairobi and Kisumu.
- Free primary education and tuition waivers for public university students in Mombasa and Eldoret.

**Key Message Frame**: "Failure of the status quo" → position campaign as the only viable path to affordable living.

### SENTIMENT & ENGAGEMENT DATA (Dashboard)
Source: VoterCore Analytics Dashboard, March 2027

- Overall voter sentiment: 68% positive (+5.2% MoM)
- Message engagement rate: 4.2% (+0.8%)
- Total donors: 12,482 (+12%)
- Recent media hits: 124 (target: 150)
- Email open rates: Weekly Update #14 (82%), Policy Paper (65%), Donation Match Alert (91%)
- Key issues: Unga Prices (xl), Healthcare (lg), Job Creation (md), Education/CBC (sm), Housing (md), Infrastructure (xs), Environment (sm), Taxation (xs)
- Top rising theme: Cost of Living +15%

### FINANCE — BUDGET, SPENDING & REPORTS
Source: Finance Team Dashboard

**Key Stats**
- Total Campaign Budget: KSh 1.2B (+4.5% vs plan)
- Actual Spend to Date: KSh 480M (41% of budget)
- Committed Spend: KSh 220M (26 contracts)
- Runway Remaining: 142 days (-8 days vs baseline)

**Expense Breakdown**
- Media & Ads: KSh 210M (40%)
- Field Operations: KSh 120M (23%)
- Logistics & Travel: KSh 65M (13%)
- Research & Polling: KSh 40M (8%)
- Compliance & Legal: KSh 25M (6%)
- Other: KSh 20M (10%)

**Cash Flow (Jan–Jun)**
- Jan: inflow 95, outflow 72
- Feb: inflow 84, outflow 76
- Mar: inflow 112, outflow 92
- Apr: inflow 128, outflow 104
- May: inflow 122, outflow 110
- Jun: inflow 138, outflow 124

**Finance Reports**
- FIN-024: Q2 Budget vs Actuals – National Campaign (Budget Report, Apr–Jun 2026, Finance Team, Final)
- FIN-021: Media Spend vs Plan by Region (Media Spend, Jan–Mar 2026, Media Finance, In Review)
- FIN-018: Cash Flow Forecast to Election Day (Forecast, Jul 2026 – Aug 2027, Treasury, Draft)

### OUTREACH & CRM
Source: Outreach Team Dashboard

**Funnel Stats**
- New contacts this week: 5,420 (+18% vs last week)
- Active conversations: 1,238 (+9% vs last week)
- Follow-ups overdue: 312 (-6% vs last week)
- Reactivation wins: 184 (+22% vs last week)

**Contact Segments**
- Core supporters: 82,340 (trend: up)
- Persuadables: 56,120 (trend: up)
- Undecided: 34,980 (trend: flat)
- At risk: 12,411 (trend: down)

**Weekly Contacts (W1–W8)**
W1: 3,820 | W2: 4,100 | W3: 4,380 | W4: 4,620 | W5: 5,010 | W6: 5,420 | W7: 5,720 | W8: 5,940

**Outreach Reports**
- OUT-019: Ward-level door-to-door coverage – Nairobi (Field, Feb 2026, Ground Game)
- OUT-016: SMS mobilisation for voter registration (SMS, Jan–Feb 2026, Comms)
- OUT-013: Re-engagement of lapsed volunteers (Email, Q4 2025, Organising)

### CALL CENTER
Source: Call Center Dashboard

**Key Stats**
- Calls today: 1,260
- Avg handle time: 4m 08s
- Surveys completed: 354
- Follow-ups flagged: 102

**Daily Call Volume (Mon–Sun)**
Mon: 980 (82% answered) | Tue: 1,120 (79%) | Wed: 1,340 (81%) | Thu: 1,410 (83%) | Fri: 1,260 (80%) | Sat: 760 (77%) | Sun: 540 (75%)

**Call Topic Distribution**
- Cost of living & prices: 34%
- Jobs & opportunities: 22%
- Service delivery issues: 18%
- Supporter & volunteering: 16%
- Other / misc: 10%

**Call Center Reports**
- CC-012: Weekly call reason distribution (Week 10 · 2026, Call Ops)
- CC-010: Constituent issue escalation report (Feb 2026, Support Desk)

### COMMS
Source: Comms Team

**Comms Reports**
- COM-028: Weekly cross-channel message performance (Email, SMS, WhatsApp, Week 10 · 2026, Comms Ops)
- COM-024: Narrative response effectiveness (Social + Field, Feb 2026, Message Strategy)
- COM-020: Event invite funnel performance (SMS + Email, Jan 2026, Engagement)

### RESEARCH
Source: Research Team Dashboard

**Research Reports**
- RES-041: Weekly Tracking Poll – National Vote Intent (Quant · Tracking, 1–7 Mar 2026, Polling Unit, Final)
- RES-036: Youth Focus Groups – Hustler Fund Perception (Qual · Focus Groups, 18–20 Feb 2026, Insights Team, In Review)
- RES-032: Issue Salience – Cost of Living vs Jobs (Quant · Issue Tracker, Jan 2026, Research Team, Draft)

**Team Focus**: Polling trends, survey performance, voter insight through studies and narrative tracking.

### MEDIA & CONTENT
Source: Media Team Dashboard

- Assets uploaded this week: 184
- Creatives in review: 27
- Approved for flighting: 63

**Team Focus**: High-quality content reinforcing campaign narrative; creative variants and response clips for trending issues.

### ANALYTICS & REPORTS
Source: Analytics Dashboard

**KPIs**
- Overall Reach: 2.4M (+18.3%)
- Voter Contacts: 485K (+12.1%)
- Conversion Rate: 3.8% (-0.4%)
- Cost per Contact: KSh 42 (-8.2%)

**Channel Performance (sent / delivered / response)**
- SMS Campaigns: 320K / 98.2% / 12.4%
- WhatsApp: 185K / 99.1% / 24.8%
- Email Blasts: 420K / 94.5% / 4.2%
- Social Ads: 1.2M / 87.3% / 2.1%
- Door-to-Door: 45K / 100% / 38.6%

**Reach by County**
- Nairobi: 89% | Mombasa: 76% | Kisumu: 72% | Nakuru: 65% | Eldoret: 58% | Machakos: 52%

### ADMIN OVERVIEW — TEAM SUMMARIES
- Research: 3 active studies (status: good)
- Finance: 41% budget spent (status: good)
- Outreach & CRM: 5.4K contacts added this week (status: warning)
- Opposition: 68% narrative risk (status: risk)

**Recent Reports (cross-team)**
- RES-041: Weekly tracking poll – national vote intent (Research, Today)
- FIN-024: Q2 budget vs actuals – national campaign (Finance, Yesterday)
- OUT-019: Ward-level door-to-door coverage – Nairobi (Outreach & CRM, 2 days ago)
- AD-OPP-221: Opposition cost of living attack – Nairobi (Opposition, 2 days ago)

**Activity Feed**
- Email Blast Dispatched: "Town Hall Invitation" sent to 120,000 voters across Nairobi County (2 hours ago)
- New Fundraising Milestone: Reached KSh 300M goal for the quarter. Major fundraiser held in Mombasa (5 hours ago)
- Media Mention Recorded: Candidate interviewed on Citizen TV regarding Kisumu infrastructure projects (Yesterday)
- War Room Alert: Disinformation campaign detected on social media targeting Nakuru voters (2 days ago)

### TOP TRENDING ISSUES (Social Listening)
1. #UngaPrices — 45.2K mentions, +320% surge — NEGATIVE sentiment
2. #CBCReform — 28.4K mentions, +180% — MIXED
3. #HealthcareForAll — 22.1K mentions, +95% — POSITIVE
4. #JobCreation — 18.9K mentions, +67% — POSITIVE
5. #InfrastructureDev — 15.3K mentions, +42% — MIXED

### WAR ROOM — ACTIVE THREATS
- Disinformation campaign targeting Nakuru voters with false healthcare claims (CRITICAL — 92% severity)
- Opposition ad spend on Facebook up 340% in Nairobi (WARNING)
- Voter suppression messaging in Kisumu (ESCALATED — 85% severity)

### COUNTY PERFORMANCE
- Nairobi: 68% positive sentiment, strong support
- Mombasa: 72% positive, strong support
- Kisumu: 45% positive — SWING COUNTY (high priority)
- Nakuru: 58% positive — swing county
- Eldoret: 65% positive, mostly supporter base
`;
}
