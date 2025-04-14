import { ItemComponent } from './components/Item.js';
import { UserComponent } from './components/User.js';

const state = {
    currentUser: null,
    items: [],
    filteredItems: [],
    currentCategory: null,
    currentCondition: null,
    currentSort: 'newest',
    searchQuery: '',
    isLoading: false
};

const elements = {
    itemList: document.getElementById('item-list'),
    addItemBtn: document.getElementById('add-item-btn'),
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    categoryButton: document.querySelectorAll('.category-btn'),
    conditionFilter: document.getElementById('condition-filter'),
    sortFilter: document.getElementById('sort-filter'),
    authSection: document.querySelector('./auth-section'),

    loginModal: document.getElementById('login-modal'),
    registerModal: document.getElementById('register-modal'),
    addItemModal: document.getElementById('add-item-modal'),
    itemDetailsModal: document.getElementById('item-details-modal'),

    loginForms: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    addItemForm: document.getElementById('add-item-form')
};

const API = {
    items: 'api/index.php?route=items',
    users: 'api/index.php?route=users',
    login: 'api/index.php?route=user&action=login',
    register: 'api/index.php?route=user&action=register',
    logout: 'api/index.php?route=users&action=logout'
};

function init() {
    //Verifica se usuário já está logado
    checkAuthStatus();
    //Load dos items
    loadItems();
    //Config eventos
    setupEventListeners();
}

