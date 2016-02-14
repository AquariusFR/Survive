<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/javascript');
//
//	Frédéric Nobre - 2011
//
//	Ce script retournera un JSON demandé

$dir    = './sessions/';
if (isset($_GET["ts"])){
	$ts=$_GET["ts"];
	//var_dump(apc_fetch($ts));
	$rep =$dir.$ts;
	$json ='';
	if (file_exists($rep)){
		$file = fopen($rep,"r");

		while(! feof($file)){
			$json = $json.fgets($file);
		}

		fclose($file);
	} else {
		echo $rep."filenotfound\n";
	}

	// clean old file

	//$dh  = opendir($dir);
	$dh  = opendir("./sessions");
	$ts = time();
	$files[] = null;
	while (false !== ($filename = readdir($dh))) {
		if($filename != "." && $filename != ".."){
			if(intval($ts)-intval($filename) > 300){
				$files[] = $filename;
			}
		}
	}
	foreach ($files as $deleteFile) {
		if($deleteFile != ""){
			unlink($dir.$deleteFile);
		}
	}

	echo $json;
} else {
	echo "i need a [ts] variable ...";
}
?>