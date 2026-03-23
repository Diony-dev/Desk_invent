from flask import Flask, render_template, request, jsonify
from services.http_services import HttpServices

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home')
def home():
    return render_template('index.html')

@app.route('/api/items', methods=['GET'])
def get_all_items():
    http_services = HttpServices()
    return jsonify(http_services.get_all_items())

@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    http_services = HttpServices()
    return jsonify(http_services.create_ticket(request.json))

if __name__ == '__main__':
    app.run(debug=True)