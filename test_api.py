import requests
import os
import sys

def test_endpoints():
    # Test soil analysis
    print("Testing soil analysis endpoint...")
    soil_url = "http://localhost:5001/api/analyze-soil"
    
    try:
        with open("test.jpg", "rb") as f:
            files = {"image": ("test.jpg", f, "image/jpeg")}
            response = requests.post(soil_url, files=files)
            
            print(f"Soil analysis status code: {response.status_code}")
            if response.status_code == 200:
                print(f"Soil analysis result: {response.json()}")
            else:
                print(f"Soil analysis error: {response.text}")
    except Exception as e:
        print(f"Error testing soil analysis: {e}")
    
    # Test crop analysis
    print("\nTesting crop analysis endpoint...")
    crop_url = "http://localhost:5001/api/analyze"
    
    try:
        with open("test.jpg", "rb") as f:
            files = {"image": ("test.jpg", f, "image/jpeg")}
            response = requests.post(crop_url, files=files)
            
            print(f"Crop analysis status code: {response.status_code}")
            if response.status_code == 200:
                print(f"Crop analysis result: {response.json()}")
            else:
                print(f"Crop analysis error: {response.text}")
    except Exception as e:
        print(f"Error testing crop analysis: {e}")

if __name__ == "__main__":
    test_endpoints() 