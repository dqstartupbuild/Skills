#!/usr/bin/env python3
"""Scan a repository and suggest Open Graph image integration targets."""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

SKIP_DIRS = {
    ".git",
    ".hg",
    ".svn",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".astro",
    ".turbo",
    ".cache",
    ".vercel",
    ".wrangler",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "out",
    "vendor",
}

TEXT_EXTENSIONS = {
    ".astro",
    ".cjs",
    ".css",
    ".html",
    ".js",
    ".jsx",
    ".json",
    ".mjs",
    ".mdx",
    ".ts",
    ".tsx",
    ".yaml",
    ".yml",
}

ROUTE_EXTENSIONS = {".astro", ".js", ".jsx", ".md", ".mdx", ".ts", ".tsx"}

EXCLUDE_ROUTE_PATTERNS = (
    re.compile(r"^/api(?:/|$)"),
    re.compile(r"^/(?:admin|auth|login|logout|signup|settings|dashboard)(?:/|$)"),
    re.compile(r"^/(?:404|500)$"),
)

METADATA_MARKERS = (
    "og:image",
    "twitter:image",
    "openGraph",
    "twitter:",
    "generateMetadata",
    "metadata =",
    "metadata:",
)


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: detect_og_targets.py <repo_root>", file=sys.stderr)
        return 1

    repo_root = Path(sys.argv[1]).expanduser().resolve()
    if not repo_root.exists() or not repo_root.is_dir():
        print(f"Repository not found: {repo_root}", file=sys.stderr)
        return 1

    package = read_package_json(repo_root / "package.json")
    framework = detect_framework(repo_root, package)
    routes = collect_routes(repo_root, framework)
    existing_assets = find_existing_assets(repo_root)
    metadata_hints = find_metadata_hints(repo_root)
    workflow = recommend_workflow(framework, routes, existing_assets)
    strategy = recommend_strategy(framework, existing_assets)
    dynamic_strategy = recommend_dynamic_strategy(framework, routes)

    result = {
        "repo_root": str(repo_root),
        "framework": framework["family"],
        "routing_mode": framework["routing_mode"],
        "recommended_workflow": workflow,
        "recommended_strategy": strategy,
        "recommended_dynamic_strategy": dynamic_strategy,
        "route_targets": routes,
        "existing_og_assets": existing_assets,
        "metadata_hint_files": metadata_hints,
        "warnings": build_warnings(framework, routes, existing_assets, metadata_hints),
    }

    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


def read_package_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except Exception:
        return {}


def dependency_names(package_json: dict) -> set[str]:
    names: set[str] = set()
    for key in ("dependencies", "devDependencies", "peerDependencies"):
        section = package_json.get(key) or {}
        if isinstance(section, dict):
            names.update(section.keys())
    return names


def detect_framework(repo_root: Path, package_json: dict) -> dict:
    deps = dependency_names(package_json)

    next_like = "next" in deps or any(
        (repo_root / name).exists()
        for name in ("next.config.js", "next.config.ts", "next.config.mjs", "next.config.cjs")
    )
    astro_like = "astro" in deps or any(
        (repo_root / name).exists()
        for name in ("astro.config.mjs", "astro.config.ts", "astro.config.js")
    )
    remix_like = any(dep in deps for dep in ("@remix-run/react", "@remix-run/dev", "@remix-run/node"))
    vite_like = "vite" in deps or any(
        (repo_root / name).exists()
        for name in ("vite.config.ts", "vite.config.js", "vite.config.mjs", "vite.config.cjs")
    )

    app_roots = existing_dirs(repo_root, "app", "src/app")
    next_app_pages = [p for root in app_roots for p in root.rglob("page.*")]
    next_pages_roots = existing_dirs(repo_root, "pages", "src/pages")

    if next_like and next_app_pages:
        return {"family": "next", "routing_mode": "app-router"}
    if next_like and next_pages_roots:
        return {"family": "next", "routing_mode": "pages-router"}
    if astro_like:
        return {"family": "astro", "routing_mode": "file-routes"}
    if remix_like:
        return {"family": "remix", "routing_mode": "route-modules"}
    if vite_like:
        return {"family": "vite", "routing_mode": "spa-or-file-routes"}
    return {"family": "generic", "routing_mode": "unknown"}


