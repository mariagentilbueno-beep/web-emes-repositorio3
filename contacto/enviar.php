<?php
// 1. CONFIGURACIÓN DE LA BASE DE DATOS DE HOSTINGER
$host     = "localhost"; 
$db_user  = "emes_agencia"; 
$db_pass  = "c!r+ZNrZ*m0M"; 
$db_name  = "contact_form"; 

// Conectar a la base de datos
$conexion = new mysqli($host, $db_user, $db_pass, $db_name);

// Comprobar la conexión
if ($conexion->connect_error) {
    die("Error crítico de conexión: " . $conexion->connect_error);
}

// Asegurar que los textos acepten eñes y acentos correctamente
$conexion->set_charset("utf8mb4");

// 2. RECOGER LOS DATOS DEL FORMULARIO
$nombre    = $_POST['nombre'] ?? '';
$apellidos = $_POST['apellidos'] ?? '';
$email     = $_POST['email'] ?? '';
$telefono  = $_POST['telefono'] ?? '';
$web_rrss  = $_POST['web-rrss'] ?? ''; // Coincide con el name="web-rrss"
$idea      = $_POST['idea'] ?? '';

// 3. CREAR LA TABLA AUTOMÁTICAMENTE (Si no existe ya)
// Adaptada con todos tus campos
$tabla_sql = "CREATE TABLE IF NOT EXISTS contactos_agencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    web_rrss VARCHAR(255),
    idea TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conexion->query($tabla_sql);

// 4. INSERTAR LOS DATOS DE FORMA SEGURA
$stmt = $conexion->prepare("INSERT INTO contactos_agencia (nombre, apellidos, email, telefono, web_rrss, idea) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $nombre, $apellidos, $email, $telefono, $web_rrss, $idea);

if ($stmt->execute()) {
    // Le indicamos a tu JavaScript que todo ha salido perfecto
    echo "success";
} else {
    echo "error";
}

// Cerrar conexiones
$stmt->close();
$conexion->close();
?>