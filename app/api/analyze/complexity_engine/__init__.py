# complexity_engine/__init__.py
from .python_analyzer import analyze_python
from .cpp_analyzer import analyze_cpp
from .java_analyzer import analyze_java
from .js_analyzer import analyze_js

def analyze_code(code: str, language: str) -> dict:
    language = language.lower()
    if language == 'python':
        return analyze_python(code)
    elif language == 'cpp' or language == 'c++':
        return analyze_cpp(code)
    elif language == 'java':
        return analyze_java(code)
    elif language in ['javascript', 'js']:
        return analyze_js(code)
    else:
        return {'status': 'error', 'message': f'Unsupported language: {language}'}
