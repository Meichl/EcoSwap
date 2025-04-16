/**
 * Componente para lidar com a renderização e interação de usuários.
 */
export class UserComponent {
    /**
     * Cria formulário de login
     * @param {Function} onSubmit - Função a ser chamada ao fazer login
     * @returns {HTMLElement} - Elemento DOM do formulário de login
     */
    static createLoginForm(onSubmit) {
        const form = document.createElement('form');
        form.id = 'login-form';
        form.className = 'auth-form';

        form.innerHTML = `
            <div class="form-group">
                <label for="login-email">Email</label>
                <input type="email" id="login-email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="login-password">Senha</label>
                <input type="password" id="login-password" name="password" required>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn">Entrar</button>
            </div>
            
            <div class="form-alternate">
                <p>Não tem uma conta? <a href="#" id="go-to-register">Cadastre-se</a></p>
            </div>
        `;
        if (typeof onSubmit === 'function') {
            form.addEventListener('submit', onSubmit);
        }
        return form
    }

    /**
     *  Cria formulário de registro
     * @param {Function} onSubmit - Função de callback para submissão
     * @returns {HTMLElement} - Elemento DOM do formulário
     */
    static createRegisterForm(onSubmit) {
        const form = document.createElement('form');
        form.id = 'register-form';
        form.className = 'auth-form';

        form.innerHTML = `
                        <div class="form-group">
                <label for="register-name">Nome completo</label>
                <input type="text" id="register-name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="register-email">Email</label>
                <input type="email" id="register-email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="register-password">Senha</label>
                <input type="password" id="register-password" name="password" required minlength="6">
            </div>
            
            <div class="form-group">
                <label for="register-confirm-password">Confirme a senha</label>
                <input type="password" id="register-confirm-password" name="confirm_password" required minlength="6">
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn">Cadastrar</button>
            </div>
            
            <div class="form-alternate">
                <p>Já tem uma conta? <a href="#" id="go-to-login">Entrar</a></p>
            </div>
        `;
        if (typeof onSubmit === 'function') {
            form.addEventListener('submit', onSubmit);
        }
        return form;
    }

    /**
     * Cria área do usuário logado
     * @param {Object} user - Dados do usuário
     * @param {Function} onLogout - Função a ser chamada ao fazer logout
     * @returns {HTMLElement} - Elemento DOM da área do usuário
     */
    static createUserMenu(user, onLogout) {
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';

        userMenu.innerHTML = `
            <div class="user-info">
                <span>Olá, ${user.name}</span>
            </div>
            <div class="user-actions">
                <button id="my-items-btn" class="btn btn-small">Meus Itens</button>
                <button id="my-swaps-btn" class="btn btn-small">Minhas Trocas</button>
                <button id="logout-btn" class="btn btn-small">Sair</button>
            </div>
        `;

        if (typeof onLogout === 'function') {
            userMenu.querySelector('#logout-btn').addEventListener('click', onLogout);
        }
        return userMenu;
    }

    /**
     * Renderiza perfil do usuário
     * @param {Object} user - Dados do usuário
     * @param {Array} items - Lista de itens do usuário
     * @returns {HTMLElement} - Elemento DOM do perfil do usuário
     */
    static renderUserProfile(user, items = []) {
        const profileElement = document.createElement('div');
        profileElement.className = 'user-profile';

        profileElement.innerHTML = `
            <div class="profile-header">
                <h2>Perfil de ${user.name}</h2>
                <p>Membro desde: ${new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div class="profile-stats">
                <div class="stat-card">
                    <div class="stat-number">${items.length}</div>
                    <div class="stat-label">Itens Oferecidos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${user.swap_count || 0}</div>
                    <div class="stat-label">Trocas Realizadas</div>
                </div>
            </div>
            
            <div class="profile-items">
                <h3>Meus Itens</h3>
                <div class="items-grid" id="user-items-grid">
                    ${items.length === 0 ? '<p class="no-items">Você ainda não adicionou nenhum item.</p>' : ''}
                </div>
            </div>
        `;

        if (items.length > 0) {
            const itemsGrid = profileElement.querySelector('#user-items-grid');
            items.forEach(item => {
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';
                itemCard.dataset.id = item.id;

                itemCard.innerHTML = `
                    <div class="item-image">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div class="no-image"><i class="fas fa-image"></i></div>'}
                    </div>
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <div class="item-meta">
                            <span class="item-condition">${item.condition}</span>
                            <span class="item-category">${item.category}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small btn-edit" data-id="${item.id}">Editar</button>
                        <button class="btn btn-small btn-delete" data-id="${item.id}">Excluir</button>
                    </div>
                `;
                itemsGrid.appendChild(itemCard);
            });
        }
        return profileElement;
    }

