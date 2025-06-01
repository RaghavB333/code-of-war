import re

def analyze_cpp(code: str) -> dict:
    try:
        code = code.strip()

        # Count loop structures
        for_loops = len(re.findall(r'\bfor\s*\(', code))
        while_loops = len(re.findall(r'\bwhile\s*\(', code))
        do_while_loops = len(re.findall(r'\bdo\s*{', code))
        loop_count = for_loops + while_loops + do_while_loops

        # Detect function names (for recursion check)
        func_defs = re.findall(r'\b(?:int|void|float|double|char|bool|string)\s+([a-zA-Z_]\w*)\s*\(', code)
        recursion_detected = False
        for func in set(func_defs):
            body_match = re.search(rf'{func}\s*\(.*?\)\s*{{(.*?)}}', code, re.DOTALL)
            if body_match:
                body = body_match.group(1)
                if re.search(rf'\b{func}\s*\(', body):
                    recursion_detected = True
                    break

        # Detect dynamic memory usage
        memory_keywords = ['malloc', 'calloc', 'realloc', 'new']
        memory_allocs = any(keyword in code for keyword in memory_keywords)

        # Estimate time complexity
        if recursion_detected:
            time_complexity = "O(2^n) or O(n) (Recursive)"
        elif loop_count == 0:
            time_complexity = "O(1)"
        elif loop_count == 1:
            time_complexity = "O(n)"
        else:
            time_complexity = f"O(n^{loop_count})"

        # Estimate space complexity
        if memory_allocs:
            space_complexity = "O(n) or more (Dynamic Allocation)"
        else:
            space_complexity = "O(1)"

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
