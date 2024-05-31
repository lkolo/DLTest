/* Projet de detection d'objets via webcam en utilisant l'IA + tensorflow + modele nommé COCO-SSD  */ 

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
const WebcamMoveNetButton = document.getElementById('WebcamMoveNet');
const Model_Path_SINGLEPOSE = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4' ;
let MoveNetModel = undefined ;
let OCRModel  = undefined ;
let predictionActive = true; // Variable to control the prediction state

document.getElementById('PredictionButton').addEventListener('click', SuspendResumePrediction);

WebcamMoveNetButton.addEventListener('click', LoadAndRunqSINGLEPOSEModel);
document.getElementById('WebcamMoveNet2').addEventListener('click',LoadAndRunqSINGLEPOSEModel_img2); 
document.getElementById('loadImageBt').addEventListener('click',ChargerImageFromHD);  // voir lkimage.js
document.getElementById('BtDelimiteZone').addEventListener('click',DrawDelimitationSquare);  // voir lk_Drawing.js
document.getElementById('BtWebcamMoveNetSquare').addEventListener('click',LoadAndRunqSINGLEPOSEModelOnDelimitedRectangle);  
document.getElementById('BtCropImage').addEventListener('click',RecadrerImage); 
document.getElementById('BtPartieImage').addEventListener('click',CopieUnePartieImage);
document.getElementById('BtTakePicture').addEventListener('click', function() {
																	capturePhoto('exempleImg', 'canvas');
																	});

document.getElementById('WebcamMoveNet3').addEventListener('click',LoadAndRunqSINGLEPOSEModel);
document.getElementById('OCR').addEventListener('click', OCRFunction );
document.getElementById('ZOOMPlus').addEventListener('click', ZoomPlus );

document.getElementById('ImageCrayonFilter').addEventListener('click',function () {AsignFiltreCrayon('canvas'); }) ;
document.getElementById('DetectCaractCrayonFilter').addEventListener('click', function () {DetectCaractOnImageCrayon('canvas'); } ) ;

// GESTION DES DIFFERENTS SLIDER ---------------------------------------------------------------------------------------------------

var ZoomFactor = document.getElementById("myZoomSlider");
ZoomFactor.addEventListener('input', function() { document.getElementById('ZoomScale').value = ZoomFactor.value.toString() ;});

//document.getElementById('myPosXSlider').addEventListener('input',UpdatePosx); 
//Utilisez l'événement DOMContentLoaded pour vous assurer que le DOM est complètement chargé avant d'ajouter les écouteurs d'événements
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('myPosXSlider').addEventListener('input', function() {
        document.getElementById('posX').value = (document.getElementById('myPosXSlider').value).toString();
		DrawDelimitationSquare() ;
    });
});
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('myPosYSlider').addEventListener('input', function() {
        document.getElementById('posY').value = (document.getElementById('myPosYSlider').value).toString();
		DrawDelimitationSquare() ;
    });
});
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mySqWidthSlider').addEventListener('input', function() {
        document.getElementById('SqWidth').value = (document.getElementById('mySqWidthSlider').value).toString();
		DrawDelimitationSquare() ;
    });
});
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mySqHeighhSlider').addEventListener('input', function() {
        document.getElementById('SqHeight').value = (document.getElementById('mySqHeighhSlider').value).toString();
		DrawDelimitationSquare() ;
    });
});
// ENd GESTION DES DIFFERENTS SLIDER ---------------------------------------------------------------------------------------------------

async function CalculateInterferenceSpeed()
{
	//enregistre un horodatage - Benchmark
	const timeStar = performance.now() ;
	let results = await useSomeModel() ;
	const timeEnd = performance.now() ;
	const timeTaken = timeEnd - timeStar ;
	console.log('Time taken : ' + timeTaken) ;
	console.log('frame per sec :' + (1000/timeTaken)) ;
}

// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will 
// define in the next step.                                             STARTING POINT OF THE PROGRAM

async function MainStart()
{
	if (getUserMediaSupported()) {
      LoadMoveNetModel() ; // charge le modele permettant la detection de pose	 COCO-SSD MODEL étant chargé un peu plus bas dans ce code
		//Actuellement, TensorFlow.js ne propose pas de modèle OCR intégré directement, mais il est possible d'utiliser d'autres bibliothèques OCR comme Tesseract.js avec TensorFlow.js. -->
		//LoadOCRModel() ; // permet la detection de caracteres
	  
	    // la bibliothèques Tesseract.js est chargée et utilisée dans la fonction DetectCaractere au lieu de OCRModel
	  
	  // Attendre l'initialisation d'OpenCV - traitement d'image
	  await loadOpenCV();
	  document.getElementById('LKMessage2').innerHTML="OPENCV Model chargé : OK" ;
	  
	  enableWebcamButton.addEventListener('click', enableCam);
	  alert("Cool, UserMedia est supporté par le systeme") ;
	} else {
	  console.warn('getUserMedia() is not supported by your browser');
	}
	changerCaptionBouton('loadImageBt', "Charger fichier image complete") ;
}

function UpdatePosx() 
{
	document.getElementById("posX").value = (document.getElementById('myPosXSlider').value).toString()	;
}


 /// *****************************Fetching the webcam stream *********************************************

// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }
  
  // Hide the button once clicked.
  event.target.classList.add('removed');  
  
  // getUsermedia parameters to force video but not audio.
  // cree une contrainte disant que seul la video doit parvenir, l'audio ne sera pas pris en compte
  const constraints = {
    video: true
  };

  // Activate the webcam stream. => UNIQUEMENT VIDEO (PAS DE AUDIO a cause de la contrainte)
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
	PositionningCanvas('webcam','VideoCanvas', 'Yellow') ;	
  });
}

// ******************************************************************************************************

// Placeholder function for next step.
var children = [];


    // Function to resume prediction
function SuspendResumePrediction() {
      predictionActive = !predictionActive;
	  if (predictionActive)
	  {
	     predictWebcam();  // voir video.addEventListener('loadeddata', predictWebcam);  chargé en debut de code
	  }
      
}

