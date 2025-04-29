from flask import Flask, request, jsonify
from radon.visitors import ComplexityVisitor
from radon.raw import analyze
from flask_cors import CORS
import ast

app = Flask(__name__)
CORS(app)

def estimate_time_complexity(code: str) -> str:
    try:
        tree = ast.parse(code)
        max_depth = [0]

        def visit(node, depth=0):
            if isinstance(node, (ast.For, ast.While)):
                depth += 1
            if isinstance(node, ast.FunctionDef):
                for inner in ast.walk(node):
                    if isinstance(inner, ast.Call) and isinstance(inner.func, ast.Name) and inner.func.id == node.name:
                        # Recursive call
                        max_depth[0] = max(max_depth[0], depth + 1)
                        return
            max_depth[0] = max(max_depth[0], depth)
            for child in ast.iter_child_nodes(node):
                visit(child, depth)

        visit(tree)

        if max_depth[0] == 0:
            return "O(1)"
        elif max_depth[0] == 1:
            return "O(n)"
        elif max_depth[0] == 2:
            return "O(n^2)"
        else:
            return "O(n^3)"
    except Exception as e:
        print(f"Time complexity estimation failed: {e}")
        return "Unknown"


def perform_code_analysis(code):
    try:
        raw_metrics = analyze(code)
        visitor = ComplexityVisitor.from_code(code)
        cyclomatic_complexity = [node.complexity for node in visitor.functions]

        if not cyclomatic_complexity:
            cyclomatic_complexity = [0]

        time_complexity = estimate_time_complexity(code)

        complexity_metrics = {
            'cyclomatic_complexity': sum(cyclomatic_complexity),
            'raw_metrics': raw_metrics._asdict(),
            'execution_time': "Instant (Static Analysis)",
            'memory_used': "Static Analysis",
            'space_complexity': "O(1)",
            'time_complexity': time_complexity,
        }

        print("Code Analysis Result:", complexity_metrics)
        return complexity_metrics
    except Exception as e:
        print(f"Error in perform_code_analysis: {e}")
        return {'error': str(e)}

@app.route('/analyze', methods=['POST'])
def analyze_code_route():
    code = request.json.get('code')
    if not code:
        return jsonify({'error': 'No code provided'}), 400

    result = perform_code_analysis(code)
    print("Result from code analysis:", result)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
