from flask import Flask, url_for
from flask_login import current_user

# BLUEPRINTS
import login
import profile
import docEditor

from dbTable import db

# CONFIG
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///registry.db"
#app.config["SESSION_TYPE"] = "filesystem"
app.config["SECRET_KEY"] = "123"

# SQL DB
db.init_app(app)

with app.app_context():
	db.create_all()

# LOGIN
login.login_manager.init_app(app)
app.register_blueprint(login.login_blueprint)
 
# PROFILE
app.register_blueprint(profile.profile_blueprint)

# DOC EDITOR
app.register_blueprint(docEditor.docEditor_blueprint)


# PATH

@app.route("/")
def index():
        if current_user.is_authenticated:
                return app.redirect(url_for('profile.profile'))
        return app.redirect(url_for('login.login'))
 
# INIT APP
app.run(debug=True,host = '0.0.0.0', port = 5000)
