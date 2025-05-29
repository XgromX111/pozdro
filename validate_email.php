<?php
header('Content-Type: application/json');

$email = $_POST['email'] ?? '';

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Email is required']);
    exit;
}

$apiKey = 'YOUR_ABSTRACT_API_KEY'; // Replace with your actual API key
$url = "https://emailvalidation.abstractapi.com/v1/?api_key={$apiKey}&email={$email}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

// Check various validation aspects
$isValid = true;
$error = '';

if ($data['deliverability'] === 'UNDELIVERABLE') {
    $isValid = false;
    $error = 'Ten adres email nie istnieje';
} elseif ($data['is_disposable_email']['value'] === true) {
    $isValid = false;
    $error = 'Nie można użyć tymczasowego adresu email';
} elseif ($data['is_free_email']['value'] === false) {
    $isValid = false;
    $error = 'Proszę użyć osobistego adresu email';
}

echo json_encode([
    'valid' => $isValid,
    'error' => $error
]);
?>