function predictWebcam() {
	
  if (predictionActive)
  {	  
	  var VideoCanvas = document.getElementById('VideoCanvas')
	  // Now let's start classifying a frame in the stream.
	  model.detect(video).then(function (predictions) {
		// Remove any highlighting we did previous frame.
		for (let i = 0; i < children.length; i++) {
		  liveView.removeChild(children[i]);
		}
		children.splice(0);
		
		// Now lets loop through predictions and draw them to the live view if
		// they have a high confidence score.
		for (let n = 0; n < predictions.length; n++) {
		  // If we are over 66% sure we are sure we classified it right, draw it!
		  if (predictions[n].score > 0.66) {
			const p = document.createElement('p');
			p.innerText = predictions[n].class  + ' - with ' 
				+ Math.round(parseFloat(predictions[n].score) * 100) 
				+ '% confidence.';
			p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
				+ (predictions[n].bbox[1] - 10) + 'px; width: ' 
				+ (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

			const highlighter = document.createElement('div');
			highlighter.setAttribute('class', 'highlighter');
			highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
				+ predictions[n].bbox[1] + 'px; width: ' 
				+ predictions[n].bbox[2] + 'px; height: '
				+ predictions[n].bbox[3] + 'px;';
				
			TraiterPredictionEtCapturerPoseHumaine(predictions[n]) ;
			drawCircleTest('VideoCanvas', 50, 50, 10) ;

			liveView.appendChild(highlighter);
			liveView.appendChild(p);
			VideoCanvas.appendChild(highlighter);  
			children.push(highlighter);
			children.push(p);
		  }
		}
		
		// Call this function again to keep predicting when the browser is ready.
		window.requestAnimationFrame(predictWebcam);
	  });
  }
}

// Pretend model has loaded so we can try out the webcam code.
	//var model = true;
	//demosSection.classList.remove('invisible');


// Store the resulting model in the global scope of our app.
var model = undefined;

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment 
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
// script tag import so ignore any warning in Glitch.
cocoSsd.load().then(function (loadedModel) {
        document.getElementById('LKMessage2').innerHTML="Chargement Modele cocoSsd" ;
	    // 'rgba(255, 255, 255, 0.9)'; // Couleur du texte blanche avec 90% d'opacité
	    ModifierCouleur_DIV('LKMessage2', 'rgb(52, 152, 219)', 'rgba(255, 255, 255, 0.9)', 'rgb(41, 128, 185)') ;
		
  model = loadedModel;
  // Show demo section now model is ready to use.
  demosSection.classList.remove('invisible');          // actiive le bouton id=webcamButton  via la fonction remove du fichier css 
         document.getElementById('LKMessage2').innerHTML="Chargement Modele cocoSsd OK" ;	
});

async function LoadMoveNetModel()
{
	if (MoveNetModel === undefined)
	{
		document.getElementById('LKMessage2').innerHTML="Chargement Modele MoveNet" ;
	    // 'rgba(255, 255, 255, 0.9)'; // Couleur du texte blanche avec 90% d'opacité
	    ModifierCouleur_DIV('LKMessage2', 'rgb(52, 152, 219)', 'rgba(255, 255, 255, 0.9)', 'rgb(41, 128, 185)') ;
	    MoveNetModel = await tf.loadGraphModel(Model_Path_SINGLEPOSE, {fromTFHub: true}) ;
		document.getElementById('LKMessage2').innerHTML="Chargement Modele MoveNet OK" ;
	}
}

async function LoadOCRModel()
{
	if (OCRModel === undefined)
	{
		document.getElementById('LKMessage2').innerHTML="Chargement Modele OCR" ;
	    // 'rgba(255, 255, 255, 0.9)'; // Couleur du texte blanche avec 90% d'opacité
	    ModifierCouleur_DIV('LKMessage2', 'rgb(52, 152, 219)', 'rgba(255, 255, 255, 0.9)', 'rgb(41, 128, 185)') ;
	    OCRModel = await ocr.load();
		document.getElementById('LKMessage2').innerHTML="Chargement Modele OCR OK" ;
	}
}

// Fonction pour charger et attendre OpenCV.js
async function loadOpenCV() 
{
	//CHARGER bibliothèque cv de OpenCV.js pour le prétraitement  d'images --> 
    //	  <script async src="https://docs.opencv.org/4.x/opencv.js"></script> 
	 
	document.getElementById('LKMessage2').innerHTML="Chargement Modele OPENCV" ;
	// 'rgba(255, 255, 255, 0.9)'; // Couleur du texte blanche avec 90% d'opacité
	ModifierCouleur_DIV('LKMessage2', 'rgb(52, 152, 219)', 'rgba(255, 255, 255, 0.9)', 'rgb(41, 128, 185)') ;
    
	return new Promise((resolve) => {
        if (typeof cv !== 'undefined' && cv.getBuildInformation) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
				document.getElementById('LKMessage2').innerHTML="ESSAYE LE Chargement Modele OPENCV" ;
                if (typeof cv !== 'undefined' && cv.getBuildInformation) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}



/*
async function ChargerImageFromHD()          // deplace dans LKImage.js
{
	document.getElementById('loadImageBt').addEventListener('change', function(event) {
		const file = event.target.files[0];
		const reader = new FileReader();

		reader.onload = function(event) {
			//const img = new Image();   // cree une nouvelle image
			const img = document.getElementById('exempleImg') ; // charge l'image dans lA BALISE IMAGE cree dans le HTML 
			img.onload = function() {
				const canvas = document.getElementById('canvas');
				const ctx = canvas.getContext('2d');
				
				var rect = img.getBoundingClientRect();
				canvas.style.position = 'absolute';
				canvas.style.top = 0 + 'px';
				canvas.style.left = 0 + 'px';
				canvas.width = img.width;
				canvas.height = img.height;
				canvas.style.border = '1px solid black'; // Ajouter une bordure pour visualiser le canvas
				
				ctx.drawImage(img, 0, 0);
			};
			img.src = event.target.result;
		};
		reader.readAsDataURL(file);
	});
}
*/

async function TraiterPredictionEtCapturerPoseHumaine(Mypredictions) 
{
	/*
	if( (Mypredictions.class).toUpperCase() === "PERSON" )
	{
		await capturePhotoV2('exempleImg', 'canvas') ;	
		await RunqSINGLEPOSEModel('canvas') ;
	}
    */ 	
	
	
	//if( (Mypredictions.class).toUpperCase() === "CONTAINER" )
    if( (Mypredictions.class).toUpperCase() === "REFRIGERATOR" )
	{
		var TextResult ;
		await capturePhotoToCanvas(Mypredictions, 'canvas', 'exempleImg') ;  // le Canvas nommé "canvas" recoit l'image complete capturée depuis la camera   
		//await CropCanvas(Mypredictions.bbox[0],Mypredictions.bbox[1] ,Mypredictions.bbox[2], Mypredictions.bbox[3], 'canvas') ;            // ne tenir compte que de la partie de l'image vraiment nécessaire
        await CROP_CopieUnePartieImage(Mypredictions.bbox[0],Mypredictions.bbox[1] ,Mypredictions.bbox[2], Mypredictions.bbox[3], 'canvas') ;
		
		await DisplayCanvasToImage('exempleImg', 'canvas') ;  	
        TextResult = await DetectCaractere('canvas') ;     // le canvas ne contient que la partie d'image prise par la camera 
		
        ClearCanvas('VideoCanvas') ; 		
        await AfficherTexte(TextResult, 'VideoCanvas', Mypredictions.bbox[0],Mypredictions.bbox[1] + 10) ; 		
	}	
}

async function OCRFunction()
{
	TextResult = await DetectCaractere('canvas') ;
	alert (TextResult) ;
}

async function AsignFiltreCrayon(MyCanavasID) 
{
				
	MettreImageDansCanvas('exempleImg', MyCanavasID) ;
    //AdapterCanvasOnImage(MyCanavasID, 'exempleImg', 'Red')	;		
			
	var canvas = undefined ;
	canvas = document.getElementById(MyCanavasID);
	var ctx = canvas.getContext('2d');
				
	/*  OLD FASHION ------------------------------------------------------------------------------------			
	ConvertirImageEnNiveauxdeGris_V2(canvas, ctx);
	InverserCouleur(canvas, ctx);			
	var  blurredData = FlouGaussien(canvas, ctx, 'blur(5px)') ;   // Context.filter = MyFiltre ; //'blur(5px)';
	MelangerImage(canvas, ctx, blurredData) ;
	*/			
				
	sketchEffect(canvas, ctx) ;
	//AdapterCanvasOnImage(MyCanavasID, 'exempleImg', 'Red')	;
}

async function DetectCaractOnImageCrayon(MyCanavasID)
{
	
	var canvas = undefined ;
	canvas = document.getElementById(MyCanavasID);
	var ctx = canvas.getContext('2d');
	
	// Recognize the container number using Tesseract.js
                const result = await Tesseract.recognize(
                    canvas,
                    'eng',
                    {
                        logger: m => console.log(m)
                    }
                );
	var TextResult = result.data.text ;
	//canvas.getContext('2d').fillText(ocrResult.text, posTextX, posTextY - 10);
	canvas.getContext('2d').fillText(result.data.text, 0, 20 - 10);
	alert ("OCR RESPONSE :" + result.data.text) ;
}

async function DetectCaractere(MyCanavasID) 
{
				// Load OCR model and recognize the container number
                   // const OCRModel = await ocr.load();  a ete chargé au debut du projet
				
				/*
				Il semble qu'il y ait une confusion concernant la disponibilité et l'importation de modèles OCR pour TensorFlow.js. 
				Actuellement, TensorFlow.js ne propose pas de modèle OCR intégré directement, 
				mais il est possible d'utiliser d'autres bibliothèques OCR comme Tesseract.js avec TensorFlow.js.
				
				var canvas = undefined ;
				canvas = document.getElementById(MyCanavasID);
                const ocrResult = await OCRModel.recognize(canvas);
				*/
				
				var canvas = undefined ;
				canvas = document.getElementById(MyCanavasID);
				var ctx = canvas.getContext('2d');

				// Prétraitement de l'image - converti en niv de gris + augmente contrate
					//preprocessImage(canvas, ctx);    // sans OPENCV
					ConvertirImageEnNiveauxdeGris(canvas, ctx) ;  // sans OPENCV
					AugmenterContrasteImage(canvas, ctx, 200) ;   // sans OPENCV
					
					
					//OPENCV_preprocessImage(canvas, ctx) ;
					//OPENCV_SeuillageImage(canvas, ctx, 150) ; 
					var alpha = 1.2;
					var beta = 20 ;
					//OpenCV_ConvertirImageEnNiveauxdeGris(canvas, ctx, alpha, beta) ;
				
				// reaffiche l'image avant traitement des caratcteres
				await DisplayCanvasToImage('exempleImg', MyCanavasID) ;

				
				// Recognize the container number using Tesseract.js
                const result = await Tesseract.recognize(
                    canvas,
                    'eng',
                    {
                        logger: m => console.log(m)
                    }
                );
				

                // Draw recognized text
                canvas.getContext('2d').fillStyle = 'blue';
                canvas.getContext('2d').font = '20px Arial';
				
				var posTextX = 0 ;
				var posTextY = canvas.height  ;
				
                var TextResult = result.data.text ;
				//canvas.getContext('2d').fillText(ocrResult.text, posTextX, posTextY - 10);
				canvas.getContext('2d').fillText(result.data.text, posTextX, posTextY - 10);
				
				return  TextResult ;
				//alert ("OCR RESPONSE :" + result.data.text) ;
}



async function CROP_CopieUnePartieImage(x, y, width, height, MyCanavasID) {
    

    // Sélectionner le canvas source
    const canvas1 = document.getElementById(MyCanavasID);
    const ctx1 = canvas1.getContext('2d', { willReadFrequently: true });         //  avec l'attribut willReadFrequently défini sur true => plus rapide

    // Créer un canvas temporaire pour manipuler l'image recadrée
    const canvasTemp = document.createElement('canvas');
    const ctxTmp = canvasTemp.getContext('2d', { willReadFrequently: true });    //avec l'attribut willReadFrequently défini sur true => plus rapide
    canvasTemp.width = width;
    canvasTemp.height = height;

    // Récupérer les données d'image de la zone spécifiée sur le canvas source
    const imageData = ctx1.getImageData(x, y, width, height);

    // Placer les données d'image sur le canvas temporaire
    ctxTmp.putImageData(imageData, 0, 0);

    // Mettre à jour le canvas original avec la partie recadrée
    canvas1.width = width;  // Redimensionner le canvas original
    canvas1.height = height; // Redimensionner le canvas original
    ctx1.putImageData(imageData, 0, 0);

	/*  code qui affiche l'image recadree 
	
	// Variables
    var MyImageID = 'exempleImg';
	
    // Convertir le contenu du canvas temporaire en URL de données
    const dataURL = canvasTemp.toDataURL('image/jpeg');
	const dataURL2 = canvas1.toDataURL('image/jpeg');

    // Mettre à jour l'élément image avec l'URL de données
    const imgElement = document.getElementById(MyImageID);
    imgElement.src = dataURL;
    imgElement.width = width;
    imgElement.height = height;

    // Mettre à jour également l'image recadrée
    const recadreeElement = dataURL2;
    recadreeElement.src = dataURL;
    recadreeElement.width = width;
    recadreeElement.height = height;
	*/
	
}


async function DisplayCanvasToImage(MyImageID, MyCanavasID )
{
	var canvas = undefined ;
	canvas = document.getElementById(MyCanavasID);
	const dataURL = canvas.toDataURL('image/jpeg');
	 // Afficher la photo dans l'élément img dont l'id = LKContainerImage  ********************************** 
     document.getElementById(MyImageID).src = dataURL;
}

// Fonction pour capturer une photo a partir de la camera
async function capturePhotoToCanvas(Mypredictions, MyCanavasID, MyImageID) 
{	
	 var canvas = undefined ;
      if  (MyCanavasID.length == 0)
      {
	     canvas = document.createElement('canvas');
	  }else{
		 canvas = document.getElementById(MyCanavasID); 
	  }
	  canvas.width = video.videoWidth;
	  canvas.height = video.videoHeight;
	  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
	  
	  // affiche l'image dans une nouvelle page -   ceci fonctionne nickel  *************************
	  // Convertir l'image capturée en base64
	      const dataURL = canvas.toDataURL('image/jpeg');
	  // Afficher la photo dans un nouvel onglet
		//const newTab = window.open();
		//newTab.document.write('<img src="' + dataURL + '"/>');
	  // ****************************************************************************************************
	  
	  // Afficher la photo dans l'élément img dont l'id = LKContainerImage  ********************************** 
	     //document.getElementById(MyImageID).src = dataURL;
	   
	  // Appeler la fonction pour actualiser l'image  // Créer une nouvelle instance de l'élément im
		//actualiserImage(dataURL);
}

// Fonction pour capturer une photo a partir de la camera
async function capturePhotoV2(MyImageID, MyCanavasID) 
{	
	 var canvas = undefined ;
      if  (MyCanavasID.length == 0)
      {
	     canvas = document.createElement('canvas');
	  }else{
		 canvas = document.getElementById(MyCanavasID); 
	  }
	  canvas.width = video.videoWidth;
	  canvas.height = video.videoHeight;
	  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
	  
	  // affiche l'image dans une nouvelle page -   ceci fonctionne nickel  *************************
	  // Convertir l'image capturée en base64
	      const dataURL = canvas.toDataURL('image/jpeg');
	  // Afficher la photo dans un nouvel onglet
		//const newTab = window.open();
		//newTab.document.write('<img src="' + dataURL + '"/>');
	  // ****************************************************************************************************
	  
	  // Afficher la photo dans l'élément img dont l'id = LKContainerImage  ********************************** 
	  // document.getElementById(MyImageID).src = dataURL;
	   
	  // Appeler la fonction pour actualiser l'image  // Créer une nouvelle instance de l'élément im
		//actualiserImage(dataURL);
}

async function RunqSINGLEPOSEModel(MyCanvaID)
{
	/*    Le modele a normalement été chargé avant que le bouton enabled Camera ne s'active
	document.getElementById('LKMessage').innerHTML="Veuillez patienter durant le chargement du modèle" ;
	if (MoveNetModel === undefined)
	{
	     MoveNetModel = await tf.loadGraphModel(Model_Path_SINGLEPOSE, {fromTFHub: true}) ;
	}
	document.getElementById('LKMessage').innerHTML="Modèle chargé" ;
	
	// 'rgba(255, 255, 255, 0.9)'; // Couleur du texte blanche avec 90% d'opacité
	ModifierCouleur_DIV('LKMessage', 'rgb(52, 152, 219)', 'rgba(255, 255, 255, 0.9)', 'rgb(41, 128, 185)') ;
	*/
	
	const MyImg2DetectPose = document.getElementById(MyCanvaID) ;
	let exempleInputTensor = tf.zeros([1,192,192,3], 'int32') ;  // cree un shape remplis de zero suivant la doc, les images sont de tailles 192*192 dans ce modele, 3 pour recevoir les valeurs X,Y et score de confiance
	                                                             // Tensorflow n'accepte qu'au maximum une taille de 192*192 => il faudra redimensionner l'image
	//console.log("shape de mon image :" + MyImg2DetectPose.shape) ;
	
	let imageTensor = tf.browser.fromPixels(MyImg2DetectPose) ;  // ImageTensor serait de type tf.Tensor3D

	// notre image etant rectangulaire alors que Tensorflow n'accepte que du carré (192*192) => 3 possibilité pour redimensionner l'image qui prendra place dans ce carre
	       // soit faire un stretch, l'image prendra place dans le carré mais sera déformée
		   // faire un pad  => des bandes noires apparaitront sur la hauteur ou la largeur  mais l'image gardera ces proportion
		   // faire un crop => selectionner une partie de l'image qui rentrera dans le carré	
	let resizedTensor = tf.image.resizeBilinear(imageTensor, [192,192], true).toInt() ;  // methode de redimensionnement de l'image a la taille de 192*192
																						// possible d'utilise ResizeNearestNeighbour cree une image plus pixelisee mais conserve les couleurs	
	
	//let tensorOutput = MoveNetModel.predict(exempleInputTensor) ;
	let tensorOutput = MoveNetModel.predict(tf.expandDims(resizedTensor)) ;
	
	//console.log(imageTensor) ;
	
	let arrayOutput = await tensorOutput.array() ;
	
	//console.log(arrayOutput) ;

	
	// dessine des cercles representants les points identifiés 
	//PositionningCanvas("exempleImg","canvas") ; // positionne le canvas sur l'image de maniere a pouvoir dessiner dessus
    ClearCanvas('VideoCanvas') ;
	DrawTensorArray(arrayOutput,'webcam','VideoCanvas') ;
	//draw() ;
	//drawCircle("exempleImg","canvas", 50,50, 12) ;
	//dessinerCercleSuivantSouris("exempleImg","canvas", 50) ;
}


// Fonction pour capturer une photo a partir de la camera
function capturePhoto(MyImageID, MyCanavasID) 
{	
	 var canvas = undefined ;
      if  (MyCanavasID.length == 0)
      {
	     canvas = document.createElement('canvas');
	  }else{
		 canvas = document.getElementById(MyCanavasID); 
	  }
	  canvas.width = video.videoWidth;
	  canvas.height = video.videoHeight;
	  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
	  
	  // affiche l'image dans une nouvelle page -   ceci fonctionne nickel  *************************
	  // Convertir l'image capturée en base64
	      const dataURL = canvas.toDataURL('image/jpeg');
	  // Afficher la photo dans un nouvel onglet
		//const newTab = window.open();
		//newTab.document.write('<img src="' + dataURL + '"/>');
	  // ****************************************************************************************************
	  
	  // Afficher la photo dans l'élément img dont l'id = LKContainerImage  ********************************** 
	   document.getElementById(MyImageID).src = dataURL;
	   
	  // Appeler la fonction pour actualiser l'image  // Créer une nouvelle instance de l'élément im
		//actualiserImage(dataURL);
}


async function RecadrerImage()
{
	// Recadrer image avec Tensorflow
	var myCroppedTensor = await cropImage('exempleImg')  ;  // exempleImg est l'Id du composant Image du fichier HTML
	// le tenseur à pour taille 192 * 192  (on ne sait pas modifier cela c'est defini dans TensorFlow)
	AfficherTensorArrayToDivComponent(myCroppedTensor, 'LKMessage') ;
	AfficherTensorArrayToImageComponent(myCroppedTensor, 'ImgRecadree')
}

async function AfficherTensorArrayToDivComponent(CroppedTensor, MonImageId)
{
	// Obtenir les valeurs du tenseur recadré sous forme de tableau JavaScript
    const croppedValues = await CroppedTensor.array();

    // Afficher les valeurs dans le HTML
    const displayElement = document.getElementById(MonImageId);
	displayElement.innerHTML = "Information contenue dans le TENSEUR represantant l image recadree" ;
    displayElement.innerHTML = displayElement.innerHTML + "<br><br>" + JSON.stringify(croppedValues);
}

async function AfficherTensorArrayToImageComponent(CroppedTensor, MonImageId)
{
	// Récupérer les valeurs du tenseur en tant qu'Array2D
    const croppedArray = await CroppedTensor.array();

    // Extraire l'image du batch
    const imageArray = croppedArray[0]; // Première image du batch (index 0)

    // Créer un élément canvas pour dessiner l'image
    const canvas = document.createElement('canvas');
    canvas.width = imageArray[0].length; // Largeur de l'image
    canvas.height = imageArray.length; // Hauteur de l'image
    const context = canvas.getContext('2d');

    // Créer un tableau de pixels pour l'image
    const imageData = context.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Remplir les données de pixels avec les valeurs de l'Array2D
    for (let i = 0; i < imageArray.length; i++) {
        for (let j = 0; j < imageArray[i].length; j++) {
            const pixelIndex = (i * canvas.width + j) * 4;
            data[pixelIndex] = imageArray[i][j][0]; // Rouge
            data[pixelIndex + 1] = imageArray[i][j][1]; // Vert
            data[pixelIndex + 2] = imageArray[i][j][2]; // Bleu
            data[pixelIndex + 3] = 255; // Alpha (opaque)
        }
    }

    // Dessiner l'image sur le canvas
    context.putImageData(imageData, 0, 0);

    // Convertir le canvas en image et l'afficher
    const imgElement = document.getElementById(MonImageId);
    imgElement.src = canvas.toDataURL();
}

async function cropImage(MonImageId) {
    // Charger l'image à partir d'un élément HTML
    const imgElement = document.getElementById(MonImageId);
    const imageTensor = tf.browser.fromPixels(imgElement);

    // Coordonnées et taille du recadrage
      // valeur de test
	/*
	const cropStartX = 100; // Coordonnée X de départ
    const cropStartY = 50;  // Coordonnée Y de départ
    const cropWidth = 200;  // Largeur du recadrage
    const cropHeight = 150; // Hauteur du recadrage
	*/
	
	
	var cropStartX = parseInt(document.getElementById('posY').value) ;
	var cropStartY = parseInt(document.getElementById('posX').value) ;
	var cropWidth = parseInt(document.getElementById('SqHeight').value) ;
	var cropHeight = parseInt(document.getElementById('SqWidth').value );
	
	
	
	 // Calculer les coordonnées des boîtes de recadrage
    const boxes = [[cropStartX / imgElement.width, cropStartY / imgElement.height, (cropStartX + cropWidth) / imgElement.width, (cropStartY + cropHeight) / imgElement.height]];


    // Effectuer le recadrage
	        /*
			const croppedTensor = tf.image.cropAndResize(
				tf.expandDims(imageTensor), // Ajouter une dimension pour obtenir un batch de taille 1
				[{x: cropStartX, y: cropStartY, width: cropWidth, height: cropHeight}], // Coordonnées et taille du recadrage
				[0], // Indice du batch
				[192, 192] // Taille de sortie
			);
			*/
	const croppedTensor = tf.image.cropAndResize(
        tf.expandDims(imageTensor), // Ajouter une dimension pour obtenir un batch de taille 1
        boxes, // Coordonnées des boîtes de recadrage
        [0], // Indice du batch
        [192, 192] // Taille de sortie
    );

    // Afficher le tenseur recadré dans la console
    croppedTensor.print();
    
    // Libérer la mémoire en supprimant les tenseurs temporaires
    imageTensor.dispose();
    //croppedTensor.dispose();
	
	return croppedTensor ;
}


async function LoadAndRunqSINGLEPOSEModelOnDelimitedRectangle()
{
	document.getElementById('LKMessage').innerHTML="Veuillez patienter durant le chargement du modèle" ;
	if (MoveNetModel === undefined)
	{
	     MoveNetModel = await tf.loadGraphModel(Model_Path_SINGLEPOSE, {fromTFHub: true}) ;
	}
	document.getElementById('LKMessage').innerHTML="Modèle chargé" ;
	
	// 'rgba(255, 255, 255, 0.9)'; // Couleur du texte blanche avec 90% d'opacité
	ModifierCouleur_DIV('LKMessage', 'rgb(52, 152, 219)', 'rgba(255, 255, 255, 0.9)', 'rgb(41, 128, 185)') ;
	
	
	const MyImg2DetectPose = document.getElementById('exempleImg') ;
	let exempleInputTensor = tf.zeros([1,192,192,3], 'int32') ;  // cree un shape remplis de zero suivant la doc, les images sont de tailles 192*192 dans ce modele, 3 pour recevoir les valeurs X,Y et score de confiance
	                                                            // Tensorflow n'accepte qu'au maximum une taille de 192*192 => il faudra redimensionner l'image
	
	//let imageTensor = tf.browser.fromPixels(MyImg2DetectPose,3,{dtype: 'int32'}) ;  // ImageTensor serait de type tf.Tensor3D
	let imageTensor = tf.browser.fromPixels(MyImg2DetectPose) ;  // ImageTensor serait de type tf.Tensor3D
	console.log("shape de mon image :" + imageTensor.shape) ; 
	
	// notre image etant rectangulaire alors que Tensorflow n'accepte que du carré (192*192) => 3 possibilité pour redimensionner l'image qui prendra place dans ce carre
	       // soit faire un stretch, l'image prendra place dans le carré mais sera déformée
		   // faire un pad  => des bandes noires apparaitront sur la hauteur ou la largeur  mais l'image gardera ces proportion
		   // faire un crop => selectionner une partie de l'image qui rentrera dans le carré	
    posx = document.getElementById('posX').value ;
	posy = document.getElementById('posY').value ;
	Width = document.getElementById('SqWidth').value ;
	Height = document.getElementById('SqHeight').value ;
	
	 // indiquer dans le tenseur le point de depart du rectangle (point superieur gauche)
	 // dans le tenseur la premiere valeur doit correpondre à la hauteur (axe Y) ,  puis la largeur (axe X) + UNE VALEUR 0 qui represente la valeur de depart de la couleur (R, G, B)  => 0 = Rouge  
	let cropStartPoint = [posy, posx, 0] ;   // posy est donc positionné en premier
	//let cropStartPoint = [posx, posy, 0] ;
	let cropStartPointTensor = tf.tensor1d(cropStartPoint, 'int32');

	
	// fournir maintenant la taille du recadrage que nous tiendrons compte dans l'image (si possible un carré puisque le tenseur est de taille 192*192)
	let cropSize = [Height, Width, 3] ;   // la hauteur en premier (axe Y),  3 pour finir car nous souhaiton prendre tous les canaux de couleur
	let cropSizeTensor = tf.tensor1d(cropSize, 'int32');	
		
	// finalement recadrer et fournir un tenseur recadré
	  //let croppedTensor = tf.slice(imageTensor, cropStartPoint, cropSize) ; // mon image, point de depart du rectangle(carre), taille du rectangle (carre de preference)                                                                         // genere une erreur si pas converti en tenseur 'int32' via  et cropSizeTensor = tf.tensor1d(cropSize, 'int32'); 
    let croppedTensor = tf.slice(imageTensor, cropStartPointTensor, cropSizeTensor); 
	
	let resizedTensor = tf.image.resizeBilinear(imageTensor, [192,192], true).toInt() ;  // methode de redimensionnement de l'image a la taille de 192*192
																						// possible d'utilise ResizeNearestNeighbour cree une image plus pixelisee mais conserve les couleurs
	
	console.log("shape de mon image recadree :" + resizedTensor.shape) ;
	
	let tensorOutput = MoveNetModel.predict(tf.expandDims(resizedTensor)) ;
	console.log("Tenseur de mon image recadree :" +imageTensor) ;
	let arrayOutput = await tensorOutput.array() ;
	
	PositionningCanvas("exempleImg","canvas") ; // positionne le canvas sur l'image de maniere a pouvoir dessiner dessus
	
	// dans la fonction ci dessous il faudra certainement tenir compte du recadrage
	DrawTensorArray(arrayOutput,"exempleImg","canvas") ; 
}

async function LoadAndRunqSINGLEPOSEModel_img2()
{
	document.getElementById('LKMessage').innerHTML="Veuillez patienter durant le chargement du modèle" ;
	if (MoveNetModel === undefined)
	{
	     MoveNetModel = await tf.loadGraphModel(Model_Path_SINGLEPOSE, {fromTFHub: true}) ;
	}
	document.getElementById('LKMessage').innerHTML="Modèle chargé" ;
	
	// 'rgba(255, 255, 255, 0.9)'; // Couleur du texte blanche avec 90% d'opacité
	ModifierCouleur_DIV('LKMessage', 'rgb(52, 152, 219)', 'rgba(255, 255, 255, 0.9)', 'rgb(41, 128, 185)') ;
	
	
	const MyImg2DetectPose = document.getElementById('ImgRecadree') ;
	let exempleInputTensor = tf.zeros([1,192,192,3], 'int32') ;  // cree un shape remplis de zero suivant la doc, les images sont de tailles 192*192 dans ce modele, 3 pour recevoir les valeurs X,Y et score de confiance
	                                                             // Tensorflow n'accepte qu'au maximum une taille de 192*192 => il faudra redimensionner l'image
	console.log("shape de mon image :" + MyImg2DetectPose.shape) ;
	
	let imageTensor = tf.browser.fromPixels(MyImg2DetectPose) ;  // ImageTensor serait de type tf.Tensor3D

	// notre image etant rectangulaire alors que Tensorflow n'accepte que du carré (192*192) => 3 possibilité pour redimensionner l'image qui prendra place dans ce carre
	       // soit faire un stretch, l'image prendra place dans le carré mais sera déformée
		   // faire un pad  => des bandes noires apparaitront sur la hauteur ou la largeur  mais l'image gardera ces proportion
		   // faire un crop => selectionner une partie de l'image qui rentrera dans le carré	
	let resizedTensor = tf.image.resizeBilinear(imageTensor, [192,192], true).toInt() ;  // methode de redimensionnement de l'image a la taille de 192*192
																						// possible d'utilise ResizeNearestNeighbour cree une image plus pixelisee mais conserve les couleurs	
	
	//let tensorOutput = MoveNetModel.predict(exempleInputTensor) ;
	let tensorOutput = MoveNetModel.predict(tf.expandDims(resizedTensor)) ;
	
	console.log(imageTensor) ;
	
	let arrayOutput = await tensorOutput.array() ;
	
	console.log(arrayOutput) ;

	
	// dessine des cercles representants les points identifiés 
	PositionningCanvas("ImgRecadree","canvas2") ; // positionne le canvas sur l'image de maniere a pouvoir dessiner dessus
	DrawTensorArray(arrayOutput,"ImgRecadree","canvas2") ;
	
	// la calcul de la posture est réalisé sur l'image recadree => il faut tenir compte du décalage pour replacer les 
	
	posx = parseInt(document.getElementById('posX').value) ;
	posy = parseInt(document.getElementById('posY').value) ;
	Width = document.getElementById('SqWidth').value ;
	Height = document.getElementById('SqHeight').value ;
	DrawTensorArrayOnImageComplete (arrayOutput,"exempleImg","canvas", posx,posy,"ImgRecadree" ) ;
}


async function LoadAndRunqSINGLEPOSEModel()
{
	document.getElementById('LKMessage').innerHTML="Veuillez patienter durant le chargement du modèle" ;
	if (MoveNetModel === undefined)
	{
	     MoveNetModel = await tf.loadGraphModel(Model_Path_SINGLEPOSE, {fromTFHub: true}) ;
	}
	document.getElementById('LKMessage').innerHTML="Modèle chargé" ;
	
	// 'rgba(255, 255, 255, 0.9)'; // Couleur du texte blanche avec 90% d'opacité
	ModifierCouleur_DIV('LKMessage', 'rgb(52, 152, 219)', 'rgba(255, 255, 255, 0.9)', 'rgb(41, 128, 185)') ;
	
	const MyImg2DetectPose = document.getElementById('exempleImg') ;
	let exempleInputTensor = tf.zeros([1,192,192,3], 'int32') ;  // cree un shape remplis de zero suivant la doc, les images sont de tailles 192*192 dans ce modele, 3 pour recevoir les valeurs X,Y et score de confiance
	                                                             // Tensorflow n'accepte qu'au maximum une taille de 192*192 => il faudra redimensionner l'image
	console.log("shape de mon image :" + MyImg2DetectPose.shape) ;
	
	let imageTensor = tf.browser.fromPixels(MyImg2DetectPose) ;  // ImageTensor serait de type tf.Tensor3D

	// notre image etant rectangulaire alors que Tensorflow n'accepte que du carré (192*192) => 3 possibilité pour redimensionner l'image qui prendra place dans ce carre
	       // soit faire un stretch, l'image prendra place dans le carré mais sera déformée
		   // faire un pad  => des bandes noires apparaitront sur la hauteur ou la largeur  mais l'image gardera ces proportion
		   // faire un crop => selectionner une partie de l'image qui rentrera dans le carré	
	let resizedTensor = tf.image.resizeBilinear(imageTensor, [192,192], true).toInt() ;  // methode de redimensionnement de l'image a la taille de 192*192
																						// possible d'utilise ResizeNearestNeighbour cree une image plus pixelisee mais conserve les couleurs	
	
	//let tensorOutput = MoveNetModel.predict(exempleInputTensor) ;
	let tensorOutput = MoveNetModel.predict(tf.expandDims(resizedTensor)) ;
	
	console.log(imageTensor) ;
	
	let arrayOutput = await tensorOutput.array() ;
	
	console.log(arrayOutput) ;

	
	// dessine des cercles representants les points identifiés 
	PositionningCanvas("exempleImg","canvas") ; // positionne le canvas sur l'image de maniere a pouvoir dessiner dessus
	DrawTensorArray(arrayOutput,"exempleImg","canvas") ;
	//draw() ;
	//drawCircle("exempleImg","canvas", 50,50, 12) ;
	//dessinerCercleSuivantSouris("exempleImg","canvas", 50) ;
}

function DrawTensorArray(arrayOutput, MyImageID, MyCanvasID)
{
	const MyImg2DetectPose = document.getElementById(MyImageID) ;
	
	// arrayOutput est un tableau de tenseur qui est contitué d'un tableau lui même constitué d'un tableau de 17 lignes.
	// chacune des 17 lignes comprend un tableau de 3 valeurs [Pourcentage en Y, Pourcentage en X, pourcentage de prediction]
	// Pourcentage en Y = position du point determiné en Y  => pour trouver la positiuon du point en pixel faire (hauteur image/100 *Pourcentage en Y ) 
	for (let i = 0; i < arrayOutput[0][0].length; i++) {
        PoseArray = arrayOutput[0][0] ;   // 
		Y = PoseArray[i][0] ;  // en tensorflow la premiere valeur represente le Y et non comme habituellement l'axe X  => la valeur est un pourcentage de la hauteur
		X = PoseArray[i][1] ;  // => la valeur est un pourcentage de la largeur
		PredictPoucentage = PoseArray[i][2] ;
		
		console.log( "X :" + X + " - Y: " + Y + " - Prediction : " + PredictPoucentage) ;
		Y = (MyImg2DetectPose.height/100) * (Y*100) ;
		X = (MyImg2DetectPose.width/100) * (X*100) ;
		drawCircle(MyImageID,MyCanvasID, X,Y,5) ;
    }
}

function DrawTensorArrayOnImageComplete (arrayOutput, MyImageID, MyCanvasID, posx,posy, IDImageRecadree ) 
{
	const MyImg2DetectPose = document.getElementById(MyImageID) ;
	const MyImgRecadreePose = document.getElementById(IDImageRecadree) ;
	
	// arrayOutput est un tableau de tenseur qui est contitué d'un tableau lui même constitué d'un tableau de 17 lignes.
	// chacune des 17 lignes comprend un tableau de 3 valeurs [Pourcentage en Y, Pourcentage en X, pourcentage de prediction]
	// Pourcentage en Y = position du point determiné en Y  => pour trouver la positiuon du point en pixel faire (hauteur image/100 *Pourcentage en Y ) 
	for (let i = 0; i < arrayOutput[0][0].length; i++) {
        PoseArray = arrayOutput[0][0] ;   // 
		Y = PoseArray[i][0] ;  // en tensorflow la premiere valeur represente le Y et non comme habituellement l'axe X  => la valeur est un pourcentage de la hauteur
		X = PoseArray[i][1] ;  // => la valeur est un pourcentage de la largeur
		PredictPoucentage = PoseArray[i][2] ;
		
		console.log( "X :" + X + " - Y: " + Y + " - Prediction : " + PredictPoucentage) ;
		Y = ((MyImgRecadreePose.height/100) * (Y*100)) + posy ;
		X = ((MyImgRecadreePose.width/100) * (X*100)) + posx ;
		drawCircle(MyImageID,MyCanvasID, X,Y,5) ;
    }
	
}

function DrawDelimitationSquare()
{
	PositionningCanvas("exempleImg","canvas") ; // positionne le canvas avant delimitation => on verra les deux rectangle sinon le canva s'efface entre les deux appels
	DrawDelimitationSquarePixelView();
	//DrawDelimitationSquareTensorView() ;  // ne sert a rien car il faudrait d'abord tourner l'image contenue dans exempleImg de 90°
}

function DrawDelimitationSquarePixelView()
{
	posx = document.getElementById('posX').value ;
	posy = document.getElementById('posY').value ;
	Width = document.getElementById('SqWidth').value ;
	Height = document.getElementById('SqHeight').value ;
	//PositionningCanvas("exempleImg","canvas") ; // positionne le canvas sur l'image de maniere a pouvoir dessiner dessus
	theColor ='rgba(255, 0, 0, 0.5)' ;
	if ((posx>0) && (posy>0) && (Width>0) && (Height>0))
	{
		DrawRectangle("exempleImg","canvas",posx, posy, Width, Height, theColor);	
	}else{
		//alert("encoder des valeurs delimtant le rectangle ou utiliser les sliders") ;
		document.getElementById('LKMessage').innerHTML = ("encoder des valeurs delimtant le rectangle ou utiliser les sliders") ;
		ModifierCouleur_DIV('LKMessage', 'rgb(255, 152, 219)', 'rgba(255, 255, 255, 0.9)', 'rgb(41, 128, 185)') ;
	}
}

function DrawDelimitationSquareTensorView()
{
	posx = document.getElementById('posY').value ;
	posy = document.getElementById('posX').value ;
	Width = document.getElementById('SqHeight').value ;
	Height = document.getElementById('SqWidth').value ;
	//PositionningCanvas("exempleImg","canvas") ; // positionne le canvas sur l'image de maniere a pouvoir dessiner dessus
	theColor ='rgba(0, 255, 0, 0.5)' ;
    DrawRectangle("exempleImg","canvas",posx, posy, Width, Height, theColor);	
}

function draw() {
  const img = document.getElementById("exempleImg");
  var canvas = document.getElementById('canvas');
  
    // Définir la position du canvas au-dessus de l'image
    var rect = img.getBoundingClientRect();
    canvas.style.position = 'absolute';
    //canvas.style.top = rect.top + 'px';
    //canvas.style.left = rect.left + 'px';
	canvas.style.top = 0 + 'px';
    canvas.style.left = 0 + 'px';
	//canvas.style.top = rect.top + window.pageYOffset + 'px';
    //canvas.style.left = rect.left + window.pageXOffset + 'px';
	
	// Vérifier si rect.top est négatif
    //var topPosition = Math.max(rect.top + window.pageYOffset, 0);
    //var leftPosition = Math.max(rect.left + window.pageXOffset, 0);
    //canvas.style.top = topPosition + 'px';
    //canvas.style.left = leftPosition + 'px';

  
    // Définir la largeur et la hauteur du canvas comme étant celles de l'image
    canvas.width = img.width;
    canvas.height = img.height;
	canvas.style.border = '1px solid black'; // Ajouter une bordure pour visualiser le canvas
    

    // Récupérer le contexte 2D du canvas
    var ctx = canvas.getContext('2d');
	
	// Dessiner un cercle sur le canvas
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = 50; // Rayon du cercle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Couleur de remplissage du cercle
    ctx.fill();
    ctx.lineWidth = 2; // Épaisseur de la ligne du cercle
    ctx.strokeStyle = '#FF0000'; // Couleur de la bordure du cercle
    ctx.stroke();
}

function CopieUnePartieImage()
{
	posx = document.getElementById('posX').value ;
	posy = document.getElementById('posY').value ;
	Width = document.getElementById('SqWidth').value ;
	Height = document.getElementById('SqHeight').value ;
	CopiePartieImage("exempleImg", "ImgRecadree", posx, posy, Width, Height)  ;
}

function ZoomPlus()
{
	if ((posx>0) && (posy>0) && (Width>0) && (Height>0))
	{
		//const canvas = document.getElementById('canvas');
		//const ctx = canvas.getContext('2d');
		const imageSrc = document.getElementById('exempleImg');
		
		const imageZoomee = document.getElementById('ImgRecadree');
		const canvas2 = document.getElementById('canvas2');  // canvas du composant image 'ImgRecadree'
		const ctxDest = canvas2.getContext('2d');
		//PositionningCanvas('ImgRecadree','canvas2');   // etre sur que le caneva est positionné sur l'image de nom 'ImgRecadree'
		
		// zoom partie d'image
		posx = document.getElementById('posX').value ;
		posy = document.getElementById('posY').value ;
		Width = document.getElementById('SqWidth').value ;
		Height = document.getElementById('SqHeight').value ;
		Zfactor = 2.5
		//var ZoomFactor = document.getElementById("myZoomSlider");
		Zfactor = ZoomFactor.value ;
		document.getElementById('ZoomScale').innerHTML = Zfactor.toString() ;
		stretchDraw(ctxDest, imageSrc, posx, posy, Width, Height, 0, 0, (Width*Zfactor), (Height*Zfactor));
		
		// Convertir le contenu du canvas en URL de donnée
		//const dataURL = canvas2.toDataURL();            
					
		// Mettre à jour l'image de destination avec la partie copiée
		//imageZoomee.src = dataURL;
    }else{
		alert ("Veuillez utiliser les slider pour definir la portion d image a zoomer") ;
	}       
}

function ZoomMinus()
{
	if ((posx>0) && (posy>0) && (Width>0) && (Height>0))
	{
		//const canvas = document.getElementById('canvas');
		//const ctx = canvas.getContext('2d');
		const imageSrc = document.getElementById('exempleImg');
		
		const imageZoomee = document.getElementById('ImgRecadree');
		const canvas2 = document.getElementById('canvas2');  // canvas du composant image 'ImgRecadree'
		const ctxDest = canvas2.getContext('2d');
		//PositionningCanvas('ImgRecadree','canvas2');   // etre sur que le caneva est positionné sur l'image de nom 'ImgRecadree'
		
		// zoom partie d'image
		posx = document.getElementById('posX').value ;
		posy = document.getElementById('posY').value ;
		Width = document.getElementById('SqWidth').value ;
		Height = document.getElementById('SqHeight').value ;
		Zfactor = 2.5
		//var ZoomFactor = document.getElementById("myZoomSlider");
		Zfactor = ZoomFactor.value ;
		document.getElementById('ZoomScale').innerHTML = Zfactor.toString() ;
		stretchDraw(ctxDest, imageSrc, posx, posy, Width, Height, 0, 0, (Width* (1/Zfactor)), (Height* (1/Zfactor)) );
		
		// Convertir le contenu du canvas en URL de donnée
		//const dataURL = canvas2.toDataURL();            
					
		// Mettre à jour l'image de destination avec la partie copiée
		//imageZoomee.src = dataURL;
    }else{
		alert ("Veuillez utiliser les slider pour definir la portion d image a zoomer") ;	
	}
}