def collect_routes(repo_root: Path, framework: dict) -> list[dict]:
    family = framework["family"]
    routing_mode = framework["routing_mode"]

    if family == "next" and routing_mode == "app-router":
        return collect_next_app_routes(repo_root)
    if family == "next" and routing_mode == "pages-router":
        return collect_next_pages_routes(repo_root)
    if family == "astro":
        return collect_astro_routes(repo_root)
    if family == "remix":
        return collect_remix_routes(repo_root)
    return collect_generic_routes(repo_root)


def collect_next_app_routes(repo_root: Path) -> list[dict]:
    routes: list[dict] = []
    for app_root in existing_dirs(repo_root, "app", "src/app"):
        for page in sorted(app_root.rglob("page.*")):
            if page.suffix not in ROUTE_EXTENSIONS:
                continue
            route = normalize_next_app_route(page.relative_to(app_root))
            dynamic = is_dynamic_route(route)
            routes.append(
                build_route_target(
                    repo_root=repo_root,
                    route=route,
                    source_file=page,
                    suggested_og_path=page.with_name(
                        "opengraph-image.tsx" if dynamic else "opengraph-image.png"
                    ),
                    suggested_twitter_path=page.with_name(
                        "twitter-image.tsx" if dynamic else "twitter-image.png"
                    ),
                )
            )
    return dedupe_routes(routes)


def normalize_next_app_route(relative_path: Path) -> str:
    parts = list(relative_path.parts[:-1])
    route_parts = []
    for part in parts:
        if part.startswith("@"):
            continue
        if part.startswith("(") and part.endswith(")"):
            continue
        route_parts.append(part)
    return normalize_route_parts(route_parts)


def collect_next_pages_routes(repo_root: Path) -> list[dict]:
    routes: list[dict] = []
    public_root = repo_root / "public" / "og"
    for pages_root in existing_dirs(repo_root, "pages", "src/pages"):
        for page in sorted(pages_root.rglob("*")):
            if not page.is_file() or page.suffix not in ROUTE_EXTENSIONS:
                continue
            relative = page.relative_to(pages_root)
            if relative.parts and relative.parts[0] == "api":
                continue
            if page.stem in {"_app", "_document", "_error"}:
                continue
            route = normalize_pages_like_route(relative)
            routes.append(
                build_route_target(
                    repo_root=repo_root,
                    route=route,
                    source_file=page,
                    suggested_og_path=public_root / f"{slug_for_route(route)}.png",
                    suggested_twitter_path=public_root / f"{slug_for_route(route)}.png",
                )
            )
    return dedupe_routes(routes)


def collect_astro_routes(repo_root: Path) -> list[dict]:
    routes: list[dict] = []
    pages_root = repo_root / "src" / "pages"
    public_root = repo_root / "public" / "og"
    if not pages_root.exists():
        return routes
    for page in sorted(pages_root.rglob("*")):
        if not page.is_file() or page.suffix not in ROUTE_EXTENSIONS:
            continue
        route = normalize_pages_like_route(page.relative_to(pages_root))
        routes.append(
            build_route_target(
                repo_root=repo_root,
                route=route,
                source_file=page,
                suggested_og_path=public_root / f"{slug_for_route(route)}.png",
                suggested_twitter_path=public_root / f"{slug_for_route(route)}.png",
            )
        )
    return dedupe_routes(routes)


def collect_remix_routes(repo_root: Path) -> list[dict]:
    routes: list[dict] = []
    routes_root = repo_root / "app" / "routes"
    public_root = repo_root / "public" / "og"
    if not routes_root.exists():
        return routes
    for route_file in sorted(routes_root.rglob("*")):
        if not route_file.is_file() or route_file.suffix not in ROUTE_EXTENSIONS:
            continue
        route = normalize_remix_route(route_file.relative_to(routes_root))
        routes.append(
            build_route_target(
                repo_root=repo_root,
                route=route,
                source_file=route_file,
                suggested_og_path=public_root / f"{slug_for_route(route)}.png",
                suggested_twitter_path=public_root / f"{slug_for_route(route)}.png",
            )
        )
    return dedupe_routes(routes)


