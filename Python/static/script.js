let allChats = [];
let filteredChats = [];
let currentPage = 1;
const itemsPerPage = 12; // Количество карточек на странице

// Загрузка чатов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadChats();
    
    // Обработчик кнопки обновления
    document.getElementById('refresh-btn').addEventListener('click', function() {
        currentPage = 1;
        loadChats();
    });
    
    // Обработчик поиска
    document.getElementById('search-input').addEventListener('input', function(e) {
        currentPage = 1;
        filterChats(e.target.value);
    });
    
    // Обработчики пагинации
    document.getElementById('prev-btn').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderChats();
        }
    });
    
    document.getElementById('next-btn').addEventListener('click', function() {
        const totalPages = Math.ceil(filteredChats.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderChats();
        }
    });
});

async function loadChats() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const chatsContainer = document.getElementById('chats-container');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    chatsContainer.style.display = 'none';
    
    try {
        console.log('Запрос чатов...');
        const response = await fetch('/api/chats');
        console.log('Ответ получен, статус:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Данные получены:', data);
        
        if (data.success) {
            allChats = data.chats || [];
            filteredChats = allChats;
            
            console.log('Чатов получено:', allChats.length);
            
            // Обновляем статистику
            document.getElementById('total-chats').textContent = allChats.length;
            document.getElementById('spam-list-count').textContent = data.spam_list_count || 0;
            
            renderChats();
        } else {
            const errorMsg = data.error || 'Ошибка при загрузке чатов';
            console.error('Ошибка от сервера:', errorMsg);
            showError(errorMsg);
        }
    } catch (err) {
        console.error('Ошибка при загрузке чатов:', err);
        showError('Ошибка соединения: ' + err.message);
    } finally {
        loading.style.display = 'none';
        chatsContainer.style.display = 'block';
    }
}

function filterChats(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
        filteredChats = allChats;
    } else {
        filteredChats = allChats.filter(chat => 
            chat.title.toLowerCase().includes(term) ||
            chat.chat_id.toString().includes(term) ||
            (chat.folder && chat.folder.toLowerCase().includes(term))
        );
    }
    
    currentPage = 1; // Сбрасываем на первую страницу при фильтрации
    renderChats();
}

function renderChats() {
    const grid = document.getElementById('chats-grid');
    const pagination = document.getElementById('pagination');
    
    grid.innerHTML = '';
    
    if (filteredChats.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">Чаты не найдены</div>
            </div>
        `;
        pagination.style.display = 'none';
        return;
    }
    
    // Вычисляем пагинацию
    const totalPages = Math.ceil(filteredChats.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageChats = filteredChats.slice(startIndex, endIndex);
    
    // Рендерим карточки
    pageChats.forEach(chat => {
        const card = createChatCard(chat);
        grid.appendChild(card);
    });
    
    // Обновляем пагинацию
    updatePagination(totalPages);
}

function createChatCard(chat) {
    const card = document.createElement('div');
    card.className = `chat-card ${chat.in_spam_list ? 'in-list' : ''}`;
    
    const statusBadge = chat.in_spam_list 
        ? '<span class="status-badge in-list">✓ В списке рассылки</span>'
        : '<span class="status-badge not-in-list">Не в списке</span>';
    
    const actionButton = chat.in_spam_list
        ? `<button class="btn btn-danger" onclick="removeFromSpamList(${chat.chat_id}, '${escapeHtml(chat.title)}')">Удалить из списка</button>`
        : `<button class="btn btn-success" onclick="addToSpamList(${chat.chat_id}, '${escapeHtml(chat.title)}')">Добавить в список</button>`;
    
    const typeLabel = chat.type === 'channel' ? 'Канал' : 'Группа';
    const typeClass = chat.type === 'channel' ? 'channel' : 'group';
    
    card.innerHTML = `
        <div class="chat-card-header">
            <div class="chat-title" title="${escapeHtml(chat.title)}">${escapeHtml(chat.title)}</div>
            <span class="chat-type-badge ${typeClass}">${typeLabel}</span>
        </div>
        
        <div class="chat-info">
            <div class="chat-id">
                <span class="chat-id-label">ID:</span>
                <span>${chat.chat_id}</span>
            </div>
            ${chat.folder ? `<div class="chat-folder">${escapeHtml(chat.folder)}</div>` : ''}
        </div>
        
        <div class="chat-status">
            ${statusBadge}
        </div>
        
        <div class="chat-actions">
            ${actionButton}
        </div>
    `;
    
    return card;
}

function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages} (${filteredChats.length} чатов)`;
}

async function addToSpamList(chatId, title) {
    try {
        const response = await fetch('/api/spam-list/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                title: title
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Обновляем локальные данные
            const chat = allChats.find(c => c.chat_id === chatId);
            if (chat) {
                chat.in_spam_list = true;
            }
            const filteredChat = filteredChats.find(c => c.chat_id === chatId);
            if (filteredChat) {
                filteredChat.in_spam_list = true;
            }
            
            // Обновляем статистику
            const spamCount = parseInt(document.getElementById('spam-list-count').textContent) + 1;
            document.getElementById('spam-list-count').textContent = spamCount;
            
            // Перерисовываем текущую страницу
            renderChats();
        } else {
            console.error('Ошибка при добавлении:', data.error || 'Неизвестная ошибка');
        }
    } catch (err) {
        console.error('Ошибка соединения при добавлении:', err.message);
    }
}

async function removeFromSpamList(chatId, title) {
    try {
        const response = await fetch('/api/spam-list/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Обновляем локальные данные
            const chat = allChats.find(c => c.chat_id === chatId);
            if (chat) {
                chat.in_spam_list = false;
            }
            const filteredChat = filteredChats.find(c => c.chat_id === chatId);
            if (filteredChat) {
                filteredChat.in_spam_list = false;
            }
            
            // Обновляем статистику
            const spamCount = Math.max(0, parseInt(document.getElementById('spam-list-count').textContent) - 1);
            document.getElementById('spam-list-count').textContent = spamCount;
            
            // Перерисовываем текущую страницу
            renderChats();
        } else {
            console.error('Ошибка при удалении:', data.error || 'Неизвестная ошибка');
        }
    } catch (err) {
        console.error('Ошибка соединения при удалении:', err.message);
    }
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = 'Ошибка: ' + message;
    error.style.display = 'block';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
