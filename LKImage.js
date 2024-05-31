
// usage : le fichier HTML doit contenir un bt   <input type="file" id="loadImageBt" accept="image/*">
           //dans un fichier js ne pas oublier de lier cette fcontion a l'evenement declancheur du bouton  :
		   //document.getElementById('loadImageBt').addEventListener('click',ChargerImageFromHD); 
		   
		   // // si besoin d'Importer de la fonction dans un autre fichier js => utiliser :   import { maFonction } from './fichier1.js';
		        // uniquement  si <script type="module" src="lkimage.js"></script> a ete chargé de cette maniere dns le fichier html 

async function ChargerImageFromHD()
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


async function AfficherTexte(TextResult, MyCanavasID, x,y) 
{
	var canvas = undefined ;
	canvas = document.getElementById(MyCanavasID);
	
	// Draw recognized text
    canvas.getContext('2d').fillStyle = 'blue';
    canvas.getContext('2d').font = '20px Arial';
	const strCopy = TextResult.split('\n');
	strCopy.forEach(function (item, index ) {
			canvas.getContext('2d').fillText(item, x, y);
			y = y +10 ;
	});
	//canvas.getContext('2d').fillText(TextResult, x, y);
}

/**
    * stretchDraw Draws a portion of an image onto a canvas, scaling it to fit the destination rectangle.
    * 
    * @param {CanvasRenderingContext2D} ctx - The rendering context of the canvas.
    * @param {HTMLImageElement} image - The source image.
    * @param {number} sx - The x coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
    * @param {number} sy - The y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
    * @param {number} sWidth - The width of the sub-rectangle of the source image to draw into the destination context.
    * @param {number} sHeight - The height of the sub-rectangle of the source image to draw into the destination context.
    * @param {number} dx - The x coordinate in the destination canvas at which to place the top-left corner of the source sub-rectangle.
    * @param {number} dy - The y coordinate in the destination canvas at which to place the top-left corner of the source sub-rectangle.
    * @param {number} dWidth - The width to draw the image in the destination canvas.
    * @param {number} dHeight - The height to draw the image in the destination canvas.
 */
 // stretchDraw copie une partie de l'image source dans un Canvas => ZOOM sur image (si dim canevas > dim de la portion d'image)
 function stretchDraw(ctxDest, imageSrc, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
     ctxDest.drawImage(imageSrc, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
 }

function CopiePartieImage(imagedepartId, imagearriveeId, x, y, width, height) 
{
            // Récupérer les éléments img par leurs IDs
            const imagedepart = document.getElementById(imagedepartId);
            const imagearrivee = document.getElementById(imagearriveeId);

            // Créer un canvas temporaire
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

                // Définir les dimensions du canvas
                canvas.width = width;
                canvas.height = height;

                // Dessiner la partie de l'image source sur le canvas
                ctx.drawImage(imagedepart, x, y, width, height, 0, 0, width, height);

                // Convertir le contenu du canvas en URL de donnée
                const dataURL = canvas.toDataURL();

                // Mettre à jour l'image de destination avec la partie copiée
                imagearrivee.src = dataURL;
           

            // Forcer le chargement de l'image source si elle est mise à jour dynamiquement
            //if (imagedepart.complete) {
                //imagedepart.onload();
            //}
}

function applyContrast(myContrastValue, MyCanvasID) {
	        
	        //La variable myContrastValue peut prendre des valeurs entre -100 et 100.    
			//Des valeurs négatives de contrast réduisent le contraste, tandis que des valeurs positives l'augmentent.
            
			//const contrast = parseInt(contrastSlider.value);
			const contrast = parseInt(myContrastValue);
			
			const canvas = document.getElementById(MyCanvasID);
			const context = canvas.getContext('2d');
			
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
			// Calcule le facteur de contraste			
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
			// Applique le facteur de contraste à chaque pixel
            for (let i = 0; i < data.length; i += 4) {
                data[i] = truncate(factor * (data[i] - 128) + 128);     // Red
                data[i + 1] = truncate(factor * (data[i + 1] - 128) + 128); // Green
                data[i + 2] = truncate(factor * (data[i + 2] - 128) + 128); // Blue
            }
			// Met à jour le canvas avec les nouvelles données d'image
            context.putImageData(imageData, 0, 0);
}

function truncate(value) {
	 // Assure que la valeur reste dans les limites 0-255
     return Math.min(255, Math.max(0, value));
}


// Fonction de prétraitement de l'image
function preprocessImage(canvas, ctx) {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        // Convertir en niveaux de gris
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue

        // Augmenter le contraste (simple threshold)
        data[i] = data[i] > 128 ? 255 : 0; // Red
        data[i + 1] = data[i + 1] > 128 ? 255 : 0; // Green
        data[i + 2] = data[i + 2] > 128 ? 255 : 0; // Blue
    }

    // Mettre à jour le canvas avec l'image prétraitée
    ctx.putImageData(imageData, 0, 0);
}


