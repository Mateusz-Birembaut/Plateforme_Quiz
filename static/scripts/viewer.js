
// construit la page d'impression viewer.html
function buildAllEnonces(tab){
  // on récupère la div contenant l'affichage
  var master = document.getElementById("allEnonces");
  for (enoncesKey in tab){
    enonces = tab[enoncesKey];
    // on crée la div contenant tout l'énoncé
    var divEnonce = document.createElement("div");
    divEnonce.setAttribute("class","divEnonce");
    divEnonce.id="divEnonce";
    // on crée la div contenant la question et les réponses
    var divQuestionReponses = document.createElement("div");
    divQuestionReponses.setAttribute("class","divQuestionReponses");
    divQuestionReponses.id="divQuestionReponses";
    // on crée la div contenant le titre
    var divTitre = document.createElement("div");
    divTitre.setAttribute("class","divTitre");
    divTitre.id="divTitre";
    divTitre.innerHTML = enonces["title"];
    // on rajoute la div contenant le titre dans la div contenant l'enoncé
    divEnonce.appendChild(divTitre);
    //on crée la div contenant la question
    var divQuestion = document.createElement("div");
    divQuestion.setAttribute("class","divQuestion");
    divQuestion.id="divQuestion";
    divQuestion.innerHTML=marked.parse(enonces["question"]);
    // on rajoute la div contenant la question dans la divQuestionReponses
    divQuestionReponses.appendChild(divQuestion);
    //on crée la div contenant toutes les réponses
    var divReponses = document.createElement("div");
    divReponses.setAttribute("class","divReponses");
    divReponses.id="divReponses";
    // on crée l'input hidden qui renvoie l'énoncé
    var inputHiddenRep = document.createElement("input");
    inputHiddenRep.type ="hidden";
    inputHiddenRep.name = "listeEnonce[]";
    inputHiddenRep.value= enonces["user"]+"µ%µ%µ"+enonces["title"];
    //pour chaque réponse
    for (repKey in enonces["reponses"]){
      //on crée un div qui content "Réponse "+numRep
      var divNumRep = document.createElement("div");
      divNumRep.setAttribute("class","divNumRep");
      divNumRep.innerHTML = "Reponse "+(parseInt(repKey)+1);
      //on rajoute la div contenant le numero de la réponse a la div contenant toutes les réponses
      divReponses.appendChild(divNumRep);
      // on crée la div contenant le text et la checkbox d'1 réponse
      var divRep = document.createElement("div");
      divRep.setAttribute("class","divRep");
      divRep.id="divRep";
      var rep = enonces["reponses"][repKey];
      // on crée la div contenant le texte de la réponse
      var divRepText = document.createElement("div");
      divRepText.setAttribute("class","divRepText");
      divRepText.id="divRepText";
      divRepText.innerHTML += marked.parse(rep);
      // on crée la div contenant la checkbox
      var divRepCheckbox = document.createElement("div");
      divRepCheckbox.setAttribute("class","divRepCheckbox");
      // on crée la checkbox
      var checkbox = document.createElement("input");
      checkbox.setAttribute("class","checkbox");
      checkbox.type="checkbox";
      divEnonce.appendChild(inputHiddenRep);
      // value = "Rep"+numéro de la réponse
      checkbox.value=repKey;
      // name = "Reponse"+numéro de l'énoncé
      checkbox.name = enonces["user"]+"µ%µ%µ"+enonces["title"];
      //on rajoute la checkbox a la div la contenant
      divRepCheckbox.appendChild(checkbox);
      // on rajoute la div du text dans la div de la réponse
      divRep.appendChild(divRepText);
      // on rajoute la div de la checkbox dans la div de la réponse
      divRep.appendChild(divRepCheckbox);
      // on rajoute la div contenant la réponse dans la div contenant toute les réponses
      divReponses.appendChild(divRep);
    }
    // on rajoute la div contenant les réponses dans la divQuestionRéponses
    divQuestionReponses.appendChild(divReponses);
    // on rajoute la divQuestionReponses dans la div contenant un enonce
    divEnonce.appendChild(divQuestionReponses);
    // on rajoute la div contenant un énoncé dans la div master
    master.appendChild(divEnonce);
  }
  // on render le tout
  hljs.highlightAll();
   renderMermaid();
  textToKatex(master);
}

// render le mermaid
function renderMermaid() {
      let i=0;
      document.querySelectorAll("pre.mermaid, pre>code.language-mermaid").forEach($el => {
        // if the second selector got a hit, reference the parent <pre>
        if($el.id==`mermaid${i}`){
          i++;
        }else if ($el.tagName === "CODE" && $el.className==`language-mermaid`){
          $el = $el.parentElement
        // put the Mermaid contents in the expected <div class="mermaid">
        // plus keep the original contents in a nice <details>
          $el.outerHTML = `<pre class="mermaid" id="mermaid${i}" >${$el.textContent}</pre>`
          textToGraph(i);
          i++;
        }
      });

    }

  function textToGraph(i){
        let graph=document.getElementById(`mermaid${i}`);
        if(graph==null){
          return;
        }
        graph = graph.innerText;
        const cb = function(svgGraph){
          document.getElementById(`mermaid${i}`).innerHTML = svgGraph;
        };
        //azeazedazdazdazdazd
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

function changePrintCSS(){
  var css=document.getElementById("printCSS");
  console.log(css.getAttribute("href"));
  if(css.getAttribute("href")=="/static/style/viewerprintTest.css"){
    css.setAttribute("href","/static/style/viewerprint.css");
  }else{
    css.setAttribute("href","/static/style/viewerprintTest.css");
  }
}