async function checkAuthStatus() {
    try {
        const response = await fetch(API.users, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            state.currentUser = userData;
            updateAuthUI();
            elements.addItemBtn.classList.remove('hidden');
        } else {
            state.currentUser = null;
            updateAuthUI();
            elements.addItemBtn.classList.add('hidden');
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação: ', error)
        state.currentUser = null;
        updateAuthUI();
        elements.addItemBtn.classList.add('hidden');
    }
}

function updateAuthUI() {
    if (state.currentUser) {
        elements.authSection.innetHTML = `
            <div class="user-menu">
                <span>Olá, ${state.currentUser.name}</span>
                <button id="logout-btn" class="btn btn-small">Sair</button>
            </div>`;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    } else {
        elements.authSection.innerHTML = `
             <button id="login-btn" class="btn">Entrar</button>
        `;

        document.getElementById('login-btn').addEventListener('click', () => {
            openModal(elements.loginModal);
        });
    }
}

async function loadItems() {
    state.isLoading = true;
    updateItemsUI();

    try {
        let endpoint = API.items;

        if (state.currentCategory) {
            endpoint += `&action=category&category=${state.currentCategory}`;
        }
        if (state.searchQuery) {
            endpoint += `&action=search&q=${state.searchQuery}`;
        }

        const response = await fetch(endpoint);
        const items = await response.json();

        state.items = items;

        applyFilters();
    } catch (error) {
        console.error('Erro ao carregar itens: ', error);
        state.items = [];
        state.filteredItems = [];
    } finally {
        state.isLoading = false;
        updateItemsUI();
    }
}

function applyFilters() {
    let filteredItems = [...state.items];

    if (state.currentCondition) {
        filteredItems = filteredItems.filter(item => item.condition === state.currentCondition);
    }

    switch (state.currentSort) {
        case 'newest':
            filteredItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredItems.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'name_asc':
            filteredItems.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            filteredItems.sort((a, b) => b.localeCompare(a.name));
            break;
    }
    state.filteredItems = filteredItems;
}

function updateItemsUI() {
    if (state.isLoading) {
        elements.itemList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
            </div>
        `;
        return;
    }

    if (state.filteredItems.length === 0) {
        elements.itemList.innerHTML = `
            <div class="no-items text-center" style="grid-column: 1 / -1;">
                <p>Nenhum item encontrado. Tente outros filtros ou adicione um novo item.</p>
            </div>
        `;
        return;
    }
    elements.itemList.innerHTML = '';

    state.filteredItems.forEach(item => {
        const itemElement = ItemComponent.createItemCard(item);
        elements.itemList.appendChild(itemElement);

        // Adicionar evento de clique para ver detalhes
        itemElement.addEventListener('click', () => {
            showItemDetails(item);
        });
    });
}

function showItemDetails(item) {
    const isOwner = state.currentUser && state.currentUser.id == item.user_id;

    const detailsHtml = `
        <div class="item-detail">
            <div class="item-detail-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div class="no-image"><i class="fas fa-image"></i></div>'}
            </div>
            <div class="item-detail-info">
                <h3>${item.name}</h3>
                <div class="item-detail-meta">
                    <span class="item-condition">${item.condition}</span>
                    <span class="item-category">${item.category}</span>
                </div>
                <div class="item-detail-description">
                    ${item.description}
                </div>
                <div class="item-detail-user">
                    <p><strong>Oferecido por:</strong> ${item.user_name}</p>
                </div>
                <div class="item-actions">
                    ${isOwner ? `
                        <button class="btn btn-edit" data-id="${item.id}">Editar</button>
                        <button class="btn btn-delete" data-id="${item.id}">Excluir</button>
                    ` : state.currentUser ? `
                        <button class="btn btn-swap" data-id="${item.id}">Propor Troca</button>
                    ` : `
                        <button class="btn" id="login-to-swap">Entre para propor troca</button>
                    `}
                </div>
            </div>
        </div>
    `;

    const detailsContent = document.getElementById('item-details-content');
    detailsContent.innerHTML = detailsHtml;

    //Eventos para os botões
    if (isOwner) {
        //Botão de editar
        detailsContent.querySelector('.btn-edit').addEventListener('click', () => {
            editItem(item);
        });
        //botão de deletar item
        detailsContent.querySelector('.btn-delete').addEventListener('click', () => {
            deleteItem(item.id);
        });
    } else if (state.currentUser) {
        //Botão de propor troca
        detailsContent.querySelector('.btn-swap').addEventListener('click', () => {
            proposeSwap(item);
        });
    } else {
        //botão de login para propor troca
        detailsContent.querySelector('#login-to-swap').addEventListener('click', () => {
            closeModal(elements.itemDetailsModal);
            openModal(elements, loginModal);
        });
    }
    //Abrir modal de detalhes
    openModal(elements.itemDetailsModal);
}

function editItem(item) {
    closeModal(elements.itemDetailsModal);

    elements.addItemForm.querySelector('#item-id').value = item.id;
    elements.addItemForm.querySelector('#item-name').value = item.name;
    elements.addItemForm.querySelector('#item-description').value = item.description;
    elements.addItemForm.querySelector('#item-category').value = item.category;
    elements.addItemForm.querySelector('#item-condition').value = item.condition;

    const previewImage = elements.addItemForm.querySelector('#image-preview');
    if (item.image) {
        previewImage.innerHTML = `<img src="${item.image}" alt = "${item.name}">`;
        previewImage.classList.remove('hidden');
    } else {
        previewImage.innerHTML = '';
        previewImage.classList.add('hidden');
    }

    const formTitle = elements.addItemModal.querySelector('.modal-title');
    formTitle.textContent = 'Editar Item';

    const submitButton = elements.addItemForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Atualizar Item';

    openModal(elements.addItemModal);
}

async function deleteItem(itemId) {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
        return;
    }

    try {
        const response = await fetch(`${API.items}&action=delete&id=${itemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            closeModal(elements.itemDetailsModal);
            loadItems();
            showNotification('Item excluído com sucesso', 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Erro ao excluir item', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        showNotification('Erro ao excluir item. Tente novamente.', 'error');
    }
}

function proposeSwap(item) {
    if (!state.currentUser) {
        showNotification('Você precisa estar logado para propor uma troca', 'error');
        return;
    }

    getUserItems(state.currentUser.id).then(userItems => {
        if (userItems.lenght === 0) {
            showNotification('Você precisa adicionar itens antes de propor uma troca', 'info');
            closeModal(elements.itemDetailsModal);
            openModal(elements.addItemModal);
            return;
        }

        constSwapModelHtml = `
            <div id="swap-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Propor Troca</h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <p>Escolha um dos seus itens para trocar por: <strong>${item.name}</strong></p>
                        <div class="user-items-grid" id="user-items-grid">
                            ${userItems.map(userItem => `
                                <div class="item-card" data-id="${userItem.id}">
                                    <div class="item-image">
                                        ${userItem.image ? `<img src="${userItem.image}" alt="${userItem.name}">` : '<div class="no-image"><i class="fas fa-image"></i></div>'}
                                    </div>
                                    <div class="item-info">
                                        <h4>${userItem.name}</h4>
                                        <div class="item-meta">
                                            <span class="item-condition">${userItem.condition}</span>
                                            <span class="item-category">${userItem.category}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn" id="cancel-swap">Cancelar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', swapModalHtml);
        const swapModal = document.getElementById('swap-modal');

        document.querySelector('#cancel-swap').addEventListener('click', () => {
            document.body.removeChild(swapModal);
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(swapModal);
        });

        const userItemCards = document.querySelectorAll('.item-card');
        userItemCards.forEach(card => {
            card.addEventListener('click', () => {
                const userItemId = card.dataset.id;
                submitSwapProposal(item.id, userItemId, item.user_id);
                document.body.removeChild(swapModal);
            });
        });

        swapModal.style.display = 'block';
    });
}

async function getUserItems(userId) {
    try {
        const response = await fetch(`${API.items}&action=user&user_id=${userId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            return await response.json();
        } else {
            return [];
        }
    } catch (error) {
        console.error('Erro ao obter itens do usuário:', error);
        return;
    }
}

async function submiteSwapProposal(itemId, userId, ownerId) {
    try {
        const response = await fetch('api/index.php?route=swaps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item_id: itemId,
                user_item_id: userItemId,
                owner_id: ownerId
            }),
            credentials: 'include'
        });

        if (response.ok) {
            closeModal(elements.itemDetailsModal);
            showNotification('Proposta de troca enviada com sucesso!', 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Erro ao enviar proposta de troca', 'error');
        }
    } catch (error) {
        console.error('Erro ao enviar proposta de troca', error);
        showNotification('Erro ao enviar proposta de troca. Tente novamente.', error);
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showNotification('Por favor, preencha todos os campos', error);
        return;
    }

    try {
        const response = await fetch(API.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            state.currentUser = userData;

            closeModal(elements.loginModal);
            updateAuthUI();
            showNotification('Login realizado com sucesso', 'success');

            elements.addItemBtn.classList.remove('hidden');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Email ou senha incorretos', 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showNotification('Error ao fazer login. Tente novamente.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!name || !email || !password || !confirmPassword) {
        showNotification('Por favor, preencha todos os campos', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('As senhas não coincidem', 'error');
        return;
    }

    try {
        const response = await fetch(API.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            state.currentUser = userData;

            closeModal(elements.registerForm);
            updateAuthUI();
            showNotification('Registro realizado com sucesso', 'success');

            elements.addItemBtn.classList.remove('hidden');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Erro ao realizar registro', 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer registro:', error);
        showNotification('Erro ao fazer registro. Tente novamente', 'error');
    }
}

async function handleLogout() {
    try {
        const response = await fetch(API.logout, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            state.currentUser = null;

            updateAuthUI();
            showNotification('Logout realizado com sucesso', 'success');
            elements.addItemBtn.classList.add('hidden');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Erro ao realizar logout', 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        showNotification('Erro ao fazer logout. Tente novamente', 'error');
    }
}

async function handleAddEditItem(e) {
    e.preventDefault();
    const itemId = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const category = document.getElementById('item-category').value;
    const condition = document.getElementById('item-condition').value;
    const imageInput = document.getElementById('item-image');

    if (!name || !description || !category || !condition) {
        showNotification('Por favor, preencha todos os campos', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('condition', condition);

    if (imageInput.files.lenght > 0) {
        formData.append('image', imageInput.files[0]);
    }
    if (itemId) {
        formData.append('id', itemId);
    }

    try {
        const action = itemId ? 'update' : 'create';
        const response = await fetch(`${API.items}&action=${action}`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (response.ok) {
            closeModal(elements.addItemModal);
            elements.addItemForm.reset();
            document.getElementById('image-preview').innerHTML = '';
            document.getElementById('image-preview').classList.add('hidden');
            loadItems();

            const message = itemId ? 'Item atualizado com sucesso' : 'Item adicionado com sucesso';
            showNotification(message, 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Erro ao adicionar/atualizar item', 'error');
        }
    } catch (error) {
        console.error('Erro ao adicionar/atualizar item:', error);
        showNotification('Erro ao adicionar/atualizar item. Tente novamente', 'error');
    }
}

function setupImagePreview() {
    const imageInput = document.getElementById('item-image');
    const previewImage = document.getElementById('image-preview');

    imageInput.addEventListener('change', () => {
        if (imageInput.files.lenght === 0) {
            previewImage.innerHTML = '';
            previewImage.classList.add('hidden');
            return;
        }

        const file = imageInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            previewImage.innerHTML = `<img src="${e.target.result}" alt="Prévia">`;
            previewImage.classList.remove('hidden');
        };

        reader.readAsDataURL(file);
    })
}

function handleCategoryFilter(category) {
    if (state.currentCategory === category) {
        state.currentCategory = null;

        elements.categoryButton.forEach(btn => {
            btn.classList.remove('active');
        });
    } else {
        state.currentCategory = category;

        elements.categoryButton.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    loadItems();
}

function handleSearch(e) {
    e.preventDefault();
    state.searchQuery = elements.searchInput.value.trim();
    loadItems();
}

function handleConditionFilter() {
    state.currentCondition = elements.conditionFilter.value;

    applyFilters();
    updateItemsUI();
}

function handleSortFilter() {
    state.currentSort = elements.sortFilter.value;

    applyFilters();
    updateItemsUI();
}

//Funções auxiliares para modais
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function setupEventListeners() {
    elements.loginForms.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);

    document.getElementById('go-to-register').addEventListener('click', () => {
        closeModal(elements.loginModal);
        openModal(elements.registerModal);
    });

    document.getElementById('go-to-login').addEventListener('click', () => {
        closeModal(elements.registerModal);
        openModal(elements.loginModal);
    });

    elements.addItemBtn.addEventListener('click', () => {
        //Resetar formulado e Resetar ID
        elements.addItemForm.reset();
        document.getElementById('item-id').value = '';
        //Resetar preview da imagem
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('image-preview').classList.add('hidden');
        //Atualzar o título e o botão de submit
        elements.addItemModal.querySelector('.modal-title').textContent = 'Adicionar Novo Item';
        elements.addItemModal.querySelector('button[type="submit"]').textContent = 'Adicionar Item';

        openModal(elements.addItemModal);
    });

    //Form de adicionar/Editar item
    elements.addItemForm.addEventListener('submit', handleAddEditItem);
    setupImagePreview();
    //Pesquisa
    document.getElementById('search-form').addEventListener('submit', handleSearch);
    //Filtros de ordenação
    elements.categoryButton.forEach(btn => {
        btn.addEventListener('click', () => {
            handleCategoryFilter(btn.dataset.category);
        });
    });

    elements.conditionFilter.addEventListener('change', handleConditionFilter);
    elements.sortFilter.addEventListener('change', handleSortFilter);
    //Fechar modais
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });

    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

//Iniciar aplicação
document.addEventListener('DOMContentLoaded', init);