def collect_generic_routes(repo_root: Path) -> list[dict]:
    routes: list[dict] = []
    public_root = repo_root / "public" / "og"
    for route_root in existing_dirs(repo_root, "src/pages", "src/routes", "pages", "routes"):
        for route_file in sorted(route_root.rglob("*")):
            if not route_file.is_file() or route_file.suffix not in ROUTE_EXTENSIONS:
                continue
            route = normalize_pages_like_route(route_file.relative_to(route_root))
            routes.append(
                build_route_target(
                    repo_root=repo_root,
                    route=route,
                    source_file=route_file,
                    suggested_og_path=public_root / f"{slug_for_route(route)}.png",
                    suggested_twitter_path=public_root / f"{slug_for_route(route)}.png",
                )
            )
    return dedupe_routes(routes)


def normalize_pages_like_route(relative: Path) -> str:
    parts = list(relative.parts)
    if not parts:
        return "/"

    filename = parts[-1]
    stem = Path(filename).stem
    if stem != "index":
        parts[-1] = stem
    else:
        parts = parts[:-1]

    return normalize_route_parts(parts)


def normalize_remix_route(relative: Path) -> str:
    stem = relative.with_suffix("").as_posix()
    segments = stem.split("/")
    parts: list[str] = []
    for segment in segments:
        for piece in segment.split("."):
            if not piece or piece == "_index":
                continue
            if piece.startswith("_"):
                continue
            parts.append(piece)
    return normalize_route_parts(parts)


def normalize_route_parts(parts: list[str]) -> str:
    cleaned = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        cleaned.append(part)
    if not cleaned:
        return "/"
    return "/" + "/".join(cleaned)


def build_route_target(
    repo_root: Path,
    route: str,
    source_file: Path,
    suggested_og_path: Path,
    suggested_twitter_path: Path,
) -> dict:
    dynamic = is_dynamic_route(route)
    include_by_default = should_include_by_default(route, dynamic)
    return {
        "route": route,
        "slug": slug_for_route(route),
        "source_file": os.path.relpath(source_file, repo_root),
        "dynamic": dynamic,
        "include_by_default": include_by_default,
        "suggested_og_path": os.path.relpath(suggested_og_path, repo_root),
        "suggested_twitter_path": os.path.relpath(suggested_twitter_path, repo_root),
    }


def is_dynamic_route(route: str) -> bool:
    return bool(re.search(r"\[[^/]+\]|\$[A-Za-z_]|:\w+|\*", route))


def should_include_by_default(route: str, dynamic: bool) -> bool:
    if dynamic:
        return False
    for pattern in EXCLUDE_ROUTE_PATTERNS:
        if pattern.search(route):
            return False
    return True


def slug_for_route(route: str) -> str:
    if route == "/":
        return "home"
    cleaned = route.strip("/")
    cleaned = re.sub(r"[^A-Za-z0-9/._-]+", "-", cleaned)
    cleaned = cleaned.replace("/", "-")
    cleaned = re.sub(r"-{2,}", "-", cleaned).strip("-")
    return cleaned or "home"


def find_existing_assets(repo_root: Path) -> list[str]:
    matches: list[str] = []
    for file_path in iter_files(repo_root):
        name = file_path.name.lower()
        rel = os.path.relpath(file_path, repo_root)
        if (
            name.startswith("opengraph-image.")
            or name.startswith("twitter-image.")
            or rel.startswith(os.path.join("public", "og-image."))
            or rel.startswith(os.path.join("public", "twitter-image."))
            or rel.startswith(os.path.join("public", "og") + os.sep)
            or rel.startswith(os.path.join("public", "opengraph") + os.sep)
        ):
            matches.append(rel)
    return sorted(set(matches))


def find_metadata_hints(repo_root: Path) -> list[str]:
    matches: list[str] = []
    for file_path in iter_files(repo_root):
        if file_path.suffix not in TEXT_EXTENSIONS:
            continue
        try:
            text = file_path.read_text(errors="ignore")
        except Exception:
            continue
        if any(marker in text for marker in METADATA_MARKERS):
            matches.append(os.path.relpath(file_path, repo_root))
    return sorted(set(matches))


