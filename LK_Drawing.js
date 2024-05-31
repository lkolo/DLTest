
var startX, startY;
startX = -1 ;
startY = -1 ;
var bCanvasOnRightPosition = false ;

// ajoute des evenement a un canvas (permet de dessiner sur le canevas avec la souris)
function AddEventOnCanvas(myCanvasID, myImageID) 
{
    var canvas = document.getElementById(myCanvasID, myImageID);	
    
	AdapterCanvasOnImage(myCanvasID, myImageID, 'Red') ;  // le canvas sera positionne sur le composant (balise) img
	
	
	// Ajouter des écouteurs d'événements pour les clics de souris et les mouvements de souris
	canvas.addEventListener('mousedown', function(event) {
		handleMouseDown(event, myCanvasID); // Passer l'identifiant du canvas
	});
	canvas.addEventListener('mousemove', function(event) {
		handleMouseMove(event, myCanvasID); // Passer l'identifiant du canvas
	});
  
}

// usage : drawCircle("myIdImage","myIdcanvas", 10, 30, 100) 
// usage : drawCircle("myIdImage","",10, 30, 100) => cree le canvas pour permettre le dessin sur l'image 
function drawCircle(myIdImage,myIdcanvas, mCenterX, mCenterY, mradius) {
  const img = document.getElementById(myIdImage);
  var canvas = undefined ;
  if (myIdcanvas.length === 0)
  {
	  canvas = document.createElement('canvas');
	  canvas.id = "canvas" ;
	  // Ajouter le canvas après l'image dans le DOM
      img.insertAdjacentElement('afterend', canvas);
	  bCanvasOnRightPosition = false ;
  }else{
      canvas = document.getElementById(myIdcanvas);
  }
    // Définir la position du canvas au-dessus de l'image
    var rect = img.getBoundingClientRect();
    
	if (!bCanvasOnRightPosition)
	{
		canvas.style.position = 'absolute';
		canvas.style.top = 0 + 'px';
		canvas.style.left = 0 + 'px';
		
		// Définir la largeur et la hauteur du canvas comme étant celles de l'image
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.style.border = '1px solid black'; // Ajouter une bordure pour visualiser le canvas
    }

    // Récupérer le contexte 2D du canvas
    var ctx = canvas.getContext('2d');
	
	// Effacer le contenu précédent du canvas
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// Dessiner un cercle sur le canvas
    var centerX = mCenterX ;  //canvas.width / 2;
    var centerY = mCenterY ;  // canvas.height / 2;
    var radius = mradius ;   //50; // Rayon du cercle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Couleur de remplissage du cercle
    ctx.fill();
    ctx.lineWidth = 2; // Épaisseur de la ligne du cercle
    ctx.strokeStyle = '#FF0000'; // Couleur de la bordure du cercle
    ctx.stroke();
}

function ClearCanvas (MyCanvasID)
{
	var canvas = document.getElementById(MyCanvasID);
	// Récupérer le contexte 2D du canvas
    var ctx = canvas.getContext('2d');
	
	// Effacer le contenu précédent du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
} 

function drawCircleTest(Mycanvas, mCenterX, mCenterY, mradius)
{
	var canvas = document.getElementById(Mycanvas);
    // Récupérer le contexte 2D du canvas
    var ctx = canvas.getContext('2d');
	
	// Effacer le contenu précédent du canvas
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// Dessiner un cercle sur le canvas
    var centerX = mCenterX ;  //canvas.width / 2;
    var centerY = mCenterY ;  // canvas.height / 2;
    var radius = mradius ;   //50; // Rayon du cercle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Couleur de remplissage du cercle
    ctx.fill();
    ctx.lineWidth = 2; // Épaisseur de la ligne du cercle
    ctx.strokeStyle = '#FF0000'; // Couleur de la bordure du cercle
    ctx.stroke();
}


function DrawRectangle(myIdImage,myIdcanvas,posX, posY, Width, Height, theColor)
{
	const img = document.getElementById(myIdImage);
  var canvas = undefined ;
  if (myIdcanvas.length === 0)
  {
	  canvas = document.createElement('canvas');
	  canvas.id = "canvas" ;
	  // Ajouter le canvas après l'image dans le DOM
      img.insertAdjacentElement('afterend', canvas);
	  bCanvasOnRightPosition = false ;
  }else{
      canvas = document.getElementById(myIdcanvas);
  }
    // Définir la position du canvas au-dessus de l'image
    var rect = img.getBoundingClientRect();
    
	if (!bCanvasOnRightPosition)
	{
		canvas.style.position = 'absolute';
		canvas.style.top = 0 + 'px';
		canvas.style.left = 0 + 'px';
		
		// Définir la largeur et la hauteur du canvas comme étant celles de l'image
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.style.border = '1px solid black'; // Ajouter une bordure pour visualiser le canvas
    }

    // Récupérer le contexte 2D du canvas
    var ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.rect(posX, posY, Width, Height);
	
	ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Couleur de remplissage 
	ctx.fillStyle = theColor ;
    ctx.fill();
    ctx.lineWidth = 2; // Épaisseur de la ligne du cercle
    ctx.strokeStyle = '#FF0000'; // Couleur de la bordure du cercle
	
	ctx.stroke();
}