function ConvertirImageEnNiveauxdeGris(canvas, ctx) {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        // Convertir en niveaux de gris
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
    }

    // Mettre à jour le canvas avec l'image prétraitée
    ctx.putImageData(imageData, 0, 0);
}

function ConvertirImageEnNiveauxdeGris_V2(canvas, ctx) {
	// Cette moyenne pondérée est généralement calculée comme suit : 0.3*R + 0.59*G + 0.11*B 
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        // Convertir en niveaux de gris
        var gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];  // classique niveau de gris
		    //var gray = 0.9 * data[i] + 0.9 * data[i + 1] + 0.9 * data[i + 2]; // pas mal, certain contour seulement visisble
        data[i] = data[i + 1] = data[i + 2] = gray;
    }

    // Mettre à jour le canvas avec l'image prétraitée
    ctx.putImageData(imageData, 0, 0);
}

function InverserCouleur(canvas, ctx) {
	// Cette moyenne pondérée est généralement calculée comme suit : 0.3*R + 0.59*G + 0.11*B 
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height, { willReadFrequently: true });
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
         // Inverser les couleurs
        for (var i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }

    // Mettre à jour le canvas avec l'image prétraitée
    ctx.putImageData(imageData, 0, 0);
}

function MettreImageDansCanvas(imageSrcID, MyCanvasID)
{
	var ImageSrc =  document.getElementById(imageSrcID);
	
	const canvas = document.getElementById(MyCanvasID);
	const ctx = canvas.getContext('2d');
	
	canvas.width = ImageSrc.width;
	canvas.height = ImageSrc.height;
	ctx.drawImage(ImageSrc, 0, 0, canvas.width, canvas.height);
	
}

//  USAGE : FlouGaussien(canvas, ctx, 'blur(5px)') ;
function FlouGaussien(canvas, ctx, MyFiltre) {
    // Cette moyenne pondérée est généralement calculée comme suit : 0.3*R + 0.59*G + 0.11*B 
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    // Créer un canvas temporaire pour appliquer le filtre de flou
    var blurredCanvas = document.createElement('canvas');
    blurredCanvas.width = canvas.width;
    blurredCanvas.height = canvas.height;
    var blurredContext = blurredCanvas.getContext('2d');

    // Appliquer le filtre de flou
    blurredContext.filter = MyFiltre; // Exemple: 'blur(5px)'
    blurredContext.drawImage(canvas, 0, 0);

    // Récupérer les données d'image du canvas flouté
    var blurredImageData = blurredContext.getImageData(0, 0, blurredCanvas.width, blurredCanvas.height);
    var blurredData = blurredImageData.data;

    // Optionnel: Mettre à jour le canvas original avec l'image floutée
    // ctx.putImageData(blurredImageData, 0, 0);

    return blurredData;
}

// Mélanger les images (fusion entre l'image originale et le flou Gaussien)
function MelangerImage(canvas, ctx, blurredData) {
    // Récupérer les données de l'image originale
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    // Mélanger les images (fusion)
    for (var i = 0; i < data.length; i += 4) {
        var blendedR = data[i] / 255 * blurredData[i] / 255 * 255;
        var blendedG = data[i + 1] / 255 * blurredData[i + 1] / 255 * 255;
        var blendedB = data[i + 2] / 255 * blurredData[i + 2] / 255 * 255;

        data[i] = blendedR;
        data[i + 1] = blendedG;
        data[i + 2] = blendedB;
    }

    // Mettre à jour le canvas avec l'image prétraitée
    ctx.putImageData(imageData, 0, 0);
}


function AugmenterContrasteImage(canvas, ctx, mcontrast) {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
		
		// Augmenter le contraste (simple threshold)
        //data[i] = data[i] > 128 ? 255 : 0; // Red
        //data[i + 1] = data[i + 1] > 128 ? 255 : 0; // Green
        //data[i + 2] = data[i + 2] > 128 ? 255 : 0; // Blue
		
		// Augmenter le contraste (simple threshold)
        data[i] = data[i] > 128 ? mcontrast : 0; // Red
        data[i + 1] = data[i + 1] > 128 ? mcontrast : 0; // Green
        data[i + 2] = data[i + 2] > 128 ? mcontrast : 0; // Blue
		
    }

    // Mettre à jour le canvas avec l'image prétraitée
    ctx.putImageData(imageData, 0, 0);
}


