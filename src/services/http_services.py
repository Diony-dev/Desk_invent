from dotenv import load_dotenv
from os import getenv
import requests
load_dotenv(override=True)

URL_REFRESH = getenv("URL_REFRESH")
ORG_ID_INVENTORY = getenv("ORG_ID_INVENTORY")
ORG_ID_DESK = getenv("ORG_ID_DESK")

class HttpServices:
    def __init__(self):
        self.url_refresh = URL_REFRESH
        self.org_id_inventory = ORG_ID_INVENTORY
        self.org_id_desk = ORG_ID_DESK

    def get_access_token(self):
        response = requests.post(self.url_refresh)
        return response.json()["access_token"]

    def get_all_items(self):
        access_token = self.get_access_token()
        headers = {
            "Authorization": f"Zoho-oauthtoken {access_token}"
        }
        response = requests.get(f"https://www.zohoapis.com/inventory/v1/items?organization_id={self.org_id_inventory}", headers=headers)
        return response.json()

    def create_ticket(self, ticket):
        access_token = self.get_access_token()
        headers = {
            "Authorization": f"Zoho-oauthtoken {access_token}",
            "orgId": self.org_id_desk
        }
        response = requests.post(f"https://desk.zoho.com/api/v1/tickets", headers=headers, json=ticket)
        print(response.status_code)
        print(response.json())
        return response.json()
