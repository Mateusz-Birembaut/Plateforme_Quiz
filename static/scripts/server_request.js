// SMOOTH ALERT
var msg_requestError = "Une erreur est survenu lors du chargement des ressources, vérifiez votre connection et réesseyez";

var f_smooth_alert = false;
function smooth_alert(msg, color) {
    f_smooth_alert = true;
    let el = document.getElementById("smoothAlert");
    let sm_el = document.getElementById("sm_message");

    if (el == null || sm_el == null) {
        console.log(msg);
        return;
    }

    sm_el.innerHTML = msg;
    el.className = "smoothAlertOn";
    el.style.display = "block";
    el.setAttribute("style", "background-color: " + color);
    

    setTimeout(() => {
        f_smooth_alert = false;
        el.className = "smoothAlert";
        setTimeout(() => {
            if (f_smooth_alert == false) {
                el.style.display = "none";
            }
        }, 1000);
    }, 5000);
}



function server_request(l_path, l_method, l_body, callbackSuccess, callbackError, callbackFailure) {
    let t_h = {
        method: l_method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    };

    if (l_method == "POST") {
        if (l_body == null) {
            l_body = {};
        }
        
        t_h["body"] = JSON.stringify(l_body);
    }

    fetch(l_path, t_h).then((response) => {
        if (response.ok) {
            if (callbackSuccess != null) {
                callbackSuccess(response);
            }
            else {
                response.text().then((data) => {smooth_alert(data, "green")});
            }
        }
        else {
            if (callbackError != null) {
                callbackError(response);
            }
            else {
                response.text().then((data) => {smooth_alert(data, "orange")});
            }
        }
    }).catch((error) => {
        if (callbackFailure != null) {
            callbackFailure(error);
        }
        else {
            smooth_alert(msg_requestError, "red");
            console.log(error);
        }
    });
}



// ***************    LOGIN    ******************

function request_changePassword(l_password, l_newPassword) {
    server_request("/newPassword", "POST", {password: l_password, newpassword: l_newPassword}, null, null, null);
}


// ***************    PROFILE    ******************

// TAG
function request_getTag(callback) {
    server_request("/getTags", "GET", null, (response) => {
        response.json().then((data) => {
            callback(data);
        });
    }, null, null);
}

function request_createTag(callback, tagname) {
    server_request("/newTag", "POST", {tag: tagname}, (response) => {
        smooth_alert("Tag créer avec succès", "green");
        callback();
    }, null, null);
}

function request_destroyTag(callback, tagname) {
    server_request("/deleteTag", "POST", {tag: tagname}, (response) => {
        smooth_alert("Tag créer avec succès", "green");
        callback();
    }, null, null);
}


// QUESTION
function request_getQuestions(callback) {
    server_request("/profileQuestionInfo", "GET", null, (response) => {
        response.json().then((data) => {
            callback(data);
        })
    }, null, null);
}


function request_createQuestion(callback, l_title, l_type) {
    server_request("/newQuestion", "POST", {title: l_title, type: l_type}, (response) => {
        smooth_alert("Question créer avec succès", "green");
        callback();
    }, null, null);
}


function request_destroyQuestion(callback, questionId) {
    server_request("/deleteQuestion", "POST", {id: questionId}, (response) => {
        smooth_alert("Question supprimée avec succès", "green");
        callback();
    }, null, null);
}

function request_setTagsToQuestion(callback, questionId, tagsname) {
    server_request("/setQuestionTags", "POST", {id:questionId, tags: tagsname}, (response) => {
        smooth_alert("Tags ajoutés avec succès", "green");
        callback();
    }, null, null);
}

// DOCUMENT
function request_getDocumentInfo(callbackSuccess, callbackFailure, callbackError, documentId) {
    server_request("/DocumentInfo", "POST", {id: documentId}, (response) => {
        response.json().then((data) => {
            callbackSuccess(data);
        })
    }, callbackFailure, callbackError,);
}

function request_getDocuments(callback) {
    server_request("/profileDocumentInfo", "GET", null, (response) => {
        response.json().then((data) => {
            callback(data);
        })
    }, null, null);
}

function request_createDocument(callback, l_title) {
    server_request("/newDocument", "POST", {title: l_title}, (response) => {
        smooth_alert("Document créer avec succès", "green", "green");
        callback();
    }, null, null);
}

function request_destroyDocument(callback, questionId) {
    server_request("/deleteDocument", "POST", {id: questionId}, (response) => {
        smooth_alert("Document supprimé avec succès", "green", "green");
        callback();
    }, null, null);
}

function request_addQuestionToDocument(callback, l_questId, l_docId) {
    server_request("/addQuestionToDocument", "POST", {idQuestion: l_questId, idDocument: l_docId}, (response) => {
        smooth_alert("Question ajoutée avec succès", "green", "green");
        callback();
    }, null, null);
}

function request_removeQuestionFromDocument(callback, l_questId, l_docId) {
    server_request("/removeQuestionFromDocument", "POST", {idQuestion: l_questId, idDocument: l_docId}, (response) => {
        smooth_alert("Question retiré du document avec succès", "green", "green");
        callback();
    }, null, null);
}