<?php
require_once __DIR__ . '/../config/db_config.php';

class User
{
    private $db;

    public function __construct()
    {
        $this->db->Database::getInstance()->getConnection();
    }

    public function createUser($name, $email, $password, $profile_image = null)
    {
        $stmt = $this->db->prepare("SELECT COUNT (*) FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetchColumn() > 0) {
            return ['error' => 'Email já está em uso'];
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $this->db->prepare("
            INSERT INTO users (name, email, password, profile_image)
            VALUES (?, ?, ?, ?)
        ");

        $stmt->execute([$name, $email, $password, $profile_image]);

        return [
            'user_id' => $this->db->lastInsertId(),
            'status' => 'ok'
        ];
    }

    public function getUserById($id)
    {
        $stmt = $this->db->prepare("SELECT id, name, email, profile_image, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function authenticateUser($email, $password)
    {
        $stmt = $this->db->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']);
            return ['status' => 'ok', 'user' => $user];
        }
        return ['status' => 'error', 'message' => 'Credenciais Inválidas'];
    }

    public function updateUser($id, $data)
    {
        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            if ($key === 'password') {
                $fields[] = "$key = ?";
                $values[] = password_hash($value, PASSWORD_DEFAULT);
            } elseif ($key !== 'id') {
                $fields[] = "$key = ?";
                $value[] = $value;
            }
        }
        $values[] = $id;
        $stmt = $this->db->prepare("
            UPDATE users SET " . implode(',', $fields) . "WHERE id = ?
            ");

        return $stmt->execute($values);
    }
}
