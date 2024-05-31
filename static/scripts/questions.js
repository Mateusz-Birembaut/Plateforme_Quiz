// const { text } = require("stream/consumers");

// garde en mémoire le nom des nouvelles étiquettes pour que quand on transfere d'une liste a l'autre on garde l'id "newEtiquette"
const nomAllNewEtiquettes = [];
mermaid.initialize({startOnLoad: false});

function render(){
     var config = {
            startOnLoad:false,
            htmlLabels:true,
            callback:function(id){
                console.log(id,' rendered');
            },
            flowchart:{
                    useMaxWidth:false,
                }
        };
        mermaid.initialize(config);
}


/* construit une div id="reponse"+n et y insére un bouton de suppression et une checkbox,
puis rajoute la div dans allReponses*/
function build1Reponses(n){
  /* initialise le bouton de suppression, le textarea et la checkbox ainsi que la div les contenant*/
		var div = document.createElement('div');
		var supp = document.createElement('button');
	  var text = document.createElement('textarea');
		var checkbox = document.createElement('input');
  // on met l'id de la div à reponse+n et la class a reponses
		var id = "reponse"+n;
		div.id=id;
    div.setAttribute("class", "reponses")
    // on met en place les boutons
		supp.type="button";
		supp.setAttribute("onclick", "supElement("+n+",allReponses)")
		supp.innerHTML="💀";
    // on met en place le textarea
    text.name="reponses";
    text.id="text"+id;
		text.required="required";
		text.placeholder="Reponse";
    // a chaque input dans la textarea, on met a jour la visualisation
    text.setAttribute("oninput","changeVisuText(this.value,"+n+",false)");
    // on met en place la checkbox
		checkbox.name="rep";
		checkbox.type="checkbox";
		checkbox.value=n;
    checkbox.id="checkbox"+id
    
		div.appendChild(supp);
		div.appendChild(text);
		div.appendChild(checkbox);
		allReponses.appendChild(div);

    // ajouter div dans visualisation avec checkbox 
    addReponseVisu(id);
  
}

/* Renvoie le nombre de div à build1Reponses*/
function buildRep(){
	var i = 0;
  // pour chaque fils de allReponses
	for(var child=allReponses.firstChild ; child!==null; child=child.nextSibling) {
		// Si le prochain fils est null (aka il n'y a pas de réponse supplémentaire), on construit 1 Réponses id=i
    if(child.nextSibling==null){
			build1Reponses(i);
			return
		}
		i++;
	}
}


/* rajoute des champs <input type='hidden'> nommé allEtiquette[] avec les etiquettes comme valeur 
   (utilisé au moment de l'envoie pour récupérer les données dans le post)*/
function etiquetteToPost(){
  const selectedEtiquettesItem = document.querySelectorAll("#selectedEtiquettes .list-item");
  let html="";
  // pour chaque element id=selectedEtiquettes
    for (let i = 0; i < selectedEtiquettesItem.length; i++) {
      let e = selectedEtiquettesItem[i].textContent;
      // si l'id de l'etiquette selectionné est aussi newEtiquette, on créé une balise hidden avec comme nom newEtiquette[]
			if (selectedEtiquettesItem[i].id=="newEtiquette"){
				html+="<input type='hidden' name='newEtiquette[]' value='"+e+"'>"
        console.log("<input type='hidden' name='newEtiquette[]' value='"+e+"'>")
			}
      // on créé une balise hidden avec comme nom allEtiquette[]
      html+="<input type='hidden' name='allEtiquette[]' value='"+e+"'>"
    }

  document.getElementById('postEtiquette').innerHTML=html;
}

// RAJOUTE LES ETIQUETTES DE static/etiquettes.txt DANS LE TABLEAU DES ETIQUETTES
function addEtiquette(etiquette){
  console.log(etiquette);
    if(etiquette == ""){
      return;
    }
    var element = document.createElement('div');
    element.className = 'list-item';
    element.draggable='true';
    element.innerText= etiquette;
    allEtiquettes.appendChild(element);
}

/* Baisse l'id */
function lowerElemId(num,list){
	for(var child=list.firstChild ; child!==null; child=child.nextSibling) {
		if(child.id == "reponse"+num){
      
			var suppButton = child.firstChild;
      
			var textbox = child.firstChild.nextSibling;
      
			var checkbox = child.firstChild.nextSibling.nextSibling;
      
			suppButton.setAttribute("onclick", "supElement("+(num-1)+",allReponses)");
			checkbox.value=num-1;
			child.id="reponse"+(num-1);
      textbox.setAttribute("oninput","changeVisuText(this.value,"+(num-1)+",false)");
      textbox.setAttribute('id',"textreponse"+(num-1));
      checkbox.setAttribute('id',"checkboxreponse"+(num-1));
      
      document.getElementById("visureponse"+num).setAttribute('id',"visureponse"+(num-1));
      document.getElementById("textvisureponse"+num).setAttribute('id',"textvisureponse"+(num-1));

      
			if(child.nextSibling!==null){
				lowerElemId((num+1),list);
			}
			return
		}
	}
	
}

