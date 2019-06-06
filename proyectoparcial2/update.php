<?php 
		$server="localhost";
		$username = "root";
		$pass = "";
		$db= "mangas";

		$conexion = new mysqli ($server, $username, $pass, $db);

		if($conexion->connect_error){
				die("Error en la conexión: " . $conexion->connect_error);
		}

		$id = $_POST["id"];
		$nombre = $_POST["nombre"];
		$genero = $_POST["genero"];
		$precio = $_POST["precio"];
		$paginas = $_POST["paginas"]; 

		$sql = "UPDATE manwhas SET nombre='$nombre', genero='$genero', precio=$precio, paginas=$paginas WHERE id=$id";

		if ($conexion->query($sql) === TRUE) {
   			 echo "Registro de manga modificado <a href='index.php'>Regresar</a>";
		} else {
			echo "ocurrió un error";
			echo $conexion->error;
			echo $sql;
		}
		$conexion->close();
 ?>