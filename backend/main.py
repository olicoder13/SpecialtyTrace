from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pyodbc
from pymongo import MongoClient
import os
from datetime import date

app = FastAPI(title="Specialty Trace API - Persistencia Políglota")

# Permitir peticiones desde el frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# CONFIGURACIÓN DE CONEXIONES
# ==========================================
SQL_DRIVER = os.getenv("SQL_DRIVER", "ODBC Driver 17 for SQL Server")
SQL_SERVER = os.getenv("SQL_SERVER", "localhost\\SQLEXPRESS")
SQL_DATABASE = os.getenv("SQL_DATABASE", "SpecialtyTraceDB")
SQL_CONN_STR = (
    f"DRIVER={{{SQL_DRIVER}}};"
    f"SERVER={SQL_SERVER};"
    f"DATABASE={SQL_DATABASE};"
    "Trusted_Connection=yes;"
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "SpecialtyTraceDB;")

mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client[MONGO_DB_NAME]

def get_sql_connection():
    return pyodbc.connect(SQL_CONN_STR)

# ==========================================
# MODELOS DE ENTRADA (PYDANTIC)
# ==========================================
class ParcelaCreate(BaseModel):
    IdProductor: int
    Nombre: str
    UbicacionGeo: str
    Altitud: float
    Hectareas: float

class CataCreate(BaseModel):
    IdLote: int
    PuntajeSCA: float
    NotasSensoriales: str
    CatadorResponsable: str

class VentaCreate(BaseModel):
    IdLote: int
    IdComprador: int
    FechaVenta: date
    CantidadKgVendidos: float
    PrecioKiloUSD: float

class ProcesoBeneficiadoCreate(BaseModel):
    TipoProceso: str
    DuracionDias: int

class CertificacionCreate(BaseModel):
    NombreSello: str
    EntidadEmisora: str

class ExpedienteMongoCreate(BaseModel):
    IdLote: int
    CodigoTrazabilidad: str
    IdParcela: int
    Variedad: str
    PesoTotalKg: float
    ProcesoBeneficiado: ProcesoBeneficiadoCreate
    Certificaciones: list[CertificacionCreate] = []

# ==========================================
# VISTA 1: ENDPOINTS MONGODB (LECTURA RÁPIDA QR)
# ==========================================
@app.get("/api/mongo/lotes")
def listar_codigos_lotes():
    """Obtiene la lista de códigos disponibles en MongoDB para el buscador rápido."""
    lotes = list(mongo_db.ExpedienteLote.find({}, {"_id": 0, "CodigoTrazabilidad": 1, "Variedad": 1}))
    return lotes

@app.get("/api/mongo/trazabilidad/{codigo}")
def obtener_expediente_qr(codigo: str):
    """Ejecuta el pipeline de agregación ($lookup) para consolidar ExpedienteLote + FichaCalidad."""
    pipeline = [
        {"$match": {"CodigoTrazabilidad": codigo}},
        {
            "$lookup": {
                "from": "FichaCalidad",
                "localField": "CodigoTrazabilidad",
                "foreignField": "CodigoTrazabilidad",
                "as": "Calidad"
            }
        },
        {"$unwind": {"path": "$Calidad", "preserveNullAndEmptyArrays": True}},
        {"$project": {"_id": 0, "Calidad._id": 0}}
    ]
    resultado = list(mongo_db.ExpedienteLote.aggregate(pipeline))
    if not resultado:
        raise HTTPException(status_code=404, detail="Código de trazabilidad no encontrado en MongoDB.")
    return resultado[0]

@app.post("/api/mongo/lotes", status_code=201)
def crear_expediente_mongo(data: ExpedienteMongoCreate):
    """Crea un nuevo documento ExpedienteLote en MongoDB."""
    codigo = data.CodigoTrazabilidad.strip().upper()
    if not codigo:
        raise HTTPException(status_code=400, detail="El código de trazabilidad no puede estar vacío.")

    if data.ProcesoBeneficiado.TipoProceso not in ("Lavado", "Natural", "Honey"):
        raise HTTPException(status_code=400, detail="Tipo de proceso inválido.")

    if mongo_db.ExpedienteLote.find_one({"CodigoTrazabilidad": codigo}, {"_id": 1}):
        raise HTTPException(status_code=409, detail="Ya existe un lote con ese código de trazabilidad.")

    documento = data.model_dump()
    documento["CodigoTrazabilidad"] = codigo

    resultado = mongo_db.ExpedienteLote.insert_one(documento)
    documento["_id"] = str(resultado.inserted_id)
    documento.pop("_id", None)

    return {
        "mensaje": f"Expediente {codigo} registrado correctamente en MongoDB.",
        "documento": documento,
    }

# ==========================================
# VISTA 2: ENDPOINTS SQL SERVER (TRANSACCIONES ACID)
# ==========================================
@app.post("/api/sql/parcelas")
def registrar_parcela(data: ParcelaCreate):
    """Ejecuta sp_RegistrarNuevaParcela y captura validaciones RAISERROR de SQL Server."""
    try:
        conn = get_sql_connection()
        cursor = conn.cursor()
        cursor.execute(
            "EXEC dbo.sp_RegistrarNuevaParcela @IdProductor=?, @Nombre=?, @UbicacionGeo=?, @Altitud=?, @Hectareas=?",
            (data.IdProductor, data.Nombre, data.UbicacionGeo, data.Altitud, data.Hectareas)
        )
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return {"mensaje": row[0] if row else "Parcela registrada correctamente."}
    except pyodbc.Error as e:
        error_msg = str(e)
        # Limpiar mensaje técnico de ODBC para mostrar la regla de negocio al usuario
        if "]" in error_msg:
            error_msg = error_msg.split("]")[-1].strip()
        raise HTTPException(status_code=400, detail=error_msg)

