from flask import Flask, redirect, url_for, request, render_template, session
import os

app = Flask(__name__)

app.secret_key = 'super secret key'


# recupere l'énoncé correspondant à l'utilisateur donné en paramètre et renvoie un dictionnaire contenant toutes les informations de l'énoncé
def getEnonce(user, title):
  try:
    path = user + "/" + title + ".txt"
    file = open('static/enonces/' + path, "r")
    tabE = file.read().split('ù%µù$^')
    rep = {
      "title": title,
      "question": tabE[0],
      "nbRep": tabE[1],
      "bonneReps": tabE[2].split("à|^£*§"),
      "reponses": tabE[3].split("à|^£*§"),
      "etiquettes": tabE[4].split("à|^£*§"),
      "user": user
    }
    return rep
  except OSError:
    return None


# recupere tous les énoncés qui sont attachés a l'etiquette donnée en paramètre et renvoie un dictionnaire avec comme clé le nom des utilisateurs et comme valeur un tableau contenant le titre de chaque énoncé
def getEnoncesEtiq(etiquette):
  rep = {}
  file = open('static/etiquettes/' + etiquette + '.txt', "r")
  allPath = file.readlines()
  for p in allPath:
    print(p)
    titre = p.split("/")[1].split(".")[0]
    user = p.split("/")[0]
    if user not in rep:
      rep[user] = [titre]
    else:
      rep[user].append(titre)
  return rep


#recupere tous les énoncés créer par un utilisateur et renvoie leur path format user/titre.txt dans un tableau
def getEnoncesUser(user):
  rep = []
  for file in os.listdir("static/enonces/" + user):
    f = os.path.join("static/enonces/" + user, file)
    if os.path.isfile(f):
      rep.append(file.split(".")[0])
  return rep


#renvoie une liste de tous les titres des énoncés de l'utilisateur passé en paramètre avec leurs étiquettes
def getEtiquetteParTitre(user):
  rep = {}
  #on récupère la liste des titres des énoncés
  lTitre = getEnoncesUser(user)
  # pour chaque titre, on rajoute ses étiquettes à [titre]
  for titre in lTitre:
    tempEtiq = getEnonce(user, titre)["etiquettes"]
    rep[titre] = tempEtiq
  return rep


# rajoute les nouvelles étiquettes à static/etiquettes.txt
def etiquettetotxt(newEtiquettes):
  # on ouvre static/etiquette.txt
  file = open('static/etiquettes.txt', 'r')
  # on lit ligne par ligne
  etiquettes = file.readlines()
  count = 0
  # pour chaque nouvelle étiquettes (donné en argument)
  for e in newEtiquettes:
    count += 1
    # si la nouvelle étiquette n'est pas dans etiquette.txt, on l'ajoute
    if e not in etiquettes:
      with open('static/etiquettes.txt', 'a') as fo:
        fo.write("\n" + e)
        fo.close()


# retourne un tableau contenant toutes les lignes présentes dans static/etiquettes.txt
def getEtiquette():
  # on ouvre static/etiquettes.txt au format read
  file = open('static/etiquettes.txt', 'r')
  # on le lit ligne par ligne
  etiquettes = file.readlines()
  count = 0
  tab = []
  # pour chaque etiquette on l'ajoute a un tableau qu'on retourne a la fin de la boucle
  for e in etiquettes:
    tab.append(e.strip())
    count += 1
  return tab


# renvoie l'index si l'utilisateur est connecté, sinon renvoie sur la page de connexion
@app.route('/')
def index():
  if 'username' in session:
    return redirect(url_for('mesEnonces'))
  else:
    return render_template('login.html')


