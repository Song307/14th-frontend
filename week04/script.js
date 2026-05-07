/* ========================================
   전역 상태 (데이터)
   ======================================== */

/**
 * 모든 멤버 데이터 배열 (마스터 데이터)
 * 필터/정렬/검색에 영향을 받지 않음
 */
let members = [];

/**
 * 필터/정렬/검색이 적용된 렌더링 대상 멤버 배열
 * 화면에 표시되는 것은 이 배열 기반
 */
let filteredMembers = [];

/**
 * 폼 창 열려있는 상태
 */
let isFormOpen = false;

/**
 * 비동기 작업 상태 관리
 */
const asyncState = {
    isLoading: false,
    lastError: null,
    lastRequest: null // {type: 'add1' | 'add5' | 'refresh', count: number}
};

/**
 * 보기 옵션 필터 상태
 */
const viewState = {
    filterPart: '전체',
    sortBy: '최신추가순',
    searchName: ''
};

/* ========================================
   DOM 선택자
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
    randomFillBtn: document.getElementById('randomFillBtn'),

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

    // 비동기 컨트롤
    addOneBtn: document.getElementById('addOneBtn'),
    addFiveBtn: document.getElementById('addFiveBtn'),
    refreshAllBtn: document.getElementById('refreshAllBtn'),
    asyncStatusText: document.getElementById('asyncStatusText'),
    asyncStatus: document.getElementById('asyncStatus'),
    retryBtn: document.getElementById('retryBtn'),

    // 보기 옵션
    filterPart: document.getElementById('filterPart'),
    sortBy: document.getElementById('sortBy'),
    searchName: document.getElementById('searchName'),

    // 카드 영역
    cardsGrid: document.getElementById('cardsGrid'),
    detailsList: document.getElementById('detailsList'),
    emptyState: document.getElementById('emptyState'),
    emptyStateDetails: document.getElementById('emptyStateDetails')
};

/**
 * 필수 입력 필드 목록
 */
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
   API 데이터 변환 함수
   ======================================== */

/**
 * randomuser.me API 응답을 우리 형식으로 변환
 * @param {Array} users - API 응답의 results 배열
 * @returns {Array} 변환된 멤버 배열
 */
function convertAPIToMembers(users) {
    return users.map(user => {
        const firstNameLen = user.name.first.length;
        const selectedTechIndex = firstNameLen % 5; // 임의로 기술 할당
        const techs = [
            'HTML / CSS',
            'JavaScript',
            'React',
            'Node.js',
            'Python'
        ];

        // 파트 할당 (이름으로 결정)
        const firstChar = user.name.first.charCodeAt(0);
        const part = [
            'Frontend',
            'Backend',
            'Design'
        ][firstChar % 3];

        return {
            name: `${user.name.first} ${user.name.last}`,
            part: part,
            techs: [techs[selectedTechIndex % 5]],
            intro: `새로운 기술을 배우고 함께 성장하고 싶습니다.`,
            bio: `저는 ${user.name.first}입니다. 프로페셔널한 개발자가 되기 위해 매일 노력하고 있습니다. 함께 성장할 수 있는 팀에서 일하고 싶습니다.`,
            email: user.email,
            phone: user.phone,
            website: user.cell || '',
            comment: `${user.location.city}에서 왔습니다. 만나서 반갑습니다!`
        };
    });
}

/**
 * randomuser.me API에서 데이터 불러오기
 * @param {number} count - 불러올 사용자 수
 * @returns {Promise<Array>} 변환된 멤버 배열
 */