@app.post("/api/sql/catas")
def registrar_cata(data: CataCreate):
    """Ejecuta sp_RegistrarEvaluacionCata en SQL Server."""
    try:
        conn = get_sql_connection()
        cursor = conn.cursor()
        cursor.execute(
            "EXEC dbo.sp_RegistrarEvaluacionCata @IdLote=?, @PuntajeSCA=?, @NotasSensoriales=?, @CatadorResponsable=?",
            (data.IdLote, data.PuntajeSCA, data.NotasSensoriales, data.CatadorResponsable)
        )
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return {"mensaje": row[0] if row else "Evaluación sensorial registrada."}
    except pyodbc.Error as e:
        error_msg = str(e).split("]")[-1].strip() if "]" in str(e) else str(e)
        raise HTTPException(status_code=400, detail=error_msg)

@app.post("/api/sql/ventas")
def registrar_venta(data: VentaCreate):
    """Ejecuta sp_RegistrarTransaccionVenta en SQL Server."""
    if data.FechaVenta > date.today():
        raise HTTPException(
            status_code=400,
            detail="La fecha de venta no puede ser posterior a la fecha actual.",
        )

    try:
        conn = get_sql_connection()
        cursor = conn.cursor()
        cursor.execute(
            "EXEC dbo.sp_RegistrarTransaccionVenta @IdLote=?, @IdComprador=?, @FechaVenta=?, @CantidadKgVendidos=?, @PrecioKiloUSD=?",
            (data.IdLote, data.IdComprador, data.FechaVenta, data.CantidadKgVendidos, data.PrecioKiloUSD)
        )
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return {
            "mensaje": f"Venta #{int(row[0])} registrada. Total facturado: ${float(row[1]):.2f} USD"
        }
    except pyodbc.Error as e:
        error_msg = str(e).split("]")[-1].strip() if "]" in str(e) else str(e)
        raise HTTPException(status_code=400, detail=error_msg)

# ==========================================
# VISTA 3: ENDPOINTS ANALÍTICOS (CONSULTAS AVANZADAS)
# ==========================================
@app.get("/api/sql/dashboard")
def obtener_metricas_dashboard():
    """Ejecuta las consultas relacionales avanzadas del Capítulo 4.4."""
    conn = get_sql_connection()
    cursor = conn.cursor()

    # 1. Ranking de rentabilidad por variedad (DENSE_RANK)
    cursor.execute("""
        SELECT 
            var.Nombre AS Variedad,
            COUNT(DISTINCT l.IdLote) AS LotesVendidos,
            ROUND(AVG(ca.PuntajeSCA), 2) AS PromedioSCA,
            ROUND(AVG(v.PrecioKiloUSD), 2) AS PrecioPromedioUSD,
            SUM(v.TotalMontoUSD) AS IngresosTotalesUSD,
            DENSE_RANK() OVER (ORDER BY SUM(v.TotalMontoUSD) DESC) AS Posicion
        FROM Variedad var
        INNER JOIN Lote l ON var.IdVariedad = l.IdVariedad
        INNER JOIN Cata ca ON l.IdLote = ca.IdLote
        INNER JOIN Venta v ON l.IdLote = v.IdLote
        GROUP BY var.Nombre
        ORDER BY Posicion ASC;
    """)
    rentabilidad_variedad = [
        {
            "variedad": r[0], "lotes": r[1], "sca": float(r[2]),
            "precio_kg": float(r[3]), "ingresos": float(r[4]), "rank": r[5]
        }
        for r in cursor.fetchall()
    ]

    # 2. Rendimiento agrícola por productor (> 200 kg/ha)
    cursor.execute("""
        SELECT TOP 8
            CONCAT(p.Nombres, ' ', p.Apellidos) AS Productor,
            SUM(pa.Hectareas) AS Hectareas,
            SUM(c.CantidadKg) AS KgCosechados,
            ROUND(SUM(c.CantidadKg) / NULLIF(SUM(pa.Hectareas), 0), 2) AS RendimientoKgHa
        FROM Productor p
        INNER JOIN Parcela pa ON p.IdProductor = pa.IdProductor
        INNER JOIN Cosecha c ON pa.IdParcela = c.IdParcela
        GROUP BY p.IdProductor, p.Nombres, p.Apellidos
        HAVING (SUM(c.CantidadKg) / NULLIF(SUM(pa.Hectareas), 0)) > 200.00
        ORDER BY RendimientoKgHa DESC;
    """)
    rendimiento_productores = [
        {
            "productor": r[0], "hectareas": float(r[1]),
            "kg": float(r[2]), "rendimiento": float(r[3])
        }
        for r in cursor.fetchall()
    ]

    # 3. KPIs globales
    cursor.execute("SELECT COUNT(*), ISNULL(SUM(TotalMontoUSD), 0), ISNULL(SUM(CantidadKgVendidos), 0) FROM Venta")
    kpi_venta = cursor.fetchone()
    cursor.execute("SELECT COUNT(*) FROM Parcela")
    total_parcelas = cursor.fetchone()[0]

    conn.close()
    return {
        "kpis": {
            "total_ventas": kpi_venta[0],
            "facturacion_usd": float(kpi_venta[1]),
            "kilos_exportados": float(kpi_venta[2]),
            "total_parcelas": total_parcelas
        },
        "rentabilidad_variedad": rentabilidad_variedad,
        "rendimiento_productores": rendimiento_productores
    }