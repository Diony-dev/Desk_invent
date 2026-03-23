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
        "Authorization": f"Zoho-oauthtoken {access_token}",
        "orgId": service.org_id_desk # adding this just in case
    }
    
    ticket = {
      "subject": "Test Ticket",
      "departmentId": "1307304000000006907",
      "contactId": "1307304000000471001",
      "status": "Open",
      "email": "dionyjunior11@gmail.com",
      "channel": "Web",
      "classification": "Others",
      "priority": "High",
      "cf": {
        "cf_departamento_solicitante": "Taller",
        "cf_fecha_requerida": "2026-03-24",
        "cf_motivo_de_solicitud": "test test",
        "cf_articulos": "test",
        "cf_productos": None,
        "cf_cantidad": "5"
      }
    }
    
    # Try with the user's URL
    url = f"https://desk.zoho.com/api/v1/tickets"
    response = requests.post(url, headers=headers, json=ticket)
    
    with open('out_ticket.json', 'w') as f:
        json.dump({
            "status_code": response.status_code,
            "response": response.json() if response.text else "No JSON"
        }, f, indent=2)

if __name__ == '__main__':
    main()
