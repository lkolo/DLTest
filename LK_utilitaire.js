// ne pas oublier dans le fichier HTML de importer ce fichier    <script src="LK_utilitaire.js"></script>

function changerCaptionBouton(BtId, nouvCaption) 
{
            // Sélectionner le bouton par son ID
            var bouton = document.getElementById(BtId);
            // Changer le texte du bouton
            bouton.innerText = nouvCaption;
}


function ModifierCouleur_DIV(MyDivID, Cfond, cTexte, cBordure)
{
	//myDiv.style.backgroundColor = 'rgb(52, 152, 219)'; // Couleur de fond bleue
	//myDiv.style.color = 'rgba(255, 255, 255, 0.9)'; // Couleur du texte blanche avec 90% d'opacité
	//myDiv.style.borderColor = 'rgb(41, 128, 185)'; // Couleur de la bordure bleue plus foncée
	
	var myDiv = document.getElementById(MyDivID);
	myDiv.style.backgroundColor = Cfond; // Couleur de fond bleue
	myDiv.style.color = cTexte; // Couleur du texte blanche avec 90% d'opacité
	myDiv.style.borderColor = cBordure; // Couleur de la bordure bleue plus foncée
}