/*Supprime le champ réponse dans la div id="reponse"+num . 
Si ce n'est pas le dernier execute lowerElemId avec num+1 */
    function supElement(num, list){
      for(var child=list.firstChild ; child!==null; child=child.nextSibling) {
          if(child.id == "reponse"+num){
              let repADelete = document.getElementById("visureponse"+num);
              repADelete.remove();
						if(child.nextSibling==null){
            	list.removeChild(child);
							return
						}else{
							list.removeChild(child);
							lowerElemId(num+1,list);
						}
          }
      }
    }



  
      function ajouterEtiquette(){
        var champNom = document.getElementById('nameEtiquette');
        var nom = champNom.value;
        if (!nom.match(/^[a-zA-Z0-9\s]*$/) || nom.match(/^\s*$/)) {
          // erreur contient que des espaces / caractères speciaux
          return;
        } else {
          // on met en forme le texte (enlève les espaces en trop)
          nom = miseEnFormeEtiquette(nom);
          // si l'étiquette  existe déjà un fait arrette (on ajoute pas) 
          if(containsElement(nom,allEtiquettes) || containsElement(nom,selectedEtiquettes)){
            champNom.value="";
            //peut etre afficher erreur etiquette deja présente
            return
          }
          //sinon on ajoute son nom a la liste des nouvelles etiquettes
          nomAllNewEtiquettes.push(nom);
          ajouterNewEtiquetteList(nom);
          champNom.value="";
        }
      }

      // on enlève les espaces en trop
      function miseEnFormeEtiquette(nom){
        let nomFinal = nom.replace(/\s+/g,' ');
        if (nomFinal.charAt(0) === ' ') {
          nomFinal = nomFinal.substring(1);
        }
        if (nomFinal.charAt(nomFinal.length-1) === ' ') {
          nomFinal = nomFinal.substring(0,nomFinal.length-1);
        }
        return nomFinal;
      }

      //parcours une liste, si un element a pour texte le texte passé en argument, on le supprime
      function removeElementList(text, list){
        for (let i = 0; i < list.length; i++) {
          if (list[i].innerText === text) {
            list[i].remove();
            return;
          }
        }
      }

      //ajoute un élément qui a pour text le text passé en arguement a une liste passé en argument
      function ajouterElementList(text, list){
        if(containsElement(text,list)){
          return;
        }
        var element = document.createElement('div');
        element.className = 'list-item';  
        element.draggable='true';
        element.innerText=text;

        //si c'est une nouvelle etiquette on ajoute un id new etiquette
        if(nomAllNewEtiquettes.includes(text)){
          element.id="newEtiquette";
        }
        
        list.appendChild(element);
      }

      // on ajoute une nouvelle etiquette a la liste des etiquettes
      function ajouterNewEtiquetteList(text){
        if(text ===""){
          return;
        }
        var element = document.createElement('div');
        element.className = 'list-item';  
        element.draggable='true';
        element.innerText=text;
        element.id="newEtiquette";
        allEtiquettes.appendChild(element);
      }

      //si la liste contient un element qui a pour innertext le text passé en argument on return true
      function containsElement(text, list){
        for(var child=list.firstChild; child!==null; child=child.nextSibling) {
            if(child.innerText === text){
              return true;
            }
        }
        return false;
      }


    // on ajoute la visualitaion d'une réponse 
    function addReponseVisu(id){
      var idVisu = "visu"+id
      var divRepVisu = document.createElement('div');
      divRepVisu.className = 'visuRep';  
      divRepVisu.id=idVisu;

      var checkBox = document.createElement('input');
      checkBox.type = 'checkbox';
      checkBox.className="checkBoxVisu";

      var text = document.createElement('div');
      text.id="text"+idVisu;
      text.className="textReponseVisu";

      divRepVisu.appendChild(checkBox);
      divRepVisu.appendChild(text);
        
      reponsesVisu.appendChild(divRepVisu);
    }

    // met a jour le text de la visualisation d'une des reponses et s'il contient du mermaid du latex ou tu code, on les affihe correctement
    function changeVisuText(text,n,start){
      let textAModifVisu = document.getElementById("textvisureponse"+n);
      textAModifVisu.innerHTML =
        marked.parse(text);
      hljs.highlightAll();
      if(!start){
        renderMermaid();
        textToKatex(textAModifVisu);
      }
    }
    
    // met a jour le text de la visualisation de l'enonce et s'il contient du mermaid du latex ou tu code, on les affihe correctement
    function changeEnonceVisu(text,start){
      let enonceVisu = document.getElementById('enonceVisu');
      enonceVisu.innerHTML =
        marked.parse(text);
      renderMermaid();
      hljs.highlightAll();
      if(!start){
        textToKatex(enonceVisu);
      }
    }

    function changeTitreVisu(text){
      let titreVisu = document.getElementById("titreVisu");
      titreVisu.innerHTML = "<h1>"+text+"</h1>";
    }


    
    /*
    $("#enonce").on('input', function (e) {
      document.getElementById('enonceVisu').innerHTML =
        marked.parse(e.target.value);
       mermaidtest();
    });
    */

    // parcours la page pour trouver les elements a transformer en mermaid, si il est deja transformé, j'incremente i sinon, on midife la balise code class="language-mermaid" en <pre class="mermaid" et id="mermaid + i" puis on appelle textToGraph, incremente i et on continue 
    function renderMermaid() {
      let i=0;
      document.querySelectorAll("pre.mermaid, pre>code.language-mermaid").forEach($el => {
        if($el.id==`mermaid${i}`){
          i++;
        }else if ($el.tagName === "CODE" && $el.className==`language-mermaid`){
          $el = $el.parentElement
          $el.outerHTML = `<pre class="mermaid" id="mermaid${i}" >${$el.textContent}</pre>`
          textToGraph(i);
          i++;
        }
      });

    }

  //transforme le text d'une div mermaid qui a pour id i en graph
  function textToGraph(i){
        let graph=document.getElementById(`mermaid${i}`);
        if(graph==null){
          return;
        }
        graph = graph.innerText;
        const cb = function(svgGraph){
          document.getElementById(`mermaid${i}`).innerHTML = svgGraph;
        };
        mermaid.render(`mermaidGraph${i}`,graph,cb);
  }

  function textToKatex(element) {
    renderMathInElement(element, {
    // customised options
    // • auto-render specific keys, e.g.:
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      // • rendering keys, e.g.:
      throwOnError : false
    });
  }


  ///////////////////////////////////////////////////// POUBELLE /////////////////////////////////////////////////////////////////
  //on recupere les données de l'enonce
  function remplirDonneEnonce(enonceTab) {
    document.getElementById("titre").value = enonceTab["title"];
    changeTitreVisu(enonceTab["title"]);
    document.getElementById("enonce").value = enonceTab["statement"];
    let allEtiquettesItem = document.querySelectorAll("#allEtiquettes .list-item");
    for (let nomEtiquette of enonceTab["etiquettes"]) {
        removeElementList(nomEtiquette,allEtiquettesItem); 
        ajouterElementList(nomEtiquette,selectedEtiquettes);
    }
    let i=0
    for (let reponse of enonceTab["answers"]) {
      buildRep();
/*      if(enonceTab["bonneReps"].includes(i.toString())){
        document.getElementById("checkboxreponse"+i).checked = true;
      }*/
      document.getElementById("textreponse"+i).innerHTML = reponse;
      changeVisuText(reponse,i,true);
      i++;
    }
    changeEnonceVisu(document.getElementById("enonce").value,true);
  }




  function bigRender(input,output){
    output.innerHTML = marked.parse(input);
    textToKatex(output);
    renderMermaid(output);
    output.querySelectorAll('code').forEach(output => {
      hljs.highlightElement(output);
    });
  }

  function renderRep(input){
    var reps = Array.from(document.querySelectorAll("#reponse"));
    idRep = reps.indexOf(input);
    visus = Array.from(document.querySelectorAll("#reponseVisu"));
    bigRender(input.value,visus[idRep]);
  }

  function remplirEnonce(enonceTab){
    idEnonce = enonceTab["id"];
    if (enonceTab["type"]=="QUIZZ"){
      console.log("rep = "+enonceTab["answers"]);
      console.dir(enonceTab["answers"]);
      for (var rep in enonceTab["answers"]){
        console.log(rep);
      build1Rep(rep,enonceTab["answers"][rep]);
      }
    }else{
      document.getElementById("buttonRep").remove();
      console.log(enonceTab["answers"][0]);
      isNumerique(Object.keys(enonceTab["answers"])[0]);
    }
    delete enonceTab["type"];
    delete enonceTab["answers"];
    delete enonceTab["id"];
    console.log(enonceTab);
    for (var key in enonceTab){
      console.log("key = "+key);
      document.getElementById(String(key)).value = enonceTab[key];
      console.log(enonceTab[key]);
      bigRender(enonceTab[key],key+"Visu");
    }
  }


  function isNumerique(texte){
    let el = document.createElement("div");
    el.id = el.className = "repDiv";
    let textbox = document.createElement("textarea");
    if(texte!=null){
      textbox.value=texte;
    }
    textbox.id = "reponse";
    textbox.setAttribute("oninput","renderRep(this)");
    textbox.className="reponsetxt";
    el.appendChild(textbox);
    let repVisu = document.createElement("div");
    repVisu.id=repVisu.className = "reponseVisu";
    document.getElementById("reponsesVisu").appendChild(repVisu);
    document.getElementById("allReponses").appendChild(el);
  }

  function build1Rep(texte,checkboxvalue){

    el=createNode("", {"💀": function(){
      console.log(this.parentElement);
      removeRep(this.parentElement);
    }});
    el.firstChild.type="button";
    el.id = el.className =  "repDiv";
    let textbox = document.createElement("textarea");
    textbox.value=texte;
    textbox.id = "reponse";
    textbox.setAttribute("oninput","renderRep(this)");
    textbox.className="reponsetxt";
    let checkbox = document.createElement("input");
    checkbox.type="checkbox";
    checkbox.checked = checkboxvalue;
    checkbox.id="bReponse";
    el.appendChild(textbox);
    el.appendChild(checkbox);
    let repVisu = document.createElement("div");
    repVisu.id=repVisu.className = "reponseVisu";
    document.getElementById("reponsesVisu").appendChild(repVisu);
    document.getElementById("allReponses").appendChild(el);

  }

  function removeRep(rep){
    console.log(rep);
    let idRep = Array.from(document.querySelectorAll("#repDiv")).indexOf(rep);
    console.log(idRep);
    rep.remove();
    document.querySelectorAll("#reponseVisu")[idRep].remove();
  }

  function testFunc(){
    server_request("/saveDoc","POST",)
  }

  function postTout(){
    console.log(idEnonce);
    var f_answers = Array.from(document.querySelectorAll("#reponse")).map(a=>a.value);
    var f_statement = document.getElementById("statement").value;
    var f_title = document.getElementById("title").value;
    var f_bRep = Array.from(document.querySelectorAll("#bReponse")).map(a=>a.checked);
    var answers = {};
    if(f_bRep.length==0){
      f_bRep[0]=true;
    }
      for (a in f_answers){
        console.log(f_answers[a])
        answers[f_answers[a]]=f_bRep[a];
      }
    
    console.log("rep = ");
    console.dir(answers);
    console.log("statement = "+f_statement);
    console.log("title = "+f_title);
    console.log("bonneRep =");
    console.dir(f_bRep);
    data = {
      "answers":answers,
      "statement":f_statement,
      "title":f_title,
      "id":idEnonce,
    }
    server_request("/saveDoc","POST",data);
  }
  

  function ayaya(){
    console.log(document.getElementById("form"));
    document.getElementById("form").submit();
  }
