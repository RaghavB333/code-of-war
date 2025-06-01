import ast

def analyze_python(code):
    try:
        tree = ast.parse(code)
        loop_count = 0
        recursion_found = False
        space_vars = 0

        for node in ast.walk(tree):
            if isinstance(node, (ast.For, ast.While)):
                loop_count += 1
            elif isinstance(node, ast.FunctionDef):
                if node.name in [n.id for n in ast.walk(node) if isinstance(n, ast.Name)]:
                    recursion_found = True
            elif isinstance(node, (ast.List, ast.Dict, ast.Set)):
                space_vars += 1

        time_complexity = "O(1)"
        if recursion_found:
            time_complexity = "O(2^n)"
        elif loop_count == 1:
            time_complexity = "O(n)"
        elif loop_count >= 2:
            time_complexity = "O(n^2)"

        space_complexity = "O(1)" if space_vars == 0 else "O(n)"

        return {
            "status": "success",
            "time": time_complexity,
            "memory": space_complexity,
            "description": f"Detected {loop_count} loops, recursion: {recursion_found}, variables using space: {space_vars}."
        }
    except Exception as e:
        return {
            "status": "error",
            "time": "Unknown",
            "memory": "Unknown",
            "description": str(e)
        }
