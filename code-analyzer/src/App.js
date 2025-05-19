import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Code, Lightbulb } from 'lucide-react';

const CodeAnalyzer = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [errors, setErrors] = useState([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', extensions: ['.js', '.jsx'] },
    { value: 'python', label: 'Python', extensions: ['.py'] },
    { value: 'java', label: 'Java', extensions: ['.java'] },
    { value: 'cpp', label: 'C++', extensions: ['.cpp', '.hpp', '.cc'] },
    { value: 'c', label: 'C', extensions: ['.c', '.h'] },
    { value: 'html', label: 'HTML', extensions: ['.html', '.htm'] },
    { value: 'css', label: 'CSS', extensions: ['.css'] },
    { value: 'json', label: 'JSON', extensions: ['.json'] },
    { value: 'xml', label: 'XML', extensions: ['.xml'] },
    { value: 'sql', label: 'SQL', extensions: ['.sql'] }
  ];

  const errorPatterns = {
    javascript: [
      { 
        pattern: /console\.log\s*\(/g, 
        type: 'warning', 
        message: 'Debug console.log statement', 
        suggestion: 'Remove console.log statements before production deployment' 
      },
      { 
        pattern: /\bvar\s+\w+/g, 
        type: 'warning', 
        message: 'Legacy var declaration', 
        suggestion: 'Use const or let instead of var for better scoping' 
      },
      { 
        pattern: /(?<!!)===?\s*(?:null|undefined)/g, 
        type: 'info', 
        message: 'Null/undefined check', 
        suggestion: 'Consider using optional chaining (?.) or nullish coalescing (??)'
      },
      { 
        pattern: /==(?!=)/g, 
        type: 'warning', 
        message: 'Loose equality comparison', 
        suggestion: 'Use strict equality (===) to avoid type coercion issues' 
      },
      { 
        pattern: /;\s*;/g, 
        type: 'error', 
        message: 'Double semicolon', 
        suggestion: 'Remove the extra semicolon' 
      },
      { 
        pattern: /function\s*\(\s*\)\s*\{\s*\}/g, 
        type: 'warning', 
        message: 'Empty function', 
        suggestion: 'Add implementation or remove empty function' 
      },
      {
        pattern: /\b\w+\s*\(\s*\)\s*\{[^}]*\}/g,
        type: 'info',
        message: 'Function definition found',
        suggestion: 'Ensure function has proper error handling if needed'
      },
      {
        pattern: /catch\s*\(\s*\w*\s*\)\s*\{\s*\}/g,
        type: 'warning',
        message: 'Empty catch block',
        suggestion: 'Handle errors appropriately or at least log them'
      },
      {
        pattern: /eval\s*\(/g,
        type: 'error',
        message: 'Use of eval() detected',
        suggestion: 'Avoid eval() as it poses security risks and performance issues'
      },
      {
        pattern: /\b\d+[a-zA-Z_$][\w$]*\b/g,
        type: 'error',
        message: 'Invalid variable name: starts with a digit',
        suggestion: 'Variable names must start with a letter, underscore, or dollar sign.'
      },
      {
        pattern: /\b[a-zA-Z_$][\w$]*[@#%^&*+\-=/\\|<>~`][\w$]*\b/g,
        type: 'error',
        message: 'Invalid variable name: contains illegal characters',
        suggestion: 'Variable names can only contain letters, digits, underscores, or dollar signs.'
      },
      {
        pattern: /\b(?:break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|let|static|async|await|true|false|null|undefined)\b(?=\s*(?:=|\(|;))/g,
        type: 'error',
        message: 'Invalid variable name: reserved keyword',
        suggestion: 'Choose a different name that is not a JavaScript reserved keyword.'
      }
    ],
    python: [
      { 
        pattern: /print\s*\(/g, 
        type: 'warning', 
        message: 'Print statement detected', 
        suggestion: 'Consider using logging module instead of print for production code' 
      },
      { 
        pattern: /except\s*:/g, 
        type: 'warning', 
        message: 'Bare except clause', 
        suggestion: 'Specify exception type(s): except ValueError, TypeError:' 
      },
      { 
        pattern: /import\s+\*/g, 
        type: 'warning', 
        message: 'Wildcard import', 
        suggestion: 'Import specific items to avoid namespace pollution: from module import item1, item2' 
      },
      { 
        pattern: /\t+/g, 
        type: 'error', 
        message: 'Tab characters detected', 
        suggestion: 'Use 4 spaces for indentation according to PEP 8' 
      },
      {
        pattern: /(?:def|class)\s+\w+.*:\s*$/gm,
        type: 'warning',
        message: 'Function/class without docstring',
        suggestion: 'Add docstrings to document your functions and classes'
      },
      {
        pattern: /(?:if|while|for).*:\s*pass\s*$/gm,
        type: 'warning',
        message: 'Empty control block with pass',
        suggestion: 'Add implementation or remove unnecessary control structure'
      },
      {
        pattern: /global\s+\w+/g,
        type: 'warning',
        message: 'Global variable usage',
        suggestion: 'Consider passing variables as parameters instead of using global'
      },
      {
        pattern: /(?:def|class|[a-zA-Z_]\w*\s*=)\s*\d+[a-zA-Z_]\w*(?=\s*(?:=|\(|:))/g,
        type: 'error',
        message: 'Invalid variable name: starts with a digit',
        suggestion: 'Variable names must start with a letter or underscore.'
      },
      {
        pattern: /(?:def|class|[a-zA-Z_]\w*\s*=)\s*[a-zA-Z_][\w]*[@#%^&*+\-=/\\|<>~`][\w]*(?=\s*(?:=|\(|:))/g,
        type: 'error',
        message: 'Invalid variable name: contains illegal characters',
        suggestion: 'Variable names can only contain letters, digits, or underscores.'
      },
      {
        pattern: /(?:def|class|[a-zA-Z_]\w*\s*=)\s*(?:False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)(?=\s*(?:=|\(|:))/g,
        type: 'error',
        message: 'Invalid variable name: reserved keyword',
        suggestion: 'Choose a different name that is not a Python reserved keyword.'
      }
    ],
    java: [
      { 
        pattern: /System\.out\.print(?:ln)?\s*\(/g, 
        type: 'warning', 
        message: 'System.out.print usage', 
        suggestion: 'Use proper logging framework (Log4j, SLF4J) instead of System.out' 
      },
      { 
        pattern: /catch\s*\(\s*Exception\s+\w+\s*\)/g, 
        type: 'warning', 
        message: 'Generic Exception caught', 
        suggestion: 'Catch specific exception types when possible' 
      },
      {
        pattern: /\w+\s*=\s*null\s*;/g,
        type: 'warning',
        message: 'Null assignment',
        suggestion: 'Consider using Optional<T> to avoid null pointer exceptions'
      },
      {
        pattern: /(?:class|interface)\s+\w+.*\{\s*\}/g,
        type: 'warning',
        message: 'Empty class/interface',
        suggestion: 'Add implementation or remove empty class/interface'
      },
      {
        pattern: /public\s+static\s+void\s+main/g,
        type: 'info',
        message: 'Main method found',
        suggestion: 'Application entry point detected'
      },
      {
        pattern: /\/\/\s*TODO/g,
        type: 'info',
        message: 'TODO comment found',
        suggestion: 'Complete the TODO item or remove the comment'
      },
      {
        pattern: /(?:int|float|double|char|boolean|byte|short|long|void|String)\s+\d+[a-zA-Z_$][\w$]*(?=\s*(?:=|\;))/g,
        type: 'error',
        message: 'Invalid variable name: starts with a digit',
        suggestion: 'Variable names must start with a letter, underscore, or dollar sign.'
      },
      {
        pattern: /(?:int|float|double|char|boolean|byte|short|long|void|String)\s+[a-zA-Z_$][\w$]*[@#%^&*+\-=/\\|<>~`][\w$]*(?=\s*(?:=|\;))/g,
        type: 'error',
        message: 'Invalid variable name: contains illegal characters',
        suggestion: 'Variable names can only contain letters, digits, underscores, or dollar signs.'
      },
      {
        pattern: /(?:int|float|double|char|boolean|byte|short|long|void|String)\s+(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)(?=\s*(?:=|\;))/g,
        type: 'error',
        message: 'Invalid variable name: reserved keyword',
        suggestion: 'Choose a different name that is not a Java reserved keyword.'
      }
    ],
    cpp: [
      { 
        pattern: /using\s+namespace\s+std\s*;/g, 
        type: 'warning', 
        message: 'Using namespace std', 
        suggestion: 'Use specific std:: qualifiers instead of "using namespace std"' 
      },
      { 
        pattern: /\b(?:malloc|free|realloc)\s*\(/g, 
        type: 'warning', 
        message: 'C-style memory management', 
        suggestion: 'Use new/delete or smart pointers (unique_ptr, shared_ptr) instead' 
      },
      { 
        pattern: /goto\s+\w+/g, 
        type: 'error', 
        message: 'goto statement detected', 
        suggestion: 'Use structured programming constructs instead of goto' 
      },
      {
        pattern: /#include\s*<\w+>/g,
        type: 'info',
        message: 'Standard library include',
        suggestion: 'Standard library header included'
      },
      {
        pattern: /delete\s+\w+\s*;(?!\s*\w+\s*=\s*nullptr)/g,
        type: 'warning',
        message: 'Delete without nullifying pointer',
        suggestion: 'Set pointer to nullptr after delete to avoid double deletion'
      },
      {
        pattern: /char\s+\w+\[\d+\]/g,
        type: 'warning',
        message: 'Fixed-size character array',
        suggestion: 'Consider using std::string for safer string handling'
      },
      {
        pattern: /(?:int|float|double|char|bool|void|long|short|auto)\s+\d+[a-zA-Z_]\w*(?=\s*(?:=|\;))/g,
        type: 'error',
        message: 'Invalid variable name: starts with a digit',
        suggestion: 'Variable names must start with a letter or underscore.'
      },
      {
        pattern: /(?:int|float|double|char|bool|void|long|short|auto)\s+[a-zA-Z_][\w]*[@#%^&*+\-=/\\|<>~`][\w]*(?=\s*(?:=|\;))/g,
        type: 'error',
        message: 'Invalid variable name: contains illegal characters',
        suggestion: 'Variable names can only contain letters, digits, or underscores.'
      },
      {
        pattern: /(?:int|float|double|char|bool|void|long|short|auto)\s+(?:alignas|alignof|and|and_eq|asm|auto|bitand|bitor|bool|break|case|catch|char|char16_t|char32_t|class|compl|const|constexpr|const_cast|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|not|not_eq|nullptr|operator|or|or_eq|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|xor|xor_eq)(?=\s*(?:=|\;))/g,
        type: 'error',
        message: 'Invalid variable name: reserved keyword',
        suggestion: 'Choose a different name that is not a C++ reserved keyword.'
      }
    ],
    c: [
      {
        pattern: /#include\s*<\w+\.h>/g,
        type: 'info',
        message: 'Standard C library include',
        suggestion: 'Standard C header included'
      },
      {
        pattern: /printf\s*\(/g,
        type: 'warning',
        message: 'printf usage detected',
        suggestion: 'Ensure format strings match argument types to avoid undefined behavior'
      },
      {
        pattern: /gets\s*\(/g,
        type: 'error',
        message: 'Dangerous gets() function',
        suggestion: 'Use fgets() instead of gets() to prevent buffer overflow'
      },
      {
        pattern: /scanf\s*\(/g,
        type: 'warning',
        message: 'scanf usage detected',
        suggestion: 'Consider using safer alternatives like fgets() with sscanf()'
      },
      {
        pattern: /(?:int|float|double|char|void|long|short)\s+\d+[a-zA-Z_]\w*(?=\s*(?:=|\;))/g,
        type: 'error',
        message: 'Invalid variable name: starts with a digit',
        suggestion: 'Variable names must start with a letter or underscore.'
      },
      {
        pattern: /(?:int|float|double|char|void|long|short)\s+[a-zA-Z_][\w]*[@#%^&*+\-=/\\|<>~`][\w]*(?=\s*(?:=|\;))/g,
        type: 'error',
        message: 'Invalid variable name: contains illegal characters',
        suggestion: 'Variable names can only contain letters, digits, or underscores.'
      },
      {
        pattern: /(?:int|float|double|char|void|long|short)\s+(?:auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)(?=\s*(?:=|\;))/g,
        type: 'error',
        message: 'Invalid variable name: reserved keyword',
        suggestion: 'Choose a different name that is not a C reserved keyword.'
      }
    ],
    html: [
      { 
        pattern: /<img(?![^>]*\salt\s*=)/g, 
        type: 'warning', 
        message: 'Image missing alt attribute', 
        suggestion: 'Add alt attribute for accessibility: <img src="..." alt="description">' 
      },
      { 
        pattern: /<(?:script|style)[^>]*>[\s\S]*?<\/(?:script|style)>/g, 
        type: 'info', 
        message: 'Inline script/style detected', 
        suggestion: 'Consider moving to external files for better maintainability' 
      },
      {
        pattern: /<[^/>]+(?<!\/)>/g,
        type: 'warning',
        message: 'Potentially unclosed tag',
        suggestion: 'Ensure all non-void tags are properly closed'
      },
      {
        pattern: /onclick\s*=/g,
        type: 'warning',
        message: 'Inline event handler',
        suggestion: 'Use addEventListener in JavaScript instead of inline handlers'
      },
      {
        pattern: /<[^>]+\sid\s*=\s*["']([^"']+)["'][^>]*>/g,
        type: 'info',
        message: 'Element with ID found',
        suggestion: 'Ensure IDs are unique throughout the document'
      },
      {
        pattern: /<([a-zA-Z0-9]*\d+[a-zA-Z0-9]*)\b/g,
        type: 'error',
        message: 'Invalid tag name: contains digits',
        suggestion: 'Tag names should not contain digits; use lowercase letters or hyphens.'
      },
      {
        pattern: /<[^>]*\s+([a-zA-Z0-9]*[@#%^&*+\=/\\|<>~`][a-zA-Z0-9]*)\s*=/g,
        type: 'error',
        message: 'Invalid attribute name: contains illegal characters',
        suggestion: 'Attribute names can only contain letters, digits, hyphens, or underscores.'
      }
    ],
    css: [
      { 
        pattern: /!important/g, 
        type: 'warning', 
        message: '!important declaration', 
        suggestion: 'Avoid !important; use more specific selectors or reorganize CSS' 
      },
      { 
        pattern: /font-size\s*:\s*\d+px/g, 
        type: 'info', 
        message: 'Fixed pixel font size', 
        suggestion: 'Consider using rem, em, or viewport units for responsive design' 
      },
      {
        pattern: /(?:width|height)\s*:\s*\d+px/g,
        type: 'info',
        message: 'Fixed pixel dimensions',
        suggestion: 'Consider using responsive units (%, vw, vh, rem) for better flexibility'
      },
      {
        pattern: /color\s*:\s*(?:red|blue|green|yellow|black|white)(?![a-zA-Z])/g,
        type: 'info',
        message: 'Basic color keyword',
        suggestion: 'Consider using hex codes, rgb(), or CSS custom properties for consistency'
      },
      {
        pattern: /\.[a-zA-Z][a-zA-Z0-9_-]*\s*\{[^}]*\}/g,
        type: 'info',
        message: 'CSS class definition',
        suggestion: 'CSS rule found'
      },
      {
        pattern: /(?:\.[a-zA-Z0-9_-]*\d+[a-zA-Z0-9_-]*|#[a-zA-Z0-9_-]*\d+[a-zA-Z0-9_-]*)/g,
        type: 'error',
        message: 'Invalid class/ID name: starts with or contains digits',
        suggestion: 'Class and ID names should start with a letter and contain letters, digits, hyphens, or underscores.'
      },
      {
        pattern: /(?:\.[a-zA-Z0-9_-]*[@#%^&*+\=/\\|<>~`][a-zA-Z0-9_-]*|#[a-zA-Z0-9_-]*[@#%^&*+\=/\\|<>~`][a-zA-Z0-9_-]*)/g,
        type: 'error',
        message: 'Invalid class/ID name: contains illegal characters',
        suggestion: 'Class and ID names can only contain letters, digits, hyphens, or underscores.'
      }
    ],
    json: [
      {
        pattern: /(?<!")(\w+)(?=\s*:)/g,
        type: 'error',
        message: 'Unquoted property name',
        suggestion: 'Property names must be enclosed in double quotes in JSON'
      },
      {
        pattern: /:\s*'[^']*'/g,
        type: 'error',
        message: 'Single quotes used for string',
        suggestion: 'Use double quotes for strings in JSON'
      },
      {
        pattern: /,\s*[}\]]/g,
        type: 'error',
        message: 'Trailing comma',
        suggestion: 'Remove trailing comma before closing bracket/brace'
      },
      {
        pattern: /"(\d+[a-zA-Z_]\w*)"/g,
        type: 'error',
        message: 'Invalid property name: starts with a digit',
        suggestion: 'Property names must start with a letter or underscore.'
      },
      {
        pattern: /"([a-zA-Z_][\w]*[@#%^&*+\-=/\\|<>~`][\w]*)"/g,
        type: 'error',
        message: 'Invalid property name: contains illegal characters',
        suggestion: 'Property names can only contain letters, digits, or underscores.'
      }
    ],
    xml: [
      {
        pattern: /<([a-zA-Z0-9]*\d+[a-zA-Z0-9]*)\b/g,
        type: 'error',
        message: 'Invalid element name: contains digits',
        suggestion: 'Element names should start with a letter or underscore and contain letters, digits, hyphens, or periods.'
      },
      {
        pattern: /<[^>]*\s+([a-zA-Z0-9]*[@#%^&*+\=/\\|<>~`][a-zA-Z0-9]*)\s*=/g,
        type: 'error',
        message: 'Invalid attribute name: contains illegal characters',
        suggestion: 'Attribute names can only contain letters, digits, hyphens, or underscores.'
      }
    ],
    sql: [
      {
        pattern: /(?:CREATE|TABLE|ALTER|INSERT|UPDATE|SELECT)\s+\d+[a-zA-Z_]\w*(?=\s*(?:\(|\;))/g,
        type: 'error',
        message: 'Invalid identifier name: starts with a digit',
        suggestion: 'Identifiers (e.g., table/column names) must start with a letter or underscore.'
      },
      {
        pattern: /(?:CREATE|TABLE|ALTER|INSERT|UPDATE|SELECT)\s+[a-zA-Z_][\w]*[@#%^&*+\-=/\\|<>~`][\w]*(?=\s*(?:\(|\;))/g,
        type: 'error',
        message: 'Invalid identifier name: contains illegal characters',
        suggestion: 'Identifiers can only contain letters, digits, or underscores.'
      },
      {
        pattern: /(?:CREATE|TABLE|ALTER|INSERT|UPDATE|SELECT)\s+(?:ADD|ALL|ALTER|AND|ANY|AS|ASC|BACKUP|BETWEEN|BY|CASE|CHECK|COLUMN|CONSTRAINT|CREATE|DATABASE|DEFAULT|DELETE|DESC|DISTINCT|DROP|EXEC|EXISTS|FOREIGN|FROM|FULL|GROUP|HAVING|IN|INDEX|INNER|INSERT|INTO|IS|JOIN|KEY|LEFT|LIKE|LIMIT|NOT|NULL|ON|OR|ORDER|OUTER|PRIMARY|PROCEDURE|RIGHT|ROWNUM|SELECT|SET|TABLE|TOP|TRUNCATE|UNION|UNIQUE|UPDATE|VALUES|VIEW|WHERE)(?=\s*(?:\(|\;))/g,
        type: 'error',
        message: 'Invalid identifier name: reserved keyword',
        suggestion: 'Choose a different name that is not an SQL reserved keyword or use quoted identifiers.'
      }
    ]
  };

  const analyzeCode = (codeText, lang) => {
    const patterns = errorPatterns[lang] || [];
    const foundErrors = [];
    const lines = codeText.split('\n');
    
    // Run pattern-based analysis
    patterns.forEach(({ pattern, type, message, suggestion }) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(codeText)) !== null) {
        const beforeMatch = codeText.substring(0, match.index);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
        
        foundErrors.push({
          line: lineNumber,
          column: columnNumber,
          type,
          message,
          suggestion,
          code: match[0].trim()
        });
      }
    });

    // Language-specific syntax analysis
    if (lang === 'javascript') {
      const openBraces = (codeText.match(/\{/g) || []).length;
      const closeBraces = (codeText.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        foundErrors.push({
          line: -1, column: -1, type: 'error', message: 'Mismatched braces',
          suggestion: `Found ${openBraces} opening braces but ${closeBraces} closing braces`, code: '{}'
        });
      }

      const openParens = (codeText.match(/\(/g) || []).length;
      const closeParens = (codeText.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        foundErrors.push({
          line: -1, column: -1, type: 'error', message: 'Mismatched parentheses',
          suggestion: `Found ${openParens} opening parentheses but ${closeParens} closing parentheses`, code: '()'
        });
      }

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine && 
            !trimmedLine.endsWith(';') && 
            !trimmedLine.endsWith('{') && 
            !trimmedLine.endsWith('}') &&
            !trimmedLine.startsWith('//') &&
            !trimmedLine.startsWith('/*') &&
            !trimmedLine.endsWith('*/') &&
            !trimmedLine.match(/^\s*(?:if|else|for|while|do|switch|function|class|const|let|var).*[{]\s*$/) &&
            !trimmedLine.match(/^\s*(?:return|break|continue).*[;]\s*$/) &&
            trimmedLine.match(/^(?:(?:const|let|var)\s+\w+.*=.*|.*=.*|.*\+\+|.*--|.*\(.*\))$/)) {
          foundErrors.push({
            line: index + 1, column: trimmedLine.length + 1, type: 'error', message: 'Missing semicolon',
            suggestion: 'Add semicolon at the end of the statement', code: trimmedLine
          });
        }
      });

      // --- Undeclared Variable and Invalid Name Check ---
      const declaredIdentifiers = new Set();
      const codeWithoutCommentsForDeclarations = codeText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

      const reservedKeywords = new Set([
        'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
        'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
        'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while',
        'with', 'yield', 'let', 'static', 'async', 'await', 'true', 'false', 'null', 'undefined'
      ]);

      const jsKeywordsAndGlobals = new Set([
        'Array', 'Boolean', 'Date', 'Error', 'Function', 'JSON', 'Math', 'Number', 'Object', 'Promise',
        'RegExp', 'Set', 'String', 'Symbol', 'Map', 'WeakMap', 'WeakSet',
        'console', 'window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'alert',
        'prompt', 'confirm', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'fetch',
        'isNaN', 'isFinite', 'parseInt', 'parseFloat', 'decodeURI', 'encodeURI', 'decodeURIComponent', 'encodeURIComponent',
        'arguments', 'require', 'module', 'exports', 'global', 'process'
      ]);

      const addIfValid = (name) => {
        if (name && /^[a-zA-Z_$][\w$]*$/.test(name) && !reservedKeywords.has(name)) {
          declaredIdentifiers.add(name);
        } else if (name && !/^[a-zA-Z_$][\w$]*$/.test(name)) {
          const linesBefore = codeWithoutCommentsForDeclarations.split('\n');
          const lineNumber = linesBefore.length;
          const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid variable name: '${name}'`,
            suggestion: 'Variable names must start with a letter, underscore, or dollar sign and contain only letters, digits, underscores, or dollar signs.',
            code: name
          });
        } else if (name && reservedKeywords.has(name)) {
          const linesBefore = codeWithoutCommentsForDeclarations.split('\n');
          const lineNumber = linesBefore.length;
          const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid variable name: '${name}' is a reserved keyword`,
            suggestion: 'Choose a different name that is not a JavaScript reserved keyword.',
            code: name
          });
        }
      };

      const varLetConstPattern = /(?:var|let|const)\s+([a-zA-Z_$][\w$]*)/g;
      let declMatch;
      while ((declMatch = varLetConstPattern.exec(codeWithoutCommentsForDeclarations)) !== null) {
        addIfValid(declMatch[1]);
      }

      const destructuringPattern = /(?:var|let|const)\s+(?:(?:\{([^}]+)\})|(?:\[([^\]]+)\]))\s*=/g;
      let destMatch;
      while ((destMatch = destructuringPattern.exec(codeWithoutCommentsForDeclarations)) !== null) {
        const content = destMatch[1] || destMatch[2];
        if (content) {
          content.split(',').forEach(part => {
            part = part.trim();
            if (!part || part === '...') return;
            let varName = part.split('=')[0].trim();
            if (varName.includes(':')) {
              varName = varName.split(':')[1].trim();
            }
            if (varName.startsWith('...')) {
              varName = varName.substring(3);
            }
            addIfValid(varName);
          });
        }
      }

      const funcNamePattern = /(?:function\s+([a-zA-Z_$][\w$]*)|(?:var|let|const)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:function|\([^)]*\)\s*=>))/g;
      let funcNameMatch;
      while ((funcNameMatch = funcNamePattern.exec(codeWithoutCommentsForDeclarations)) !== null) {
        addIfValid(funcNameMatch[1] || funcNameMatch[2]);
      }

      const classNamePattern = /class\s+([a-zA-Z_$][\w$]*)/g;
      let classNameMatch;
      while ((classNameMatch = classNamePattern.exec(codeWithoutCommentsForDeclarations)) !== null) {
        addIfValid(classNameMatch[1]);
      }

      const paramPattern = /(?:function\s*\w*\s*|(?:\w+\s*=\s*)?(?:async\s*)?)\(([^)]*)\)\s*(?:=>|{)|catch\s*\(([^)]*)\)/g;
      let paramMatch;
      while ((paramMatch = paramPattern.exec(codeWithoutCommentsForDeclarations)) !== null) {
        const paramsString = paramMatch[1] !== undefined ? paramMatch[1] : paramMatch[2];
        if (paramsString) {
          paramsString.split(',').forEach(p => {
            let paramName = p.trim().split('=')[0].trim();
            if (paramName.startsWith('...')) {
              addIfValid(paramName.substring(3));
            } else if (paramName.startsWith('{') && paramName.endsWith('}')) {
              paramName.substring(1, paramName.length - 1).split(',').forEach(dp => {
                let destructuredP = dp.trim().split('=')[0].trim();
                if (destructuredP.includes(':')) destructuredP = destructuredP.split(':')[1].trim();
                if (destructuredP.startsWith('...')) destructuredP = destructuredP.substring(3);
                addIfValid(destructuredP);
              });
            } else if (paramName.startsWith('[') && paramName.endsWith(']')) {
              paramName.substring(1, paramName.length - 1).split(',').forEach(dp => {
                let destructuredP = dp.trim().split('=')[0].trim();
                if (destructuredP.startsWith('...')) destructuredP = destructuredP.substring(3);
                addIfValid(destructuredP);
              });
            } else {
              addIfValid(paramName);
            }
          });
        }
      }

      const importPattern = /import\s+(?:([\w$*]+|\{[\s\S]*?\})\s+from\s+['"][^'"]+['"])/g;
      let impMatch;
      while ((impMatch = importPattern.exec(codeWithoutCommentsForDeclarations)) !== null) {
        const importClause = impMatch[1];
        const defaultImportMatch = importClause.match(/^([a-zA-Z_$][\w$]*)(?:\s*,|\s*$)/);
        if (defaultImportMatch && !importClause.includes('{')) {
          addIfValid(defaultImportMatch[1]);
        }
        const namespaceImportMatch = importClause.match(/\*\s+as\s+([a-zA-Z_$][\w$]*)/);
        if (namespaceImportMatch) {
          addIfValid(namespaceImportMatch[1]);
        }
        const namedImportsMatch = importClause.match(/\{([^}]+)\}/);
        if (namedImportsMatch) {
          namedImportsMatch[1].split(',').forEach(specifier => {
            specifier = specifier.trim();
            if (!specifier) return;
            const parts = specifier.split(/\s+as\s+/);
            const declaredName = (parts.length > 1 ? parts[1] : parts[0]).trim();
            addIfValid(declaredName);
          });
        }
      }

      const commentRegions = [];
      const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;
      let commentMatch;
      while ((commentMatch = commentRegex.exec(codeText)) !== null) {
        commentRegions.push({ start: commentMatch.index, end: commentMatch.index + commentMatch[0].length });
      }
      const isInsideComment = (index) => commentRegions.some(region => index >= region.start && index < region.end);

      const alreadyReportedUndeclared = new Set();
      const invalidNameReported = new Set();
      const allIdentifiersRegex = /\b([a-zA-Z_$][\w$]*)\b|\b(\d+[a-zA-Z_$][\w$]*)\b|\b([a-zA-Z_$][\w$]*[@#%^&*+\-=/\\|<>~`][\w$]*)\b/g;
      let idMatch;
      while ((idMatch = allIdentifiersRegex.exec(codeText)) !== null) {
        const token = idMatch[1] || idMatch[2] || idMatch[3];
        const matchIndex = idMatch.index;

        if (isInsideComment(matchIndex)) {
          continue;
        }

        const beforeMatch = codeText.substring(0, matchIndex);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;

        const reportKey = `${lineNumber}-${columnNumber}-${token}`;

        if (idMatch[2] || idMatch[3]) {
          if (!invalidNameReported.has(reportKey)) {
            foundErrors.push({
              line: lineNumber,
              column: columnNumber,
              type: 'error',
              message: `Invalid variable name: '${token}'`,
              suggestion: idMatch[2]
                ? 'Variable names must start with a letter, underscore, or dollar sign.'
                : 'Variable names can only contain letters, digits, underscores, or dollar signs.',
              code: token
            });
            invalidNameReported.add(reportKey);
          }
          continue;
        }

        if (reservedKeywords.has(token)) {
          const postTokenContent = codeText.substring(matchIndex + token.length);
          if (postTokenContent.match(/^\s*(?:=|\(|;)/)) {
            if (!invalidNameReported.has(reportKey)) {
              foundErrors.push({
                line: lineNumber,
                column: columnNumber,
                type: 'error',
                message: `Invalid variable name: '${token}' is a reserved keyword`,
                suggestion: 'Choose a different name that is not a JavaScript reserved keyword.',
                code: token
              });
              invalidNameReported.add(reportKey);
            }
          }
          continue;
        }

        if (alreadyReportedUndeclared.has(reportKey)) continue;

        if (jsKeywordsAndGlobals.has(token) || declaredIdentifiers.has(token)) {
          continue;
        }

        if (matchIndex > 0) {
          const prevChar = codeText[matchIndex - 1];
          if (prevChar === '.' || (matchIndex > 1 && prevChar === '?' && codeText[matchIndex - 2] === '.')) {
            continue;
          }
        }
        const postTokenContent = codeText.substring(matchIndex + token.length);
        if (postTokenContent.match(/^\s*:/)) continue;

        foundErrors.push({
          line: lineNumber,
          column: columnNumber,
          type: 'warning',
          message: `Potential undeclared variable: '${token}'`,
          suggestion: `Ensure '${token}' is declared (via var, let, const, function, class, parameter, import), is a global, or an object property.`,
          code: token
        });
        alreadyReportedUndeclared.add(reportKey);
      }
      // --- End of Undeclared Variable and Invalid Name Check ---
    }

    if (lang === 'python') {
      lines.forEach((line, index) => {
        if (line.trim() && line.match(/^(\s+)/)) {
          const indentation = line.match(/^(\s+)/)[1];
          if (indentation.includes('\t') && indentation.includes(' ')) {
            foundErrors.push({
              line: index + 1, column: 1, type: 'error', message: 'Mixed tabs and spaces',
              suggestion: 'Use either tabs or spaces consistently for indentation', code: indentation
            });
          }
        }
      });

      // --- Python Variable Declaration Validation ---
      const declaredIdentifiers = new Set();
      const codeWithoutComments = codeText.replace(/#.*$/gm, '');
      
      const reservedKeywords = new Set([
        'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
        'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
        'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
        'try', 'while', 'with', 'yield'
      ]);

      const addIfValid = (name, lineNumber, columnNumber) => {
        if (name && /^[a-zA-Z_][\w]*$/.test(name) && !reservedKeywords.has(name)) {
          declaredIdentifiers.add(name);
        } else if (name && !/^[a-zA-Z_][\w]*$/.test(name)) {
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid variable name: '${name}'`,
            suggestion: 'Variable names must start with a letter or underscore and contain only letters, digits, or underscores.',
            code: name
          });
        } else if (name && reservedKeywords.has(name)) {
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid variable name: '${name}' is a reserved keyword`,
            suggestion: 'Choose a different name that is not a Python reserved keyword.',
            code: name
          });
        }
      };

      // Collect variable assignments
      const varAssignPattern = /([a-zA-Z_][\w]*)\s*=/g;
      let varMatch;
      while ((varMatch = varAssignPattern.exec(codeWithoutComments)) !== null) {
        const name = varMatch[1];
        const matchIndex = varMatch.index;
        const beforeMatch = codeWithoutComments.substring(0, matchIndex);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
        addIfValid(name, lineNumber, columnNumber);
      }

      // Collect function/class parameters
      const defPattern = /(?:def|class)\s+\w+\s*\(([^)]*)\)/g;
      let defMatch;
      while ((defMatch = defPattern.exec(codeWithoutComments)) !== null) {
        const params = defMatch[1];
        const matchIndex = defMatch.index;
        const beforeMatch = codeWithoutComments.substring(0, matchIndex);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
        if (params) {
          params.split(',').forEach(param => {
            const paramName = param.trim().split('=')[0].trim();
            if (paramName) {
              addIfValid(paramName, lineNumber, columnNumber);
            }
          });
        }
      }
      // --- End of Python Variable Declaration Validation ---
    }

    if (lang === 'java') {
      const openBraces = (codeText.match(/\{/g) || []).length;
      const closeBraces = (codeText.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        foundErrors.push({
          line: -1, column: -1, type: 'error', message: 'Mismatched braces',
          suggestion: `Found ${openBraces} opening braces but ${closeBraces} closing braces`, code: '{}'
        });
      }

      const openParens = (codeText.match(/\(/g) || []).length;
      const closeParens = (codeText.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        foundErrors.push({
          line: -1, column: -1, type: 'error', message: 'Mismatched parentheses',
          suggestion: `Found ${openParens} opening parentheses but ${closeParens} closing parentheses`, code: '()'
        });
      }

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine && 
            !trimmedLine.endsWith(';') && 
            !trimmedLine.endsWith('{') && 
            !trimmedLine.endsWith('}') &&
            !trimmedLine.startsWith('//') &&
            !trimmedLine.startsWith('/*') &&
            !trimmedLine.endsWith('*/') &&
            !trimmedLine.match(/^\s*(?:if|else|for|while|do|switch|class|struct|enum|namespace|try|catch|finally|synchronized)/) &&
            !trimmedLine.match(/^\s*(?:public|private|protected|static|final|abstract|default)/) &&
            (trimmedLine.match(/^.*(?:int|float|double|char|bool|string|auto|void|long|short)\s+\w+.*=.*;?$/) ||
             trimmedLine.match(/^.*\w+\s*=.*;?$/) ||
             trimmedLine.match(/^.*\w+\s*\+\+;?$/) ||
             trimmedLine.match(/^.*\w+\s*--;?$/) ||
             trimmedLine.match(/^.*(?:new\s+)?\w+\s*\(.*\)\s*;?$/) ||
             trimmedLine.match(/^\s*return.*;?$/) ||
             trimmedLine.match(/^\s*throw.*;?$/)
            ) && !trimmedLine.endsWith(";")) {
          foundErrors.push({
            line: index + 1, column: trimmedLine.length + 1, type: 'error', message: 'Missing semicolon',
            suggestion: 'Add semicolon at the end of the statement', code: trimmedLine
          });
        }
      });

      // --- Java Variable Declaration Validation ---
      const declaredIdentifiers = new Set();
      const codeWithoutComments = codeText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      
      const reservedKeywords = new Set([
        'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
        'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
        'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
        'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
        'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
        'volatile', 'while'
      ]);

      const addIfValid = (name, lineNumber, columnNumber) => {
        if (name && /^[a-zA-Z_$][\w$]*$/.test(name) && !reservedKeywords.has(name)) {
          declaredIdentifiers.add(name);
        } else if (name && !/^[a-zA-Z_$][\w$]*$/.test(name)) {
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid variable name: '${name}'`,
            suggestion: 'Variable names must start with a letter, underscore, or dollar sign and contain only letters, digits, underscores, or dollar signs.',
            code: name
          });
        } else if (name && reservedKeywords.has(name)) {
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid variable name: '${name}' is a reserved keyword`,
            suggestion: 'Choose a different name that is not a Java reserved keyword.',
            code: name
          });
        }
      };

      // Collect variable declarations
      const varDeclPattern = /(?:int|float|double|char|boolean|byte|short|long|void|String)\s+([a-zA-Z_$][\w$]*)\s*(?:=|[;])/g;
      let varMatch;
      while ((varMatch = varDeclPattern.exec(codeWithoutComments)) !== null) {
        const name = varMatch[1];
        const matchIndex = varMatch.index;
        const beforeMatch = codeWithoutComments.substring(0, matchIndex);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
        addIfValid(name, lineNumber, columnNumber);
      }

      // Collect method parameters
      const methodParamPattern = /(?:void|int|float|double|char|boolean|byte|short|long|String)\s+\w+\s*\(([^)]*)\)/g;
      let paramMatch;
      while ((paramMatch = methodParamPattern.exec(codeWithoutComments)) !== null) {
        const params = paramMatch[1];
        const matchIndex = paramMatch.index;
        const beforeMatch = codeWithoutComments.substring(0, matchIndex);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
        if (params) {
          params.split(',').forEach(param => {
            const paramName = param.trim().split(/\s+/).pop();
            if (paramName) {
              addIfValid(paramName, lineNumber, columnNumber);
            }
          });
        }
      }
      // --- End of Java Variable Declaration Validation ---
    }

    if (lang === 'cpp' || lang === 'c') {
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine && 
            !trimmedLine.endsWith(';') && 
            !trimmedLine.endsWith('{') && 
            !trimmedLine.endsWith('}') &&
            !trimmedLine.startsWith('//') &&
            !trimmedLine.startsWith('/*') &&
            !trimmedLine.endsWith('*/') &&
            !trimmedLine.startsWith('#') &&
            !trimmedLine.match(/^\s*(?:if|else|for|while|do|switch|class|struct|enum|namespace|try|catch|finally|synchronized)/) &&
            !trimmedLine.match(/^\s*(?:public|private|protected|static|final|abstract|default)/) &&
            (trimmedLine.match(/^.*(?:int|float|double|char|bool|string|auto|void|long|short)\s+\w+.*=.*;?$/) ||
             trimmedLine.match(/^.*\w+\s*=.*;?$/) ||
             trimmedLine.match(/^.*\w+\s*\+\+;?$/) ||
             trimmedLine.match(/^.*\w+\s*--;?$/) ||
             trimmedLine.match(/^.*(?:new\s+)?\w+\s*\(.*\)\s*;?$/) ||
             trimmedLine.match(/^\s*return.*;?$/) ||
             trimmedLine.match(/^\s*throw.*;?$/)
            ) && !trimmedLine.endsWith(";")) {
          foundErrors.push({
            line: index + 1, column: trimmedLine.length + 1, type: 'error', message: 'Missing semicolon',
            suggestion: 'Add semicolon at the end of the statement', code: trimmedLine
          });
        }
      });

      const openBraces = (codeText.match(/\{/g) || []).length;
      const closeBraces = (codeText.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        foundErrors.push({
          line: -1, column: -1, type: 'error', message: 'Mismatched braces',
          suggestion: `Found ${openBraces} opening braces but ${closeBraces} closing braces`, code: '{}'
        });
      }

      const openParens = (codeText.match(/\(/g) || []).length;
      const closeParens = (codeText.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        foundErrors.push({
          line: -1, column: -1, type: 'error', message: 'Mismatched parentheses',
          suggestion: `Found ${openParens} opening parentheses but ${closeParens} closing parentheses`, code: '()'
        });
      }

      // --- C/C++ Variable Declaration Validation ---
      const declaredIdentifiers = new Set();
      const codeWithoutComments = codeText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      
      const reservedKeywords = lang === 'cpp' ? new Set([
        'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break',
        'case', 'catch', 'char', 'char16_t', 'char32_t', 'class', 'compl', 'const', 'constexpr',
        'const_cast', 'continue', 'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast',
        'else', 'enum', 'explicit', 'export', 'extern', 'float', 'for', 'friend', 'goto', 'if',
        'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq',
        'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'register',
        'reinterpret_cast', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert',
        'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local', 'throw', 'try',
        'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void',
        'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'
      ]) : new Set([
        'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else',
        'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register', 'return',
        'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned',
        'void', 'volatile', 'while'
      ]);

      const addIfValid = (name, lineNumber, columnNumber) => {
        if (name && /^[a-zA-Z_][\w]*$/.test(name) && !reservedKeywords.has(name)) {
          declaredIdentifiers.add(name);
        } else if (name && !/^[a-zA-Z_][\w]*$/.test(name)) {
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid variable name: '${name}'`,
            suggestion: 'Variable names must start with a letter or underscore and contain only letters, digits, or underscores.',
            code: name
          });
        } else if (name && reservedKeywords.has(name)) {
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid variable name: '${name}' is a reserved keyword`,
            suggestion: `Choose a different name that is not a ${lang === 'cpp' ? 'C++' : 'C'} reserved keyword.`,
            code: name
          });
        }
      };

      // Collect variable declarations
      const varDeclPattern = /(?:int|float|double|char|bool|void|long|short|auto)\s+([a-zA-Z_][\w]*)\s*(?:=|[;])/g;
      let varMatch;
      while ((varMatch = varDeclPattern.exec(codeWithoutComments)) !== null) {
        const name = varMatch[1];
        const matchIndex = varMatch.index;
        const beforeMatch = codeWithoutComments.substring(0, matchIndex);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
        addIfValid(name, lineNumber, columnNumber);
      }

      // Collect function parameters
      const funcParamPattern = /(?:void|int|float|double|char|bool|long|short|auto)\s+\w+\s*\(([^)]*)\)/g;
      let paramMatch;
      while ((paramMatch = funcParamPattern.exec(codeWithoutComments)) !== null) {
        const params = paramMatch[1];
        const matchIndex = paramMatch.index;
        const beforeMatch = codeWithoutComments.substring(0, matchIndex);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
        if (params) {
          params.split(',').forEach(param => {
            const paramName = param.trim().split(/\s+/).pop();
            if (paramName) {
              addIfValid(paramName, lineNumber, columnNumber);
            }
          });
        }
      }
      // --- End of C/C++ Variable Declaration Validation ---
    }

    if (lang === 'sql') {
      // --- SQL Identifier Validation ---
      const declaredIdentifiers = new Set();
      const codeWithoutComments = codeText.replace(/--.*$|\/\*[\s\S]*?\*\//gm, '');
      
      const reservedKeywords = new Set([
        'ADD', 'ALL', 'ALTER', 'AND', 'ANY', 'AS', 'ASC', 'BACKUP', 'BETWEEN', 'BY', 'CASE',
        'CHECK', 'COLUMN', 'CONSTRAINT', 'CREATE', 'DATABASE', 'DEFAULT', 'DELETE', 'DESC',
        'DISTINCT', 'DROP', 'EXEC', 'EXISTS', 'FOREIGN', 'FROM', 'FULL', 'GROUP', 'HAVING',
        'IN', 'INDEX', 'INNER', 'INSERT', 'INTO', 'IS', 'JOIN', 'KEY', 'LEFT', 'LIKE', 'LIMIT',
        'NOT', 'NULL', 'ON', 'OR', 'ORDER', 'OUTER', 'PRIMARY', 'PROCEDURE', 'RIGHT', 'ROWNUM',
        'SELECT', 'SET', 'TABLE', 'TOP', 'TRUNCATE', 'UNION', 'UNIQUE', 'UPDATE', 'VALUES',
        'VIEW', 'WHERE'
      ]);

      const addIfValid = (name, lineNumber, columnNumber) => {
        if (name && /^[a-zA-Z_][\w]*$/.test(name) && !reservedKeywords.has(name)) {
          declaredIdentifiers.add(name);
        } else if (name && !/^[a-zA-Z_][\w]*$/.test(name)) {
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid identifier name: '${name}'`,
            suggestion: 'Identifiers must start with a letter or underscore and contain only letters, digits, or underscores.',
            code: name
          });
        } else if (name && reservedKeywords.has(name)) {
          foundErrors.push({
            line: lineNumber,
            column: columnNumber,
            type: 'error',
            message: `Invalid identifier name: '${name}' is a reserved keyword`,
            suggestion: 'Choose a different name that is not an SQL reserved keyword or use quoted identifiers.',
            code: name
          });
        }
      };

      // Collect table/column names
      const tableColumnPattern = /(?:CREATE|TABLE|ALTER|INSERT|UPDATE|SELECT)\s+([a-zA-Z_][\w]*)\s*(?:\(|\;)/g;
      let tableMatch;
      while ((tableMatch = tableColumnPattern.exec(codeWithoutComments)) !== null) {
        const name = tableMatch[1];
        const matchIndex = tableMatch.index;
        const beforeMatch = codeWithoutComments.substring(0, matchIndex);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
        addIfValid(name, lineNumber, columnNumber);
      }

      // Collect column definitions in CREATE TABLE
      const columnPattern = /CREATE\s+TABLE\s+\w+\s*\(([^)]*)\)/g;
      let columnMatch;
      while ((columnMatch = columnPattern.exec(codeWithoutComments)) !== null) {
        const columns = columnMatch[1];
        const matchIndex = columnMatch.index;
        const beforeMatch = codeWithoutComments.substring(0, matchIndex);
        const linesBefore = beforeMatch.split('\n');
        const lineNumber = linesBefore.length;
        const columnNumber = linesBefore[linesBefore.length - 1].length + 1;
        if (columns) {
          columns.split(',').forEach(column => {
            const columnName = column.trim().split(/\s+/)[0];
            if (columnName) {
              addIfValid(columnName, lineNumber, columnNumber);
            }
          });
        }
      }
      // --- End of SQL Identifier Validation ---
    }

    if (lang === 'json') {
      try {
        JSON.parse(codeText);
      } catch (e) {
        const lineMatch = e.message.match(/line (\d+)/);
        const lineNum = lineMatch ? parseInt(lineMatch[1]) : -1;
        
        foundErrors.push({
          line: lineNum !== -1 ? lineNum + 1 : -1,
          column: -1, type: 'error', message: 'JSON syntax error',
          suggestion: e.message, code: 'JSON'
        });
      }
    }

    const uniqueErrors = foundErrors.filter((error, index, self) => 
      index === self.findIndex(e => 
        e.line === error.line && 
        e.column === error.column && 
        e.message === error.message
      )
    );

    return uniqueErrors.sort((a, b) => {
      if (a.line === b.line) return a.column - b.column;
      if (a.line === -1) return 1;
      if (b.line === -1) return -1;
      return a.line - b.line;
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const detectedLang = languages.find(lang => lang.extensions.includes(extension));
    if (detectedLang) setLanguage(detectedLang.value);
    const text = await file.text();
    setCode(text);
  };

  const handleCodeChange = (e) => setCode(e.target.value);

  useEffect(() => {
    if (code.trim()) {
      const foundErrors = analyzeCode(code, language);
      setErrors(foundErrors);
    } else {
      setErrors([]);
    }
  }, [code, language]);

  const getErrorIcon = (type) => {
    switch (type) {
      case 'error': return <AlertCircle size={16} style={{color: '#dc3545'}} />;
      case 'warning': return <AlertCircle size={16} style={{color: '#ffc107'}} />;
      case 'info': return <CheckCircle size={16} style={{color: '#0d6efd'}} />;
      default: return <AlertCircle size={16} style={{color: '#6c757d'}} />;
    }
  };

  const getErrorClass = (type) => {
    switch (type) {
      case 'error': return 'alert alert-danger';
      case 'warning': return 'alert alert-warning';
      case 'info': return 'alert alert-info';
      default: return 'alert alert-secondary';
    }
  };

  const highlightErrors = (codeText) => {
    if (!errors.length) return codeText;
    const linesArr = codeText.split('\n');
    const errorsWithCode = errors.filter(error => error.code && error.line > 0 && error.column > 0);
    
    errorsWithCode.sort((a, b) => {
      if (b.line !== a.line) return b.line - a.line;
      return b.column - a.column;
    });

    errorsWithCode.forEach(error => {
      if (error.line <= linesArr.length) {
        const lineIndex = error.line - 1;
        let line = linesArr[lineIndex];
        
        const errorCodeStr = String(error.code);
        const codeStartIndex = error.column - 1;
        const codeEndIndex = codeStartIndex + errorCodeStr.length;

        if (codeStartIndex >= 0 && codeStartIndex < line.length && line.substring(codeStartIndex, codeEndIndex) === errorCodeStr) {
          const before = line.substring(0, codeStartIndex);
          const after = line.substring(codeEndIndex);
          const errorClass = error.type === 'error' ? 'error-highlight' : 
                            error.type === 'warning' ? 'warning-highlight' : 'info-highlight';
          const bgColor = error.type === 'error' ? '#ffdddd' : 
                         error.type === 'warning' ? '#fff3cd' : '#cff4fc';
          
          linesArr[lineIndex] = `${before}<mark class="${errorClass}" style="background-color: ${bgColor}; padding: 1px 2px; border-radius: 2px;">${errorCodeStr}</mark>${after}`;
        } else {
          const simpleCodeIndex = line.indexOf(errorCodeStr);
          if (simpleCodeIndex !== -1) {
            const before = line.substring(0, simpleCodeIndex);
            const after = line.substring(simpleCodeIndex + errorCodeStr.length);
            const errorClass = error.type === 'error' ? 'error-highlight' : 
                              error.type === 'warning' ? 'warning-highlight' : 'info-highlight';
            const bgColor = error.type === 'error' ? '#ffdddd' : 
                           error.type === 'warning' ? '#fff3cd' : '#cff4fc';
            linesArr[lineIndex] = `${before}<mark class="${errorClass}" style="background-color: ${bgColor}; padding: 1px 2px; border-radius: 2px;">${errorCodeStr}</mark>${after}`;
          }
        }
      }
    });
    return linesArr.join('\n');
  };

  return (
    <>
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div className="container-fluid bg-light" style={{minHeight: '100vh', padding: '2rem'}}>
        <div className="container">
          <header className="text-center mb-5">
            <h1 className="display-4 fw-bold text-dark mb-3">Code Error Analyzer</h1>
            <p className="lead text-muted">Upload a file or paste your code to analyze for errors and get suggestions</p>
          </header>

          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="card-title h4 mb-4">
                    <Code size={20} className="me-2" style={{color: '#0d6efd'}} />
                    Code Input
                  </h2>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Programming Language</label>
                    <select
                      className="form-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Upload File</label>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="d-none"
                        accept={languages.flatMap(l => l.extensions).join(',')}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={16} className="me-2" />
                        Choose File
                      </button>
                      {fileName && (
                        <span className="text-muted small">
                          <FileText size={14} className="me-1" />
                          {fileName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Or paste your code directly</label>
                    <textarea
                      ref={textareaRef}
                      value={code}
                      onChange={handleCodeChange}
                      placeholder={`Paste your ${languages.find(l => l.value === language)?.label || language} code here...`}
                      className="form-control"
                      style={{
                        height: '300px',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {code && (
                    <div>
                      <h5 className="fw-semibold mb-2">Code with Error Highlighting</h5>
                      <div 
                        className="border rounded p-3 bg-light overflow-auto"
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          maxHeight: '200px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all'
                        }}
                        dangerouslySetInnerHTML={{ __html: highlightErrors(code).replace(/\n/g, '<br>') }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="card-title h4 mb-4">
                    <AlertCircle size={20} className="me-2" style={{color: '#dc3545'}} />
                    Error Analysis
                    {errors.length > 0 && (
                      <span className={`badge ms-2 ${errors.some(e => e.type === 'error') ? 'bg-danger' : errors.some(e => e.type === 'warning') ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                        {errors.length}
                      </span>
                    )}
                  </h2>

                  {errors.length === 0 ? (
                    <div className="text-center py-5">
                      {code ? (
                        <div>
                          <CheckCircle size={64} style={{color: '#198754'}} className="mb-3" />
                          <h4 className="text-success">No issues detected!</h4>
                          <p className="text-muted">Your code looks good based on the current checks.</p>
                        </div>
                      ) : (
                        <div>
                          <Code size={64} className="text-muted mb-3" />
                          <p className="text-muted">Upload a file or paste some code to get started</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{maxHeight: '550px', overflowY: 'auto'}}>
                      {errors.map((error, index) => (
                        <div key={index} className={`${getErrorClass(error.type)} mb-3`} role="alert" style={{fontSize: '0.9rem'}}>
                          <div className="d-flex align-items-start">
                            <div className="me-2 mt-1 flex-shrink-0">
                              {getErrorIcon(error.type)}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-semibold me-2">{error.message}</span>
                                {error.line > 0 && (
                                  <span className="badge bg-secondary small">
                                    Line {error.line}{error.column > 0 ? `:${error.column}` : ''}
                                  </span>
                                )}
                                {error.line === -1 && (
                                  <span className="badge bg-secondary small">
                                    General
                                  </span>
                                )}
                              </div>
                              {error.code && error.code !== '{}' && error.code !== '()' && error.code !== 'JSON' && (
                                <div className="small font-monospace bg-white border rounded p-2 mb-2" style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                                  {error.code}
                                </div>
                              )}
                              <div className="d-flex align-items-start small">
                                <Lightbulb size={16} style={{color: error.type === 'error' ? '#dc3545' : error.type === 'warning' ? '#ffc107' : '#0d6efd' }} className="me-2 mt-1 flex-shrink-0" />
                                <span className="text-muted">{error.suggestion}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {code && (
            <div className="row mt-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <h3 className="card-title h5 mb-3">Analysis Summary</h3>
                    <div className="row text-center">
                      <div className="col-md-3 mb-3">
                        <div className="p-3 bg-light rounded">
                          <div className="h3 fw-bold text-dark">{code.split('\n').length}</div>
                          <div className="small text-muted">Lines of Code</div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="p-3 rounded" style={{backgroundColor: '#f8d7da'}}>
                          <div className="h3 fw-bold text-danger">
                            {errors.filter(e => e.type === 'error').length}
                          </div>
                          <div className="small text-muted">Errors</div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="p-3 rounded" style={{backgroundColor: '#fff3cd'}}>
                          <div className="h3 fw-bold text-warning">
                            {errors.filter(e => e.type === 'warning').length}
                          </div>
                          <div className="small text-muted">Warnings</div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="p-3 rounded" style={{backgroundColor: '#cff4fc'}}>
                          <div className="h3 fw-bold text-info">
                            {errors.filter(e => e.type === 'info').length}
                          </div>
                          <div className="small text-muted">Info</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CodeAnalyzer;