# enregistre l'utilisateur dans la session et l'ajoute a la liste des utilisateur si il n'est pas connu
@app.route('/login', methods=['POST', 'GET'])
def login():
  error = None
  if request.method == 'POST':
    name = request.form['name']
    mdp = request.form['mdp']

    # on ouvre le fichier utilisateurs
    file = open('static/utilisateurs.txt', 'r')
    Lines = file.readlines()
    count = 0
    # on lit ligne par ligne dans le fichier utilisateurs
    for line in Lines:
      count += 1
      #si on trouve son identifiant
      if line.split(";")[0] == name:
        #si on a rentré le bon mdp dans le formulaire
        if line.split(";")[1] == mdp:
          # on se connecte en initialisant la variable de session "username" + on redirige vers la page d'acceuil
          session['username'] = name
          return redirect(url_for('index'))
        #sinon on renvoie la page avec un msg d'erreur
        error = "indentifiants incorrect"
        return render_template('login.html', error=error)

    #si on a pas trouvé l'utilisateur alors on l'ajoute
    with open("static/utilisateurs.txt", "a") as fo:
      fo.write(name + ";" + mdp + ";\n")
    fo.close()

    #on créer son dossier qui contiendra ses énoncés
    os.makedirs("static/enonces/" + name)

    #on se connecte en initialisant la variable de session "username" + on redirige vers la page d'acceuil
    session['username'] = name
    return redirect(url_for('index'))
  else:
    return render_template('login.html')


#Renvoie la page de modification et ajout de page selon les données reçues
@app.route('/AjoutQuestions', methods=['POST', 'GET'])
def ajoutQuestions():
  #on récupère la liste des étiquettes
  etiquettes = getEtiquette()
  # si on a des infos dans le get, alors on renvoie AddQ déjà remplis, si un champs vide alors on affiche juste la page pour ajouter une question
  if request.method == 'GET':
    titre = request.args.get('titre')
    if titre is None:
      return render_template('AddQ.html', enonceTab={}, etiquettes=etiquettes)
    user = request.args.get('utilisateur')
    if user is None:
      return render_template('AddQ.html', enonceTab={}, etiquettes=etiquettes)
    enonceTab = getEnonce(user, titre)
    #si on a pas trouvé le fichier, on renvoie sur la liste des enoncés
    if enonceTab is None:
      return redirect(url_for('mesEnonces'))

    return render_template('AddQ.html',
                           enonceTab=enonceTab,
                           etiquettes=etiquettes)

  return render_template('AddQ.html', enonceTab={}, etiquettes=etiquettes)


# route pour la page affichant la liste des énoncés de l'utilisateur et leurs étiquettes
@app.route('/mesEnonces')
def mesEnonces():
  # si l'utilisateur n'est pas connecté, on le redirige a l'index
  if 'username' not in session:
    return redirect(url_for('index'))
  # si l'utilisateur n'est pas connecté, on le revoit sur mesEnonces.html avec la liste de ses énoncés et leurs étiquettes
  else:
    return render_template(
      'mesEnonces.html',
      enonces=[session["username"],
               getEtiquetteParTitre(session["username"])])


# Route pour l'affichage des énoncés liés a une etiquette
@app.route('/Etiquette', methods=['POST', 'GET'])
def etiquette():
  if request.method == 'GET':
    nomEtiquette = request.args.get("etiquette")
    #si on a aucune étiquette dans le get, on renvoie a l'index
    if nomEtiquette is None:
      return redirect(url_for('index'))
    titres = getEnoncesEtiq(nomEtiquette)
    # sinon, on renvoie à étiquette.html les énoncés liés à une étiquette
    return render_template('etiquette.html',
                           titres=titres,
                           etiquette=nomEtiquette)


