<?php
error_reporting(0);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['files'])) {
        $errors = [];
        $path = 'uploads/';
		$extensions = ['jpg', 'jpeg', 'png', 'gif'];
		$response = null;
        $all_files = count($_FILES['files']['tmp_name']);
		$file = [];
        for ($i = 0; $i < $all_files; $i++) {  
			$file_name = $_FILES['files']['name'][$i];
			$file_tmp = $_FILES['files']['tmp_name'][$i];
			$file_type = $_FILES['files']['type'][$i];
			$file_size = $_FILES['files']['size'][$i];
			$file_ext = strtolower(end(explode('.', $_FILES['files']['name'][$i])));

			$file[$i] = $path . $file_name;

			if ($file_size > 2097152) {
				$errors[] = 'File size exceeds limit: ' . $file_name . ' ' . $file_type;
			}

			if (empty($errors)) {
				move_uploaded_file($file_tmp, $file[$i]);
			}
			
		
		}
        exec('java -cp yampp-ls.jar fr.lirmm.yamplusplus.yamppls.YamppOntologyMatcher -s '.$file[0].' -t '.$file[1], $response);

        $find = 'Result file: ';
        $alignment_path = null;
        for ($i = 0; $i < count($response); $i++) {
            if (strpos($response[$i], $find) !== false) {
                $alignment_path = str_replace($find, '', $response[$i]);
            }
        }

        if (file_exists($alignment_path)) {

            http_response_code(200);
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            header('Content-Type: ' . finfo_file($finfo, $filename));
            finfo_close($finfo);
            //No cache
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');

            header("Content-Transfer-Encoding: Binary");
            header("Content-Length:".filesize($alignment_path));
            header("Content-Disposition: attachment; filename=".basename($filename));

            ob_clean();
            flush();
            readfile($alignment_path);
            die();
        } else {
            die("Error: File not found.");
        }

        // Contents
		//print json_encode ($response);
	    if ($errors) print($errors);
    }
}
