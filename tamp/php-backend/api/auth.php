<?php
require_once __DIR__ . '/../config/db.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$db = (new Database())->connect();
$usersCollection = $db->selectCollection('users');
$secret_key = "yoursecretkey";

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = $parts[1] ?? '';

    if ($action == 'login') {
        if (empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(["message" => "Email and password required"]);
            exit;
        }

        $user = $usersCollection->findOne(['email' => $data->email]);

        if ($user && password_verify($data->password, $user->password)) {
            $payload = [
                "iss" => "shoprent",
                "aud" => "shoprent_users",
                "iat" => time(),
                "exp" => time() + (60 * 60 * 24),
                "data" => [
                    "id" => (string)$user->_id,
                    "email" => $user->email,
                    "role" => $user->role ?? 'Admin'
                ]
            ];

            $jwt = JWT::encode($payload, $secret_key, 'HS256');

            echo json_encode([
                "token" => $jwt,
                "user" => [
                    "_id" => (string)$user->_id,
                    "email" => $user->email,
                    "role" => $user->role ?? 'Admin'
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid credentials"]);
        }
    } elseif ($action == 'register') {
        $hashedPassword = password_hash($data->password, PASSWORD_BCRYPT);
        $usersCollection->insertOne([
            'email' => $data->email,
            'password' => $hashedPassword,
            'role' => $data->role ?? 'Admin',
            'createdAt' => new MongoDB\BSON\UTCDateTime()
        ]);
        echo json_encode(["message" => "User registered successfully"]);
    }
}
?>
