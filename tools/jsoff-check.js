/* JS 비활성 회귀 검사기.
   `html.js` 게이팅이 깨지면 스크립트 없는 환경에서 본문이 백지가 되거나
   모바일에서 내비에 도달할 수 없게 됩니다. 그 회귀를 잡습니다.

   사용: 브라우저에서 페이지를 연 뒤 __jsoff()

   원리: html.js 클래스를 잠시 떼서 "JS 미실행" 상태를 재현합니다.
   기본값이 보임이어야 하므로 전이(transition)가 없고 값이 즉시 확정됩니다.
   판정은 반드시 클래스를 복구하기 **전에** 계산합니다. */
window.__jsoff = function () {
  const de = document.documentElement;
  const had = de.classList.contains('js');
  if (!had) return { 오류: 'html.js가 없습니다 — 스크립트가 실행되지 않았거나 게이팅이 제거됨' };

  const rev = [...document.querySelectorAll('.reveal')];
  const onBefore = rev.filter(el => el.classList.contains('on')).length;
  const nav = document.getElementById('navLinks');
  const tog = document.getElementById('navToggle');

  // JS 미실행 상태 재현
  de.classList.remove('js');
  rev.forEach(el => el.classList.remove('on'));
  void de.offsetHeight;

  const hidden = rev.filter(el => parseFloat(getComputedStyle(el).opacity) < 0.9);
  const navD = nav ? getComputedStyle(nav).display : null;
  const togD = tog ? getComputedStyle(tog).display : null;
  const mobile = de.clientWidth <= 820;

  // 판정 — 복구 전에 계산
  const fail = [];
  if (hidden.length) fail.push(`본문 ${hidden.length}/${rev.length}개가 투명 (기본값이 숨김으로 되돌아감)`);
  if (mobile && nav && navD === 'none') fail.push('모바일에서 내비 링크에 도달 불가 (nav-links display:none)');
  if (mobile && tog && togD !== 'none') fail.push('JS 없이 동작하지 않는 토글 버튼이 노출됨');

  // 복구
  de.classList.add('js');
  rev.forEach(el => el.classList.add('on'));
  void de.offsetHeight;

  return {
    페이지: location.pathname,
    뷰포트: de.clientWidth + (mobile ? ' (모바일 폭)' : ' (데스크톱 폭)'),
    "reveal 총": rev.length,
    "JS-off 시 투명": hidden.length,
    "navLinks display": navD,
    "navToggle display": togD,
    복구됨: de.classList.contains('js') && rev.filter(el => el.classList.contains('on')).length === rev.length,
    판정: fail.length ? '실패' : '통과',
    실패사유: fail
  };
};
'jsoff checker loaded — __jsoff()';
