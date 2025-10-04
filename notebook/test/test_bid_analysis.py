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


class TestBidAnalysisFunctions(unittest.TestCase):

    def test_extract_placement_id_with_gpid(self):
        """Test extracting placement ID from ext.gpid field"""
        imp = {
            'ext': {
                'gpid': 'test_placement_123'
            }
        }
        result = extract_placement_id(imp)
        self.assertEqual(result, 'test_placement_123')

    def test_extract_placement_id_with_pbadslot(self):
        """Test extracting placement ID from ext.data.pbadslot field"""
        imp = {
            'ext': {
                'data': {
                    'pbadslot': 'publisher_slot_456'
                }
            }
        }
        result = extract_placement_id(imp)
        self.assertEqual(result, 'publisher_slot_456')

    def test_extract_placement_id_with_tagid(self):
        """Test extracting placement ID from tagid field"""
        imp = {
            'tagid': 'tag_789'
        }
        result = extract_placement_id(imp)
        self.assertEqual(result, 'tag_789')

    def test_extract_placement_id_with_id(self):
        """Test extracting placement ID from id field"""
        imp = {
            'id': 'imp_999'
        }
        result = extract_placement_id(imp)
        self.assertEqual(result, 'imp_999')

    def test_extract_placement_id_with_fallback(self):
        """Test fallback mechanism for placement ID extraction"""
        imp = {
            'ext': {
                'custom_placement_id': 'fallback_placement_123',
                'other_field': 'other_value'
            }
        }
        result = extract_placement_id(imp)
        self.assertEqual(result, 'fallback_placement_123')

    def test_extract_placement_id_unknown(self):
        """Test returning unknown_placement_id when no fields match"""
        imp = {
            'unknown_field': 'unknown_value'
        }
        result = extract_placement_id(imp)
        self.assertEqual(result, 'unknown_placement_id')

    def test_extract_demand_source_from_nurl(self):
        """Test extracting demand source from nurl field"""
        bid = {
            'nurl': 'https://dsp.example.com/bid?params=values'
        }
        result = extract_demand_source_from_nurl(bid)
        self.assertEqual(result, 'dsp.example.com')

    def test_extract_demand_source_from_lurl(self):
        """Test extracting demand source from lurl when nurl is empty"""
        bid = {
            'lurl': 'https://ssp.example.com/lose?params=values',
            'nurl': ''
        }
        result = extract_demand_source_from_nurl(bid)
        self.assertEqual(result, 'ssp.example.com')

    def test_extract_demand_source_from_adm(self):
        """Test extracting demand source from adm field"""
        bid = {
            'adm': '<img src="https://tracker.demand-source.com/pixel?event=win" />',
            'nurl': '',
            'lurl': ''
        }
        result = extract_demand_source_from_nurl(bid)
        self.assertEqual(result, 'tracker.demand-source.com')

    def test_extract_demand_source_casalemedia_special_case(self):
        """Test special handling for casalemedia.com domains"""
        bid = {
            'nurl': 'https://anyvalue.casalemedia.com/rtb/bid?param=value'
        }
        result = extract_demand_source_from_nurl(bid)
        self.assertEqual(result, 'casalemedia.com')

    def test_extract_demand_source_unknown(self):
        """Test returning unknown when no source can be extracted"""
        bid = {
            'nurl': '',
            'lurl': '',
            'adm': ''
        }
        result = extract_demand_source_from_nurl(bid)
        self.assertEqual(result, 'unknown_nurl')

    def test_extract_bids_from_responses(self):
        """Test extracting bids from response data"""
        responses = [
            {
                'requestId': 'req_123',
                'statusCode': 200,
                'body': json.dumps({
                    'seatbid': [
                        {
                            'bid': [
                                {
                                    'impid': 'imp_001',
                                    'price': 2.50,
                                    'adomain': ['advertiser.com'],
                                    'crid': 'creative_123',
                                    'w': 300,
                                    'h': 250
                                }
                            ]
                        }
                    ],
                    'cur': 'USD'
                })
            }
        ]
        
        bid_data = extract_bids_from_responses(responses)
        
        self.assertEqual(len(bid_data), 1)
        self.assertEqual(bid_data[0]['request_id'], 'req_123')
        self.assertEqual(bid_data[0]['impid'], 'imp_001')
        self.assertEqual(bid_data[0]['bid_price'], 2.50)
        self.assertEqual(bid_data[0]['bid_currency'], 'USD')
        self.assertEqual(bid_data[0]['advertiser_domain'], 'advertiser.com')

    def test_extract_bids_from_responses_with_nurl(self):
        """Test extracting demand source from bid nurl"""
        responses = [
            {
                'requestId': 'req_456',
                'statusCode': 200,
                'body': json.dumps({
                    'seatbid': [
                        {
                            'bid': [
                                {
                                    'impid': 'imp_002',
                                    'price': 1.75,
                                    'nurl': 'https://dsp.example.com/win?bidid=123',
                                    'adomain': ['dsp.com'],
                                    'crid': 'creative_456'
                                }
                            ]
                        }
                    ],
                    'cur': 'USD'
                })
            }
        ]
        
        bid_data = extract_bids_from_responses(responses)
        
        self.assertEqual(len(bid_data), 1)
        self.assertEqual(bid_data[0]['demand_source'], 'dsp.example.com')

    def test_extract_bids_from_responses_invalid_json(self):
        """Test handling of invalid JSON in response body"""
        responses = [
            {
                'requestId': 'req_789',
                'statusCode': 200,
                'body': 'invalid json'
            }
        ]
        
        bid_data = extract_bids_from_responses(responses)
        
        self.assertEqual(len(bid_data), 0)

    def test_extract_bids_from_responses_non_200_status(self):
        """Test handling of non-200 status codes"""
        responses = [
            {
                'requestId': 'req_abc',
                'statusCode': 404,
                'body': json.dumps({
                    'seatbid': [
                        {
                            'bid': [
                                {
                                    'impid': 'imp_003',
                                    'price': 3.00
                                }
                            ]
                        }
                    ]
                })
            }
        ]
        
        bid_data = extract_bids_from_responses(responses)
        
        self.assertEqual(len(bid_data), 0)

    def test_extract_placements_from_requests(self):
        """Test extracting placements from request data"""
        requests = [
            {
                'requestId': 'req_xyz',
                'body': json.dumps({
                    'imp': [
                        {
                            'id': 'imp_001',
                            'ext': {
                                'gpid': 'placement_abc'
                            }
                        },
                        {
                            'id': 'imp_002',
                            'tagid': 'placement_def'
                        }
                    ]
                })
            }
        ]
        
        placement_data = extract_placements_from_requests(requests)
        
        self.assertIn('req_xyz', placement_data)
        self.assertIn('imp_001', placement_data['req_xyz'])
        self.assertIn('imp_002', placement_data['req_xyz'])
        self.assertEqual(placement_data['req_xyz']['imp_001'], 'placement_abc')
        self.assertEqual(placement_data['req_xyz']['imp_002'], 'placement_def')

    def test_extract_placements_from_requests_invalid_json(self):
        """Test handling of invalid JSON in request body"""
        requests = [
            {
                'requestId': 'req_invalid',
                'body': 'invalid json'
            }
        ]
        
        placement_data = extract_placements_from_requests(requests)
        
        self.assertEqual(placement_data, {})

    def test_extract_placements_from_requests_no_body(self):
        """Test handling of requests without body field"""
        requests = [
            {
                'requestId': 'req_no_body'
            }
        ]
        
        placement_data = extract_placements_from_requests(requests)
        
        self.assertEqual(placement_data, {})


    def test_extract_request_and_response_placement_id_integration_with_int_str_type_difference_in_impid(self):
        """Integration test for extracting placement IDs and matching with bids, handling int/str type differences"""
        requests = [
            {
                'requestId': 'req_001',
                'body': json.dumps({
                    'imp': [
                        {
                            'id': '1',  # impid as string but string in response
                            'ext': {
                                'gpid': 'placement_1'
                            }
                        },
                        {
                            'id': 2,  # impid as integer but integer in response
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
                                    'impid': 1,  # intger impid but string in request
                                    'price': 2.00,
                                    'adomain': ['adv1.com'],
                                    'crid': 'creative_1'
                                },
                                {
                                    'impid': '2',  # string impid but integer in request
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