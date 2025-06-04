from flask import Flask, request,jsonify
import pyodbc
from flask_cors import CORS
from dotenv import load_dotenv
import os
import datetime

app = Flask(__name__)
CORS(app)

# DATOS DE CONEXIÓN A TU BD
server = 'serverbdcloudrfid.database.windows.net'
database = 'BDCloudRFID'
username = 'AdminCloudSQL'
password = 'cloudRFID_1'

#  Cadena de conexión
connection_string = f'DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'


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

@app.route('/usuarios', methods=['POST'])
def create_usuarios():
    data= request.get_json()
    id = data.get('tagId')
    name = data.get('nombre')
    age= data.get('edad')
    tipo= data.get('tipo')
    estado = "Alta"
    username = data.get('username')
    password = data.get('password')
    print(data)
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO dbo.Usuarios (TagId, NombreCompleto, Edad, FechaRegistro, Estado, TipoUsuario, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
                       (id, name, age, datetime.datetime.now(), estado, tipo, username, password))
        conn.commit()
        return jsonify({"success":" Usuario Creado"}),200 
    except Exception as e:
        return jsonify({"Error":f"An error ocurred {e}"}),500




@app.route('/login',methods=["POST"])
def login_user():
    data=request.get_json()
    print(data)
    if not data:
        return jsonify({"Error":"No data found"}),404
    id = data.get('username')
    password=data.get('password')
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT username,password,TipoUsuario FROM dbo.Usuarios where username = ?",id)
        usertype = cursor.fetchone()
        if usertype and usertype[0] == id and usertype[1] == password:
            if usertype[2]=="Guardia":
                return jsonify({"success":f"Bienvenido {usertype[0]}","TipoUsuario":usertype[2],"redirect_url": '/PaginaCloud/dashboard_guardia.html'}),200
            elif usertype[2]=="Administrador":
                return jsonify({"success":f"Bienvenido {usertype[0]}","TipoUsuario":usertype[2],"redirect_url": '/PaginaCloud/dashboard_admin.html'}),200
            else:
                return jsonify({"Error":"No tienes accesos"}),400
    except Exception as e:
        return jsonify({"Error":f"An error ocurred {e}"})

@app.route('/tag',methods=['POST'])
def tag_used():
    data=request.get_json()
    tag = data.get('TagId')
    modulo = data.get('ModuloId')
    print(tag,modulo)
    try:
        print(tag,modulo)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT NombreCompleto,TipoUsuario FROM dbo.Usuarios where TagId = ?",tag)
        user = cursor.fetchone()
        date = datetime.datetime.now().date()
        time = datetime.datetime.now().time()
        status="Permitido"
        print(data)
        if user:
            print(user)
            name=user[0]
            usertype=user[1]
            if usertype == "Guardia" and modulo <=2:  
                cursor.execute("INSERT INTO dbo.HistorialDetecciones (TagId, FechaDeteccion,HoraDeteccion,ModuloId,nombre,status) VALUES (?, ?, ?, ?, ?, ?)", (tag, date,time,modulo,name,status))
                conn.commit()
                return jsonify({"success":f"Tag {tag} usado por {name}"}),200
            elif usertype == "Administrador" and modulo <=3:
                cursor.execute("INSERT INTO dbo.HistorialDetecciones (TagId, FechaDeteccion,HoraDeteccion,ModuloId,nombre,status) VALUES (?, ?, ?, ?, ?,?)", (tag, date,time,modulo,name,status))
                conn.commit()
                return jsonify({"success":f"Tag {tag} usado por {name}"}),200
            elif usertype == "Usuario" and modulo == 1:
                cursor.execute("INSERT INTO dbo.HistorialDetecciones (TagId, FechaDeteccion,HoraDeteccion,ModuloId,nombre,status) VALUES (?, ?, ?, ?, ?,?)", (tag, date,time,modulo,name,status))
                conn.commit()
                return jsonify({"success":f"Tag {tag} usado por {name}"}),200
            else:
                status="Denegado"
                cursor.execute("INSERT INTO dbo.HistorialDetecciones (TagId, FechaDeteccion,HoraDeteccion,ModuloId,nombre,status) VALUES (?, ?, ?, ?, ?,?)", (tag, date,time,modulo,name,status))
                conn.commit()
                return jsonify({"success":f"Tag {tag} usado por {name}"}),200
    except Exception as e:
        return jsonify({"Error":f"An error ocurred {e}"}),404
    return jsonify({'success':'Si se leyo'}),200



    


#  Endpoint: Obtener módulos
@app.route('/modulos', methods=['GET'])
def get_modulos():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Id, Nombre,status FROM dbo.ModulosRFID")
    rows = cursor.fetchall()
    conn.close()
    modulos = [{"Id": row.Id, "Nombre": row.Nombre,"status":row.status} for row in rows]
    return jsonify(modulos)

#  Endpoint: Obtener historial de detecciones
@app.route('/detecciones', methods=['GET'])
def get_detecciones():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Id, TagId, FechaDeteccion, HoraDeteccion, nombre,status FROM dbo.HistorialDetecciones")
    rows = cursor.fetchall()
    conn.close()
    detecciones = []
    for row in rows:
        detecciones.append({
            "Id": row.Id,
            "TagId": row.TagId,
            "Nombre": row.nombre,  # Assuming TagId is the name, adjust if needed
            "FechaDeteccion": str(row.FechaDeteccion),
            "HoraDeteccion": str(row.HoraDeteccion),
            "status": row.status
        })
    return jsonify(detecciones)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
