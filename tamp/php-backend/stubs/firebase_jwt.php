<?php
/**
 * IDE Stubs for Firebase JWT Library
 * These stubs exist ONLY for IDE autocompletion.
 * The actual classes come from composer install (firebase/php-jwt package).
 */

namespace Firebase\JWT {
    class JWT {
        public static function encode(array $payload, string $key, string $alg = 'HS256', ?string $keyId = null, ?array $head = null): string { return ''; }
        public static function decode(string $jwt, Key $keyOrKeyArray): object { return new \stdClass(); }
    }

    class Key {
        public function __construct(string $keyMaterial, string $algorithm) {}
    }
}