# route pour l'affichage des fiches de question et pour la suppression des énoncés
@app.route('/viewerQuestion', methods=['POST', 'GET'])
def viewer():
  # si la methode de requete est un get, on renvoie 1 seul énoncé
  if request.method == 'GET':
    titre = request.args.get("titre")
    utilisateur = request.args.get("utilisateur")
    # si le titre du get n'est pas vide on ne récupère qu'un énoncé
    if titre is not None:
      print("return enonce")
      return render_template('viewer.html',
                             enonces=[getEnonce(utilisateur, titre)])
      # si la methode est un post, on doit recupérer les énoncés dans une liste
  elif request.method == 'POST':
    titres = request.form.getlist('selectViewer[]')
    # si selectViewer[] n'est pas vide
    if titres is not None:
      rep = []
      # Si on a appuyé sur le bouton Supprimer, on renvoit à delete une liste format [user%µ%µ%titre]
      if request.form['submit'] == "Supprimer":
        for i in titres:
          rep.append(i)
        return redirect(url_for('delete', lirep=rep))
      # sinon on recupère les utilisateurs et le titre des énoncés selectionnés puis on les renvoie sur viewer.html
      for i in titres:
        user = i.split("%µ%µ%")[0]
        titre = i.split("%µ%µ%")[1]
        rep.append(getEnonce(user, titre))
      print("return enonces")
      return render_template('viewer.html', enonces=rep)
  return redirect(url_for('index'))


@app.route('/logout')
def logout():
  # remove the username from the session if it is there
  session.pop('username', None)
  return redirect(url_for('index'))


@app.route('/recupQuestion', methods=['POST', 'GET'])
# FORMAT DES ENONCES :
# question ù%µù$^ nombreDeRep ù%µù$^ rep1;rep2;rep3 ù%µù$^ bonneRep1;bonneRep2;bonnRep3 ù%µù$^ etiquette1;etiquette2;etiquette3 ù%µù$^
# bonneRepx = x
def recupquestions():
  rep = []
  bonnerep = []
  etiq = []
  newEtiq = []
  # on récupere le titre, la question et l'identifiant utilisateur dans le form
  titre = request.form['titre']
  if titre is None:
    return redirect(url_for("ajoutQuestions"))
  question = request.form['question']
  if question is None:
    return redirect(url_for("ajoutQuestions"))
  user = request.form['user']
  # on récupere les réponses une par une et on les ajoute dans rep[]
  if request.form.getlist("reponses") == []:
    return redirect(url_for("ajoutQuestions"))
  for reponse in request.form.getlist('reponses'):
    rep.append(reponse)
# on récupère les bonne réponses une par une et on les ajoutes dans bRep[]
  if request.form.getlist('rep') == []:
    return redirect(url_for("ajoutQuestions"))
  for bRep in request.form.getlist('rep'):
    bonnerep.append(bRep)
# on récupère toutes les étiquettes et on les ajoutes à etiq[]
  if request.form.getlist('allEtiquette[]') == []:
    return redirect(url_for("ajoutQuestions"))
  for etiquette in request.form.getlist('allEtiquette[]'):
    etiq.append(etiquette)

