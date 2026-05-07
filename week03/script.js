/* ========================================
   전역 상태 (데이터)
   ======================================== */

/**
 * 아기 사자 멤버 데이터 배열
 * 각 멤버 객체 구조:
 * {
 *   name: "이름",
 *   part: "Frontend | Backend | Design",
 *   techs: ["기술1", "기술2", "기술3"],
 *   intro: "한 줄 소개",
 *   bio: "자기소개 전문",
 *   email: "이메일",
 *   phone: "전화번호",
 *   website: "웹사이트 URL",
 *   comment: "한 마디"
 * }
 */
let members = [];

/**
 * 폼 창 열려있는 상태
 */
let isFormOpen = false;

/* ========================================
   DOM 선택자 (계속 조회하므로 변수로 관리)
   ======================================== */

const selectors = {
    // 컨트롤 영역
    addBtn: document.getElementById('addBtn'),
    deleteBtn: document.getElementById('deleteBtn'),
    memberCount: document.getElementById('memberCount'),

    // 폼 영역
    formSection: document.getElementById('formSection'),
    addForm: document.getElementById('addForm'),
    cancelBtn: document.getElementById('cancelBtn'),

    // 폼 입력 요소들
    inputName: document.getElementById('inputName'),
    inputPart: document.getElementById('inputPart'),
    inputTechs: document.getElementById('inputTechs'),
    inputIntro: document.getElementById('inputIntro'),
    inputBio: document.getElementById('inputBio'),
    inputEmail: document.getElementById('inputEmail'),
    inputPhone: document.getElementById('inputPhone'),
    inputWebsite: document.getElementById('inputWebsite'),
    inputComment: document.getElementById('inputComment'),

    // 카드 영역
    cardsGrid: document.getElementById('cardsGrid'),
    detailsList: document.getElementById('detailsList')
};

/* ========================================
   필수 입력 필드 목록
   ======================================== */

const requiredFields = [
    'inputName',
    'inputPart',
    'inputTechs',
    'inputIntro',
    'inputBio',
    'inputEmail',
    'inputPhone'
];

/* ========================================
   1단계: 초기화 함수들
   ======================================== */

/**
 * 페이지 로드 시 초기화
 * - 기존 HTML 카드에서 데이터를 읽어 배열로 변환
 * - 총 인원 수 업데이트
 */
function initializeApp() {
    initializeMembersFromHTML();
    updateMemberCount();
    attachEventListeners();
}

/**
 * HTML의 요약 카드 데이터를 읽어 members 배열로 변환
 */
function initializeMembersFromHTML() {
    const cards = document.querySelectorAll('.profile-summary-card');

    cards.forEach(card => {
        const name = card.getAttribute('data-name');
        const part = card.getAttribute('data-part');
        const intro = card.getAttribute('data-intro');

        // 대응하는 상세 카드 찾기
        const allDetailCards = document.querySelectorAll('.details-card');
        let detailCardData = null;

        for (let dc of allDetailCards) {
            const detailName = dc.querySelector('.details-card-name')?.textContent.trim();
            if (detailName === name) {
                detailCardData = extractDetailsFromCard(dc);
                break;
            }
        }

        if (detailCardData) {
            members.push({
                name,
                part,
                techs: detailCardData.techs,
                intro,
                bio: detailCardData.bio,
                email: detailCardData.email,
                phone: detailCardData.phone,
                website: detailCardData.website || '',
                comment: detailCardData.comment || ''
            });
        }
    });
}

/**
 * 상세 카드 DOM에서 데이터 추출
 */
function extractDetailsFromCard(detailCard) {
    // 자기소개 텍스트 추출
    const bioElement = detailCard.querySelector('.detail-description');
    const bio = bioElement ? bioElement.textContent.trim() : '';

    // 기술 리스트 추출
    const techItems = detailCard.querySelectorAll('.detail-tech-list li');
    const techs = Array.from(techItems).map(item => item.textContent.trim());

    // 연락처 정보 추출
    const contactLinks = detailCard.querySelectorAll('.detail-contact-list a');
    const contactTexts = detailCard.querySelectorAll('.detail-contact-list dd');

    let email = '';
    let phone = '';
    let website = '';

    detailCard.querySelectorAll('.detail-contact-list dt').forEach((dt, index) => {
        const dtText = dt.textContent.trim();
        const ddElement = dt.nextElementSibling;

        if (dtText === '이메일') {
            const link = ddElement.querySelector('a');
            email = link ? link.textContent.trim() : '';
        } else if (dtText === '휴대전화') {
            email = ddElement ? ddElement.textContent.trim() : '';
        } else if (dtText === '웹사이트') {
            const link = ddElement.querySelector('a');
            website = link ? link.getAttribute('href') : '';
        }
    });

    // 전화번호 다시 정확히 찾기
    const phoneDt = Array.from(detailCard.querySelectorAll('.detail-contact-list dt'))
        .find(dt => dt.textContent.trim() === '휴대전화');
    if (phoneDt) {
        phone = phoneDt.nextElementSibling.textContent.trim();
    }

    // 이메일 다시 정확히 찾기
    const emailDt = Array.from(detailCard.querySelectorAll('.detail-contact-list dt'))
        .find(dt => dt.textContent.trim() === '이메일');
    if (emailDt) {
        const emailDD = emailDt.nextElementSibling;
        const link = emailDD.querySelector('a');
        email = link ? link.textContent.trim() : '';
    }

    // 한마디 추출 (마지막 description)
    const allDescriptions = detailCard.querySelectorAll('.detail-description');
    const comment = allDescriptions.length > 1 ?
        allDescriptions[allDescriptions.length - 1].textContent.trim() : '';

    return { techs, bio, email, phone, website, comment };
}

