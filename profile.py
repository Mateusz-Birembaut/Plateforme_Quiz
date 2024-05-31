from flask import Blueprint, request, render_template, url_for, flash, make_response, redirect

from flask_login import current_user
from flask_security import login_required

import hashlib
import json

from dbTable import *
import login

profile_blueprint = Blueprint("profile", __name__, template_folder = "templates")

@profile_blueprint.route("/profile/")
@login_required
def profile():
        return render_template("profile.html", usr_name = current_user.name, usr_surname = current_user.surname, usr_email = current_user.email, isProfessor = current_user.isProfessor)


# DOCUMENT
@profile_blueprint.route("/DocumentInfo/", methods=["POST"])
@login_required
def DocumentInfo():
        f_documentId = request.json["id"]
        
        
        q = db.session.query(DB_DOC).filter_by(id = f_documentId).first()

        if q == None or q.author != current_user.id:
                return make_response("invalid id", 400)
        
        r = {"id": q.id, "title": q.title, "questions": []}

        for i in db.session.query(DB_DOC_QUESTION.id_question).filter_by(id_doc = f_documentId).all():
                r["questions"].append(i.id_question)
        
        return json.dumps(r)


@profile_blueprint.route("/profileDocumentInfo/")
@login_required
def profileDocumentInfo():
        r = [{"id": i.id, "title": i.title} for i in db.session.query(DB_DOC).filter_by(author = current_user.id).all()]
        
        return json.dumps(r)


@profile_blueprint.route("/newDocument/", methods = ["POST"])
@login_required
def newDocument():
        f_title = request.json["title"]
        
        if len(f_title) >= 150:
                return make_response("invalid param size", 400)
        
        db.session.add(DB_DOC(author = current_user.id, title = f_title))
        db.session.commit()
        
        return make_response("ok", 200)


@profile_blueprint.route("/deleteDocument/", methods = ["POST"])
@login_required
def deleteDocument():
        f_id = request.json["id"]
        
        obj = db.session.query(DB_DOC).filter_by(id=f_id)
        if obj.first() == None or obj.first().author != current_user.id:
                return make_response("id invalid", 400)
        
        db.session.query(DB_DOC_QUESTION).filter_by(id_doc = f_id).delete()
        obj.delete()
        db.session.commit()
        return make_response("ok", 200)


@profile_blueprint.route("/addQuestionToDocument/", methods = ["POST"])
@login_required
def addQuestionToDocument():
        f_questId = request.json["idQuestion"]
        f_docId = request.json["idDocument"]

        obj = db.session.query(DB_DOC).filter_by(id = f_docId).first()
        if obj == None or obj.author != current_user.id:
                return make_response("invalid document id", 400)
        
        obj = db.session.query(DB_QUESTION).filter_by(id = f_questId).first()
        if obj == None or obj.author != current_user.id:
                return make_response("invalid question id", 400)
        
        db.session.add(DB_DOC_QUESTION(id_doc = f_docId, id_question = f_questId))
        db.session.commit()
        return make_response("ok", 200)


@profile_blueprint.route("/removeQuestionFromDocument/", methods = ["POST"])
@login_required
def removeQuestionFromDocument():
        f_questId = request.json["idQuestion"]
        f_docId = request.json["idDocument"]

        obj = db.session.query(DB_DOC).filter_by(id = f_docId).first()
        if obj == None or obj.author != current_user.id:
                return make_response("invalid document id", 400)
        
        obj = db.session.query(DB_QUESTION).filter_by(id = f_questId).first()
        if obj == None or obj.author != current_user.id:
                return make_response("invalid question id", 400)

        db.session.query(DB_DOC_QUESTION).filter_by(id_doc = f_docId, id_question = f_questId).delete()
        db.session.commit()
        return make_response("ok", 200)


# QUESTION
@profile_blueprint.route("/profileQuestionInfo/")
@login_required
def profileQuestionInfo():
        r = [{"id": i.id, "title": i.title, "type": i.type} for i in db.session.query(DB_QUESTION.id, DB_QUESTION.title, DB_QUESTION.type).filter_by(author = current_user.id).all()]

        for i in r:
                i["tags"] = [j.tag for j in db.session.query(DB_TAG_QUESTION).filter_by(id_question = i["id"]).all()]

        return json.dumps(r)
                
        
@profile_blueprint.route("/newQuestion/", methods = ["POST"])
@login_required
def newQuestion():
        f_title = request.json["title"]
        f_type = request.json["type"]
        
        if len(f_title) >= 150 or len(f_type) >= 15:
                return make_response("La question n'a pas pu être créer, vérifiez à ce que les paramêtres n'excède pas la taille recommandée", 400)
        
        db.session.add(DB_QUESTION(author = current_user.id, title = f_title, type = f_type, statement = "", answers = json.dumps([])))
        db.session.commit()

        return make_response("ok", 200)


@profile_blueprint.route("/deleteQuestion/", methods = ["POST"])
@login_required
def deleteQuestion():
        f_id = request.json["id"]

        obj = db.session.query(DB_QUESTION).filter_by(id = f_id)
        if obj.first() == None or obj.first().author != current_user.id:
                return make_response("invalid id", 400)
        
        db.session.query(DB_DOC_QUESTION).filter_by(id_question = f_id).delete()
        db.session.query(DB_TAG_QUESTION).filter_by(id_question = f_id).delete()
        obj.delete()
        db.session.commit()
        
        return make_response("ok", 200)
                
                
@profile_blueprint.route("/setQuestionTags/", methods = ["POST"])
@login_required
def setQuestionTags():
        f_questionId = request.json["id"]
        f_tags = request.json["tags"]
        
        t_obj = db.session.query(DB_QUESTION.id, DB_QUESTION.author).filter_by(id = f_questionId).first()
        if t_obj == None or t_obj.author != current_user.id:
                return make_response("invalid param", 400)
                
        db.session.query(DB_TAG_QUESTION).filter_by(id_question = f_questionId).delete()
        
        for l_tag in f_tags:
                if db.session.query(DB_TAG).filter_by(tag = l_tag, id_usr = current_user.id).first() != None: # CHECK IF EXIST
                        db.session.add(DB_TAG_QUESTION(tag = l_tag, id_tag = current_user.id, id_question = f_questionId))
        db.session.commit()
        
        return make_response("ok", 200)


# TAG
@profile_blueprint.route("/getTags/")
@login_required
def getTags():
        return json.dumps([i.tag for i in db.session.query(DB_TAG).filter_by(id_usr = current_user.id).all()])


@profile_blueprint.route("/newTag/", methods = ["POST"])
@login_required
def newTag():
        f_tag = request.json["tag"]
        if f_tag == "" or len(f_tag) > 20:
                return make_response("invalid tag", 400)

        if db.session.query(DB_TAG).filter_by(id_usr = current_user.id, tag = f_tag).first() == None:
                db.session.add(DB_TAG(id_usr = current_user.id, tag = f_tag))
                db.session.commit()
                return make_response("ok", 200)
        
        return make_response("already existing Tag", 400)


@profile_blueprint.route("/deleteTag/", methods = ["POST"])
@login_required
def deleteTag():
        f_tag = request.json["tag"]
        if db.session.query(DB_TAG).filter_by(id_usr = current_user.id, tag = f_tag).first() != None:
                db.session.query(DB_TAG_QUESTION).filter_by(id_tag = current_user.id, tag = f_tag).delete()
                db.session.query(DB_TAG).filter_by(id_usr = current_user.id, tag = f_tag).delete()
                db.session.commit()
                return make_response("ok", 200)
        
        return make_response("tag not found", 400)
