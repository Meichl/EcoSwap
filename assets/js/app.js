import {ItemComponent} from './components/Item.js';
import {UserComponent} from './components/User.js';

const state = {
    currentUser: null,
    item: [],
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

function init(){
    //Verifica se usuário já está logado
    checkAuthStatus();
    //Load dos items
    loadItems();
    //Config eventos
    setupEventListeners();
}

async function checkAuthStatus(){
    try{
        const responde = await fetch(API.users, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (responde.ok){
            const userData = await responde.json();
            state.currentUser = userData;
            updateAuthUI();
            elements.addItemBtn.classList.remove('hidden');
        } else {
            state.currentUser = null;
            updateAuthUI();
            elements.addItemBtn.classList.add('hidden');
        }
    } catch (error){
        console.error('Erro ao verificar autenticação: ', error)
        state.currentUser = null;
        updateAuthUI();
        elements.addItemBtn.classList.add('hidden');
    }
}

function updateAuthUI(){
    if (state.currentUser){
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

async function loadItems(){
    state.isLoading = true;
    updateItemsUI();

    try{
        let endpoint = API.items;

        if (state.currentCategory){
            endpoint += `&action=search&q=${state.searchQuery}`;
        }

        const responde = await fetch(endpoint);
        const items = await responde.json();

        state.items = items;

        applyFilters();
    } catch (error) {
        console.error('Erro ao carregar itens: ', error);
        state.items = [];
        state.filteredItems =[];
    } finally {
        state.isLoading = false;
        updateItemsUI();
    }
}

function applyFilters(){
    let filteredItems = [...state.items];

    if (state.currentCondition){
        filteredItems = filteredItems.filter(item => item.condition === state.currentCondition);
    }

    switch (state.currentSort) {
        case 'newest':
            filteredItems.sort((a, b) => new Date(b.created_at)  - new Date(a.created_at));
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

function updateItemsUI(){
    if (state.isLoading) {
        elements.itemList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
            </div>
        `;
        return;
    }

    if (state.filteredItems.length === 0){
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

function showItemDetails(item){
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
    if (isOwner){
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
            openModal(elements,loginModal);
        });
    }
    //Abrir modal de detalhes
    openModal(elements.itemDetailsModal);
}