#!/usr/bin/env python3
"""
Integration Test for Maia Chess Backend API

This script tests the complete functionality of the backend API
to ensure it's ready for Render deployment.
"""

import json
import time
import requests
import chess

# Test configuration
API_BASE_URL = "http://localhost:5000"  # Change for production testing
TEST_TIMEOUT = 30  # seconds

def test_health_check():
    """Test the health check endpoint."""
    print("🔍 Testing health check endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['message']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_basic_move_prediction():
    """Test basic move prediction functionality."""
    print("\n🔍 Testing basic move prediction...")
    try:
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 1500
        }
        response = requests.post(f"{API_BASE_URL}/get_move", 
                               json=payload, timeout=TEST_TIMEOUT)
        
        if response.status_code == 200:
            data = response.json()
            move = data['move']
            print(f"✅ Move prediction successful: {move}")
            
            # Validate the move format
            if len(move) >= 4 and move.isalnum():
                print(f"✅ Move format valid: {move}")
                return True
            else:
                print(f"❌ Invalid move format: {move}")
                return False
        else:
            print(f"❌ Move prediction failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Move prediction error: {e}")
        return False

def test_nodes_functionality():
    """Test nodes parameter functionality."""
    print("\n🔍 Testing nodes functionality...")
    test_cases = [
        {'nodes': 1, 'description': 'minimum nodes'},
        {'nodes': 10, 'description': 'moderate nodes'},
        {'nodes': 100, 'description': 'high nodes'},
        {'nodes': 1000, 'description': 'very high nodes'}
    ]
    
    all_passed = True
    for test_case in test_cases:
        try:
            payload = {
                'fen': 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
                'level': 1500,
                'nodes': test_case['nodes']
            }
            
            start_time = time.time()
            response = requests.post(f"{API_BASE_URL}/get_move", 
                                   json=payload, timeout=TEST_TIMEOUT)
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                duration = end_time - start_time
                print(f"✅ {test_case['description']} ({test_case['nodes']} nodes): {data['move']} ({duration:.2f}s)")
            else:
                print(f"❌ {test_case['description']} failed: {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"❌ {test_case['description']} error: {e}")
            all_passed = False
    
    return all_passed

def test_error_handling():
    """Test error handling for various invalid inputs."""
    print("\n🔍 Testing error handling...")
    
    error_tests = [
        {
            'payload': {'fen': 'invalid_fen', 'level': 1500},
            'description': 'invalid FEN',
            'expected_status': 400
        },
        {
            'payload': {'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'level': 'invalid'},
            'description': 'invalid level',
            'expected_status': 400
        },
        {
            'payload': {'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'level': 1500, 'nodes': 0},
            'description': 'nodes too low',
            'expected_status': 400
        },
        {
            'payload': {'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'level': 1500, 'nodes': 10001},
            'description': 'nodes too high',
            'expected_status': 400
        },
        {
            'payload': {'level': 1500},
            'description': 'missing FEN',
            'expected_status': 400
        }
    ]
    
    all_passed = True
    for test in error_tests:
        try:
            response = requests.post(f"{API_BASE_URL}/get_move", 
                                   json=test['payload'], timeout=TEST_TIMEOUT)
            
            if response.status_code == test['expected_status']:
                print(f"✅ Error handling for {test['description']}: correct status {response.status_code}")
            else:
                print(f"❌ Error handling for {test['description']}: expected {test['expected_status']}, got {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"❌ Error handling for {test['description']} failed: {e}")
            all_passed = False
    
    return all_passed

def test_different_positions():
    """Test with different chess positions."""
    print("\n🔍 Testing different chess positions...")
    
    positions = [
        {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'description': 'starting position'
        },
        {
            'fen': 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
            'description': 'after 1.e4'
        },
        {
            'fen': 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
            'description': 'after 1.e4 e5'
        },
        {
            'fen': 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
            'description': 'after 1.e4 e5 2.Nf3'
        }
    ]
    
    all_passed = True
    for pos in positions:
        try:
            payload = {
                'fen': pos['fen'],
                'level': 1500,
                'nodes': 10
            }
            
            response = requests.post(f"{API_BASE_URL}/get_move", 
                                   json=payload, timeout=TEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                # Validate move is legal
                board = chess.Board(pos['fen'])
                move = chess.Move.from_uci(data['move'])
                
                if move in board.legal_moves:
                    print(f"✅ {pos['description']}: {data['move']} (legal)")
                else:
                    print(f"❌ {pos['description']}: {data['move']} (illegal move!)")
                    all_passed = False
            else:
                print(f"❌ {pos['description']}: failed with status {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"❌ {pos['description']}: error {e}")
            all_passed = False
    
    return all_passed

def main():
    """Run all integration tests."""
    print("🚀 Starting Maia Chess Backend Integration Tests")
    print("=" * 60)
    
    tests = [
        test_health_check,
        test_basic_move_prediction,
        test_nodes_functionality,
        test_error_handling,
        test_different_positions
    ]
    
    passed = 0
    total = len(tests)
    
    for test_func in tests:
        if test_func():
            passed += 1
    
    print("\n" + "=" * 60)
    print(f"🏁 Integration Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The API is ready for deployment.")
        return True
    else:
        print("⚠️ Some tests failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    main()