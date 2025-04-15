/**
 * Componente para lidar com renderização e interação de itens.
 */
export class ItemComponent{
    /**
     * Cria um card de item para a listagem
     * @param {Object} item - Dados do item
     * @returns {HTMLElement} - Elemento DOM do card
     */
    static createItemCard(item) {
        //Criar elemento do card
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.dataset.id = item.id;

        //HTML do card
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
                <div class="item-user">
                    <small>Oferecido por: ${item.user_name}</small>
                </div>
            </div>
        `;

        return itemCard;
    }

    /**
     * Cria um card de item para seleção em uma troca
     * @param{Object} item - Dados do item
     * @param{Function} onSelect - Função a ser chamada ao selecionar
     * @returns{HTMLElement} - Elemento DOM do card
     */

    static createSelectableItemCard(item, onSelect) {
        const itemCard = this.createItemCard(item);
        itemCard.classList.add('selectable');

        //Adicionar evento de seleção
        itemCard.addEventListener('click', () => {
            if (typeof onSelect === 'function') {
                onSelect(item);
            }
        });
        return itemCard;
    }

    /**
     * Cria formulário para adicionar/editar item
     * @param {Object} item - Dados do item (opcional)
     * @returns {HTMLElement} - Elemento DOM do formulário
     */
    static createItemForm(item = null){
        const form = document.createElement('form');
        form.id = 'item-form';
        form.className = 'item-form';

        //Definir se é adição ou edição
        const isEdit = item !== null;
        form.innerHTML = `
            <input type="hidden" id="item-id" name="id" value="${isEdit ? item.id : ''}">
            
            <div class="form-group">
                <label for="item-name">Nome do Item*</label>
                <input type="text" id="item-name" name="name" required value="${isEdit ? item.name : ''}">
            </div>
            
            <div class="form-group">
                <label for="item-description">Descrição*</label>
                <textarea id="item-description" name="description" rows="5" required>${isEdit ? item.description : ''}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="item-category">Categoria*</label>
                    <select id="item-category" name="category" required>
                        <option value="" disabled ${!isEdit ? 'selected' : ''}>Selecione</option>
                        <option value="roupas" ${isEdit && item.category === 'roupas' ? 'selected' : ''}>Roupas</option>
                        <option value="eletronicos" ${isEdit && item.category === 'eletronicos' ? 'selected' : ''}>Eletrônicos</option>
                        <option value="livros" ${isEdit && item.category === 'livros' ? 'selected' : ''}>Livros</option>
                        <option value="moveis" ${isEdit && item.category === 'moveis' ? 'selected' : ''}>Móveis</option>
                        <option value="decoracao" ${isEdit && item.category === 'decoracao' ? 'selected' : ''}>Decoração</option>
                        <option value="outros" ${isEdit && item.category === 'outros' ? 'selected' : ''}>Outros</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="item-condition">Estado*</label>
                    <select id="item-condition" name="condition" required>
                        <option value="" disabled ${!isEdit ? 'selected' : ''}>Selecione</option>
                        <option value="novo" ${isEdit && item.condition === 'novo' ? 'selected' : ''}>Novo</option>
                        <option value="seminovo" ${isEdit && item.condition === 'seminovo' ? 'selected' : ''}>Seminovo</option>
                        <option value="usado" ${isEdit && item.condition === 'usado' ? 'selected' : ''}>Usado</option>
                        <option value="antigo" ${isEdit && item.condition === 'antigo' ? 'selected' : ''}>Antigo</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="item-image">Imagem do Item</label>
                <input type="file" id="item-image" name="image" accept="image/*">
                
                <div id="image-preview" class="${isEdit && item.image ? '' : 'hidden'}">
                    ${isEdit && item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn">${isEdit ? 'Atualizar Item' : 'Adicionar Item'}</button>
            </div>
        `;

        //Configurar visualização previa da imagem
        const setupPreview = () => {
            const imageInput = form.querySelector('#item-image');
            const previewContainer = form.querySelector('#image-preview');

            imageInput.addEventListener('change', () => {
                if (imageInput.files.lenght === 0){
                    previewContainer.innerHTML = '';
                    previewContainer.classList.add('hidden');
                    return;
                }

                const file = imageInput.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewContainer.innerHTML = `<img src="${e.target.result}" alt="Prévia">`;
                    previewContainer.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            });
        };
        //Configurar preview após adicionar formulario ao DOM
        setTimeout(setupPreview, 0);
        return form;
    }

    /**
     * Formata a data para exibição
     * @param {string} dateString - String da data
     * @returns {string} - Data formatada
     */
    static formatDate(dateString){
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    /**
     * Renderiza detalhes completos de um item
     * @param {Object} item - Dados do item
     * @param {Object} currentUser - usuário atual
     * @return {HTMLElement} - Elemento DOM do card de detalhes
     */

    static renderItemDetails(item, currentUser) {
        const detailsElement = document.createElement('div');
        detailsElement.className = 'item-detail';

        const isOwner = currentUser && currentUser.id === item.user_id;

        detailsElement.innerHTML = `
                        <div class="item-detail-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div class="no-image"><i class="fas fa-image"></i></div>'}
            </div>
            <div class="item-detail-info">
                <h3>${item.name}</h3>
                <div class="item-detail-meta">
                    <span class="item-condition">${item.condition}</span>
                    <span class="item-category">${item.category}</span>
                    <span class="item-date">Publicado em: ${this.formatDate(item.created_at)}</span>
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
                    ` : currentUser ? `
                        <button class="btn btn-swap" data-id="${item.id}">Propor Troca</button>
                    ` : `
                        <button class="btn" id="login-to-swap">Entre para propor troca</button>
                    `}
                </div>
            </div>
        `;
        return detailsElement;
    }
}