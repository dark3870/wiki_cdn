document.addEventListener('DOMContentLoaded', function() {
	var links = document.querySelectorAll('.article-content a');
	links.forEach(function(link) {
		link.setAttribute('target', '_blank'); // 새 탭으로 열기
		link.setAttribute('rel', 'noopener noreferrer'); // 보안 관련 속성 추가 권장
	});
});
