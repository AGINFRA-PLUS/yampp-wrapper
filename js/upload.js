const url = 'process.php';
const form = document.querySelector('form');

function validateForm() {
    if (document.forms["form"]["sourceUrl"].value == "" && document.getElementById("sourceFile").files.length == 0) {
      console.log("You must provide a Source ontology");
      alert("You must provide a Source ontology");
      return false;
    }
    if (document.forms["form"]["targetUrl"].value == "" && document.getElementById("targetFile").files.length == 0) {
      console.log("You must provide a Target ontology");
      alert("You must provide a Target ontology");
      return false;
    }
    document.location.href = '#overlay';
}
function refreshFileUpload(uploadFilename, labelToUpdate) {
	var path = document.getElementById(uploadFilename).value;
	var fileName = path.match(/[^\/\\]+$/);
	
	var d = document.getElementById(labelToUpdate);
	if(d)
		d.innerHTML = fileName;
	
	var input = null;
	if(labelToUpdate=='sourceFilename'){
		input = document.getElementById('sourceUrl');
		if(path){
			input.setAttribute('disabled',true);
		} else {
			input.removeAttribute('disabled');
		}
	} else {
		input = document.getElementById('targetUrl');
		if(path){
			input.setAttribute('disabled',true);
		} else {
			input.removeAttribute('disabled');
		}
	}
}

form.addEventListener('submit', e => {
    e.preventDefault();

    const sourceFile = document.getElementById("sourceFile").files;
    const targetFile = document.getElementById("targetFile").files;
    const sourceUrl = document.forms["form"]["sourceUrl"].value;
    const targetUrl = document.forms["form"]["targetUrl"].value;

    const formData = new FormData();
	var doAsync = 0;
	
    if(sourceFile.length>0){
        formData.append('files[]', sourceFile[0]);
    } else {
		doAsync=doAsync+1;//do for source
    }

    if(targetFile.length>0){
        formData.append('files[]', targetFile[0]);
    } else {
		doAsync=doAsync+2;//do for target
    }
	
	if(doAsync==0){
		callServer(formData);
	} else if(doAsync==1){
		fetch(sourceUrl).then(res => res.blob()).then(blob => {
            formData.append('files[]', blob, sourceUrl.substring(sourceUrl.lastIndexOf('/')+1));
			callServer(formData);
        });
	} else if(doAsync==2){
		fetch(targetUrl).then(res => res.blob()).then(blob => {
            formData.append('files[]', blob, targetUrl.substring(targetUrl.lastIndexOf('/')+1));
			callServer(formData);
        });
	} else if(doAsync==3){
		fetch(sourceUrl).then(res => res.blob()).then(blob => {
            formData.append('files[]', blob, sourceUrl.substring(targetUrl.lastIndexOf('/')+1));
			
			fetch(targetUrl).then(res => res.blob()).then(blob => {
				formData.append('files[]', blob, targetUrl.substring(url.lastIndexOf('/')+1));
				callServer(formData);
			});
        });
	}
	
});
function callServer(formData){
	var submitButton = document.getElementById('submitMatcher');
	var loader = document.getElementById('yampp-loader');
	console.log(submitButton,loader);
	submitButton.style.display = 'none';
	loader.style.display = 'inline-block';
    fetch(url, {
        method: 'POST',
        body: formData
    }).then(response => response.blob()
    ).then(blob => {
		var filename = 'alignment.rdf';

        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
		
		submitButton.style.display = 'inline-block';
		loader.style.display = 'none';
    });
}