/**
 * 이벤트 리스너 설정
 */
function attachEventListeners() {
    selectors.addBtn.addEventListener('click', toggleFormVisibility);
    selectors.cancelBtn.addEventListener('click', toggleFormVisibility);
    selectors.deleteBtn.addEventListener('click', handleDelete);
    selectors.addForm.addEventListener('submit', handleFormSubmit);
}

/* ========================================
   2단계: 폼 관련 함수들
   ======================================== */

/**
 * 입력 폼 토글 (열기/닫기)
 */
function toggleFormVisibility() {
    isFormOpen = !isFormOpen;

    if (isFormOpen) {
        selectors.formSection.classList.remove('form-section--hidden');
        selectors.inputName.focus();
    } else {
        selectors.formSection.classList.add('form-section--hidden');
        resetForm();
    }
}

/**
 * 입력 폼 초기화
 */
function resetForm() {
    selectors.addForm.reset();
    clearAllErrors();
}

/**
 * 모든 에러 메시지 제거
 */
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(element => {
        element.classList.remove('show');
        element.textContent = '';
    });

    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea')
        .forEach(element => {
            element.classList.remove('input-error');
        });
}

/**
 * 입력값 유효성 검사
 * @returns {boolean} 유효하면 true
 */
function validateForm() {
    clearAllErrors();
    let isValid = true;

    // 필수 필드 검사
    requiredFields.forEach(fieldId => {
        const field = selectors[fieldId];
        if (!field.value.trim()) {
            isValid = false;
            showFieldError(fieldId, '필수 입력 항목입니다.');
        }
    });

    // 이메일 형식 검사
    if (selectors.inputEmail.value.trim() && !isValidEmail(selectors.inputEmail.value.trim())) {
        isValid = false;
        showFieldError('inputEmail', '유효한 이메일 주소를 입력하세요.');
    }

    return isValid;
}

/**
 * 이메일 형식 검증
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 필드 에러 메시지 표시
 */
function showFieldError(fieldId, message) {
    const field = selectors[fieldId];
    const errorElement = field.parentElement.querySelector('.error-message');

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        field.classList.add('input-error');
    }
}

/**
 * 폼 제출 처리
 * @param {Event} event
 */
function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    // 기술 목록을 배열로 변환 (쉼표 기준 분리)
    const techsString = selectors.inputTechs.value.trim();
    const techs = techsString.split(',').map(tech => tech.trim());

    // 새 멤버 데이터 생성
    const newMember = {
        name: selectors.inputName.value.trim(),
        part: selectors.inputPart.value,
        techs: techs,
        intro: selectors.inputIntro.value.trim(),
        bio: selectors.inputBio.value.trim(),
        email: selectors.inputEmail.value.trim(),
        phone: selectors.inputPhone.value.trim(),
        website: selectors.inputWebsite.value.trim(),
        comment: selectors.inputComment.value.trim()
    };

    // 멤버 추가
    addMember(newMember);

    // UI 리셋
    resetForm();
    toggleFormVisibility(); // 폼 닫기
}

/* ========================================
   3단계: 데이터 조작 함수들
   ======================================== */

/**
 * 새 멤버 추가
 * @param {Object} member
 */
function addMember(member) {
    members.push(member);
    renderCards();
    renderDetails();
    updateMemberCount();
}

/**
 * 마지막 멤버 삭제
 */
function handleDelete() {
    if (members.length === 0) {
        alert('삭제할 멤버가 없습니다.');
        return;
    }

    members.pop();
    renderCards();
    renderDetails();
    updateMemberCount();
}

/**
 * 총 인원 수 업데이트
 */
function updateMemberCount() {
    selectors.memberCount.textContent = members.length;
}

