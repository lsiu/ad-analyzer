import json
import urllib.parse
import re


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
    nurl = bid.get('nurl', '')
    lurl = bid.get('lurl', '')
    adm = bid.get('adm', '')
    if nurl:
        domain = urllib.parse.urlparse(nurl).netloc
        if domain.endswith('.casalemedia.com'):
            domain = 'casalemedia.com'
        demand_source = domain if domain else 'unknown_domain'
    elif lurl:
        domain = urllib.parse.urlparse(lurl).netloc
        if domain.endswith('.casalemedia.com'):
            domain = 'casalemedia.com'
        demand_source = domain if domain else 'unknown_domain'
    elif adm:
        # Attempt to extract URL from adm if it contains a tracking pixel or similar
        urls = re.findall(r'https?://[^\s"\']+', adm)
        if urls:
            domain = urllib.parse.urlparse(urls[0]).netloc
            if domain.endswith('.casalemedia.com'):
                domain = 'casalemedia.com'
            demand_source = domain if domain else 'unknown_domain'
        else:
            demand_source = 'unknown_adm'
    else:
        demand_source = 'unknown_nurl'
    return demand_source


def extract_bids_from_responses(responses):
    """
    Extract bid information from bid responses
    """
    bid_data = []
    
    for response in responses:
        if 'body' not in response or response['statusCode'] != 200:
            continue
            
        try:
            response_body = json.loads(response['body'])
        except json.JSONDecodeError:
            continue
        
        # Get request ID to match with requests
        request_id = response.get('requestId', 'unknown')
        
        # Extract bids from seatbid
        if 'seatbid' in response_body:
            for seatbid in response_body['seatbid']:
                if 'bid' in seatbid:
                    for bid in seatbid['bid']:
                        # Extract placement ID from bid.impid by matching with request impressions
                        # We'll need to get this from the corresponding request
                        impid = bid.get('impid', 'unknown_impid')
                        bid_price = bid.get('price', 0)
                        bid_currency = response_body.get('cur', 'USD')
                        demand_source = extract_demand_source_from_nurl(bid)
                        adomain = ', '.join(bid.get('adomain', [])) if 'adomain' in bid else 'unknown_adomain'
                        
                        bid_data.append({
                            'request_id': request_id,
                            'impid': impid,
                            'bid_price': bid_price,
                            'bid_currency': bid_currency,
                            'demand_source': demand_source,
                            'advertiser_domain': adomain,
                            'creative_id': bid.get('crid', 'unknown_creative'),
                            'creative_width': bid.get('w', 0),
                            'creative_height': bid.get('h', 0)
                        })
    
    return bid_data


def extract_placements_from_requests(requests):
    """
    Extract placement IDs from bid requests
    """
    placement_data = {}
    
    for request in requests:
        if 'body' not in request:
            continue
        
        try:
            request_body = json.loads(request['body'])
        except json.JSONDecodeError:
            continue
        
        # Get request ID
        request_id = request.get('requestId', 'unknown')
        
        # Extract impressions
        if 'imp' in request_body:
            for imp in request_body['imp']:
                placement_id = extract_placement_id(imp)
                imp_id = str(imp.get('id', 'unknown_imp'))
                
                # Store mapping from impression ID to placement ID
                if request_id not in placement_data:
                    placement_data[request_id] = {}
                placement_data[request_id][imp_id] = placement_id
    
    return placement_data