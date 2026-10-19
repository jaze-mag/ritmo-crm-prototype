#!/usr/bin/env python3
"""Publish approved V2 runtime files without changing the V1/V2 branches."""
import argparse
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    'index.html', 'src/styles.css', 'src/customers.js', 'src/session.js', 'src/main.js',
    'assets/ritmo-workstation.png',
    'assets/references/maya-precall-approved.png',
    'assets/references/daniel-precall-approved.png',
    'assets/references/renee-precall-approved.png',
    'assets/fonts/inter-latin-400-normal.woff2',
    'assets/fonts/inter-latin-600-normal.woff2',
    'assets/fonts/montserrat-latin-700-normal.woff2',
    'assets/fonts/inter-LICENSE', 'assets/fonts/montserrat-LICENSE',
]


def git(*args, data=None, env=None):
    return subprocess.check_output(['git', *args], cwd=ROOT, input=data, env=env).decode().strip()


def ref(name):
    result = subprocess.run(['git', 'rev-parse', '--verify', name], cwd=ROOT, capture_output=True, text=True)
    return result.stdout.strip() if result.returncode == 0 else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--push', action='store_true', help='Push the prepared gh-pages commit to GitHub')
    args = parser.parse_args()
    if git('branch', '--show-current') == 'gh-pages':
        parser.error('Run from the deployment/github-pages checkout, not gh-pages.')
    # Existing HTTPS Git authentication is used; no tokens are stored in this script.
    git('fetch', 'origin', '+refs/heads/*:refs/remotes/origin/*')
    source = git('rev-parse', 'refs/remotes/origin/prototype/ritmo-crm-v2^{commit}')
    remote = ref('refs/remotes/origin/gh-pages')
    local = ref('refs/heads/gh-pages')
    parent = remote or local
    with tempfile.TemporaryDirectory(prefix='ritmo-pages-') as tmp:
        env = {**os.environ, 'GIT_INDEX_FILE': str(Path(tmp) / 'index')}
        git('read-tree', '--empty', env=env)
        for path in FILES:
            blob = git('rev-parse', f'{source}:{path}')
            git('update-index', '--add', '--cacheinfo', f'100644,{blob},{path}', env=env)
        empty = git('hash-object', '-w', '--stdin', data=b'')
        git('update-index', '--add', '--cacheinfo', f'100644,{empty},.nojekyll', env=env)
        tree = git('write-tree', env=env)
    # Do not create needless commits when the deployed files already match V2.
    if parent and git('rev-parse', f'{parent}^{{tree}}') == tree:
        commit = parent
    else:
        message = f'Publish Ritmo CRM V2\n\nSource: prototype/ritmo-crm-v2 @ {source}\n'
        commit = git('commit-tree', tree, *(['-p', parent] if parent else []), data=message.encode())
    git('update-ref', 'refs/heads/gh-pages', commit, local or '0' * 40)
    print(f'Source V2: {source}\nPublishing commit: {commit}')
    print('Runtime-only branch prepared; working files and V1/V2 refs are unchanged.')
    if args.push:
        # Ordinary push deliberately rejects concurrent/non-fast-forward updates.
        subprocess.check_call(['git', 'push', 'origin', 'gh-pages:gh-pages'], cwd=ROOT)
        print('Branch pushed. GitHub Pages must be enabled for gh-pages / (root).')
    else:
        print('Not pushed. Review/test gh-pages, then rerun with --push to publish.')


if __name__ == '__main__':
    main()
