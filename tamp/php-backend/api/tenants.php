<?php
require_once __DIR__ . '/../config/db.php';
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

$db = (new Database())->connect();
$tenantsCollection = $db->selectCollection('tenants');
$shopsCollection = $db->selectCollection('shops');
$depositTransactionsCollection = $db->selectCollection('deposittransactions');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if ($id) {
            $tenant = $tenantsCollection->findOne(['_id' => new ObjectId($id)]);
            if ($tenant) {
                $tenant['_id'] = (string)$tenant['_id'];
                $tenant['shopId'] = (string)$tenant['shopId'];
                echo json_encode($tenant);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Tenant not found"]);
            }
        } else {
            $cursor = $tenantsCollection->find();
            $tenants = iterator_to_array($cursor);
            foreach ($tenants as &$t) {
                $t['_id'] = (string)$t['_id'];
                $t['shopId'] = (string)$t['shopId'];
            }
            echo json_encode($tenants);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        // 1. Create Tenant
        $tenantResult = $tenantsCollection->insertOne([
            'tenantName' => $data->tenantName,
            'phone' => $data->phone,
            'aadhaar' => $data->aadhaar ?? '',
            'address' => $data->address ?? '',
            'shopId' => new ObjectId($data->shopId),
            'shopNumber' => $data->shopNumber,
            'rentAmount' => (float)$data->rentAmount,
            'joiningDate' => new UTCDateTime(strtotime($data->joiningDate) * 1000),
            'securityDeposit' => (float)$data->securityDeposit,
            'refundableAmount' => (float)$data->securityDeposit,
            'depositStatus' => 'Active',
            'depositDate' => new UTCDateTime(),
            'status' => 'Active',
            'createdAt' => new UTCDateTime()
        ]);

        $newTenantId = $tenantResult->getInsertedId();

        // 2. Update Shop
        $shopsCollection->updateOne(
            ['_id' => new ObjectId($data->shopId)],
            ['$set' => [
                'occupancyStatus' => 'Occupied',
                'tenantId' => $newTenantId
            ]]
        );

        // 3. Record Deposit Transaction
        $depositTransactionsCollection->insertOne([
            'tenantId' => $newTenantId,
            'tenantName' => $data->tenantName,
            'shopNumber' => $data->shopNumber,
            'type' => 'Collection',
            'amount' => (float)$data->securityDeposit,
            'reason' => 'Initial deposit on tenant onboarding',
            'balanceBefore' => 0,
            'balanceAfter' => (float)$data->securityDeposit,
            'date' => new UTCDateTime()
        ]);

        echo json_encode(["message" => "Tenant created successfully", "id" => (string)$newTenantId]);
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "ID required"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"));
        $action = $parts[2] ?? '';

        if ($action == 'refund') {
            $tenant = $tenantsCollection->findOne(['_id' => new ObjectId($id)]);
            if (!$tenant) {
                http_response_code(404);
                echo json_encode(["message" => "Tenant not found"]);
                exit;
            }

            $deductionAmount = (float)($data->deductionAmount ?? 0);
            $reason = $data->deductionReason ?? 'Adjustment';
            $balanceBefore = (float)$tenant->refundableAmount;
            $newRefundable = max(0, $balanceBefore - $deductionAmount);

            $status = 'Active';
            if ($newRefundable == 0 && $deductionAmount > 0) $status = 'Deducted';
            elseif ($deductionAmount > 0 && $newRefundable > 0) $status = 'Partial Refund';
            elseif ($deductionAmount == 0 && $newRefundable == 0) $status = 'Refunded';

            $tenantsCollection->updateOne(
                ['_id' => new ObjectId($id)],
                ['$set' => [
                    'refundableAmount' => $newRefundable,
                    'depositStatus' => $status,
                    'refundDate' => new UTCDateTime()
                ]]
            );

            if ($status == 'Refunded' || $status == 'Deducted') {
                $shopsCollection->updateOne(
                    ['_id' => $tenant->shopId],
                    ['$set' => ['occupancyStatus' => 'Vacant', 'tenantId' => null]]
                );
                $tenantsCollection->updateOne(
                    ['_id' => new ObjectId($id)],
                    ['$set' => ['status' => 'Inactive']]
                );
            }

            $depositTransactionsCollection->insertOne([
                'tenantId' => new ObjectId($id),
                'tenantName' => $tenant->tenantName,
                'shopNumber' => $tenant->shopNumber,
                'type' => $deductionAmount > 0 ? 'Deduction' : 'Refund',
                'amount' => $deductionAmount,
                'reason' => $reason,
                'balanceBefore' => $balanceBefore,
                'balanceAfter' => $newRefundable,
                'date' => new UTCDateTime()
            ]);

            echo json_encode(["message" => "Deposit adjustment processed"]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "ID required"]);
            exit;
        }
        $tenant = $tenantsCollection->findOne(['_id' => new ObjectId($id)]);
        if ($tenant && $tenant->shopId) {
            $shopsCollection->updateOne(
                ['_id' => $tenant->shopId],
                ['$set' => ['occupancyStatus' => 'Vacant', 'tenantId' => null]]
            );
        }
        $tenantsCollection->deleteOne(['_id' => new ObjectId($id)]);
        echo json_encode(["message" => "Tenant deleted and shop vacated"]);
        break;
}
?>
