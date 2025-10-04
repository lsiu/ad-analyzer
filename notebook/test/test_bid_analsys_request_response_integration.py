import unittest
import sys
import os
import json

# Add the notebook directory to the path so we can import bid_analysis
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../src'))

from bid_analysis import (
    extract_placement_id,
    extract_demand_source_from_nurl,
    extract_bids_from_responses,
    extract_placements_from_requests
)


class TestBidAnalysisRequestResponseIntegration(unittest.TestCase):
    def test_extract_request_and_response_placement_id_integration_with_int_str_type_difference_in_impid(self):
        """Integration test for extracting placement IDs and matching with bids, handling int/str type differences"""
        requests = [
            {
                'requestId': 'req_001',
                'body': json.dumps({
                    'imp': [
                        {
                            'id': '1',  # impid as string and match to resposne which is an integer
                            'ext': {
                                'gpid': 'placement_1'
                            }
                        },
                        {
                            'id': 2,  # impid as integer and match to response which is a string
                            'tagid': 'placement_2'
                        }
                    ]
                })
            }
        ]
        
        responses = [
            {
                'requestId': 'req_001',
                'statusCode': 200,
                'body': json.dumps({
                    'seatbid': [
                        {
                            'bid': [
                                {
                                    'impid': 1,  # integer impid matching string in request
                                    'price': 2.00,
                                    'adomain': ['adv1.com'],
                                    'crid': 'creative_1'
                                },
                                {
                                    'impid': '2',  # string impid matching integer in request
                                    'price': 3.00,
                                    'adomain': ['adv2.com'],
                                    'crid': 'creative_2'
                                }
                            ]
                        }
                    ],
                    'cur': 'USD'
                })
            }
        ]
        
        placement_map = extract_placements_from_requests(requests)
        bids = extract_bids_from_responses(responses)
        
        # Add placement IDs to bid data by matching request and impression IDs
        for bid in bids:
            req_id = bid['request_id']
            imp_id = bid['impid']  # This is actually the impid from the bid
            
            # Look up the actual placement ID from our mapping
            if req_id in placement_map and str(imp_id) in placement_map[req_id]:
                bid['placement_id'] = placement_map[req_id][str(imp_id)]
            else:
                bid['placement_id'] = 'unknown_placement_id'
        
        self.assertEqual(len(bids), 2)
        self.assertEqual(bids[0]['placement_id'], 'placement_1')
        self.assertEqual(bids[1]['placement_id'], 'placement_2')


if __name__ == '__main__':
    unittest.main()