/*
// Fonction pour charger et attendre OpenCV.js
function loadOpenCV() {
	//CHARGER bibliothèque cv de OpenCV.js pour le prétraitement  d'images --> 
    //	  <script async src="https://docs.opencv.org/4.x/opencv.js"></script> 
	
    return new Promise((resolve) => {
        if (cv.getBuildInformation) {
            resolve();
        } else {
            cv['onRuntimeInitialized'] = resolve;
        }
    });
}
*/

//CHARGER bibliothèque cv de OpenCV.js pour le prétraitement  d'images --> 
//	  <script async src="https://docs.opencv.org/4.x/opencv.js"></script> 
async function OPENCV_preprocessImage(canvas, ctx) 
{
	
	// <script async src="https://docs.opencv.org/4.x/opencv.js"></script> 
	
    // Attendre que OpenCV.js soit prêt
        /// await cv['onRuntimeInitialized'];   //-> pas besoin si chagé via la fonction loadOpenCV

    //var ctx = canvas.getContext('2d');
    var img = cv.imread(canvas);
    var gray = new cv.Mat();
    var blurred = new cv.Mat();
    var binary = new cv.Mat();

    // Convertir en niveaux de gris
    cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);

    // Appliquer un flou gaussien pour réduire le bruit
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    // Appliquer un seuil adaptatif pour obtenir une image binaire
    cv.adaptiveThreshold(blurred, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

    // Mettre à jour le canvas avec l'image prétraitée
    cv.imshow(canvas, binary);

    // Libérer la mémoire
    img.delete();
    gray.delete();
    blurred.delete();
    binary.delete();
}

function OpenCV_ConvertirImageEnNiveauxdeGris(canvas, ctx, alpha = 1.0, beta = 0) {
    // Lire l'image à partir du canevas
    let src = cv.imread(canvas);

    // Créer une nouvelle matrice pour l'image en niveaux de gris
    let gray = new cv.Mat();
    
    // Convertir en niveaux de gris
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Ajuster les niveaux de gris (alpha est le gain, beta est le biais)
    // gray.convertTo(destination, type, alpha, beta)
    let adjusted = new cv.Mat();
    gray.convertTo(adjusted, cv.CV_8U, alpha, beta);

    // Mettre à jour le canevas avec l'image en niveaux de gris ajustée
    cv.imshow(canvas, adjusted);

    // Libérer la mémoire
    src.delete();
    gray.delete();
    adjusted.delete();
}

async function OPENCV_SeuillageImage(canvas, ctx, seuil) 
{
	
	// <script async src="https://docs.opencv.org/4.x/opencv.js"></script> 
	
    // Attendre que OpenCV.js soit prêt
        /// await cv['onRuntimeInitialized'];   //-> pas besoin si chagé via la fonction loadOpenCV

    //var ctx = canvas.getContext('2d');
    var img = cv.imread(canvas);
    var gray = new cv.Mat();
   

    // Convertir en niveaux de gris
    cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);
      
	// applique le suillage
	//cv.threshold(gray,seuil,255,cv.THRESH_BINARY)	;
    
    // Mettre à jour le canvas avec l'image prétraitée
    cv.imshow(canvas, gray);

    // Libérer la mémoire
    img.delete();
    gray.delete();
 
}


function sketchEffect(canvas, ctx) {
    // Step 1: Convert to grayscale
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var grayscaleImage = convertToGrayscale(imageData);
    ctx.putImageData(grayscaleImage, 0, 0);

    // Step 2: Apply Gaussian blur
	var filterRadius = 2 ;
    var blurredImage = applyGaussianBlur(canvas, ctx, filterRadius); // filterRadius

    // Step 3: Invert blurred image
    var invertedBlurredImage = invertImage(blurredImage);

    // Step 4: Blend grayscale and inverted blurred images
    var finalImage = blendImages(grayscaleImage, invertedBlurredImage);
    ctx.putImageData(finalImage, 0, 0);
}

function convertToGrayscale(imageData) {
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var avg = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
    return imageData;
}

function invertImage(imageData) {
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
    return imageData;
}

function applyGaussianBlur(canvas, ctx, radius) {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var blurredCanvas = document.createElement('canvas');
    blurredCanvas.width = canvas.width;
    blurredCanvas.height = canvas.height;
    var blurredCtx = blurredCanvas.getContext('2d');
    blurredCtx.filter = `blur(${radius}px)`;
    blurredCtx.putImageData(imageData, 0, 0);
    blurredCtx.drawImage(canvas, 0, 0);
    return blurredCtx.getImageData(0, 0, blurredCanvas.width, blurredCanvas.height);
}

function blendImages(original, blended) {
    var data = original.data;
    var blendedData = blended.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i] = (data[i] * blendedData[i]) / 255;
        data[i + 1] = (data[i + 1] * blendedData[i + 1]) / 255;
        data[i + 2] = (data[i + 2] * blendedData[i + 2]) / 255;
    }
    return original;
}

