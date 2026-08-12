"""HTML 유효성 검사기 (자체 구현).

W3C validator를 쓸 수 없는 환경이라 직접 만들었습니다.
사용:  python tools/html-check.py [디렉터리] [출력파일]

이전 버전은 인용부호 **안쪽**의 `=`(예: content="width=device-width")를
인용 없는 속성값으로 잘못 잡는 오탐이 있었습니다. 정규식으로 태그 전체를
훑는 대신 속성을 하나씩 토큰화해서 판정하도록 고쳤습니다.

픽스처(tests/a11y-fixture.html)의 data-expect-html 속성으로 탐지율을 확인합니다.
"""
import re
import sys
import io
from pathlib import Path

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'source', 'track', 'wbr'}


def strip_noise(t):
    """주석·script·style 내용을 제거 (태그 균형 계산에서 제외)"""
    t = re.sub(r'<!--.*?-->', '', t, flags=re.S)
    t = re.sub(r'<(script|style)\b[^>]*>.*?</\1>', '', t, flags=re.S)
    return t


def iter_tags(t):
    """여는 태그 문자열을 순회. 문자열 리터럴을 존중해 > 를 찾는다."""
    i = 0
    n = len(t)
    while i < n:
        lt = t.find('<', i)
        if lt < 0:
            return
        if not re.match(r'<[a-zA-Z]', t[lt:lt + 2]):
            i = lt + 1
            continue
        j = lt + 1
        q = None
        while j < n:
            c = t[j]
            if q:
                if c == q:
                    q = None
            elif c in '"\'':
                q = c
            elif c == '>':
                break
            j += 1
        yield lt, t[lt:j + 1]
        i = j + 1


def parse_attrs(tagstr):
    """여는 태그에서 (이름, 원본값토큰, 인용여부) 목록을 뽑는다."""
    m = re.match(r'<([a-zA-Z][a-zA-Z0-9]*)', tagstr)
    if not m:
        return None, []
    tag = m.group(1).lower()
    s = tagstr[m.end():-1]          # 태그명 뒤 ~ '>' 전
    out = []
    i, n = 0, len(s)
    while i < n:
        while i < n and s[i] in ' \t\r\n/':
            i += 1
        if i >= n:
            break
        nm = re.match(r'[^\s=/>]+', s[i:])
        if not nm:
            i += 1
            continue
        name = nm.group(0)
        i += nm.end()
        while i < n and s[i] in ' \t\r\n':
            i += 1
        if i < n and s[i] == '=':
            i += 1
            while i < n and s[i] in ' \t\r\n':
                i += 1
            if i < n and s[i] in '"\'':
                q = s[i]
                end = s.find(q, i + 1)
                if end < 0:
                    out.append((name, s[i:], 'unterminated'))
                    break
                out.append((name, s[i + 1:end], 'quoted'))
                i = end + 1
            else:
                vm = re.match(r'[^\s>]*', s[i:])
                out.append((name, vm.group(0), 'unquoted'))
                i += vm.end()
        else:
            out.append((name, None, 'bare'))
    return tag, out


def check(path):
    t = io.open(path, encoding='utf-8').read()
    issues = []

    if not t.lstrip().lower().startswith('<!doctype html>'):
        issues.append(('doctype', 'DOCTYPE 누락 또는 부정확'))
    head = t[:400]
    if 'lang=' not in head:
        issues.append(('html-lang', 'html lang 누락'))
    if '<meta charset=' not in head:
        issues.append(('charset', 'charset이 앞 400B에 없음'))
    if t.count('<title>') != 1:
        issues.append(('title', f'title {t.count("<title>")}개'))
    if t.count('<h1') != 1:
        issues.append(('h1-count', f'h1 {t.count("<h1")}개'))

    clean = strip_noise(t)

    opens, closes = {}, {}
    for _, tagstr in iter_tags(clean):
        tag, attrs = parse_attrs(tagstr)
        if not tag:
            continue
        if tag in VOID or tagstr.rstrip().endswith('/>'):
            continue
        opens[tag] = opens.get(tag, 0) + 1
    for m in re.finditer(r'</([a-zA-Z][a-zA-Z0-9]*)\s*>', clean):
        tg = m.group(1).lower()
        closes[tg] = closes.get(tg, 0) + 1
    for tag in set(list(opens) + list(closes)):
        if opens.get(tag, 0) != closes.get(tag, 0):
            issues.append(('tag-balance', f'<{tag}> 열림 {opens.get(tag,0)} / 닫힘 {closes.get(tag,0)}'))

    # 속성 검사 (script/style 안은 제외하지 않음 — 속성 자체는 유효해야 함)
    for _, tagstr in iter_tags(strip_noise(t)):
        tag, attrs = parse_attrs(tagstr)
        if not tag:
            continue
        seen = set()
        for name, val, kind in attrs:
            low = name.lower()
            if low in seen:
                issues.append(('duplicate-attr', f'<{tag}> 중복 속성 {name}'))
            seen.add(low)
            if kind == 'unquoted' and val != '':
                issues.append(('unquoted-attr', f'<{tag} {name}={val}> 인용부호 없음'))
            if kind == 'unterminated':
                issues.append(('unterminated-attr', f'<{tag} {name}> 인용부호가 닫히지 않음'))

    ids = re.findall(r'\sid="([^"]+)"', t)
    for i in {x for x in ids if ids.count(x) > 1}:
        issues.append(('duplicate-id', f'id="{i}" ×{ids.count(i)}'))

    for v in VOID:
        if f'</{v}>' in t:
            issues.append(('void-close', f'</{v}> 사용 (void 태그)'))

    return issues


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    outp = sys.argv[2] if len(sys.argv) > 2 else None
    lines = []
    total = 0
    for p in sorted(root.glob('*.html')) + sorted(root.glob('tests/*.html')):
        issues = check(p)
        total += len(issues)
        lines.append(f'{p.as_posix()}: {"통과" if not issues else str(len(issues)) + "건"}')
        for rule, detail in issues:
            lines.append(f'    [{rule}] {detail}')
    lines.append(f'합계: {total}건')
    txt = '\n'.join(lines)
    if outp:
        io.open(outp, 'w', encoding='utf-8').write(txt)
    print(f'총 {total}건' + (f' (상세 -> {outp})' if outp else '\n' + txt))


if __name__ == '__main__':
    main()
