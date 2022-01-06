#!/usr/bin/env python3
import sys
import math
import requests
import json
from io import BytesIO
from flask import *

app = Flask(__name__)

@app.route("/static/<path:path>")
def returnStaticFile(path):
    return send_from_directory('static', path)

@app.route("/")
def getIndex():
    index_html = open("./index.html", "r", encoding="utf-8")
    return index_html.read()

@app.route("/login")
def getLogin():
    index_html = open("./login.html", "r", encoding="utf-8")
    return index_html.read()

@app.route("/register")
def getRegister():
    index_html = open("./register.html", "r", encoding="utf-8")
    return index_html.read()

if __name__ == "__main__":
    app.debug = True
    app.run(host="0.0.0.0", port=80)