# on récupère tout les nouvelles étiquettes et on les ajoutes à newEtiq[]
  for etiqu in request.form.getlist('newEtiquette[]'):
    newEtiq.append(etiqu)

    # on ouvre static/enonces/user/titre.txt
  open("static/enonces/" + user + "/" + titre + ".txt", 'w').close()
  with open("static/enonces/" + user + "/" + titre + ".txt", "a") as fo:
    # on écrit " question ù%µù$^ len(rep) ù%µù$^ "
    fo.write(question)
    fo.write("ù%µù$^" + str(len(rep)) + 'ù%µù$^')
    # on écrit les bonnes réponses : " x;n; ù%µù$^ "
    for i in range(len(bonnerep) - 1):
      fo.write(bonnerep[i] + 'à|^£*§')
    fo.write(bonnerep[len(bonnerep) - 1] + "ù%µù$^")
    # on écrit les réponses possibles : "rep1;rep2;rep3 ù%µù$^"
    for i in range(len(rep) - 1):
      fo.write(rep[i] + 'à|^£*§')
    fo.write(rep[len(rep) - 1] + "ù%µù$^")
    # on écrit les étiquettes : "e1;e2;e3; ù%µù$^ "
    for i in range(len(etiq) - 1):
      fo.write(etiq[i] + 'à|^£*§')
    fo.write(etiq[len(etiq) - 1] + "ù%µù$^")
    fo.write("\n")
  fo.close()
  # on renvoie la liste des nouvelles étiquettes à etiquettetotxt
  # (met les nouvelles etiquettes dans etiquettes.txt)
  etiquettetotxt(newEtiq)
  # pour chaque etiquettes e
  etiquetteBefore = request.form.getlist("etiquetteBefore")
  if etiquetteBefore != []:
    print("etiquette is not none")
    for eBefore in etiquetteBefore:
      if eBefore not in etiq:
        print("eBefore = " + eBefore)
        with open("static/etiquettes/" + eBefore + ".txt", "r") as input:
          with open("temp.txt", "w") as output:
            for line in input:
              # if text matches then don't write it
              if line.strip("\n") != user + "/" + titre + ".txt":
                output.write(line)
          os.replace('temp.txt', ("static/etiquettes/" + eBefore + '.txt'))
          output.close()
        input.close()
  for e in etiq:
    # si e.txt n'est pas créer, on le créer puis on ajoute user/titre.txt à l'intérieur et on renvoie a la liste des énoncés
    if not os.path.isfile("static/etiquettes/" + e + ".txt"):
      with open("static/etiquettes/" + e + ".txt", "a") as fo:
        fo.write(user + "/" + titre + ".txt\n")
      fo.close()
    else:
      # sinon on ouvre etiquettes/e.txt
      file = open("static/etiquettes/" + e + ".txt")
      lines = file.readlines()
      for line in lines:
        i = 0
        # si l'énoncé est déjà dans e.txt, on retourne a mesEnonces
        if user + "/" + titre + ".txt" == line.strip("\n"):
          i = 1
          break
        # sinon on ouvre e.txt et on y écrit user/titre.txt
      if i == 0:
        with open("static/etiquettes/" + e + ".txt", "a") as fo:
          fo.write(user + "/" + titre + ".txt\n")
        fo.close()
  # on renvoie à l'index
  return redirect(url_for('mesEnonces'))


# https://pynative.com/python-delete-lines-from-file/


# route la suppression d'énoncé
@app.route('/DeleteEnonces', methods=['POST', 'GET'])
def delete():
  if request.method == 'GET':
    reponses = request.args.getlist("lirep")
    print(reponses)
    for enonce in reponses:
      user = enonce.split("%µ%µ%")[0]
      titre = enonce.split("%µ%µ%")[1]
      etiquettes = getEnonce(user, titre)["etiquettes"]
      for e in etiquettes:
        print(e)
        with open("static/etiquettes/" + e + ".txt", "r") as input:
          with open("temp.txt", "w") as output:
            for line in input:
              # if text matches then don't write it
              if line.strip("\n") != user + "/" + titre + ".txt":
                output.write(line)

        os.replace('temp.txt', ("static/etiquettes/" + e + '.txt'))
      os.remove('static/enonces/' + user + "/" + titre + ".txt")
  return (redirect(url_for("index")))


# route pour la vérification des réponses
@app.route("/checkReponses", methods=["POST", "GET"])
def checkRep():
  if request.method == "POST":
    liEnonce = request.form.getlist('listeEnonce[]')
    for enonce in liEnonce:
      print(enonce)
      user = enonce.split("µ%µ%µ")[0]
      print(user)
      titre = enonce.split("µ%µ%µ")[1]
      print(titre)
      for numRep in request.form.getlist(enonce):
        print(numRep)
        print(getEnonce(user, titre)["bonneReps"])
        if numRep not in getEnonce(user, titre)["bonneReps"]:
          return render_template("checkQuestion.html", check=0)
    return render_template("checkQuestion.html", check=1)


app.run(debug=True, host="0.0.0.0", port=81)
