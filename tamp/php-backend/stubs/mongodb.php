<?php
/**
 * IDE Stubs for MongoDB PHP Library
 * These stubs exist ONLY for IDE autocompletion.
 * The actual classes come from composer install (mongodb/mongodb package).
 */

namespace MongoDB {
    class Client {
        public function __construct(string $uri = '', array $uriOptions = [], array $driverOptions = []) {}
        public function selectDatabase(string $databaseName, array $options = []): Database { return new Database(); }
    }

    class Database {
        public function selectCollection(string $collectionName, array $options = []): Collection { return new Collection(); }
        public function countDocuments(array $filter = [], array $options = []): int { return 0; }
    }

    class Collection {
        public function find(array $filter = [], array $options = []): \Iterator { return new \ArrayIterator([]); }
        public function findOne(array $filter = [], array $options = []): ?object { return null; }
        public function insertOne($document, array $options = []): InsertOneResult { return new InsertOneResult(); }
        public function updateOne(array $filter, $update, array $options = []): UpdateResult { return new UpdateResult(); }
        public function deleteOne(array $filter, array $options = []): DeleteResult { return new DeleteResult(); }
        public function countDocuments(array $filter = [], array $options = []): int { return 0; }
    }

    class InsertOneResult {
        public function getInsertedId() { return null; }
    }
    class UpdateResult {}
    class DeleteResult {}
}

namespace MongoDB\BSON {
    class ObjectId {
        public function __construct(string $id = '') {}
        public function __toString(): string { return ''; }
    }

    class UTCDateTime {
        public function __construct($milliseconds = null) {}
        public function toDateTime(): \DateTime { return new \DateTime(); }
    }
}
