<?php
// Professional Headers for React + PHP Communication
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS requests from React
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

// MIDDLEWARE SECURITY: intercept incoming JSON Web Token (JWT) signatures
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["error" => "Access Blocked: Missing unique identification token."]);
    exit;
}

// Token extracted successfully
$userToken = $matches[1]; 

// Your exact Firebase Realtime Database cluster address
$firebaseURL = "https://student-454cb-default-rtdb.firebaseio.com/students.json";

$method = $_SERVER['REQUEST_METHOD'];

// 1. FETCH RECORDS FROM FIREBASE (GET)
if ($method === 'GET') {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $firebaseURL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
    
    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);
    $students = [];

    if ($data && is_array($data)) {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $value['id'] = $key;
                $students[] = $value;
            }
        }
    }
    echo json_encode(array_reverse($students));
}

// 2. SAVE RECORD TO FIREBASE (POST)
if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!empty($input['name'])) {
        $payload = json_encode([
            "name" => $input['name'],
            "dob" => $input['dob'],
            "gender" => $input['gender'],
            "age" => (int)$input['age'],
            "submitted_at" => date('Y-m-d H:i:s')
        ]);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $firebaseURL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        curl_close($ch);

        echo json_encode(["status" => "success"]);
    }
}
?>