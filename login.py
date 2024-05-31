from flask import Blueprint, request, render_template, url_for, flash, redirect, make_response

from flask_login import LoginManager, login_user, current_user, logout_user
from flask_security import login_required

import hashlib

from dbTable import *

LoginManager.login_view = 'login'  # redirect on login when user not connected
login_manager = LoginManager()

login_blueprint = Blueprint("login", __name__, template_folder="templates")


class LOG_USR:

  def __init__(self, l_usr):
    self.id = l_usr.id
    self.name = l_usr.name
    self.surname = l_usr.surname
    self.email = l_usr.email
    self.password = l_usr.password
    self.isProfessor = l_usr.isProfessor

  def is_authenticated(self):
    return True

  def is_active(self):
    return True

  def is_anonymous(self):
    return False

  def get_id(self):
    return str(self.id)


def hashPassword(l_pass):
  return hashlib.md5(l_pass.encode('utf-8')).hexdigest()


@login_manager.user_loader
def load_user(user_id):
  usr = db.session.query(DB_USR).filter_by(id=user_id).first()
  if usr == None:
    return None
  return LOG_USR(usr)


@login_blueprint.route("/signup/", methods=["POST", "GET"])
def signup():
  if current_user.is_authenticated:
    return redirect(url_for('profile.profile'))

  if not request.method == "POST":
    return render_template('signup.html')

  #POST
  f_name = request.form['name']
  f_surname = request.form['surname']
  f_email = request.form['email']
  f_password = hashPassword(request.form["password"]) # HASH PASSWORD

  if len(f_name) > 30 or len(f_surname) > 30 or len(f_email) > 70:
    return render_template("signup.html", error = "Les champs ont une taille invalide")

  if db.session.query(DB_USR).filter_by(email=f_email).first() != None:  # test if email exist
    return render_template("signup.html", error = "Email déjà existant")

  # create account
  db.session.add(DB_USR(name = f_name, surname = f_surname, email = f_email, password = f_password, isProfessor = True))
  db.session.commit()

  flash("Compte créer avec succès")
  return redirect(url_for("login.login"))


@login_blueprint.route("/login/", methods=["POST", "GET"])
def login():
  if current_user.is_authenticated:
    return redirect(url_for('profile.profile'))

  if not request.method == "POST":
    return render_template('login.html')

  #POST
  f_email = request.form['email']
  f_password = hashPassword(request.form['password']) # HASH PASSWORD
  f_remember = request.form.get('remember') != None

  q_usr = db.session.query(DB_USR).filter_by(email=f_email,password=f_password).first()
  if q_usr == None:  # test if email and password are valid
    return render_template("login.html", error = "Email ou mot de passe invalide")

  # identification
  login_user(LOG_USR(q_usr), remember = f_remember)
  return redirect(url_for('index'))


@login_blueprint.route("/logout/")
@login_required
def logout():
  logout_user()
  return redirect(url_for("login.login"))


@login_blueprint.route("/newPassword/", methods=["POST"])
@login_required
def newPassword():
	f_password = hashPassword(request.json["password"])
	f_newpassword = hashPassword(request.json["newpassword"])

	obj = db.session.query(DB_USR).filter_by(id = current_user.id, password = f_password).first()
	if obj == None:
		return make_response("Le mot de passe n'a pas été changé correctement, vérifiez que votre mot de passe entré est correct", 400)
	
	obj.password = f_newpassword
	db.session.commit()
	return make_response("Mot de passe changé avec succès !", 200)
