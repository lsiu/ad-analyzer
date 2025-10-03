# OpenRTB Bid Analysis

This repository contains the analysis of OpenRTB bid request/response pairs to extract placement IDs with their corresponding bid prices from each demand source.

## Files

### Input Data
- `/bids/openrtb-bid-data-2025-10-01T01-35-07.json`: Raw OpenRTB bid data collected from browser extension

### Analysis Notebooks
- `/notebook/analyze bids.ipynb`: Original Jupyter notebook for bid analysis
- `/notebook/analyze bids_fixed.ipynb`: Fixed version of the analysis notebook
- `/notebook/analyze bids_output.ipynb`: Executed notebook with results

### Analysis Reports
- `/report/openrtb_bid_analysis_report.md`: Comprehensive markdown report of findings
- `/output/bid_analysis.csv`: Full dataset of analyzed bids
- `/output/bid_summary_stats.csv`: Statistical summary of bid prices
- `/output/demand_source_analysis.csv`: Analysis of demand sources and their bidding behavior
- `/output/placement_frequency.csv`: Frequency count of placements in bid requests
- `/output/top_bids.csv`: Top 10 highest bids sorted by price

### Scripts
- `/scripts/export_to_csv.py`: Script to export analysis results to CSV files

## Methodology

The analysis extracts placement identifiers from OpenRTB bid requests and matches them with bid prices from bid responses. Placement IDs are identified through several common fields in the OpenRTB protocol:

1. `imp.ext.gpid` - Global Placement ID
2. `imp.tagid` - Tag ID
3. `imp.ext.data.pbadslot` - Publisher Ad Slot
4. `imp.id` - Impression ID
5. `imp.ext.dfp_id` - DFP Ad Unit Code

## Key Findings

1. **High-Value Placements**: The placement "/1001609/Discuss_Web_HOME_BBLive" achieved the highest average bid price at $22.00.

2. **Premium Demand Sources**: Demand source "1" consistently submitted high-value bids with an average of $19.60 across 5 bid responses.

3. **Bid Price Distribution**: Bids showed a wide distribution with a minimum of $0.03 and maximum of $22.00, indicating varied bidding strategies among demand sources.

For detailed findings, refer to the comprehensive report at `/report/openrtb_bid_analysis_report.md`.