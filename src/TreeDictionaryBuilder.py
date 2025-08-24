import json
import requests
import bs4



with open('src\language-tree.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(requests.__version__)
print(bs4.__version__)