# Customer Analytics - Quick Reference

## Dashboard Access

The Customer Analytics Dashboard is integrated into the Manager Dashboard as a new tab.

### Navigation
```
Manager Dashboard → Analytics → Customer Analytics
```

### URL
```
/manager/analytics
```

## Key Features at a Glance

### Overview Tab
- **At-Risk Customers**: Count of customers with churn score ≥ 70%
- **Active Segments**: Number of active customer segments
- **Cohorts Tracked**: Number of cohorts being analyzed
- **Top Deal Engagement**: Best performing deal metric

### Churn Prediction Tab
- **Quick Start**: Click "Recalculate Risks" to update all churn scores
- **Risk Levels**:
  - 🔴 Critical (80-100%): Immediate action needed
  - 🟠 High (60-80%): Launch retention campaign
  - 🟡 Medium (40-60%): Monitor and follow up
- **Export**: Download CSV of at-risk customers

### Segments Tab
- **Create Segment**: Click "Create Segment" to build new groups
- **Criteria**:
  - Minimum lifetime spend (slider)
  - Minimum number of visits (slider)
  - Maximum days since last visit (slider)
- **Actions**: View members, export list, re-evaluate criteria

### Cohorts Tab
- **Retention Curves**: Visual representation of retention by cohort
- **Metrics**:
  - Week 1 Retention: % of cohort still active after 1 week
  - Week 4 Retention: % of cohort still active after 4 weeks
- **Analysis**: Compare cohort quality and identify best acquisition periods

### Deal Engagement Tab
- **Deal Performance**: Sorted by total engagements
- **Metrics per Deal**:
  - Unique Customers: How many different customers engaged
  - Total Engagements: Total times deal was triggered
  - Total Bonus: Dollar value issued
  - Engagement Rate: % of all customers who engaged

## Common Tasks

### Task 1: Identify At-Risk Customers
1. Go to "Churn Prediction" tab
2. Review customers with scores > 60%
3. Click "Recalculate Risks" to update
4. Export CSV for outreach campaign

**Use Case**: Launch "We Miss You" email campaign for customers inactive >30 days

### Task 2: Create a VIP Segment
1. Go to "Segments" tab
2. Click "Create Segment"
3. Set criteria:
   - Min Lifetime Spend: $2,000
   - Min Visits: 20+
   - Max Days Since Visit: 30
4. Name: "VIP Customers"
5. Click "Create Segment"
6. Use segment for targeted deals

**Use Case**: Send exclusive deals to your highest-value customers

### Task 3: Track New Customer Retention
1. Go to "Cohorts" tab
2. Look at most recent cohort period
3. Compare Week 1 and Week 4 retention
4. If low, identify what happened

**Use Case**: Optimize onboarding flow based on cohort retention data

### Task 4: Find Best Performing Deals
1. Go to "Deal Engagement" tab
2. Sort by "Total Engagements"
3. Check engagement rate (% of customer base)
4. Compare different deal types

**Use Case**: Decide which deals to continue and which to retire

### Task 5: Tag Important Customers
1. From any customer detail page
2. Click "Add Tag"
3. Choose from predefined or custom tags
4. Set confidence level and expiration

**Use Case**: Mark VIP customers for special treatment, flag at-risk for follow-up

## Performance Tips

### Reducing Load Times
- Filter churn customers by risk level before exporting
- Use date range filters on retention metrics
- Segment by tenant if multi-tenant setup

### Optimization Strategies
1. **Run churn recalculation weekly**, not daily
   - Jobs → Maintenance → "Recalculate Churn Risk"
   
2. **Archive old cohorts** after 12 months
   - Keeps dashboard responsive
   
3. **Use exports for bulk analysis**
   - Don't filter large datasets in UI
   - Export to Excel for deeper analysis

## Integration with Other Features

### With Deal Templates
```
Advanced Deal Templates → Create Comeback Deal
→ Use "Churn Risk" tag from analytics
→ Target customers inactive 30+ days
```

