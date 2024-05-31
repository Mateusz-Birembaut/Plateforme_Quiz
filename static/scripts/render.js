
const { mermaidAPI } = mermaid;


function render(){
     var config = {
            startOnLoad:false,
            callback:function(id){
                console.log(id,' rendered');
            },
            flowchart:{
                    useMaxWidth:false,
                }
        };
        mermaid.initialize(config);
  console.log("youpi");
}

function render2(inp,out){
  var input=document.getElementById(inp).innerText;
  var output=document.getElementById(out).innerHTML;
  mermaidAPI.render("coucou",input,output)
  
}