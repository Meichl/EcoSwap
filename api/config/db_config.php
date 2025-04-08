<?php

class Database
{
    private static $instance = null;
    private $pdo;

    private function __construct()
    {
        try {
            $this->pdo = new PDO("sqlite:" . dirname(dirname(__DIR__)) . "/data/ecoswap.db");
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            //Criar tabelas caso não existam:
            $this->initDatabase();
        } catch (PDOException $e) {
            die("Erro na conexão: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->pdo;
    }

    private function initDatabase()
    {
        $this->pdo->exec(
            "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                profile_image TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                condition TEXT CHECK(condition IN ('novo', 'seminovo', 'usado', 'antigo')) NOT NULL,
                category TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                image TEXT,
                status TEXT DEFAULT 'disponível' CHECK(status IN ('disponível', 'reservado', 'trocado')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            
            CREATE TABLE IF NOT EXISTS swap_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id INTEGER NOT NULL,
                requested_item_id INTEGER NOT NULL,
                offered_item_id INTEGER NOT NULL,
                status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'aceito', 'rejeitado')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(requester_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(requested_item_id) REFERENCES items(id) ON DELETE CASCADE,
                FOREIGN KEY(offered_item_id) REFERENCES items(id) ON DELETE CASCADE
            );
        "
        );
    }
}

$uploadsDir = dirname(dirname(__DIR__)) . "/uploads/items/";
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}
