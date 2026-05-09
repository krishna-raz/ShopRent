<?php
require_once __DIR__ . '/../config/db.php';
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

$db = (new Database())->connect();
$paymentsCollection = $db->selectCollection('payments');
$transactionsCollection = $db->selectCollection('paymenttransactions');
$tenantsCollection = $db->selectCollection('tenants');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->tenantId) || empty($data->month) || !isset($data->paidAmount)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data"]);
        exit;
    }

    try {
        $amount = (float)$data->paidAmount;
        $month = $data->month;
        $paymentMode = $data->paymentMode ?? 'Cash';
        $notes = $data->notes ?? '';
        $paymentDate = !empty($data->paymentDate) ? new UTCDateTime(strtotime($data->paymentDate) * 1000) : new UTCDateTime();

        $tenant = $tenantsCollection->findOne(['_id' => new ObjectId($data->tenantId)]);
        if (!$tenant) {
            throw new Exception("Tenant not found");
        }

        $rentAmount = (float)$tenant->rentAmount;
        $totalPaid = $amount;
        $payment = $paymentsCollection->findOne(['tenantId' => new ObjectId($data->tenantId), 'month' => $month]);

        if ($payment) {
            $totalPaid = (float)$payment->paidAmount + $amount;
            $dueAmount = max(0, $rentAmount - $totalPaid);
            $status = ($totalPaid >= $rentAmount) ? 'Paid' : (($totalPaid > 0) ? 'Partial' : 'Pending');

            $paymentsCollection->updateOne(
                ['_id' => $payment->_id],
                ['$set' => [
                    'paidAmount' => $totalPaid,
                    'dueAmount' => $dueAmount,
                    'status' => $status,
                    'paymentDate' => $paymentDate,
                    'paymentMode' => $paymentMode
                ]]
            );
            $paymentId = $payment->_id;
        } else {
            $dueAmount = max(0, $rentAmount - $totalPaid);
            $status = ($totalPaid >= $rentAmount) ? 'Paid' : (($totalPaid > 0) ? 'Partial' : 'Pending');

            $result = $paymentsCollection->insertOne([
                'tenantId' => new ObjectId($data->tenantId),
                'tenantName' => $tenant->tenantName,
                'shopNumber' => $tenant->shopNumber,
                'month' => $month,
                'rentAmount' => $rentAmount,
                'paidAmount' => $totalPaid,
                'dueAmount' => $dueAmount,
                'status' => $status,
                'paymentDate' => $paymentDate,
                'paymentMode' => $paymentMode,
                'notes' => $notes
            ]);
            $paymentId = $result->getInsertedId();
        }

        $transactionsCollection->insertOne([
            'paymentId' => $paymentId,
            'tenantId' => new ObjectId($data->tenantId),
            'tenantName' => $tenant->tenantName,
            'shopNumber' => $tenant->shopNumber,
            'month' => $month,
            'rentAmount' => $rentAmount,
            'transactionAmount' => $amount,
            'paidAmount' => $totalPaid,
            'remainingDue' => $dueAmount,
            'paymentMode' => $paymentMode,
            'status' => $status,
            'notes' => $notes,
            'date' => $paymentDate
        ]);

        echo json_encode([
            "message" => "Payment recorded successfully",
            "_id" => (string)$paymentId,
            "totalPaid" => $totalPaid,
            "dueAmount" => $dueAmount,
            "status" => $status
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
} elseif ($method == 'GET') {
    $action = $parts[1] ?? '';

    if ($action == 'transactions') {
        $cursor = $transactionsCollection->find([], ['sort' => ['date' => 1]]);
        $transactions = iterator_to_array($cursor);
        foreach ($transactions as &$t) {
            $t['_id'] = (string)$t['_id'];
            $t['tenantId'] = (string)$t['tenantId'];
        }
        echo json_encode($transactions);
    } elseif ($action == 'pending-dues') {
        $cursor = $paymentsCollection->find(['status' => ['$ne' => 'Paid']], ['sort' => ['paymentDate' => -1]]);
        echo json_encode(iterator_to_array($cursor));
    } else {
        $query = [];
        if (!empty($_GET['tenantId'])) $query['tenantId'] = new ObjectId($_GET['tenantId']);
        if (!empty($_GET['status'])) $query['status'] = $_GET['status'];
        if (!empty($_GET['month'])) $query['month'] = $_GET['month'];

        $cursor = $paymentsCollection->find($query, ['sort' => ['paymentDate' => -1]]);
        $payments = iterator_to_array($cursor);
        foreach ($payments as &$p) {
            $p['_id'] = (string)$p['_id'];
        }
        echo json_encode($payments);
    }
}
?>
