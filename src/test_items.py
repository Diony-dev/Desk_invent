import sys
import os
import requests
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.http_services import HttpServices

def main():
    service = HttpServices()
    access_token = service.get_access_token()
    headers = {
        "Authorization": f"Zoho-oauthtoken {access_token}"
    }
    
    url = f"https://www.zohoapis.com/inventory/v1/items?organization_id={service.org_id}"
    response = requests.get(url, headers=headers)
    items_data = response.json()
    
    with open('out_zohoapis.json', 'w') as f:
        json.dump(items_data, f, indent=2)

if __name__ == '__main__':
    main()
