#!/usr/bin/env python3
import sys
import math
import requests
import json
import firebase_admin
import datetime

from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import auth
from firebase_admin import exceptions
from firebase_admin import db;

from io import BytesIO
from flask import *

cred = credentials.Certificate("ntut-web-c0525-firebase-adminsdk-25ufm-948f706dae.json")
firebase_app = firebase_admin.initialize_app(cred)

session_map = {}

app = Flask(__name__)

def fetchData(session_key):
    email = session_map[session_key]["email"]
    data = {}

    database = firestore.client()
    doc = database.collection(u"user").document(email).get()
    doc_dict = doc.to_dict()

    data["email"] = email
    data["role"] = doc_dict["role"]
    data["username"] = doc_dict["username"]

    return data

@app.route("/static/<path:path>")
def returnStaticFile(path):
    return send_from_directory('static', path)

@app.route("/")
def getIndex():
    
    session_cookie = request.cookies.get('session')

    if session_cookie in session_map:
        return redirect('/platform')

    index_html = open("./index.html", "r", encoding="utf-8")
    return index_html.read()

@app.route("/login")
def getLogin():

    session_cookie = request.cookies.get('session')

    if session_cookie in session_map:
        return redirect('/platform')
    
    index_html = open("./login.html", "r", encoding="utf-8")
    return index_html.read()

@app.route("/register", methods=["GET", "POST"])
def getRegister():

    session_cookie = request.cookies.get('session')

    if session_cookie in session_map:
        return redirect('/platform')

    if request.method == "GET":
        index_html = open("./register.html", "r", encoding="utf-8")
        return index_html.read()

@app.route("/platform", methods=["GET", "POST"])
def getPlatform():
    
    session_cookie = request.cookies.get('session')

    if not session_cookie or session_cookie not in session_map:
        return redirect('/login')
    
    if request.method == "GET":
        index_html = open("./platform.html", "r", encoding="utf-8")
        return index_html.read()

    try:
        decoded_claims = auth.verify_session_cookie(session_cookie, check_revoked=True)
        return json.dumps(fetchData(session_cookie))
    
    except auth.InvalidSessionCookieError:
        # Session cookie is invalid, expired or revoked. Force user to login.
        return redirect('/login')

@app.route("/platform/addSchedule", methods=["GET", "POST"])
def getPlatformAddSchedule():
    
    session_cookie = request.cookies.get('session')

    if not session_cookie or session_cookie not in session_map:
        return redirect('/login')
    
    if request.method == "GET":
        index_html = open("./platform-addSchedule.html", "r", encoding="utf-8")
        return index_html.read()

    try:
        decoded_claims = auth.verify_session_cookie(session_cookie, check_revoked=True)
        return json.dumps(session_map[session_cookie])
    
    except auth.InvalidSessionCookieError:
        # Session cookie is invalid, expired or revoked. Force user to login.
        return redirect('/login')

@app.route("/signin", methods=["POST"])
def signin():
    email = request.json["email"]
    id_token = request.json["token"]
    expires_in = datetime.timedelta(days=5)
    try:

        session_cookie = auth.create_session_cookie(id_token, expires_in=expires_in)

        userInfo = auth.get_user_by_email(email)
        
        database = firestore.client()
        doc = database.collection(u"user").document(email).get()
        doc_dict = doc.to_dict()

        data = {"email": email, "role": doc_dict["role"], "username": doc_dict["username"]}

        session_map[session_cookie] = data

        response = jsonify({'status': 'success'})
        
        expires = datetime.datetime.now() + expires_in

        response.set_cookie("session", session_cookie, expires=expires)

        print(session_map)

        return response
    
    except exceptions.FirebaseError:
        return abort(401, 'Failed to create a session cookie')

@app.route("/logout", methods=["GET"])
def logout():

    session_cookie = request.cookies.get('session')

    if session_cookie is None:
        return redirect("/")
    
    del session_map[session_cookie]
    return redirect("/")

@app.route("/teapot", methods=["GET"])
def teapot():
    index_html = open("./teapot.html", "r", encoding="utf-8")
    return Response(index_html.read(), 418)

if __name__ == "__main__":
    app.debug = True
    app.run(host="0.0.0.0", port=80)