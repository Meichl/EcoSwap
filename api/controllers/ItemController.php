<?php
require_once __DIR__ . '/../models/Item.php';

class ItemController
{
    private $itemModel;

    public function __construct()
    {
        $this->itemModel = new Item();
    }

    public function handleRequest()
    {
        header('Content-Type: application/json');
        //Verifica autenticidade do usuario
        session_start();
        $method = $_SERVER['REQUEST_METHOD'];
        $action = isset($_GET['action']) ? $_GET['action'] : '';

        try {
            switch ($method) {
                case 'GET':
                    $this->handleGetRequest($action);
                    break;

                case 'POST':
                    $this->handlePostRequest($action);
                    break;

                case 'PUT':
                    $this->handlePutRequest();
                    break;

                case 'DELETE':
                    $this->handleDeleteRequest();
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

    private function handleGetRequest($action)
    { //Função de puxar os dados
        if ($action === 'search' && isset($_GET['q'])) {
            $items = $this->itemModel->searchItems($_GET['q']);
            echo json_encode($items);
        } elseif ($action === 'category' && isset($_GET['category'])) {
            $items = $this->itemModel->getItemsByCategory($_GET['category']);
            echo json_encode($items);
        } elseif ($action === 'user' && isset($_GET['userId'])) {
            $items = $this->itemModel->getItemsByUserId($_GET['userId']);
            echo json_encode($items);
        } elseif (isset($_GET['id'])) {
            $item = $this->itemModel->getItemById($_GET['id']);
            if ($item) {
                echo json_encode($item);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Item não encontrado']);
            }
        } else {
            $items = $this->itemModel->getAllItems();
            echo json_encode($items);
        }
    }

    private function handlePostRequest($action)
    {
        //Verificar autenticacao
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode((['error' => 'Não autenticado']));
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        //Upload de arquivo
        if ($action === 'upload' && isset($_FILES['image'])) {
            $uploadResult = $this->handleImageUpload();
            echo json_encode($uploadResult);
            return;
        }

        //Validar dados
        if (!isset($data['name']) || empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nome do item é obrigatório']);
            return;
        }

        $data['user_id'] = $_SESSION['user_id'];

        //Criar item
        $itemId = $this->itemModel->createItem($data);
        echo json_encode(['status' => 'ok', 'item_id' => $itemId]);
    }

    private function handlePutRequest()
    {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Não autenticado']);
            return;
        }

        parse_str(file_get_contents("php://input"), $data);
        $dataPut = json_decode(file_get_contents("php://input"), true);

        if (empty($dataPut) && isset($data)) {
            $dataPut = $data;
        }

        if (!isset($dataPut['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID do item é obrigatório']);
            return;
        }

        //Verificar se o usuário é dono do item
        $item = $this->itemModel->getItemById($dataPut['id']);
        if (!$item || $item['user_id'] != $_SESSION['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Não autorizado a editar esse item']);
            return;
        }
        // atualizar o item
        $sucess = $this->itemModel->updateItem($dataPut['id'], $dataPut);

        if ($sucess) {
            echo json_encode(['status' => 'ok']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Falha ao atualizar o item']);
        }
    }

    private function handleDeleteRequest()
    {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Não autenticado']);
            return;
        }

        //Obter id do item
        $id = isset($_GET['id']) ? $_GET['id'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID do item é obrigatório']);
            return;
        }
        // Excluir item apenas se pertencer ao proprio usuario
        $sucess = $this->itemModel->deleteItem($id, $_SESSION['user_id']);

        if ($sucess) {
            echo json_encode(['status' => 'ok']);
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'Não autorizado a excluir esse item']);
        }
    }

    private function handleImageUpload()
    {
        global $uploadsDir;

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return ['error' => 'Erro no upload do arquivo'];
        }

        $file = $_FILES['image'];
        $fileName = time() . '_' . basename($file['name']);
        $targetPath = $uploadsDir . $fileName;

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileType = mime_content_type($file['tmp_name']);

        if (!in_array($fileType, $allowedTypes)) {
            return ['error' => 'Formato de arquivo não permitido. Use .jpeg, .png e .gif'];
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            return ['error' => 'Arquivo muito grande. Limite de 5Mb'];
        }

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return [
                'status' => 'ok',
                'image_path' => 'uploads/items' . $fileName
            ];
        } else {
            return ['error' => 'Falha ao salvar arquivo'];
        }
    }
}

$itemController = new ItemController();
$itemController->handleRequest();
