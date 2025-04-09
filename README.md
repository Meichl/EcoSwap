# ♻️ EcoSwap – Plataforma de Trocas Sustentáveis
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

**EcoSwap** é uma aplicação web em desenvolvimento que incentiva o consumo consciente e a reutilização de objetos, permitindo que pessoas cadastrem itens que não usam mais e proponham trocas com outros usuários.

Este projeto está sendo construído com foco na prática de desenvolvimento backend, utilizando **PHP** e **JavaScript**.

---

## 🚧 Status do Projeto

> **Em desenvolvimento (MVP)**  
> Funcionalidades básicas sendo implementadas:  
> ✅ Cadastro de usuários  
> ✅ Cadastro e listagem de itens  
> ⏳ Solicitação de troca  
> ⏳ Upload de imagem  
> ⏳ Sistema de avaliação e histórico  

---
## 🗂️ Estrutura do Projeto

ecoswap/  
 ├── api/  
 │├── db.php # Conexão e criação do banco  
 │ ├── items.php # Endpoints para itens  
 │ └── users.php # Endpoints para usuários  
 ├── uploads/ # Diretório para imagens  
 ├── index.html # Interface simples para testes  
 └── script.js # Lógica JS para interações  

---

## ▶️ Como Executar o Projeto Localmente

1. Clone o repositório:  
   ```bash
   git clone https://github.com/seuusuario/ecoswap.git
   cd ecoswap
Inicie o servidor embutido do PHP:  
- php -S localhost:8000
  
Acesse no navegador:
http://localhost:8000

🎯 Objetivos do Projeto
- Praticar a criação de APIs REST com PHP puro
- Trabalhar com banco de dados local (SQLite)
- Criar uma interface simples de consumo via JavaScript
- Desenvolver um projeto com impacto social e sustentável
