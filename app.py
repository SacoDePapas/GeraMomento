from flask import Flask, request,jsonify
import pyodbc
from flask_cors import CORS
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

# DATOS DE CONEXIÓN A TU BD
server = os.getenv("SERVER") 
database = os.getenv("DATABASE")
username = os.getenv("USERNAME")
password = os.getenv("PASSWORD")  

#  Cadena de conexión
connection_string = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'

def get_connection():
    return pyodbc.connect(connection_string)

#  Ruta de prueba
@app.route('/')
def home():
    return jsonify({"mensaje": "API Cloud RFID activa"})

#  Endpoint: Obtener usuarios
@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Id, TagId, NombreCompleto, Edad, FechaRegistro, Estado FROM dbo.Usuarios")
    users = cursor.fetchall()
    conn.close()
    usuarios = [{"id":user[0],"NombreCompleto":user[1],"Edad":user[2],"FechaRegistro":user[3],"Estado":user[4]}for user in users]
    return jsonify(usuarios)

@app.route('/login',methods=["POST"])
def login_user():
    data=request.get_json()
    if not data:
        return jsonify({"Error":"No data found"}),404
    id = int(data.get('username'))
    password=data.get('password')
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(f"SELECT Id,Contrasena,TipoUsuario FROM dbo.Usuarios where Usuario ={id}")
        usertype = cursor.fetchone()
        if usertype !="" and usertype == "":
            a=1
    except Exception as e:
        return jsonify({"Error":f"An error ocurred {e}"})

@app.route('/tag',methods=['POST'])
def tag_used():
    data=request.get_json()
    print(data)
    return jsonify({'success':'Si se leyo'}),200



    


#  Endpoint: Obtener módulos
@app.route('/modulos', methods=['GET'])
def get_modulos():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Id, Nombre FROM dbo.ModulosRFID")
    rows = cursor.fetchall()
    conn.close()
    modulos = [{"Id": row.Id, "Nombre": row.Nombre} for row in rows]
    return jsonify(modulos)

#  Endpoint: Obtener historial de detecciones
@app.route('/detecciones', methods=['GET'])
def get_detecciones():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Id, TagId, FechaDeteccion, HoraDeteccion, ModuloId FROM dbo.HistorialDetecciones")
    rows = cursor.fetchall()
    conn.close()
    detecciones = []
    for row in rows:
        detecciones.append({
            "Id": row.Id,
            "TagId": row.TagId,
            "FechaDeteccion": str(row.FechaDeteccion),
            "HoraDeteccion": str(row.HoraDeteccion),
            "ModuloId": row.ModuloId
        })
    return jsonify(detecciones)

#  Endpoint: Obtener permisos
@app.route('/permisos', methods=['GET'])
def get_permisos():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT UsuarioId, ModuloId FROM dbo.PermisosAcceso")
    rows = cursor.fetchall()
    conn.close()
    permisos = [{"UsuarioId": row.UsuarioId, "ModuloId": row.ModuloId} for row in rows]
    return jsonify(permisos)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