def recommend_strategy(framework: dict, existing_assets: list[str]) -> str:
    family = framework["family"]
    routing_mode = framework["routing_mode"]
    if any("opengraph-image." in path for path in existing_assets):
        return "route-local-static-assets"
    if any(path.startswith("public/og-image.") for path in existing_assets):
        return "shared-public-og-image"
    if any(path.startswith("public/og/") for path in existing_assets):
        return "public-og-directory"
    if family == "next" and routing_mode == "app-router":
        return "route-local-static-assets"
    return "public-og-directory"


def recommend_workflow(framework: dict, routes: list[dict], existing_assets: list[str]) -> str | None:
    if not routes:
        return None

    has_dynamic = any(route["dynamic"] for route in routes)
    has_static = any(not route["dynamic"] and route["include_by_default"] for route in routes)
    family = framework["family"]
    routing_mode = framework["routing_mode"]

    if family == "next" and routing_mode == "app-router":
        if has_dynamic and has_static:
            return "review-hub-static-imports-plus-dynamic-opengraph-routes"
        if has_dynamic:
            return "review-hub-plus-dynamic-opengraph-routes"
        return "review-hub-before-wiring"

    if any(path.startswith("public/og-image.") or path.startswith("public/og/") for path in existing_assets):
        return "review-hub-before-extending-existing-static-system"

    return "review-hub-before-wiring"


def recommend_dynamic_strategy(framework: dict, routes: list[dict]) -> str | None:
    dynamic_routes = [route for route in routes if route["dynamic"]]
    if not dynamic_routes:
        return None

    family = framework["family"]
    routing_mode = framework["routing_mode"]
    if family == "next" and routing_mode == "app-router":
        return "route-local-opengraph-image-tsx"
    if family == "next":
        return "shared-metadata-helper-or-fallback-image"
    return "metadata-helper-or-build-script"


def build_warnings(
    framework: dict,
    routes: list[dict],
    existing_assets: list[str],
    metadata_hints: list[str],
) -> list[str]:
    warnings: list[str] = []
    if not routes:
        warnings.append("No route candidates were detected. Inspect the repository manually.")
    if routes and all(not route["include_by_default"] for route in routes):
        warnings.append("Every detected route was excluded by default. Review dynamic or internal routes manually.")
    if any(not route["dynamic"] and route["include_by_default"] for route in routes):
        warnings.append(
            "Stable public routes were detected. Prefer a review hub with staged previews and Import buttons before rewiring metadata."
        )
    if (
        framework["family"] == "next"
        and framework["routing_mode"] == "app-router"
        and any(route["dynamic"] for route in routes)
    ):
        warnings.append(
            "Dynamic Next App Router segments were detected. Prefer route-local opengraph-image.tsx files over one static PNG per slug, and keep dynamic route application separate from static Import / Import All actions."
        )
    if existing_assets and not metadata_hints:
        warnings.append("Existing OG assets were found, but no metadata hint files were detected. The wiring may be indirect.")
    if metadata_hints and not existing_assets:
        warnings.append("Metadata hints exist without obvious OG asset files. The repo may point to remote images or generated paths.")
    return warnings


def dedupe_routes(routes: list[dict]) -> list[dict]:
    deduped: dict[str, dict] = {}
    for route in routes:
        key = route["route"]
        existing = deduped.get(key)
        if existing is None or route["source_file"] < existing["source_file"]:
            deduped[key] = route
    return [deduped[key] for key in sorted(deduped.keys())]


def existing_dirs(repo_root: Path, *relative_paths: str) -> list[Path]:
    result: list[Path] = []
    for relative in relative_paths:
        path = repo_root / relative
        if path.exists() and path.is_dir():
            result.append(path)
    return result


def iter_files(repo_root: Path):
    for dirpath, dirnames, filenames in os.walk(repo_root):
        dirnames[:] = [name for name in dirnames if name not in SKIP_DIRS]
        for filename in filenames:
            yield Path(dirpath) / filename


if __name__ == "__main__":
    raise SystemExit(main())
