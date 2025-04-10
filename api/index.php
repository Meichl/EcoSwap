<?php

header('Content-Type: application/json');

$route = isset($_GET['route']) ? $_GET['route'] : '';

switch ($route) {
    case 'items':
        require_once 'controllers/ItemController.php';
        $controller = new ItemController();
        $controller->handleRequest();
        break;
    case 'users':
        require_once 'controllers/UserController.php';
        $controller = new UserController();
        $controller->handleRequest();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Rota não encontrada']);
}
