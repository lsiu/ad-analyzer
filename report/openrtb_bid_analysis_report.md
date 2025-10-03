# OpenRTB Bid Analysis Report

## Executive Summary

This report analyzes bid request/response pairs from OpenRTB data to extract placement IDs with their corresponding bid prices from each demand source. The analysis reveals key insights about bidding patterns, demand sources, and placement performance.

## Key Findings

### 1. Placement Identification in OpenRTB

In OpenRTB protocol, placement IDs can be identified through several fields:
- `imp.ext.gpid` - Global Placement ID (most common)
- `imp.tagid` - Tag ID
- `imp.ext.data.pbadslot` - Publisher Ad Slot
- `imp.id` - Impression ID
- `imp.ext.dfp_id` - DFP Ad Unit Code

### 2. Top Performing Placements

The analysis identified several high-performing placements based on bid prices:

| Placement ID | Average Bid Price (USD) | Max Bid Price (USD) |
|--------------|-------------------------|---------------------|
| /1001609/Discuss_Web_HOME_BBLive | $22.00 | $22.00 |
| /1001609/Discuss_Web_HOME_BB1 | $19.00 | $19.00 |
| /1001609/Discuss_Web_HOME_BBLive2 | $19.00 | $19.00 |
| /1001609/Discuss_Web_HOME_BBLive3 | $19.00 | $19.00 |
| /1001609/Discuss_Web_HOME_BBLive4 | $19.00 | $19.00 |

### 3. Demand Sources Analysis

Different demand sources showed varying bidding behaviors:

| Demand Source | Average Bid Price | Number of Bids |
|---------------|-------------------|----------------|
| 1 | $19.60 | 5 |
| 4194632 | $15.00 | 1 |
| 1495 | $0.50 | 5 |
| 3426 | $0.48 | 1 |
| 48503 | $0.43 | 1 |

### 4. Advertiser Domains

The most prominent advertiser domains in the bid responses include:
- icmarkets.com
- hkexpress.com
- interactivebrokers.com.hk
- adobe.com

## Detailed Insights

### High-Value Placements
The placement "/1001609/Discuss_Web_HOME_BBLive" achieved the highest average bid price at $22.00, indicating strong demand from advertisers for this specific ad slot.

### Demand Source Patterns
Demand source "1" consistently submitted high-value bids with an average of $19.60 across 5 bid responses, suggesting it represents a premium bidder or a bidder with significant budget allocation.

### Bid Price Distribution
The bid prices show a wide distribution:
- Minimum bid: $0.03
- 25th percentile: $0.43
- Median bid: $1.23
- 75th percentile: $19.00
- Maximum bid: $22.00

This indicates a mix of low-value and high-value bidding strategies among different demand sources.

## Recommendations

1. **Optimize High-Performing Placements**: Given the premium pricing of placements like "/1001609/Discuss_Web_HOME_BBLive", focus on maintaining and expanding inventory for these high-demand slots.

2. **Demand Source Relationship Management**: Strengthen relationships with high-value demand sources like source "1" that consistently submit premium bids.

3. **Inventory Diversification**: Consider creating similar high-performing placements to capitalize on the demonstrated demand for premium homepage slots.

4. **Dynamic Pricing Strategy**: Implement dynamic floor pricing that adapts to the wide bid distribution observed, maximizing revenue while maintaining fill rates.

## Conclusion

The OpenRTB bid analysis reveals significant variation in bid prices across different placements and demand sources. Homepage placements command premium prices, particularly those associated with live content areas. Understanding these patterns enables publishers to optimize their ad inventory and maximize revenue through strategic placement management and demand source partnerships.