### With Loyalty Tiers
```
Customer Tier → Churn Risk Analysis
→ Track which tiers have highest churn
→ Adjust tier multipliers or benefits
```

### With Branch Management
```
Branch Management → Customer Movement
→ Use Cohort Analysis to compare branches
→ Identify strongest and weakest locations
```

## Data Interpretation

### Churn Risk Score Meaning
- **Score = 0.8 (80%)**
  - 30+ days inactive
  - Recent spending decline
  - Below-average visit frequency
  - → Action: Contact within 48 hours

### Cohort Retention Interpretation
- **Week 1: 85%, Week 4: 60%**
  - Initial experience is good
  - Mid-month drop suggests unclear value prop
  - → Action: Strengthen week 2-3 experience

### Deal Engagement Rate Meaning
- **80% engagement rate = 80% of customers engaged with deal**
  - Highly popular deal
  - Good for brand awareness
  - → Action: Continue offering

- **10% engagement rate = only 10% engaged**
  - Niche or unpopular deal
  - Check if it's visible to target audience
  - → Action: Modify or retire

## Common Questions

**Q: Why are my cohort retention numbers going down?**
A: Normal - retention decreases as time passes. Week 4 < Week 1 is expected. Compare Week 4 across cohorts.

**Q: Should I recalculate churn risk daily?**
A: No, weekly is sufficient. Recalculate after major campaign or seasonal events.

**Q: How do I know if a segment is good?**
A: Size should be 5-20% of customer base. Too small = too narrow. Too large = not selective enough.

**Q: Can I undo a segment creation?**
A: Yes, segments are purely analytical. Delete without affecting customers.

**Q: What's the difference between cohort and segment?**
A: **Cohort** = grouped by acquisition date. **Segment** = grouped by behavior/criteria.

## Best Practices

### Weekly Routine
1. Review new churn risk customers (Mon morning)
2. Check deal engagement stats (Wed)
3. Analyze cohort retention trends (Fri)
4. Plan segment-based campaigns (Fri afternoon)

### Monthly Routine
1. Full churn risk recalculation
2. Create segment for top 10% (high-value)
3. Create segment for at-risk customers
4. Export data for board reporting

### Quarterly Routine
1. Review all cohort data
2. Identify best performing acquisition period
3. Compare deal engagement across quarters
4. Plan next quarter's deal strategy

## Troubleshooting

### Dashboard Not Loading
- Check internet connection
- Clear browser cache
- Verify authorization token is valid
- Check browser console for errors

### Churn Scores Seem Wrong
- Run "Recalculate Risks" button
- Check customer visit history
- Verify customer data isn't deleted

### Segment Has 0 Members
- Check criteria JSON syntax
- Verify customer data matches criteria
- Click "Repopulate" button
- Check min values aren't too high

### Export Not Working
- Disable popup blockers
- Try different browser
- Check file download settings
- Contact IT support

## Data Export

### CSV Format
All exports include standard columns:
- Customer ID
- Customer Name
- Primary Metric (score, spend, etc.)
- Secondary Metrics

### Using Exports
1. **Excel**: Open directly in spreadsheet
2. **Bulk Email**: Upload to email platform
3. **CRM Sync**: Import to external system
4. **Analytics**: Process in BI tools

## Advanced Features

### A/B Testing (Coming Soon)
- Create variant A and variant B of deals
- Random customer assignment
- Compare conversion rates
- Statistical significance testing

### Custom Reports (Coming Soon)
- Build custom analytics views
- Schedule automated reports
- Email delivery
- Custom metrics

### Predictive Analytics (Coming Soon)
- ML-based churn prediction
- Revenue forecasting
- Customer LTV prediction
- Optimal offer timing

---

**Last Updated**: 2025-01-30
**Version**: 1.0.0
**Status**: ✅ Production Ready
