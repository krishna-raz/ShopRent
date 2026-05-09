<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// Load vendor autoload first (if composer install was run)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// Load stubs ONLY for IDE support when extension is NOT installed
if (!extension_loaded('mongodb')) {
    require_once __DIR__ . '/stubs/mongodb.php';
    require_once __DIR__ . '/stubs/firebase_jwt.php';
}

require_once __DIR__ . '/config/db.php';

$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/api';
$script_path = dirname($_SERVER['SCRIPT_NAME']);
$script_path = str_replace('\\', '/', $script_path);

// Remove script path from request URI to get API path
$path = parse_url($request_uri, PHP_URL_PATH);
if ($script_path !== '/' && $script_path !== '') {
    $path = str_replace($script_path, '', $path);
}
$path = str_replace($base_path, '', $path);
$parts = explode('/', trim($path, '/'));

$resource = $parts[0] ?? '';
$id = $parts[1] ?? null;

// Determine which API file to include
switch ($resource) {
    case 'auth':
        require_once __DIR__ . '/api/auth.php';
        break;
    case 'shops':
        require_once __DIR__ . '/api/shops.php';
        break;
    case 'tenants':
        require_once __DIR__ . '/api/tenants.php';
        break;
    case 'payments':
        require_once __DIR__ . '/api/payments.php';
        break;
    case 'activity-logs':
        require_once __DIR__ . '/api/activityLogs.php';
        break;
    case 'dashboard':
        require_once __DIR__ . '/api/dashboard.php';
        break;
    case 'deposits':
        require_once __DIR__ . '/api/deposits.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(["message" => "API Endpoint not found", "path" => $path]);
        break;
}
?>
