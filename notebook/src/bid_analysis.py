import json
import urllib.parse
import re

def get_request_response_dataframe(data_dir):
    requests = []
    responses = []
    
    import pandas as pd
    from glob import glob

    bid_files = glob(data_dir)
    for bid_file in bid_files:
        with open(bid_file, 'r', encoding='UTF-8') as f:
            bid_data = json.load(f)
            requests.extend(bid_data.get('requests', []))
            responses.extend(bid_data.get('responses', []))

    df_req  = pd.DataFrame(requests)
    df_resp = pd.DataFrame(responses)

    return df_req.merge(df_resp, on='requestId', suffixes=('_req', '_resp'), how='outer')


def extra_bids_from_response(response):
    bids = []
    if 'seatbid' in response:
        for seat in response['seatbid']:
            for bid in seat.get('bid', []):
                bids.append(bid)
    elif 'bids' in response:  # Rubicon format
        for bid in response['bids']:
            bids.append(bid)
    elif 'bidList' in response:  # Pubmatic format
        for bid in response['bidList']:
            bids.append(bid)

    if not bids:
        return None
    return bids

def extract_placement_id(imp):
    """
    Extract placement ID from an impression object.
    
    Common placement ID fields in OpenRTB:
    - ext.gpid: Global Placement ID
    - ext.data.pbadslot: Publisher ad slot
    - ext.tid: Transaction ID
    - ext.dfp_id: DFP Ad Unit Code
    - ext.divid: Div ID
    - ext.ae_ad_id: Ad Exchange Ad ID
    - ext.ae_ad_type: Ad Exchange Ad Type
    - ext.ae_a_id: Ad Exchange Advertiser ID
    - tagid: Tag ID
    - id: Impression ID
    """
    # Common placement ID fields in OpenRTB
    placement_fields = [
        ('ext', 'gpid'),           # Global Placement ID
        ('ext', 'data', 'pbadslot'), # Publisher ad slot
        ('ext', 'tid'),            # Transaction ID
        ('ext', 'dfp_id'),         # DFP Ad Unit Code
        ('ext', 'divid'),          # Div ID
        ('ext', 'ae_ad_id'),       # Ad Exchange Ad ID
        ('ext', 'ae_ad_type'),     # Ad Exchange Ad Type
        ('ext', 'ae_a_id'),        # Ad Exchange Advertiser ID
        ('tagid',),                # Tag ID
        ('id',)                    # Impression ID
    ]
    
    for field_path in placement_fields:
        current = imp
        try:
            for field in field_path:
                current = current[field]
            if current and isinstance(current, str):
                return current
        except (KeyError, TypeError):
            continue
    
    # Fallback: check for placement-related fields in adomain, adid, etc.
    if 'ext' in imp and isinstance(imp['ext'], dict):
        for key, value in imp['ext'].items():
            if 'placement' in key.lower() or 'slot' in key.lower() or 'tag' in key.lower():
                if isinstance(value, str):
                    return value
    
    return "unknown_placement_id"


def extract_demand_source_from_nurl(bid):
    """
    Extracts demand_source from nurl field in bid object
    """
    def to_root_domain(domain):
        if domain.endswith('.casalemedia.com'):
            domain = 'casalemedia.com'
        return domain


    nurl = bid.get('nurl', '')
    lurl = bid.get('lurl', '')
    adm = bid.get('adm', '')
    if nurl:
        domain = urllib.parse.urlparse(nurl).netloc
        demand_source = domain if domain else 'unknown_domain'
    elif lurl:
        domain = urllib.parse.urlparse(lurl).netloc
        demand_source = domain if domain else 'unknown_domain'
    elif adm:
        # Attempt to extract URL from adm if it contains a tracking pixel or similar
        urls = re.findall(r'https?://[^\s"\']+', adm)
        if urls:
            domain = urllib.parse.urlparse(urls[0]).netloc
            demand_source = domain if domain else 'unknown_domain'
        else:
            demand_source = 'no_domains_in_adm'
    else:
        demand_source = 'no_domain_in_nurl_lurl_adm'
    return to_root_domain(demand_source)