/* ========================================
   4단계: 렌더링 (화면 업데이트) 함수들
   ======================================== */

/**
 * 요약 카드 목록 렌더링
 */
function renderCards() {
    // 첫 번째(내 카드) 제외한 나머지 카드 모두 제거
    const allCards = document.querySelectorAll('.profile-summary-card');
    for (let i = allCards.length - 1; i > 0; i--) {
        allCards[i].remove();
    }

    // 두 번째 멤버부터 카드 추가 (members[1]부터 시작)
    for (let i = 1; i < members.length; i++) {
        const card = createSummaryCard(members[i]);
        selectors.cardsGrid.appendChild(card);
    }
}

/**
 * 요약 카드 DOM 요소 생성
 * @param {Object} member
 * @returns {HTMLElement}
 */
function createSummaryCard(member) {
    const article = document.createElement('article');
    article.className = 'profile-summary-card';
    article.setAttribute('data-name', member.name);
    article.setAttribute('data-part', member.part);
    article.setAttribute('data-intro', member.intro);

    // 첫 번째 기술을 배지로 사용
    const badgeTech = member.techs[0] || '기술 없음';

    article.innerHTML = `
        <div class="profile-image-container">
            <img src="logo_like_lion.png" alt="${member.name} 프로필" class="profile-summary-image">
            <span class="profile-badge">${badgeTech}</span>
        </div>
        <div class="profile-summary-content">
            <h2 class="profile-summary-name">${member.name}</h2>
            <p class="profile-summary-part">${member.part}</p>
            <p class="profile-summary-intro">${member.intro}</p>
        </div>
    `;

    return article;
}

/**
 * 상세 정보 카드 목록 렌더링
 */
function renderDetails() {
    // 첫 번째 멤버들 (초기 9개)을 제외한 추가된 상세 카드 지우기
    const allDetailCards = document.querySelectorAll('.details-card');
    
    // members 배열의 크기에 맞춰서 상세 카드를 제거
    // 초기에는 9개(members[0]~members[8])가 있음
    // 10번째부터는 동적으로 추가된 것들이므로 지워야 함
    for (let i = allDetailCards.length - 1; i >= members.length; i--) {
        allDetailCards[i].remove();
    }

    // members 배열의 크기만큼 상세 카드가 있어야 함
    // 초기 9개 이후의 멤버들에 대한 카드만 새로 생성
    const currentDetailCount = document.querySelectorAll('.details-card').length;
    
    for (let i = currentDetailCount; i < members.length; i++) {
        const detailCard = createDetailCard(members[i]);
        selectors.detailsList.appendChild(detailCard);
    }
}

/**
 * 상세 정보 카드 DOM 요소 생성
 * @param {Object} member
 * @returns {HTMLElement}
 */
function createDetailCard(member) {
    const article = document.createElement('article');
    article.className = 'details-card';

    // 기술 리스트 HTML 생성
    const techListHTML = member.techs
        .map(tech => `<li>${tech}</li>`)
        .join('');

    // 웹사이트 링크 생성 (있으면)
    let websiteHTML = '';
    if (member.website) {
        websiteHTML = `<dd><a href="${member.website}" target="_blank">${member.website}</a></dd>`;
    } else {
        websiteHTML = '<dd>없음</dd>';
    }

    article.innerHTML = `
        <h3 class="details-card-name">${member.name}</h3>
        <div class="details-grid">
            <div class="detail-group">
                <h4 class="detail-label">기본 정보</h4>
                <dl class="detail-list">
                    <dt>소속 파트</dt>
                    <dd>${member.part}</dd>
                    <dt>동아리명</dt>
                    <dd>멋쟁이사자처럼</dd>
                </dl>
            </div>

            <div class="detail-group">
                <h4 class="detail-label">자기소개</h4>
                <p class="detail-description">${member.bio}</p>
            </div>

            <div class="detail-group">
                <h4 class="detail-label">관심 기술</h4>
                <ul class="detail-tech-list">
                    ${techListHTML}
                </ul>
            </div>

            <div class="detail-group">
                <h4 class="detail-label">연락처</h4>
                <dl class="detail-contact-list">
                    <dt>이메일</dt>
                    <dd><a href="mailto:${member.email}">${member.email}</a></dd>
                    <dt>웹사이트</dt>
                    ${websiteHTML}
                    <dt>휴대전화</dt>
                    <dd>${member.phone}</dd>
                </dl>
            </div>

            <div class="detail-group">
                <h4 class="detail-label">한마디</h4>
                <p class="detail-description">${member.comment || '(한마디 없음)'}</p>
            </div>
        </div>
    `;

    return article;
}

/* ========================================
   페이지 로드 시 실행
   ======================================== */

document.addEventListener('DOMContentLoaded', initializeApp);