function PositionningCanvas(myIdImage,myIdcanvas)
{
	// redimensionne et positionne le canvas sur l'image   
	bCanvasOnRightPosition = false ;
	const img = document.getElementById(myIdImage);
    var canvas = undefined ;
    if (myIdcanvas.length === 0)
    {
	  canvas = document.createElement('canvas');
	  canvas.id = "canvas" ;
	  // Ajouter le canvas après l'image dans le DOM
      img.insertAdjacentElement('afterend', canvas);
	  bCanvasOnRightPosition = false ;
    }else{
      canvas = document.getElementById(myIdcanvas);
    }
    // Définir la position du canvas au-dessus de l'image
    var rect = img.getBoundingClientRect();
	if (!bCanvasOnRightPosition)
	{
		canvas.style.position = 'absolute';
		canvas.style.top = 0 + 'px';
		canvas.style.left = 0 + 'px';
		
		canvas.style.top = img.offsetTop + 'px';
		canvas.style.left = img.offsetLeft + 'px';
		
		// Définir la largeur et la hauteur du canvas comme étant celles de l'image
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.style.border = '1px solid black'; // Ajouter une bordure pour visualiser le canvas
		bCanvasOnRightPosition = true ;
    }
}

// Fonction pour dessiner un cercle suivant le pointeur de la souris
// usage : drawCircle("myIdImage","myIdcanvas", 30)
// usage : drawCircle("myIdImage","", 30 )
function dessinerCercleSuivantSouris(myIdImage,myIdcanvas, mradius) {
    // Récupérer l'élément canvas
    //const canvas = document.getElementById('myCanvas');
	
	const img = document.getElementById(myIdImage);
	var canvas = undefined ;
	if (myIdcanvas.length === 0)
	{
		  canvas = document.createElement('canvas');
		  canvas.id = "canvas" ;
		  // Ajouter le canvas après l'image dans le DOM
		  img.insertAdjacentElement('afterend', canvas);  // beforebegin, afterbegin, beforeend, afterend 
	}else{
		  canvas = document.getElementById(myIdcanvas);
	}
	canvas.style.top = 0 + 'px';
    canvas.style.left = 0 + 'px';
  
    // Définir la largeur et la hauteur du canvas comme étant celles de l'image
    canvas.width = img.width;
    canvas.height = img.height;
	canvas.style.border = '1px solid black'; // Ajouter une bordure pour visualiser le canvas
  

	
	
	const ctx = canvas.getContext('2d');
	
    // Ajouter un écouteur d'événement pour suivre le mouvement de la souris
    canvas.addEventListener('mousemove', function(event) {
        // Effacer le contenu précédent du canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Récupérer les coordonnées du pointeur de la souris par rapport au canvas
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Dessiner un cercle centré sur les coordonnées de la souris
        const rayon = mradius; // Rayon du cercle
        drawCircle(myIdImage,canvas.id, x, y , mradius)
    });
}


// Ajouter un événement de mouvement de la souris sur le canvas
// Fonction pour gérer l'événement de mouvement de la souris
function handleMouseMove(event, canvasID) {
	if (startX)
	{
		// Récupérer le canvas par son identifiant
		var canvas = document.getElementById(canvasID);
		// Récupérer le contexte 2D du canvas
		var ctx = canvas.getContext('2d');
		
		// Effacer le contenu précédent du canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Récupérer les coordonnées de la souris par rapport au canvas
		var rect = canvas.getBoundingClientRect();
		var mouseX = event.clientX - rect.left;
		var mouseY = event.clientY - rect.top;

		// Calculer la distance entre les coordonnées actuelles de la souris et le point de référence initial
		var distance = Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2));

		// Dessiner un cercle centré sur le point de référence initial avec un rayon égal à la distance calculée
		ctx.beginPath();
		ctx.arc(startX, startY, distance, 0, 2 * Math.PI);
		ctx.stroke();
	}
}

// Fonction pour gérer l'événement de clic de souris
function handleMouseDown(event, canvasID) {
    // Récupérer le canvas par son identifiant
    var canvas = document.getElementById(canvasID);

	// Récupérer le contexte 2D du canvas
	var ctx = canvas.getContext('2d');
		
    // Récupérer les coordonnées de la souris par rapport au canvas
    var rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
}

function AdapterCanvasOnImage(myCanvasID, myImageID, myColor) 
{
	const img = document.getElementById(myImageID);
	var canvas = document.getElementById(myCanvasID);
	
	var rect = img.getBoundingClientRect();  // Position de l'image (top,left, width, height)
    canvas.style.position = 'absolute';
    //canvas.style.top = rect.top + 'px';
    //canvas.style.left = rect.left + 'px';
	 
     
	let top = rect.top + window.scrollY;
    let left = rect.left + window.scrollX;
	canvas.style.top = top + 'px';
    canvas.style.left = left + 'px';
	 
	// OLD CODE -------------------------------
	//canvas.style.top = 0 + 'px';
    //canvas.style.left = 0 + 'px';
	// --------------------------------------------
  
    // Définir la largeur et la hauteur du canvas comme étant celles de l'image
	if ((img.width != canvas.width) && (img.height != canvas.height))
	{
		// si on adapte la largeur ou la heuteur cela efface le contenu du canvss  
		canvas.width = img.width;
		canvas.height = img.height;
		//canvas.style.border = '1px solid black' ;
	}
	canvas.style.border = '1px solid ' + myColor // ;black'; // Ajouter une bordure pour visualiser le canvas
}



