<?php
require_once __DIR__ . '/../config/db_config.php';

class Item
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllItems()
    {
        $stmt = $this->db->query("
            SELECT i.*, u.name as user_name, u.email as user_email 
            FROM items i 
            JOIN users u ON u.id = i.user_id 
            ORDER BY i.created_at DESC
        ");
        return $stmt->fetchAll();
    }

    public function getItemsByCategory($category)
    {
        $stmt = $this->db->prepare("
            SELECT i.*, u.name as user_name, u.email as user_email 
            FROM items i 
            JOIN users u ON u.id = i.user_id 
            WHERE i.category = ? 
            ORDER BY i.created_at DESC
        ");
        $stmt->execute([$category]);
        return $stmt->fetchAll();
    }

    public function getItemById($id)
    {
        $stmt = $this->db->prepare("
            SELECT i.*, u.name as user_name, u.email as user_email 
            FROM items i 
            JOIN users u ON u.id = i.user_id 
            WHERE i.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getItemsByUserId($userId)
    {
        $stmt = $this->db->prepare("
            SELECT i.*, u.name as user_name, u.email as user_email 
            FROM items i 
            JOIN users u ON u.id = i.user_id 
            WHERE i.user_id = ? 
            ORDER BY i.created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function createItem($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO items (name, description, condition, category, user_id, image) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['name'],
            $data['description'],
            $data['condition'],
            $data['category'],
            $data['user_id'],
            $data['image'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function updateItem($id, $data)
    {
        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            if ($key !== 'id') {
                $fields[] = "$key = ?";
                $values[] = $value;
            }
        }
        $values[] = $id;
        $stmt = $this->db->prepare("
            UPDATE items SET " . implode(', ', $fields) . " WHERE id = ?
        ");
        return $stmt->execute($values);
    }

    public function deleteItem($id, $userId)
    {
        $stmt = $this->db->prepare("DELETE FROM items WHERE id = ? AND user_id = ?");
        return $stmt->execute([$id, $userId]);
    }

    public function searchItems($query)
    {
        $search = "%$query";
        $stmt = $this->db->prepare("
            SELECT i.*, u.name as user_name, u.email as user_email 
            FROM items i 
            JOIN users u ON u.id = i.user_id 
            WHERE i.name LIKE ? OR i.description LIKE ? OR i.category LIKE ? 
            ORDER BY i.created_at DESC
        ");
        $stmt->execute([$search, $search, $search]);
        return $stmt->fetchAll();
    }
}
