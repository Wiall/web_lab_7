<?php
header('Content-Type: application/json');
date_default_timezone_set("Europe/Kiev");
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'DELETE') {
        $filePath = 'events.log';

        if (file_exists($filePath)) {
            unlink($filePath);
            echo json_encode(["status" => "success", "message" => "All events cleared."]);
        } else {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "No events found to clear",
            ]);
        }
    }

    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['message']) && !empty($data['message'])) {
            $timestamp = date("Y-m-d H:i:s");
            file_put_contents('events.log', "{$timestamp} - {$data['message']}\n", FILE_APPEND);

            echo json_encode([
                "status" => "success",
                "serverTime" => $timestamp,
            ]);
        } else {
            http_response_code(400);
            echo json_encode([ 
                "status" => "error", 
                "message" => "Invalid data: 'message' is required" 
            ]);
        }
    }
    elseif ($method === 'GET') {
        $filePath = 'events.log';

        if (file_exists($filePath)) {
            $events = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

            echo json_encode([
                "status" => "success",
                "events" => $events,
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "No events found",
            ]);
        }
    }
    else {
        http_response_code(405);
        echo json_encode([
            "status" => "error",
            "message" => "Only POST, GET and DELETE methods are allowed",
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "An unexpected error occurred",
        "details" => $e->getMessage(),
    ]);
}
?>
