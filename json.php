<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/javascript');
//
//	Fr�d�ric Nobre - 2011
//
//	Ce script retournera un JSON demand�
if (isset($_GET["s"]) && isset($_GET["c"])){
	$src=$_GET["s"];
	$callback=$_GET["c"];


	$rep = $src;
	$json ='';
	if (file_exists($rep)){
		$file = fopen($rep,"r");

		while(! feof($file)){
	  		$json = $json.fgets($file);
	  	}

		fclose($file);
	}
	echo "var result = {};\n";
	echo "result['response'] = ".$json;
} else {
 echo "i need a [s]and [c] variable ...";	
}
?>

<?php
if (isset($_GET["v"])) {

	$variable=$_GET["v"];
	echo $callback.'(result, "'.$variable.'");';
} else {
	echo $callback."(result);" ;
}
?>