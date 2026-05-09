<?php
require_once __DIR__ . '/../config/db.php';

$db = (new Database())->connect();
$shopsCollection = $db->selectCollection('shops');
$tenantsCollection = $db->selectCollection('tenants');
$paymentsCollection = $db->selectCollection('payments');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $action = $parts[1] ?? '';

    $totalShops = $shopsCollection->countDocuments();
    $occupiedShops = $shopsCollection->countDocuments(['occupancyStatus' => 'Occupied']);
    $totalTenants = $tenantsCollection->countDocuments(['status' => 'Active']);
    $allTenants = $tenantsCollection->find()->toArray();
    $inactiveTenants = count(array_filter($allTenants, fn($t) => $t->status === 'Inactive'));
    $activeDeposits = $tenantsCollection->countDocuments(['depositStatus' => 'Active']);

    $totalDepositsHeld = 0;
    $totalRefundableAmount = 0;
    foreach ($tenantsCollection->find(['depositStatus' => 'Active']) as $t) {
        $totalDepositsHeld += (float)($t->securityDeposit ?? 0);
        $totalRefundableAmount += (float)($t->refundableAmount ?? 0);
    }

    $monthlyRevenue = 0;
    foreach ($paymentsCollection->find(['status' => ['$in' => ['Paid', 'Partial']]]) as $p) {
        $monthlyRevenue += (float)$p->paidAmount;
    }

    $totalPendingDues = 0;
    foreach ($paymentsCollection->find(['status' => ['$ne' => 'Paid']]) as $p) {
        $totalPendingDues += (float)$p->dueAmount;
    }

    if ($action == 'stats') {
        echo json_encode([
            "totalShops" => $totalShops,
            "occupiedShops" => $occupiedShops,
            "vacantShops" => $totalShops - $occupiedShops,
            "totalTenants" => $totalTenants,
            "monthlyRevenue" => $monthlyRevenue,
            "totalPendingDues" => $totalPendingDues
        ]);
    } else {
        $recentActivities = $db->selectCollection('activitylogs')->find([], ['sort' => ['createdAt' => -1], 'limit' => 10])->toArray();
        $recentPayments = $paymentsCollection->find([], ['sort' => ['paymentDate' => -1], 'limit' => 5])->toArray();

        echo json_encode([
            "deposits" => [
                "totalDepositsHeld" => $totalDepositsHeld,
                "totalRefundableAmount" => $totalRefundableAmount,
                "totalRefunded" => 0,
                "activeDepositsCount" => $activeDeposits
            ],
            "shops" => [
                "total" => $totalShops,
                "occupied" => $occupiedShops,
                "vacant" => $totalShops - $occupiedShops
            ],
            "tenants" => [
                "total" => count($allTenants),
                "active" => $totalTenants,
                "inactive" => $inactiveTenants
            ],
            "financial" => [
                "monthlyRevenue" => $monthlyRevenue,
                "totalPendingDues" => $totalPendingDues
            ],
            "recentActivities" => $recentActivities,
            "recentPayments" => $recentPayments
        ]);
    }
}
?>
