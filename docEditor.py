from flask import Blueprint, request, render_template, url_for, flash, make_response, redirect

from flask_login import current_user
from flask_security import login_required

import hashlib
import json

from dbTable import *
import login

def getEnonceComplet(idQ):
        dataQ = db.session.query(DB_QUESTION).filter_by(id=idQ).first()
        if dataQ !=None:
                rep = {
                        "id":dataQ.id,
                        "author":dataQ.author,
                        "title":dataQ.title ,
                        "type":dataQ.type ,
                        "statement":dataQ.statement ,
                        "answers":json.dumps(dataQ.answers),
                }
                return rep
        return 0

def getEnonceForRender(idQ):
        dataQ = db.session.query(DB_QUESTION).filter_by(id=idQ).first()
        if dataQ !=None:
                rep = {
                        "id":dataQ.id,
                        "title":dataQ.title ,
                        "statement":dataQ.statement ,
                        "answers":json.loads(dataQ.answers),
                        "type":dataQ.type ,
                }
                return rep
        return 0
                

docEditor_blueprint = Blueprint("docEditor", __name__, template_folder = "templates")

@docEditor_blueprint.route("/editDoc/<idQ>",methods=["GET"])
@login_required
def editDoc(idQ):
        if id!=None:
                if db.session.query(DB_QUESTION).filter_by(id=idQ , author = current_user.id)!=None:
                        return render_template("AddQ.html", data=getEnonceForRender(idQ))


@docEditor_blueprint.route("/viewDoc/<id>")
@login_required
def viewDoc():
        return render_template("profile.html")

@docEditor_blueprint.route("/saveDoc/", methods = ["POST"])
@login_required
def saveDoc():
        f_title = request.json["title"]
        f_statement = request.json["statement"]
        f_answers = request.json["answers"]
        f_id = request.json["id"]
        print(f_title)
        print(f_statement)
        print(json.dumps(f_answers))
        print(f_id)
        entry = db.session.query(DB_QUESTION).filter_by(id=f_id).first()
        if entry !=None and entry.author==current_user.id:
                entry.statement = f_statement
                entry.answers = json.dumps(f_answers)
                entry.title = f_title
                db.session.commit()
        return make_response(200, "OK")


"""
@profile_blueprint.route("/newDocument/", methods = ["POST"])
@login_required
def newDocument():
        f_title = request.json["title"]
        
        if len(f_title) >= 150:
                return make_response("invalid param size", 400)
        
        db.session.add(DB_DOC(author = current_user.id, title = f_title))
        db.session.commit()
        
        return make_response("ok", 200)
"""