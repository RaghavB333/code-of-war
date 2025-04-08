from flask import Flask, request, jsonify
import timeit
from memory_profiler import memory_usage
import radon.complexity as rc
from radon.visitors import ComplexityVisitor
from radon.raw import analyze
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def analyze_memory_growth(code):
    def memory_function_with_input(input_size):
        exec(code, {"input_size": input_size})

    memory_results = []
    for input_size in range(1, 51, 5):  
        try:
            memory_usage_at_size = memory_usage((memory_function_with_input, (input_size,)), max_usage=True)
            if isinstance(memory_usage_at_size, list):
                peak_memory = max(memory_usage_at_size)
            elif isinstance(memory_usage_at_size, float): 
                peak_memory = memory_usage_at_size 
            else:
                print(f"Unexpected memory_usage output: {memory_usage_at_size}")
                peak_memory = 0  # Handle unexpected output gracefully
            memory_results.append((input_size, peak_memory))
        except Exception as e: 
            print(f"Memory usage measurement failed for input size {input_size}: {e}")
            continue 

    if len(memory_results) < 2:
        return [], "Not enough data for analysis" 

    input_sizes, memory_usages = zip(*memory_results)

    growth_rates = []
    for i in range(1, len(memory_usages)):
        try:
            growth_rates.append(memory_usages[i] / memory_usages[i-1])
        except ZeroDivisionError:
            growth_rates.append(float('inf'))

    if all(rate < 1.2 for rate in growth_rates):
        return memory_results, "O(1)"
    elif all(rate < 2 for rate in growth_rates):
        return memory_results, "O(n)"
    elif all(rate < 5 for rate in growth_rates):
        return memory_results, "O(n^2)"
    else:
        return memory_results, "O(n^3)"

def perform_code_analysis(code):
    try:
        raw_metrics = analyze(code)
        visitor = ComplexityVisitor.from_code(code)
        cyclomatic_complexity = [node.complexity for node in visitor.functions] 

        if not cyclomatic_complexity: 
            cyclomatic_complexity = [0] 

        def time_function():
            exec(code, {}, {})

        execution_time = timeit.timeit(time_function, number=1)

        memory_results, space_complexity = analyze_memory_growth(code)

        if memory_results: 
            memory_used = sum([usage for _, usage in memory_results]) / len(memory_results) 
        else:
            memory_used = 0

        complexity_metrics = {
            'cyclomatic_complexity': sum(cyclomatic_complexity), 
            'raw_metrics': raw_metrics._asdict(),
            'execution_time': execution_time,
            'memory_used': memory_used,
            'space_complexity': space_complexity,
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