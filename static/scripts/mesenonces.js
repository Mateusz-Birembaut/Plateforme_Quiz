// Affiche la liste des titres donné en data ainsi que leurs étiquettes
function afficherTitreListe(data){
  var user = data[0];
  var li = data[1];
  // on récupere la div qui contient la liste des titres
  var master = document.getElementById("masterEnonces");
  // pour chaque titre
  for (titre in li){
    // on crée la div contenant la totalité de l'énoncé
    var divEnonce = document.createElement('div');
    divEnonce.setAttribute("class","divEnonce");
    // on crée la div contenant le titre
    var divTitre=document.createElement('div');
    divTitre.setAttribute("class","divTitre");
    // on crée le link contenant le titre
    var linkTitre = document.createElement('a');
    linkTitre.setAttribute("class","linkTitre");
    linkTitre.href="/viewerQuestion?titre="+titre+"&utilisateur="+user;
    linkTitre.innerHTML = titre;
    // on crée le lien permettant de modifier l'énoncé
    var linkModify = document.createElement('a');
    linkModify.setAttribute("class", "linkModify");
    linkModify.href="/AjoutQuestions?titre="+titre+"&utilisateur="+user;
    linkModify.innerHTML="Modifier";
    // on crée la div contenant les étiquettes
    var divEtiq= document.createElement('div');
    divEtiq.setAttribute("class","divEtiq");
    // on crée la checkbox permettant de selectionner les élements qu'on veut supprimer/afficher
    var checkboxTitre=document.createElement('input');
    checkboxTitre.setAttribute("class","checkboxTitre");
    checkboxTitre.type="checkbox";
    checkboxTitre.name="selectViewer[]";
    checkboxTitre.value=user+"%µ%µ%"+titre;
    // on rajoute la div contenant la checkbox dans le div contenant le titre
    divTitre.appendChild(checkboxTitre);
    // on rajoute la div du lien de l'affichage du titre dans la div du titre
    divTitre.appendChild(linkTitre);
    // on rajoute la div du lien de modification dans la div du titre
    divTitre.appendChild(linkModify);
    // on rajoute la div du titre dans la div de l'énoncé
    divEnonce.appendChild(divTitre);
    // pour chaque étiquette, on crée un lien pour afficher les exercices lié a cette etiquette
    for (e in li[titre]){
      var etiq = li[titre][e];
      var etiquette=document.createElement('a');
      etiquette.href="/Etiquette?etiquette="+etiq;
      etiquette.setAttribute("class","aEtiq");
      etiquette.innerHTML = "•"+etiq;
      // on rajoute l'etiquette dans la div contenant les étiquettes
      divEtiq.appendChild(etiquette);
    }
    // on rajoute la div des étiquettes dans la div des énoncés
    divEnonce.appendChild(divEtiq);
    // on rajoute la div de l'énoncé dans la div master
    master.appendChild(divEnonce);
  }
}

// gere l'affichage des titres lié a une étiquette en les groupant par l'utilisateur qui les a crée
function afficherTitrePerUser(titres){
  // on récupère la div contenant tous les titres
  var master = document.getElementById("masterTitres");
  // pour chaque utilisateur
  for (user in titres){
    console.log(user);
    // on crée la div contenant 
    var divUser = document.createElement('div');
    divUser.setAttribute("class","divUser");
    var ulUser = document.createElement('ul');
    ulUser.setAttribute("class","ulUser");
    var pUser = document.createElement('p');
    pUser.setAttribute("class","pUser");
    pUser.innerHTML = "énoncés créés par "+user+" : ";
    ulUser.appendChild(pUser);
    for (i in titres[user]){
      var checkbox = document.createElement('input')
      checkbox.setAttribute("class","checkbox");
      checkbox.type="checkbox";
      checkbox.value=user+"%µ%µ%"+titres[user][i];
      checkbox.name="selectViewer[]";
      var liTitre = document.createElement("li");
      liTitre.setAttribute("class","liTitre");
      var linkEnonce = document.createElement("a");
      linkEnonce.setAttribute("class","linkEnonce");
      linkEnonce.href="/viewerQuestion?titre="+titres[user][i]+"&utilisateur="+user;
      linkEnonce.innerHTML = titres[user][i];
      liTitre.appendChild(linkEnonce);
      liTitre.appendChild(checkbox);
      ulUser.appendChild(liTitre);
      divUser.appendChild(ulUser);
    }
    master.appendChild(divUser);
  }
}