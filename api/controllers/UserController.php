<?php
require_once __DIR__ . '/../models/User.php';

class UserController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function handleRequest()
    {
        header('Content-Type: application/json');

        $method = $_SERVER['REQUEST_METHOD'];
        $action = isset($_GET['action']) ? $_GET['action'] : '';

        try {
            switch ($method) {
                case 'GET':
                    $this->handleGetRequest();
                    break;
                case 'POST':
                    if ($action === 'login') {
                        $this->handleLogin();
                    } elseif ($action === 'logout') {
                        $this->handleLogout();
                    } elseif ($action === 'register') {
                        $this->handleRegister();
                    } else {
                        http_response_code(400);
                        echo json_encode(['error' => 'Ação Inválida']);
                    }
                    break;
                case 'PUT':
                    $this->handleUpdateUser();
                    break;
                default:
                    http_response_code(405);
                    echo json_encode(['error' => 'Método não permitido']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro no servidor: ' . $e->getMessage()]);
        }
    }

    public function handleGetRequest()
    {
        session_start();

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Não autenticado']);
            return;
        }

        if (isset($_GET['id'])) {
            $user = $this->userModel->getUserById($_GET['id']);
            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Usuário não encontrado']);
            }
        }
    }

    private function handleLogin()
    {
        $data = json_encode(file_get_contents("php://input"), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email e senha são obrigatórios']);
            return;
        }

        $result = $this->userModel->authenticateUser($data['email'], $data['password']);

        if ($result['status'] === 'ok') {
            session_start();
            $_SESSION['user_id'] = $result['user']['id'];
            $_SESSION['user_name'] = $result['user']['name'];
            $_SESSION['user_email'] = $result['user']['email'];
        } else {
            http_response_code(401);
        }
        echo json_encode($result);
    }

    private function handleLogout()
    {
        session_start();
        session_destroy();
        echo json_encode(['status' => 'ok']);
    }

    private function handleRegister()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['name']) || !isset($data['email']) || !isset($data['passaword'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nome, email e senha são obrigatórios']);
            return;
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email inválido']);
            return;
        }

        if (strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'A senha deve ter pelo menos 6 caracteres']);
            return;
        }

        $result = $this->userModel->createUser(
            $data['name'],
            $data['email'],
            $data['password'],
            isset($data['profile_image']) ? $data['profile_image'] : null
        );

        if (isset($result['error'])) {
            http_response_code(409);
            echo json_encode($result);
            return;
        }

        session_start();
        $_SESSION['user_id'] = $result['user_id'];
        $_SESSION['user_name'] = $data['name'];
        $_SESSION['user_email'] = $data['email'];

        echo json_encode($result);
    }

    private function handleUpdateUser()
    {
        session_start();

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Não autenticado']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email inválido']);
            return;
        }

        if (isset($data['password']) && strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'A senha deve ter pelo menos 6 caracteres']);
            return;
        }

        $success = $this->userModel->updateUser($_SESSION['user_id'], $data);
        if ($success) {
            if (isset($data['name'])) $_SESSION['user_name'] = $data['name'];
            if (isset($data['email'])) $_SESSION['user_email'] = $data['email'];

            echo json_encode(['status' => 'ok']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Falha ao atualizar o usuário']);
        }
    }
}

$userController = new UserController();
$userController->handleRequest();
