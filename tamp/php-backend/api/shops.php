<?php
require_once __DIR__ . '/../config/db.php';
use MongoDB\BSON\ObjectId;

$db = (new Database())->connect();
$shopsCollection = $db->selectCollection('shops');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $cursor = $shopsCollection->find();
        $shops = iterator_to_array($cursor);
        foreach ($shops as &$s) {
            $s['_id'] = (string)$s['_id'];
            if (isset($s['tenantId']) && $s['tenantId'] instanceof ObjectId) {
                $s['tenantId'] = (string)$s['tenantId'];
            }
        }
        echo json_encode($shops);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $result = $shopsCollection->insertOne([
            'shopNumber' => $data->shopNumber,
            'floor' => $data->floor,
            'monthlyRent' => (float)$data->monthlyRent,
            'shopName' => $data->shopName ?? 'Unnamed Shop',
            'occupancyStatus' => 'Vacant',
            'tenantId' => null,
            'createdAt' => new MongoDB\BSON\UTCDateTime()
        ]);
        echo json_encode(["message" => "Shop created", "_id" => (string)$result->getInsertedId()]);
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "ID required"]);
            exit;
        }
        $data = json_decode(file_get_contents("php://input"));
        $updateData = [];
        foreach ($data as $key => $value) {
            if ($key != '_id') $updateData[$key] = $value;
        }
        $shopsCollection->updateOne(
            ['_id' => new ObjectId($id)],
            ['$set' => $updateData]
        );
        echo json_encode(["message" => "Shop updated"]);
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "ID required"]);
            exit;
        }
        $shopsCollection->deleteOne(['_id' => new ObjectId($id)]);
        echo json_encode(["message" => "Shop deleted"]);
        break;
}
?>
