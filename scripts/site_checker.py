#!/usr/bin/env python3
import requests
import time
from datetime import datetime
import sys
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('site_checks.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

def check_website(url, interval=300):  # 300 seconds = 5 minutes
    """
    Periodically checks a website and logs its status
    
    Args:
        url (str): The URL to check
        interval (int): Time between checks in seconds
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    while True:
        try:
            start_time = time.time()
            response = requests.get(url, headers=headers, timeout=10)
            response_time = time.time() - start_time
            
            status = {
                'timestamp': datetime.now().isoformat(),
                'status_code': response.status_code,
                'response_time': f"{response_time:.2f}s",
                'content_length': len(response.content),
            }
            
            if response.status_code == 200:
                logging.info(f"Success - Status: {status['status_code']}, Time: {status['response_time']}")
            else:
                logging.warning(f"Warning - Status: {status['status_code']}, Time: {status['response_time']}")
                
        except requests.RequestException as e:
            logging.error(f"Error checking {url}: {str(e)}")
        
        time.sleep(interval)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python site_checker.py <url> [interval_in_seconds]")
        sys.exit(1)
        
    url = sys.argv[1]
    interval = int(sys.argv[2]) if len(sys.argv) > 2 else 300
    
    logging.info(f"Starting website checker for {url} with {interval}s interval")
    check_website(url, interval)
