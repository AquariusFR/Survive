<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/javascript');
//
//	Fr�d�ric Nobre - 2011
//
//	Ce script retournera un JSON demand�
if (isset($_GET["s"])){
	$src=$_GET["s"];

	$ts = time();
	//apc_store($ts, $src, 600);

	// ouverture en �criture
	$file = fopen("sessions/".$ts,"w");
	fwrite($file, $src);
	fclose($file);
	echo $ts;
} else {
	echo "i need a [s] variable ...";
}
?>