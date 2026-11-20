# Sinks and Dangerous Patterns Reference Checklist

Use this reference during static code analysis to identify risky programming patterns and untrusted input sinks.

## 1. Python Sinks

### SQL Injection
- `sqlite3.Cursor.execute()` with raw format string or concatenation.
- SQLAlchemy `text("SELECT ... " + var)` or `session.execute(raw_sql)`.
- psycopg2 / asyncpg queries without query parameters tuple.

### Command Execution
- `os.system(...)`
- `os.popen(...)`
- `subprocess.call(..., shell=True)`
- `subprocess.Popen(..., shell=True)`
- `subprocess.run(..., shell=True)`

### Deserialization & Eval
- `pickle.loads(...)`
- `marshal.loads(...)`
- `shelve.open(...)`
- `yaml.load(..., Loader=yaml.Loader)` or `yaml.unsafe_load(...)`
- `eval(...)`
- `exec(...)`

### Path Traversal & File Access
- `open(os.path.join(BASE_DIR, user_input))` without checking `os.path.commonpath`.
- `pathlib.Path(user_input).read_bytes()` without path resolution boundary checks.
- Unsanitized archive extraction (`tarfile.extractall`, `zipfile.extractall`).

### SSRF (Server-Side Request Forgery)
- `requests.get(url)`, `urllib.request.urlopen(url)`
- `httpx.get(url)`, `aiohttp.ClientSession().get(url)`
- Sinks where destination URL or IP originates from client input without loopback/private range protection (e.g. `127.0.0.1`, `169.254.169.254`, `10.0.0.0/8`).

---

## 2. JavaScript / TypeScript Sinks

### Code Execution / Injections
- `eval(...)`
- `new Function(...)`
- `child_process.exec(...)`, `child_process.execSync(...)`
- `vm.runInThisContext(...)`

### DOM-based XSS
- `element.innerHTML = ...`
- `element.outerHTML = ...`
- `document.write(...)`
- React `dangerouslySetInnerHTML={{ __html: ... }}`

### Path Traversal
- `fs.readFile(path.join(__dirname, userInput))`
- `res.sendFile(userInput)`