async function fetchRandomUsers(count) {
    const url = `https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }
        
        const data = await response.json();
        return convertAPIToMembers(data.results);
    } catch (error) {
        console.error('API 호출 실패:', error);
        throw error;
    }
}

/* ========================================
   비동기 상태 UI 함수
   ======================================== */

/**
 * 비동기 상태 업데이트
 * @param {string} status - 'loading' | 'success' | 'error' | 'ready'
 * @param {string} message - 표시할 메시지
 */
function updateAsyncStatus(status, message) {
    const statusEl = selectors.asyncStatus;
    const textEl = selectors.asyncStatusText;
    const retryBtn = selectors.retryBtn;

    // 클래스 초기화
    statusEl.classList.remove('status-loading', 'status-success', 'status-error');

    // 상태에 따른 클래스 추가
    if (status === 'loading') {
        statusEl.classList.add('status-loading');
        retryBtn.style.display = 'none';
        disableAsyncButtons(true);
    } else if (status === 'success') {
        statusEl.classList.add('status-success');
        retryBtn.style.display = 'none';
        disableAsyncButtons(false);
    } else if (status === 'error') {
        statusEl.classList.add('status-error');
        retryBtn.style.display = 'inline-block';
        disableAsyncButtons(false);
    } else { // 'ready'
        retryBtn.style.display = 'none';
        disableAsyncButtons(false);
    }

    textEl.textContent = message;
}

/**
 * 비동기 버튼 활성화/비활성화
 */
function disableAsyncButtons(disabled) {
    selectors.addOneBtn.disabled = disabled;
    selectors.addFiveBtn.disabled = disabled;
    selectors.refreshAllBtn.disabled = disabled;
}

/* ========================================
   1단계: 초기화 함수들
   ======================================== */

/**
 * 페이지 로드 시 초기화
 */
function initializeApp() {
    initializeMembersFromHTML();
    updateFilteredMembers();
    updateMemberCount();
    attachEventListeners();
    updateAsyncStatus('ready', '준비 완료');
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
        const detailCard = document.querySelector(`.details-card[data-name="${name}"]`);
        
        if (detailCard) {
            const detailCardData = extractDetailsFromCard(detailCard);

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
    const bioElement = detailCard.querySelector('.detail-description');
    const bio = bioElement ? bioElement.textContent.trim() : '';

    const techItems = detailCard.querySelectorAll('.detail-tech-list li');
    const techs = Array.from(techItems).map(item => item.textContent.trim());

    let email = '';
    let phone = '';
    let website = '';

    const emailDt = Array.from(detailCard.querySelectorAll('.detail-contact-list dt'))
        .find(dt => dt.textContent.trim() === '이메일');
    if (emailDt) {
        const emailDD = emailDt.nextElementSibling;
        const link = emailDD.querySelector('a');
        email = link ? link.textContent.trim() : '';
    }

    const phoneDt = Array.from(detailCard.querySelectorAll('.detail-contact-list dt'))
        .find(dt => dt.textContent.trim() === '휴대전화');
    if (phoneDt) {
        phone = phoneDt.nextElementSibling.textContent.trim();
    }

    const websiteDt = Array.from(detailCard.querySelectorAll('.detail-contact-list dt'))
        .find(dt => dt.textContent.trim() === '웹사이트');
    if (websiteDt) {
        const websiteDD = websiteDt.nextElementSibling;
        const link = websiteDD.querySelector('a');
        website = link ? link.getAttribute('href') : '';
    }

    const allDescriptions = detailCard.querySelectorAll('.detail-description');
    const comment = allDescriptions.length > 1 ?
        allDescriptions[allDescriptions.length - 1].textContent.trim() : '';

    return { techs, bio, email, phone, website, comment };
}

/**
 * 이벤트 리스너 설정
 */
function attachEventListeners() {
    // 기본 컨트롤
    selectors.addBtn.addEventListener('click', toggleFormVisibility);
    selectors.cancelBtn.addEventListener('click', toggleFormVisibility);
    selectors.deleteBtn.addEventListener('click', handleDelete);
    selectors.addForm.addEventListener('submit', handleFormSubmit);

    // 비동기 컨트롤
    selectors.addOneBtn.addEventListener('click', () => handleAsyncAdd(1));
    selectors.addFiveBtn.addEventListener('click', () => handleAsyncAdd(5));
    selectors.refreshAllBtn.addEventListener('click', handleAsyncRefresh);
    selectors.retryBtn.addEventListener('click', handleRetry);

    // 폼 자동 채우기
    selectors.randomFillBtn.addEventListener('click', handleRandomFill);

    // 보기 옵션
    selectors.filterPart.addEventListener('change', handleViewOptionChange);
    selectors.sortBy.addEventListener('change', handleViewOptionChange);
    selectors.searchName.addEventListener('input', handleSearchInput);
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
 */
function validateForm() {
    clearAllErrors();
    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = selectors[fieldId];
        if (!field.value.trim()) {
            isValid = false;
            showFieldError(fieldId, '필수 입력 항목입니다.');
        }
    });

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
 */
function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const techsString = selectors.inputTechs.value.trim();
    const techs = techsString.split(',').map(tech => tech.trim());

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

    addMember(newMember);
    resetForm();
    toggleFormVisibility();
}

/**
 * 폼 자동 채우기 (API에서 1명의 데이터 가져와서 폼에 입력)
 */
async function handleRandomFill() {
    try {
        updateAsyncStatus('loading', '랜덤 값을 불러오는 중...');
        const users = await fetchRandomUsers(1);
        
        if (users.length > 0) {
            const user = users[0];
            selectors.inputName.value = user.name;
            selectors.inputPart.value = user.part;
            selectors.inputTechs.value = user.techs.join(', ');
            selectors.inputIntro.value = user.intro;
            selectors.inputBio.value = user.bio;
            selectors.inputEmail.value = user.email;
            selectors.inputPhone.value = user.phone;
            selectors.inputWebsite.value = user.website;
            selectors.inputComment.value = user.comment;

            updateAsyncStatus('success', '랜덤 값을 채웠습니다!');
            setTimeout(() => {
                updateAsyncStatus('ready', '준비 완료');
            }, 2000);
        }
    } catch (error) {
        updateAsyncStatus('error', `오류 발생: ${error.message}`);
        asyncState.lastError = error;
    }
}

/* ========================================
   3단계: 비동기 데이터 처리 함수
   ======================================== */

/**
 * 비동기: 랜덤 N명 추가
 */
async function handleAsyncAdd(count) {
    try {
        asyncState.isLoading = true;
        asyncState.lastRequest = { type: 'add' + count, count };
        updateAsyncStatus('loading', `${count}명을 불러오는 중...`);

        const newUsers = await fetchRandomUsers(count);
        members.push(...newUsers);
        
        updateFilteredMembers();
        updateMemberCount();
        renderCards();
        renderDetails();

        updateAsyncStatus('success', `${count}명을 추가했습니다!`);
        setTimeout(() => {
            updateAsyncStatus('ready', '준비 완료');
        }, 2000);
    } catch (error) {
        asyncState.lastError = error;
        updateAsyncStatus('error', `오류 발생: ${error.message}`);
    } finally {
        asyncState.isLoading = false;
    }
}

/** 
 * 비동기: 전체 새로고침
 * 기존 명단(첫 번째 '내 카드' 제외)을 새 데이터로 교체
 */
async function handleAsyncRefresh() {
    try {
        asyncState.isLoading = true;
        const countToRefresh = members.length - 1; // '내 카드' 제외
        
        if (countToRefresh <= 0) {
            updateAsyncStatus('error', '갱신할 데이터가 없습니다.');
            return;
        }

        asyncState.lastRequest = { type: 'refresh', count: countToRefresh };
        updateAsyncStatus('loading', '전체 데이터를 새로고침하는 중...');

        const newUsers = await fetchRandomUsers(countToRefresh);
        
        // 첫 번째 멤버('내 카드')만 유지, 나머지 교체
        members = [members[0], ...newUsers];
        
        updateFilteredMembers();
        updateMemberCount();
        renderCards();
        renderDetails();

        updateAsyncStatus('success', `${countToRefresh}명의 데이터를 갱신했습니다!`);
        setTimeout(() => {
            updateAsyncStatus('ready', '준비 완료');
        }, 2000);
    } catch (error) {
        asyncState.lastError = error;
        updateAsyncStatus('error', `오류 발생: ${error.message}`);
    } finally {
        asyncState.isLoading = false;
    }
}

/**
 * 재시도: 마지막 요청 재실행
 */
async function handleRetry() {
    if (!asyncState.lastRequest) {
        updateAsyncStatus('error', '재시도할 요청이 없습니다.');
        return;
    }

    const { type, count } = asyncState.lastRequest;

    if (type === 'add1') {
        await handleAsyncAdd(1);
    } else if (type === 'add5') {
        await handleAsyncAdd(5);
    } else if (type === 'refresh') {
        await handleAsyncRefresh();
    }
}

/* ========================================
   4단계: 필터/정렬/검색 함수
   ======================================== */

/**
 * 보기 옵션 변경 처리
 */
function handleViewOptionChange(event) {
    if (event.target === selectors.filterPart) {
        viewState.filterPart = event.target.value;
    } else if (event.target === selectors.sortBy) {
        viewState.sortBy = event.target.value;
    }

    updateFilteredMembers();
    renderCards();
    renderDetails();
}

/**
 * 검색 입력 처리 (실시간)
 */
function handleSearchInput(event) {
    viewState.searchName = event.target.value.trim();
    updateFilteredMembers();
    renderCards();
    renderDetails();
}

/**
 * 필터/정렬/검색을 적용한 filteredMembers 업데이트
 */
function updateFilteredMembers() {
    // 필터링
    let result = members.filter(member => {
        // 파트 필터
        if (viewState.filterPart !== '전체' && member.part !== viewState.filterPart) {
            return false;
        }

        // 검색 필터
        if (viewState.searchName && !member.name.toLowerCase().includes(viewState.searchName.toLowerCase())) {
            return false;
        }

        return true;
    });

    // 정렬
    if (viewState.sortBy === '최신추가순') {
        // 역순 (나중에 추가된 것부터)
        result.reverse();
    } else if (viewState.sortBy === '이름순') {
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    filteredMembers = result;
}

/* ========================================
   5단계: 데이터 조작 함수들
   ======================================== */

/**
 * 새 멤버 추가
 */
function addMember(member) {
    members.push(member);
    updateFilteredMembers();
    renderCards();
    renderDetails();
    updateMemberCount();
}

/**
 * 마지막 멤버 삭제 (내 카드는 제외)
 */
function handleDelete() {
    if (members.length <= 1) {
        alert('삭제할 멤버가 없습니다. (내 카드는 유지됩니다)');
        return;
    }

    members.pop();
    updateFilteredMembers();
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
   6단계: 렌더링 (화면 업데이트) 함수들
   ======================================== */

/**
 * 요약 카드 목록 렌더링 (filteredMembers 기준)
 */
function renderCards() {
    // 첫 번째(내 카드) 제외한 나머지 카드 모두 제거
    const allCards = document.querySelectorAll('.profile-summary-card');
    for (let i = allCards.length - 1; i > 0; i--) {
        allCards[i].remove();
    }

    // filteredMembers 기반으로 카드 렌더링
    // 단, 첫 번째 멤버(내 카드)는 이미 HTML에 있으므로, filteredMembers에 포함되었다면 스킵
    filteredMembers.forEach(member => {
        // 내 카드는 skip
        if (member === members[0]) {
            return;
        }
        
        const card = createSummaryCard(member);
        selectors.cardsGrid.appendChild(card);
    });

    // 빈 상태 처리
    updateEmptyState();
}

/**
 * 요약 카드 DOM 요소 생성
 */
function createSummaryCard(member) {
    const article = document.createElement('article');
    article.className = 'profile-summary-card';
    article.setAttribute('data-name', member.name);
    article.setAttribute('data-part', member.part);
    article.setAttribute('data-intro', member.intro);

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
 * 상세 정보 카드 목록 렌더링 (filteredMembers 기준)
 */
function renderDetails() {
    // 첫 번째 멤버(내 카드) 제외한 나머지 상세 카드 지우기
    const allDetailCards = document.querySelectorAll('.details-card');
    for (let i = allDetailCards.length - 1; i > 0; i--) {
        allDetailCards[i].remove();
    }

    // filteredMembers 기반으로 상세 카드 렌더링
    filteredMembers.forEach(member => {
        // 내 카드는 skip
        if (member === members[0]) {
            return;
        }

        const detailCard = createDetailCard(member);
        selectors.detailsList.appendChild(detailCard);
    });

    // 빈 상태 처리
    updateEmptyStateDetails();
}

/**
 * 상세 정보 카드 DOM 요소 생성
 */
function createDetailCard(member) {
    const article = document.createElement('article');
    article.className = 'details-card';
    article.setAttribute('data-name', member.name);

    const techListHTML = member.techs
        .map(tech => `<li>${tech}</li>`)
        .join('');

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

/**
 * 빈 상태 표시 업데이트 (카드)
 */
function updateEmptyState() {
    const hasVisibleCards = document.querySelectorAll('.profile-summary-card:not(.profile-summary-card--my-card)').length > 0;
    
    if (!hasVisibleCards && members.length > 1) {
        // 조건으로 인해 카드가 숨겨진 상태
        selectors.emptyState.style.display = 'block';
    } else {
        selectors.emptyState.style.display = 'none';
    }
}

/**
 * 빈 상태 표시 업데이트 (상세 정보)
 */
function updateEmptyStateDetails() {
    const hasVisibleDetails = document.querySelectorAll('.details-card[data-name]:not([data-name="송하성"])').length > 0;
    
    if (!hasVisibleDetails && filteredMembers.length <= 1) {
        selectors.emptyStateDetails.style.display = 'block';
    } else {
        selectors.emptyStateDetails.style.display = 'none';
    }
}

/* ========================================
   앱 초기화
   ======================================== */

// DOM이 준비되면 앱 초기화
document.addEventListener('DOMContentLoaded', initializeApp);
