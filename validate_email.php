<?php
header('Content-Type: application/json');

$email = $_POST['email'] ?? '';

if (!$email) {
    http_response_code(400);
    echo json_encode(['valid' => false, 'error' => 'Email jest wymagany']);
    exit;
}

// Basic email format validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['valid' => false, 'error' => 'Nieprawidłowy format adresu email']);
    exit;
}

// Extract domain from email
$domain = substr(strrchr($email, "@"), 1);

// Check if domain exists and has MX record
if (!checkdnsrr($domain, 'MX')) {
    echo json_encode(['valid' => false, 'error' => 'Domena email nie istnieje']);
    exit;
}

// Check for disposable email domains
$disposableDomains = ['tempmail.com', 'temp-mail.org', 'guerrillamail.com'];
if (in_array($domain, $disposableDomains)) {
    echo json_encode(['valid' => false, 'error' => 'Tymczasowe adresy email nie są dozwolone']);
    exit;
}

// If all checks pass
echo json_encode(['valid' => true, 'error' => '']);
?>