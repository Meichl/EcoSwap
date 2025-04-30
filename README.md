# ♻️ EcoSwap – Plataforma de Trocas Sustentáveis
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

Tecnologias: PHP | JavaScript | HTML | CSS

EcoSwap é uma aplicação web que promove o consumo consciente e a reutilização de objetos. A plataforma permite que usuários cadastrem itens que não utilizam mais e realizem trocas com outras pessoas da comunidade.

✅ Funcionalidades
Cadastro e autenticação de usuários

Cadastro, edição e listagem de itens para troca

Solicitação de trocas entre usuários

Upload de imagens dos itens

Avaliação de usuários e histórico de trocas  

🧱 Estrutura do Projeto  

ecoswap/  
├── api/  
│   ├── config/   
│   │   └── db_config.php           
│   ├── controllers/    
│   │   ├── ItemController.php       
│   │   └── UserController.php       
│   ├── models/  
│   │   ├── Item.php               
│   │   ├── User.php                
│   │   └── index.php               
├── assets/  
│   ├── css/  
│   │   └── style.css             
│   ├── img/  
│   │   └── logo.png             
│   └── js/  
│       ├── components/  
│       │   ├── Item.js         
│       │   └── User.js          
│       └── app.js                
├── includes/  
│   ├── footer.php                
│   └── header.php              
├── uploads/                        
├── index.html                       
└── README.md

🚀 Como rodar o projeto
Clone o repositório:  
git clone https://github.com/seu-usuario/ecoswap.git  
Configure o banco de dados em api/config/db_config.php  

Suba o projeto em um servidor local (ex: XAMPP ou WAMP)  

Acesse index.html no navegador  

📌 Observações  
Esse projeto foi uma excelente oportunidade para consolidar práticas de desenvolvimento backend, integração com frontend e organização modular de código. Toda a lógica foi separada por camadas (controllers, models, API) com foco em manutenibilidade e clareza.
