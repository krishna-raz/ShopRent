<?php
require_once __DIR__ . '/../config/db.php';
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

$db = (new Database())->connect();
$depositsCollection = $db->selectCollection('deposittransactions');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $tenantId = $_GET['tenantId'] ?? null;
    $query = [];

    if ($tenantId) {
        $query['tenantId'] = new ObjectId($tenantId);
    }

    $cursor = $depositsCollection->find($query, ['sort' => ['date' => -1]]);
    $transactions = iterator_to_array($cursor);
    foreach ($transactions as &$t) {
        $t['_id'] = (string)$t['_id'];
        $t['tenantId'] = (string)$t['tenantId'];
    }
    echo json_encode($transactions);
}
?>
