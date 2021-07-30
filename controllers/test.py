import requests

url = "https://car-spa.io/api/auth/admins/login"

payload='adminEmail=omarredaelsayedmohamed@gmail.com&adminPassword=nashar77'
headers = {}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)