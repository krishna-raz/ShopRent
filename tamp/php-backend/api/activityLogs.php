<?php
require_once __DIR__ . '/../config/db.php';
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

$db = (new Database())->connect();
$logsCollection = $db->selectCollection('activitylogs');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $cursor = $logsCollection->find([], ['sort' => ['createdAt' => -1], 'limit' => 50]);
    $logs = iterator_to_array($cursor);
    foreach ($logs as &$l) {
        $l['_id'] = (string)$l['_id'];
    }
    echo json_encode($logs);
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $logsCollection->insertOne([
        'action' => $data->action,
        'description' => $data->description,
        'entityType' => $data->entityType ?? 'System',
        'entityId' => !empty($data->entityId) ? new ObjectId($data->entityId) : null,
        'performedBy' => !empty($data->performedBy) ? new ObjectId($data->performedBy) : null,
        'createdAt' => new UTCDateTime()
    ]);
    echo json_encode(["message" => "Activity logged"]);
}
?>
