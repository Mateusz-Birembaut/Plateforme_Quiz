// ELEMENT CREATOR HELPER

function createNode(l_title, l_events) {
    let nel = document.createElement("div");
    
    for(let k in l_events) {
        console.log(l_events[k]);
        let elEv = document.createElement("button");
        elEv.addEventListener("click", l_events[k]);
        elEv.appendChild(document.createTextNode(k));
        nel.appendChild(elEv);
    }

    nel.appendChild(document.createTextNode(l_title));

    return nel;
}


// SEARCH BAR
class SearchBar {
    constructor(searchTextId, docSelectorId, tagsSelectorId) {
        // TAG
        this.elTagSelectorId = tagsSelectorId;
        this.searchTagList = [];

        // TEXT
        this.elSearchText = searchTextId;

        // DOC
        this.elDocSelector = docSelectorId;
	    this.searchDocumentId = null;
	    this.searchDocumentQuestion = [];

        this.onModify = null;
    }

    setOnModify(l_fun) {
        this.onModify = l_fun;
    }

    // TEXT
    getSearchText() {
        let t_el = document.getElementById(this.elSearchText);
        if(t_el == null) {
            return "";
        } 
        return t_el.value;
    }

    // DOCUMENTS
    updateDocumentSearch(callback) {
		if (this.searchDocumentId != null) {
            let s_ref = this;
			request_getDocumentInfo((data) => { // IF REQUEST SUCCEED
				this.searchDocumentQuestion = data["questions"];
				
                let t_s = document.getElementById(this.elDocSelector);

                if (t_s != null) {
                    t_s.innerHTML = "";
                    var s_ref = this;

                    t_s.appendChild(document.createTextNode(data["title"]));

                    let nbtDel = document.createElement("button");
                    nbtDel.onclick = function() {
                        s_ref.setDocumentSearch(null, null); // DELETE DOC FROM SEARCH
                    };
                    nbtDel.appendChild(document.createTextNode("remove"));
                    t_s.appendChild(nbtDel);
                }
                
                if(this.onModify != null) {
                    this.onModify();
                }

                if (callback != null) {
                    callback();
                }
			}, (data) => { // IF REQUEST FAIL AND WRONG ID REMOVE DOC
                s_ref.setDocumentSearch(null, null);

                if(callback != null) {
                    callback();
                }
            }, (error) => {
                smooth_alert(msg_requestError, "red");
                s_ref.setDocumentSearch(null, null);

                if(callback != null) {
                    callback();
                }
            },this.searchDocumentId);
		}
        else {
            if (callback != null) {
                callback();
            }
        }
	}

    setDocumentSearch(callback, documentId) {
		this.searchDocumentId = documentId;

		if (documentId == null) {
			this.searchDocumentQuestion = [];
            let t_s = document.getElementById(this.elDocSelector);
            if(t_s != null) {
                t_s.innerHTML = "Aucun document sélectionné pour le moment";
            }

            if(this.onModify != null) {
                this.onModify();
            }
            
            if(callback != null) {
                callback();
            }
		}
		else {
			this.updateDocumentSearch(callback);
		}
	}

    // TAGS
    updateTagSearchList() {
        let el = document.getElementById(this.elTagSelectorId);
        el.innerHTML = "";
        let s_ref = this;

        for(let t of this.searchTagList) {
            let obj = document.createElement("div");
            obj.appendChild(document.createTextNode(t));

            let nbtdel = document.createElement("button");
            nbtdel.appendChild(document.createTextNode("X"));
            nbtdel.onclick = function() {
                s_ref.removeTagSearch(t);

                if(this.onModify != null) {
                    this.onModify();
                }
            };

            obj.appendChild(nbtdel);
            obj.className = "tagSearch";
            el.appendChild(obj);
        }

        if(this.searchTagList.length == 0) {
            el.appendChild(document.createTextNode("Aucun tag pour l'instant"));
        }

        if(this.onModify != null) {
            this.onModify();
        }
    }

    addTagSearch(tagStr) {
        if(!this.searchTagList.includes(tagStr)) {
            this.searchTagList.push(tagStr);
            this.updateTagSearchList();
        }
    }

    removeTagSearch(tagStr) {
        let index = this.searchTagList.indexOf(tagStr);
        if (index > -1) {
            this.searchTagList.splice(index, 1);
            this.updateTagSearchList();
        }
    }

    replaceTagSearch(l_tagList) {
        this.searchTagList = [];
        for(let i in l_tagList) {
            this.searchTagList.push(i); // DEEP COPY
        }
        this.updateTagSearchList();
    }
}



// DYNAMIC PAGES
class DynamicPageSelector {
    constructor(l_page) {
        this.actualPage = l_page;
    }

    changePage(l_page) {
        if (this.actualPage != null) {
            this.actualPage.unloadPage();
        }

        this.actualPage = l_page;
        if (this.actualPage != null) {
            l_page.loadPage();
        }
    }

    refresh() {
        if (this.actualPage != null) {
            this.actualPage.updatePage();
        }
    }

    reload() {
        if (this.actualPage != null) {
            this.actualPage.unloadPage();
            this.actualPage.loadPage();
        }
    }
}


class DynamicPage {
    constructor(pageId) {
        this.id = pageId;
    }

    loadPage() {
        document.getElementById(this.id).style.display = "block";
    }

    updatePage() {}

    unloadPage() {
        document.getElementById(this.id).style.display = "none";
    }
}

// TAGS
class RequestListPage extends DynamicPage {
    constructor(pageId, PageListId) {
        super(pageId);

        this.requestDataList = [];
        this.PageList = PageListId;

        this.nodeCreator = null;
        this.requestFunc = null;
    }

    setFactory(l_fun) {
        this.nodeCreator = l_fun;
    }

    setRequest(l_fun) {
        this.requestFunc = l_fun;
    }
    
    loadPage() {
        super.loadPage();
        document.getElementById(this.PageList).innerHTML = "";
        let s_ref = this;

        if(this.requestFunc != null) {
            this.requestFunc((data) => {
                s_ref.requestDataList = data;
                s_ref.updatePage();
            });
        }
    }

    updatePage() {
        let obj = document.getElementById(this.PageList);
        obj.innerHTML = "";
        for(let data of this.requestDataList) {
            let el = null;
            if(this.nodeCreator != null) {
                el = this.nodeCreator(data);
            }
            else {
                el = document.createTextNode(data);
            }

            if(el != null) {
                obj.appendChild(el);
            }
        }

        if (obj.innerHTML == "") {
            obj.appendChild(document.createTextNode("Aucun élément pour l'instant"));
        }
    }

    unloadPage() {
        super.unloadPage();
        this.requestDataList = [];
    }
}