window.onload = (event) => {
  const allReponses = document.getElementById("allReponses");
  const allEtiquettes = document.getElementById("allEtiquettes");
  const selectedEtiquettes = document.getElementById("selectedEtiquettes");

  const etiquettesVisu = document.getElementById("etiquettesVisu");
  const reponsesVisu = document.getElementById("reponsesVisu");
  
  allEtiquettes.addEventListener("dragstart", dragStart);
  allEtiquettes.addEventListener("dragend", dragEnd);
  selectedEtiquettes.addEventListener("dragstart", dragStart);
  selectedEtiquettes.addEventListener("dragend", dragEnd);
  
  allEtiquettes.addEventListener("dragover", dragOver);
  allEtiquettes.addEventListener("drop", dragDropToAllEtiquettes);
  
  selectedEtiquettes.addEventListener("dragover", dragOver);
  selectedEtiquettes.addEventListener("drop", dragDropToSelectedEtiquettes);
  
  function dragStart(event) {
    event.dataTransfer.setData("text", event.target.innerText);
    event.target.style.backgroundColor = "gray";
  }
  
  function dragEnd(event) {
    event.target.style.backgroundColor = "#eee";
  }
  
  function dragOver(event) {
    event.preventDefault();
  }
  
  
  function dragDropToAllEtiquettes(event) {
    let data = event.dataTransfer.getData("text");
    let selectedEtiquettesItem = document.querySelectorAll("#selectedEtiquettes .list-item");

    let visuEtiquettes = document.querySelectorAll("#etiquettesVisu .etiquetteVisu");
        
    ajouterElementList(data,allEtiquettes);
    removeElementList(data,selectedEtiquettesItem);
        
  }
  
  function dragDropToSelectedEtiquettes(event) {
        
    let data = event.dataTransfer.getData("text");
    let allEtiquettesItem = document.querySelectorAll("#allEtiquettes .list-item");

    removeElementList(data,allEtiquettesItem);  
    ajouterElementList(data,selectedEtiquettes);
  }

  renderMathInElement(document.body);



};

