from flask_sqlalchemy import SQLAlchemy

# DEFINE DB
db = SQLAlchemy()

# DEFINE TABLE

class DB_USR(db.Model):
	id = db.Column(db.Integer, primary_key = True, autoincrement = True)
	name = db.Column(db.String(30), nullable = False)
	surname = db.Column(db.String(30), nullable = False)
	email = db.Column(db.String(70), nullable = False, unique = True)
	password = db.Column(db.String(200), nullable = False)
	isProfessor = db.Column(db.Boolean, nullable = False)


class DB_DOC(db.Model):
	id = db.Column(db.Integer, primary_key = True, autoincrement=True)
	author = db.Column(db.Integer, db.ForeignKey(DB_USR.id))
	title = db.Column(db.String(100))


class DB_QUESTION(db.Model):
	id = db.Column(db.Integer, primary_key = True, autoincrement=True)
	author = db.Column(db.Integer, db.ForeignKey(DB_USR.id), nullable = False)
	title = db.Column(db.String(150))
	type = db.Column(db.String(15))
	statement = db.Column(db.Text)
	answers = db.Column(db.Text)

    
class DB_TAG(db.Model):
	id_usr = db.Column(db.Integer, db.ForeignKey(DB_USR.id), primary_key = True)
	tag = db.Column(db.String(20), primary_key = True)


class DB_TAG_QUESTION(db.Model):
	id_tag = db.Column(db.Integer, db.ForeignKey(DB_TAG.id_usr), primary_key = True)
	tag = db.Column(db.String(20), db.ForeignKey(DB_TAG.tag), primary_key = True)
	id_question = db.Column(db.Integer, db.ForeignKey(DB_QUESTION.id), primary_key = True)


class DB_DOC_QUESTION(db.Model):
	id_doc = db.Column(db.Integer, db.ForeignKey(DB_DOC.id), primary_key = True)
	id_question = db.Column(db.Integer, db.ForeignKey(DB_QUESTION.id), primary_key = True)
