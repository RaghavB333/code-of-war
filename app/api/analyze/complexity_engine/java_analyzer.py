import re

def analyze_java(code: str) -> dict:
    try:
        code = code.strip()

        # Count loops
        for_loops = len(re.findall(r'\bfor\s*\(', code))
        while_loops = len(re.findall(r'\bwhile\s*\(', code))
        do_while_loops = len(re.findall(r'\bdo\s*{', code))
        loop_count = for_loops + while_loops + do_while_loops

        # Detect recursion
        method_defs = re.findall(r'(?:public|private|protected)?\s+(?:static\s+)?[a-zA-Z_][\w<>\[\]]*\s+([a-zA-Z_]\w*)\s*\(', code)
        recursion_detected = False
        for method in set(method_defs):
            body_match = re.search(rf'{method}\s*\(.*?\)\s*\{{(.*?)\}}', code, re.DOTALL)
            if body_match:
                body = body_match.group(1)
                if re.search(rf'\b{method}\s*\(', body):
                    recursion_detected = True
                    break

        # Detect real dynamic memory allocation
        memory_allocs = bool(re.search(r'\bnew\s+(ArrayList|HashMap|LinkedList|int\s*\[|double\s*\[|String\s*\[)', code))

        # Determine time complexity
        if recursion_detected:
            time_complexity = "O(2^n) or O(n) (Recursive)"
        elif loop_count == 0:
            time_complexity = "O(1)"
        elif loop_count == 1:
            time_complexity = "O(n)"
        else:
            time_complexity = f"O(n^{loop_count})"

        # Determine space complexity
        space_complexity = "O(n)" if memory_allocs else "O(1)"

        # Description
        description = (
            f"Detected {loop_count} loop(s) (for: {for_loops}, while: {while_loops}, do-while: {do_while_loops}), "
            f"{'recursion detected' if recursion_detected else 'no recursion'}, "
            f"{'dynamic memory used' if memory_allocs else 'no dynamic memory'}."
        )

        return {
            "status": "success",
            "time": time_complexity,
            "memory": space_complexity,
            "description": description
        }

    except Exception as e:
        return {
            "status": "error",
            "time": None,
            "memory": None,
            "description": f"Exception occurred: {str(e)}"
        }
