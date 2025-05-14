# analyze.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from complexity_engine import analyze_code

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    code = data.get('code')
    language = data.get('language')

    if not code or not language:
        return jsonify({'status': 'error', 'message': 'Missing code or language'}), 400

    try:
        result = analyze_code(code, language)
        return jsonify(result)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
