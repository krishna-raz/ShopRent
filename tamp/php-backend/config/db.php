<?php
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

class Database {
    private $uri = "mongodb+srv://admin:demo@cluster0.oj9mebk.mongodb.net/?appName=Cluster0/shop-rental-management";
    private $dbName = "shop-rental-management";
    private $conn = null;

    public function connect() {
        if ($this->conn == null) {
            try {
                $client = new Client($this->uri);
                $this->conn = $client->selectDatabase($this->dbName);
            } catch (Exception $e) {
                die("Connection Error: " . $e->getMessage());
            }
        }
        return $this->conn;
    }
}
?>
