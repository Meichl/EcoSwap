<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoSwap - Troque itens de forma sustentável</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>
    <header>
        <div class="container">
            <div class="logo">
                <h1><i class="fas fa-recycle"></i> EcoSwap</h1>
            </div>
            <nav>
                <ul>
                    <li><a href="#" class="active">Itens</a></li>
                    <li><a href="#" id="nav-categories">Categorias</a></li>
                    <li><a href="#" id="nav-about">Sobre</a></li>
                    <li class="auth-section">
                        <!-- Será preenchido via JavaScript dependendo do estado de autenticação -->
                    </li>
                </ul>
            </nav>
            <div class="mobile-toggle">
                <i class="fas fa-bars"></i>
            </div>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <div class="hero-content">
                    <h2>Troque, Reutilize, Sustente</h2>
                    <p>Troque itens que você não usa mais por coisas que precisa. Ajude o planeta reduzindo o desperdício.</p>
                    <div class="search-container">
                        <input type="text" id="search-input" placeholder="Buscar itens...">
                        <button id="search-button"><i class="fas fa-search"></i></button>
                    </div>
                </div>
            </div>
        </section>

        <section class="categories">
            <div class="container">
                <h2>Categorias</h2>
                <div class="category-buttons">
                    <button class="category-btn" data-category="eletrônicos">Eletrônicos</button>
                    <button class="category-btn" data-category="roupas">Roupas</button>
                    <button class="category-btn" data-category="livros">Livros</button>
                    <button class="category-btn" data-category="decoração">Decoração</button>
                    <button class="category-btn" data-category="esportes">Esportes</button>
                    <button class="category-btn" data-category="outros">Outros</button>
                </div>
            </div>
        </section>

        <section class="items">
            <div class="container">
                <div class="section-header">
                    <h2>Itens Disponíveis</h2>
                    <button id="add-item-btn" class="btn">Adicionar Item</button>
                </div>
                <div class="item-filters">
                    <select id="condition-filter">
                        <option value="">Todas as condições</option>
                        <option value="novo">Novo</option>
                        <option value="seminovo">Seminovo</option>
                        <option value="usado">Usado</option>
                        <option value="antigo">Antigo</option>
                    </select>
                    <select id="sort-filter">
                        <option value="newest">Mais recentes</option>
                        <option value="oldest">Mais antigos</option>
                        <option value="name_asc">Nome (A-Z)</option>
                        <option value="name_desc">Nome (Z-A)</option>
                    </select>
                </div>
                <div id="item-list" class="item-grid">
                    <!-- Os itens serão carregados dinamicamente via JavaScript -->
                    <div class="loading-spinner">
                        <i class="fas fa-circle-notch fa-spin"></i>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Modal de Login -->
    <div id="login-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Entrar</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="login-email">Email</label>
                    <input type="email" id="login-email" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Senha</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit" class="btn btn-primary">Entrar</button>
                <p class="form-footer">Não tem uma conta? <a href="#" id="show-register">Registre-se</a></p>
            </form>
        </div>
    </div>

    <!-- Modal de Registro -->
    <div id="register-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Criar Conta</h2>
            <form id="register-form">
                <div class="form-group">
                    <label for="register-name">Nome completo</label>
                    <input type="text" id="register-name" required>
                </div>
                <div class="form-group">
                    <label for="register-email">Email</label>
                    <input type="email" id="register-email" required>
                </div>
                <div class="form-group">
                    <label for="register-password">Senha</label>
                    <input type="password" id="register-password" required>
                    <small>Mínimo de 6 caracteres</small>
                </div>
                <div class="form-group">
                    <label for="register-confirm-password">Confirmar senha</label>
                    <input type="password" id="register-confirm-password" required>
                </div>
                <button type="submit" class="btn btn-primary">Registrar</button>
                <p class="form-footer">Já possui uma conta? <a href="#" id="show-login">Entrar</a></p>
            </form>
        </div>
    </div>

    <!-- Modal de Adicionar Item -->
    <div id="add-item-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Adicionar Novo Item</h2>
            <form id="add-item-form">
                <div class="form-group">
                    <label for="item-name">Nome do item</label>
                    <input type="text" id="item-name" required>
                </div>
                <div class="form-group">
                    <label for="item-description">Descrição</label>
                    <textarea id="item-description" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="item-condition">Condição</label>
                    <select id="item-condition" required>
                        <option value="">Selecione</option>
                        <option value="novo">Novo</option>
                        <option value="seminovo">Seminovo</option>
                        <option value="usado">Usado</option>
                        <option value="antigo">Antigo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="item-category">Categoria</label>
                    <select id="item-category" required>
                        <option value="">Selecione</option>
                        <option value="eletrônicos">Eletrônicos</option>
                        <option value="roupas">Roupas</option>
                        <option value="livros">Livros</option>
                        <option value="decoração">Decoração</option>
                        <option value="esportes">Esportes</option>
                        <option value="outros">Outros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="item-image">Imagem (opcional)</label>
                    <input type="file" id="item-image" accept="image/*">
                    <div id="image-preview" class="image-preview"></div>
                </div>
                <button type="submit" class="btn btn-primary">Adicionar Item</button>
            </form>
        </div>
    </div>

    <!-- Modal de Detalhes do Item -->
    <div id="item-details-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="item-details-content">
                <!-- Conteúdo será carregado dinamicamente -->
            </div>
        </div>
    </div>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <h3><i class="fas fa-recycle"></i> EcoSwap</h3>
                    <p>Troque itens de forma sustentável</p>
                </div>
                <div class="footer-links">
                    <h4>Links</h4>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Sobre</a></li>
                        <li><a href="#">Termos de Uso</a></li>
                        <li><a href="#">Privacidade</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h4>Contato</h4>
                    <p><i class="fas fa-envelope"></i> contato@ecoswap.com.br</p>
                    <div class="social-icons">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 EcoSwap. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>

    <script src="assets/js/app.js" type="module"></script>
</body>

</html>