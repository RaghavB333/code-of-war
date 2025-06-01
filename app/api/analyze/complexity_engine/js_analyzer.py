import re

def analyze_js(code: str) -> dict:
    try:
        code = code.strip()

        # Detect loop constructs
        for_loops = len(re.findall(r'\bfor\s*\(', code))
        while_loops = len(re.findall(r'\bwhile\s*\(', code))
        do_while_loops = len(re.findall(r'\bdo\s*{', code))
        higher_order_loops = len(re.findall(r'\b(forEach|map|reduce|filter)\s*\(', code))
        loop_count = for_loops + while_loops + do_while_loops + higher_order_loops

        # Detect function names for recursion
        func_defs = re.findall(r'function\s+([a-zA-Z_]\w*)\s*\(', code)
        arrow_funcs = re.findall(r'const\s+([a-zA-Z_]\w*)\s*=\s*\(.*?\)\s*=>', code)
        all_funcs = set(func_defs + arrow_funcs)

        recursion_detected = False
        for func in all_funcs:
            body_match = re.search(rf'{func}\s*.*?{{(.*?)}}', code, re.DOTALL)
            if body_match:
                body = body_match.group(1)
                if re.search(rf'\b{func}\s*\(', body):
                    recursion_detected = True
                    break

        # Check for dynamic memory usage
        memory_allocs = False
        if re.search(r'\bnew\s+(Array|Object|Map|Set)\b', code) or re.search(r'\[.*?\]', code):
            memory_allocs = True

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
            f"Detected {loop_count} loop(s) "
            f"(for: {for_loops}, while: {while_loops}, do-while: {do_while_loops}, "
            f"HOFs: {higher_order_loops}), "
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
