let currentPage = 2;
const pageSize = 20;

// 더보기 버튼 클릭 시 게시글 추가 로딩
$(document).ready(function() {
	$('#load-more-btn').on('click', function() {
		$.ajax({
			url: '/posts.html',
			type: 'GET',
			data: { page: currentPage++, size: pageSize },
			dataType: 'json',
			success: function(posts) {
				if(posts.length === 0) {
					alert("더 이상 게시물이 없습니다.");
					$('#load-more-btn').hide();
				} else {
					posts.forEach(function(post) {
						const html = `
								  <div class="post" onclick="location.href='/view/${post.seq}'" style="cursor: pointer; margin-bottom: 50px;">
									<h2>${post.title}</h2>
									<small>작성일: ${formatDate(post.regDateStr)}</small>
									<p>${truncateContent(post.contents)}</p>
								  </div>
								`;
						$('.container').append(html);
					});

				}
			},
			error: function() {
				alert("게시물을 불러오는 데에 오류가 발생했습니다.");
			}
		});
	});
});

// 날짜 형식 간략화 함수
function formatDate(isoDateString) {
	const dateObj = new Date(isoDateString);
	const year = dateObj.getFullYear();
	const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
	const day = ('0' + dateObj.getDate()).slice(-2);
	return `${year}-${month}-${day}`;
}

// HTML 이스케이프 함수
function escapeHTML(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

// 내용 길이 제한 함수 (100자 제한 시...)
function truncateContent(content) {
	// 내용이 없는 경우 처리
	if (!content) return '';

	// 먼저 내용을 자르고
	const truncated = content.length > 100 ? content.substring(0, 100) + "..." : content;

	// 이스케이프 처리하여 반환
	return escapeHTML(truncated);
}