    /**
     * Renderiza sistema de gerenciamento de trocas
     * @param {Array} proposals - proposta de troca
     * @param {Array} receivedProposals - propostas recebidas
     * @returns {HTMLElement} - Elemento DOM do sistema de gerenciamento de trocas
     */
    static renderSwapManagement(proposals = [], receivedProposals = []) {
        const swapElement = document.createElement('div');
        swapElement.className = 'swap-management';

        swapElement.innerHTML = `
            <div class="swap-tabs">
                <button class="tab-btn active" data-tab="received">Propostas Recebidas (${receivedProposals.length})</button>
                <button class="tab-btn" data-tab="sent">Propostas Enviadas (${proposals.length})</button>
            </div>
            
            <div class="swap-content">
                <div class="tab-content active" id="received-tab">
                    ${this.renderProposalList(receivedProposals, 'received')}
                </div>
                <div class="tab-content" id="sent-tab">
                    ${this.renderProposalList(proposals, 'sent')}
                </div>
            </div>
        `;

        const tabButtons = swapElement.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                //Remover classe ativa de todos os botões e conteudos
                tabButtons.forEach(b => b.classList.remove('active'));
                swapElement.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                //Adicionar classe ativa ao botao clidado e ao conteudo correspondente
                btn.classList.add('active');
                swapElement.querySelector(`#${btn.dataset.tab}-tab`).classList.add('active');
            });
        });
        return swapElement;
    }

    /**
     * Renderiza lista de propostas de troca
     * @param {Array} proposals - Lista de propostas
     * @param {string} type - Tipo da lista ('sent' ou 'received')
     * @returns {string} - HTML da lista
     */
    static renderProposalList(proposals, type) {
        if (proposals.length === 0) {
            return `<p class="no-proposals">Nenhuma proposta ${type === 'sent' ? 'enviada' : 'recebida'}.</p>`;
        }

        const proposalsHtml = proposals.map(proposal => `
            <div class="proposal-card" data-id="${proposal.id}">
                <div class="proposal-items">
                    <div class="proposal-item">
                        <h4>${type === 'sent' ? 'Você ofereceu:' : 'Seu item:'}</h4>
                        <div class="item-card mini">
                            <div class="item-image">
                                ${proposal.user_item_image ? `<img src="${proposal.user_item_image}" alt="${proposal.user_item_name}">` : '<div class="no-image"><i class="fas fa-image"></i></div>'}
                            </div>
                            <div class="item-info">
                                <h5>${proposal.user_item_name}</h5>
                            </div>
                        </div>
                    </div>
                    
                    <div class="proposal-arrow">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    
                    <div class="proposal-item">
                        <h4>${type === 'sent' ? 'Por:' : 'Proposta de troca por:'}</h4>
                        <div class="item-card mini">
                            <div class="item-image">
                                ${proposal.item_image ? `<img src="${proposal.item_image}" alt="${proposal.item_name}">` : '<div class="no-image"><i class="fas fa-image"></i></div>'}
                            </div>
                            <div class="item-info">
                                <h5>${proposal.item_name}</h5>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="proposal-info">
                    <p class="proposal-date">Proposta ${type === 'sent' ? 'enviada' : 'recebida'} em: ${new Date(proposal.created_at).toLocaleDateString('pt-BR')}</p>
                    <p class="proposal-status status-${proposal.status}">${this.getStatusLabel(proposal.status)}</p>
                </div>
                
                <div class="proposal-actions">
                    ${type === 'received' && proposal.status === 'pending' ? `
                        <button class="btn btn-small btn-accept" data-id="${proposal.id}">Aceitar</button>
                        <button class="btn btn-small btn-reject" data-id="${proposal.id}">Recusar</button>
                    ` : type === 'sent' && proposal.status === 'pending' ? `
                        <button class="btn btn-small btn-cancel" data-id="${proposal.id}">Cancelar</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        return proposalsHtml;
    }
    /**
     * Obtém o rótulo do status da proposta
     * @param {string} status - Status da proposta
     * @return {string} - Rótulo do status
     */
    static getStatusLabel(status) {
        const labels = {
            'pending': 'Pendente',
            'accepted': 'Aceita',
            'rejected': 'Recusada',
            'canceled': 'Cancelada',
            'completed': 'Concluída'
        };
        return labels[status] || status;
    }
}