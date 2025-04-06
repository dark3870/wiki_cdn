function submitForm() {
	const query = $('#wikiSearchWord').val();
	if(query.trim() == "") {
		alert("Word Encyclopedia");
		return false;
	}
	$("#submitBtn").prop("disabled", true).text("loading...");

	$.ajax({
		url: '/en/wikiSearch.html',
		type: 'GET',
		data: { wikiSearchWord: query },
		dataType: 'json',
		success: function(response){
			if(response.jsonResult) {
				saveWordToCookie(query);
				location.href = '/en/wiki.html?word=' + response.jsonResultMessage;
			} else {
				alert("An error occurred during the search. Please try again.");
				$("#submitBtn").prop("disabled", false).text("Search");
			}
		},
		error: function(xhr, status, error){
			console.error("AJAX error: ", status, error);
			alert("An error occurred during the search. Please try again.");
			$("#submitBtn").prop("disabled", false).text("Search");
		}
	});
}

function evaluateContent(seq, feedback) {
	document.querySelectorAll('.eval-btn').forEach(btn => {
		btn.disabled = true;
		btn.style.cursor = "default";
		btn.style.opacity = "0.5";
	});

	let selectedBtnClass = feedback === 'good' ? '.good-btn' : '.bad-btn';
	let btn = document.querySelector(selectedBtnClass);
	btn.style.opacity = "1";

	$.ajax({
		url: '/en/wikiEval.html',
		method: 'POST',
		data: {type: feedback, seq: seq},
		success: function(response){
			alert(feedback === 'good' ? 'Thank you for your feedback! Your positive review will be reflected.' : 'Thank you for your feedback! We will strive to improve.');
		}
	});
}

$(document).ready(function () {
	document.querySelector('.search-input').addEventListener('keypress', function(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			submitForm();
		}
	});

	let debounceTimer;
	$(".search-input").on("keyup", function(){
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const keyword = $(this).val();

			if (keyword.length < 1) {
				$('#autoCompleteResults').hide();
				return;
			}

			$.ajax({
				url: "/en/wikiAuto.html",
				type: "GET",
				data: {keyword: keyword},
				success: function (data) {
					let autoCompleteResults = $('#autoCompleteResults');
					autoCompleteResults.empty();

					if (data.length === 0) {
						autoCompleteResults.hide();
						return;
					}

					data.forEach(item => {
						const resultDiv = $('<div>').text(item).click(function () {
							$('.search-input').val($(this).text());
							autoCompleteResults.hide();
						});
						autoCompleteResults.append(resultDiv);
					});

					autoCompleteResults.show();
				},
				error: function (xhr, status, error) {
					console.error("loading error:", error);
				}
			});
		}, 300);
	});


	// Ajax 호출로 데이터 가져오기
	// $.ajax({
	// 	url: "/en/wikiList.html", // Spring MVC 컨트롤러 연결 URL
	// 	type: "GET",
	// 	dataType: "json",
	// 	success: function(result){
	// 		let html = "";
	// 		result.forEach(function(item){
	// 			html += `<li><a href="#" onclick="saveWordToCookie('${item.word}'); location.href='/en/wiki.html?word=${encodeURIComponent(item.word)}'; return false;">${item.word}</a></li>`;
	// 		});
	// 		$("#wikiList").html(html);
	// 	},
	// 	error: function(err){
	// 		console.error("에러 발생: ", err);
	// 	}
	// });
});

function setCookie(name, value, days) {
	const d = new Date();
	d.setTime(d.getTime() + (days*24*60*60*1000));
	document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/';
}

function getCookie(name) {
	const nameEQ = name + '=';
	const ca = document.cookie.split(';');
	for(let i=0; i < ca.length; i++) {
		let c = ca[i].trim();
		if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
	}
	return null;
}

function saveWordToCookie(word) {
	let history = getCookie('wordHistoryEn');
	let wordHistory = history ? JSON.parse(history) : [];

	wordHistory = wordHistory.filter(w => w !== word);
	wordHistory.push(word);

	if(wordHistory.length > 10) wordHistory.shift();
	setCookie('wordHistoryEn', JSON.stringify(wordHistory), 7);
}

function loadHistory() {
	const historyElement = document.getElementById('wikiList');
	const history = getCookie('wordHistoryEn');
	//historyElement.innerHTML = '';
	if(history) {
		const words = JSON.parse(history);
		words.forEach(word => {
			// 이미 존재하는 항목이 있으면 DOM에서 삭제
			Array.from(historyElement.querySelectorAll('a')).forEach(el => {
				if (el.textContent === word) {
					el.parentNode.remove(); // 기존 li 요소 전체 삭제
				}
			});
			
			const li = document.createElement('li');
			const link = document.createElement('a');
			link.textContent = word;
			link.href = '/en/wiki.html?word=' + encodeURIComponent(word);
			link.onclick = function(event) {
				event.preventDefault();

				const originUrl = '/en/wiki.html?word=' + encodeURIComponent(word);
				const url = '/en/wikiCount.html?word=' + encodeURIComponent(word);

				fetch(url, {
					method: 'HEAD'
				}).then(response => {
					if(response.status === 200) {
						saveWordToCookie(word);
						window.location.href = originUrl;
					} else if(response.status === 404) {
						alert('No information available.');
					} else {
						alert('An error occurred.');
					}
				}).catch(error => {
					console.error('Error fetching URL:', error);
					alert('An error occurred.');
				});
			};
			li.appendChild(link);
			historyElement.insertBefore(li, historyElement.firstChild);
		});
	} else {
		//historyElement.innerHTML = '<li>There are no recently viewed words.</li>';
	}
}

document.addEventListener('DOMContentLoaded', () => {

	loadHistory();

	const wordLinks = document.querySelectorAll('.word-list a');
	wordLinks.forEach(link => {
		link.addEventListener('click', function(e) {
			const word = this.textContent.trim();
			saveWordToCookie(word);
			loadHistory();
		});
	});
});

window.onscroll = function() {toggleScrollBtn()};
function toggleScrollBtn() {
	const btn = document.getElementById("scrollToTopBtn");
	btn.style.display = window.scrollY > 300 ? "block" : "none";
}

document.addEventListener('DOMContentLoaded', function() {
	const scrollBtn = document.getElementById("scrollToTopBtn");
	if (scrollBtn) {
		scrollBtn.onclick = function() {
			if ('scrollBehavior' in document.documentElement.style) {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			} else {
				window.scrollTo(0, 0);
			}
		};
	} else {
		console.warn("scrollToTopBtn Element not found.");
	}
});

document.addEventListener('DOMContentLoaded', function () {
	try {
	document.getElementById('btnCopyLink').addEventListener('click', function() {
		copyCurrentUrl();
	});
	} catch (e) {
	}
});

function copyCurrentUrl() {
	const url = window.location.href; // Get current URL

	navigator.clipboard.writeText(url).then(() => {
		alert('Link copied successfully!');
	}).catch(err => {
		console.error('Failed to copy link: ', err);
		alert('Failed to copy link.');
	});
}