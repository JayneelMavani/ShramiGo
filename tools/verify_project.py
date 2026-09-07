from __future__ import annotations

import ast
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "backend/app/main.py",
    "backend/app/core/config.py",
    "backend/app/core/database.py",
    "backend/app/core/security.py",
    "backend/app/routers/auth.py",
    "backend/app/routers/profile.py",
    "backend/app/routers/services.py",
    "backend/app/routers/worker_services.py",
    "backend/app/routers/workers.py",
    "backend/app/routers/bookings.py",
    "backend/app/routers/payments.py",
    "backend/app/routers/reviews.py",
    "backend/app/routers/notifications.py",
    "backend/app/routers/admin.py",
    "backend/app/routers/ai.py",
    "frontend/src/App.tsx",
    "frontend/src/services/api.ts",
    "frontend/src/services/auth.ts",
    "frontend/src/services/bookings.ts",
    "frontend/src/services/profile.ts",
    "frontend/src/services/worker.ts",
    "frontend/src/services/ai.ts",
]

def check_python_syntax() -> list[str]:
    errors = []
    for path in (ROOT / "backend/app").rglob("*.py"):
        try:
            ast.parse(path.read_text(encoding="utf-8"))
        except SyntaxError as exc:
            errors.append(f"{path}: {exc}")
    return errors

def check_migrations() -> list[str]:
    versions = {}
    for path in sorted((ROOT / "backend/alembic/versions").glob("*.py")):
        tree = ast.parse(path.read_text(encoding="utf-8"))
        values = {}
        for node in tree.body:
            if isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name) and node.target.id in {"revision", "down_revision"}:
                values[node.target.id] = ast.literal_eval(node.value)
            elif isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name) and node.targets[0].id in {"revision", "down_revision"}:
                values[node.targets[0].id] = ast.literal_eval(node.value)
        if values.get("revision"):
            versions[values["revision"]] = values.get("down_revision")
    errors = []
    heads = [rev for rev, down in versions.items() if rev not in {d for d in versions.values() if isinstance(d, str)}]
    if len(heads) != 1:
        errors.append(f"Expected one migration head, found {heads}")
    current = heads[0] if heads else None
    visited = set()
    while current:
        if current in visited:
            errors.append("Migration chain contains a cycle")
            break
        visited.add(current)
        current = versions.get(current)
    if len(visited) != len(versions):
        errors.append(f"Migration chain does not cover all revisions: {sorted(set(versions) - visited)}")
    return errors

def main() -> int:
    missing = [p for p in REQUIRED if not (ROOT / p).exists()]
    syntax_errors = check_python_syntax()
    migration_errors = check_migrations()
    package = json.loads((ROOT / "frontend/package.json").read_text())
    lock = json.loads((ROOT / "frontend/package-lock.json").read_text())
    package_root = lock["packages"][""]
    package_errors = []
    for section in ("dependencies", "devDependencies"):
        for name, version in package[section].items():
            locked = package_root.get(section, {}).get(name)
            if locked != version:
                package_errors.append(f"{section} {name}: package.json={version}, lockfile={locked}")
    print(f"Required files: {len(REQUIRED) - len(missing)}/{len(REQUIRED)}")
    print(f"Python syntax errors: {len(syntax_errors)}")
    print(f"Migration errors: {len(migration_errors)}")
    print(f"Package/lock mismatches: {len(package_errors)}")
    for item in missing + syntax_errors + migration_errors + package_errors:
        print("ERROR:", item)
    return 1 if (missing or syntax_errors or migration_errors or package_errors) else 0

if __name__ == "__main__":
    raise SystemExit(main())
