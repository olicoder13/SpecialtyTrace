// esquema de validacion

use ('especialtytrace'); 

 
db.createCollection("FichaCalidad", { 

  validator: { 

    $jsonSchema: { 

      bsonType: "object", 

      required: [ 

        "IdControl", 

        "IdLote", 

        "CodigoTrazabilidad", 

        "PorcentajeHumedad", 

        "CantidadDefectos", 

        "PuntajeSCA", 

        "NotasSensoriales", 

        "CatadorResponsable" 

      ], 

      properties: { 

        IdControl: { 

          bsonType: "int", 

          description: "Identificador del control físico" 

        }, 

        IdLote: { 

          bsonType: "int", 

          description: "Identificador numérico del lote evaluado" 

        }, 

        CodigoTrazabilidad: { 

          bsonType: "string", 

          description: "Código de trazabilidad replicado del lote" 

        }, 

        PorcentajeHumedad: { 

          bsonType: ["double", "decimal"], 

          minimum: 9.00, 

          maximum: 13.00, 

          description: "Humedad permitida entre 9.00% y 13.00%" 

        }, 

        CantidadDefectos: { 

          bsonType: "int", 

          minimum: 0, 

          description: "Conteo total de defectos (entero >= 0)" 

        }, 

        PuntajeSCA: { 

          bsonType: ["double", "decimal"], 

          minimum: 0.00, 

          maximum: 100.00, 

          description: "Puntuación en taza de 0 a 100" 

        }, 

        NotasSensoriales: { 

          bsonType: "string", 

          description: "Descriptores sensoriales de la muestra" 

        }, 

        CatadorResponsable: { 

          bsonType: "string", 

          description: "Nombre del Q-Grader a cargo" 

        } 

      } 

    } 

  } 

}); 

// scripts de creacion mongodb
// 1. Borrar las colecciones anteriores para limpiar el terreno
db.ExpedienteLote.drop();
db.FichaCalidad.drop();

// 2. Crear ExpedienteLote 
db.createCollection("ExpedienteLote", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "IdLote",
        "CodigoTrazabilidad",
        "IdParcela",
        "Variedad",
        "PesoTotalKg",
        "ProcesoBeneficiado"
      ],
      properties: {
        IdLote: { bsonType: "int" },
        CodigoTrazabilidad: { bsonType: "string" },
        IdParcela: { bsonType: "int" },
        Variedad: { bsonType: "string" },
        PesoTotalKg: { bsonType: ["double", "decimal", "int", "long"] }, // Acepta cualquier formato numérico
        ProcesoBeneficiado: {
          bsonType: "object",
          required: ["TipoProceso", "DuracionDias"],
          properties: {
            TipoProceso: { enum: ["Lavado", "Natural", "Honey"] },
            DuracionDias: { bsonType: "int" }
          }
        }
      }
    }
  }
});

// 3. Crear FichaCalidad 
db.createCollection("FichaCalidad", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "IdControl",
        "IdLote",
        "CodigoTrazabilidad",
        "PorcentajeHumedad",
        "CantidadDefectos",
        "PuntajeSCA",
        "CatadorResponsable"
      ],
      properties: {
        IdControl: { bsonType: "int" },
        IdLote: { bsonType: "int" },
        CodigoTrazabilidad: { bsonType: "string" },
        PorcentajeHumedad: { bsonType: ["double", "decimal", "int"] },
        CantidadDefectos: { bsonType: "int" },
        PuntajeSCA: { bsonType: ["double", "decimal", "int"] },
        CatadorResponsable: { bsonType: "string" }
      }
    }
  }
});

//ingresar datos mongodb
// Limpiar registros previos de prueba si deseas empezar con los 10 limpios
db.ExpedienteLote.deleteMany({});
db.FichaCalidad.deleteMany({});

// Inserción de 10 Expedientes de Lote
db.ExpedienteLote.insertMany([
  {
    IdLote: NumberInt(1),
    CodigoTrazabilidad: "TRZ-26-GSH-001",
    IdParcela: NumberInt(1),
    Variedad: "Geisha",
    PesoTotalKg: 250.00,
    ProcesoBeneficiado: { TipoProceso: "Lavado", DuracionDias: NumberInt(15) },
    Certificaciones: [
      { NombreSello: "Orgánico USDA", EntidadEmisora: "USDA" },
      { NombreSello: "Fairtrade", EntidadEmisora: "Fairtrade International" }
    ]
  },
  {
    IdLote: NumberInt(2),
    CodigoTrazabilidad: "TRZ-26-BRB-002",
    IdParcela: NumberInt(2),
    Variedad: "Bourbon Rosado",
    PesoTotalKg: 300.00,
    ProcesoBeneficiado: { TipoProceso: "Honey", DuracionDias: NumberInt(20) },
    Certificaciones: [
      { NombreSello: "Rainforest Alliance", EntidadEmisora: "Rainforest Org" }
    ]
  },
  {
    IdLote: NumberInt(3),
    CodigoTrazabilidad: "TRZ-26-TYP-003",
    IdParcela: NumberInt(3),
    Variedad: "Typica",
    PesoTotalKg: 280.50,
    ProcesoBeneficiado: { TipoProceso: "Natural", DuracionDias: NumberInt(30) },
    Certificaciones: [
      { NombreSello: "Orgánico USDA", EntidadEmisora: "USDA" }
    ]
  },
  {
    IdLote: NumberInt(4),
    CodigoTrazabilidad: "TRZ-26-GSH-004",
    IdParcela: NumberInt(4),
    Variedad: "Geisha",
    PesoTotalKg: 350.00,
    ProcesoBeneficiado: { TipoProceso: "Lavado", DuracionDias: NumberInt(14) },
    Certificaciones: [
      { NombreSello: "Fairtrade", EntidadEmisora: "Fairtrade International" }
    ]
  },
  {
    IdLote: NumberInt(5),
    CodigoTrazabilidad: "TRZ-26-CTI-005",
    IdParcela: NumberInt(5),
    Variedad: "Catuai",
    PesoTotalKg: 200.20,
    ProcesoBeneficiado: { TipoProceso: "Honey", DuracionDias: NumberInt(22) },
    Certificaciones: [
      { NombreSello: "Rainforest Alliance", EntidadEmisora: "Rainforest Org" }
    ]
  },
  {
    IdLote: NumberInt(6),
    CodigoTrazabilidad: "TRZ-26-MRG-006",
    IdParcela: NumberInt(6),
    Variedad: "Maragogype",
    PesoTotalKg: 320.00,
    ProcesoBeneficiado: { TipoProceso: "Natural", DuracionDias: NumberInt(28) },
    Certificaciones: [
      { NombreSello: "Orgánico USDA", EntidadEmisora: "USDA" }
    ]
  },
  {
    IdLote: NumberInt(7),
    CodigoTrazabilidad: "TRZ-26-PCM-007",
    IdParcela: NumberInt(7),
    Variedad: "Pacamara",
    PesoTotalKg: 260.50,
    ProcesoBeneficiado: { TipoProceso: "Lavado", DuracionDias: NumberInt(16) },
    Certificaciones: [
      { NombreSello: "Fairtrade", EntidadEmisora: "Fairtrade International" }
    ]
  },
  {
    IdLote: NumberInt(8),
    CodigoTrazabilidad: "TRZ-26-CST-008",
    IdParcela: NumberInt(8),
    Variedad: "Castillo",
    PesoTotalKg: 290.00,
    ProcesoBeneficiado: { TipoProceso: "Honey", DuracionDias: NumberInt(21) },
    Certificaciones: [
      { NombreSello: "Rainforest Alliance", EntidadEmisora: "Rainforest Org" }
    ]
  },
  {
    IdLote: NumberInt(9),
    CodigoTrazabilidad: "TRZ-26-SL8-009",
    IdParcela: NumberInt(9),
    Variedad: "SL28",
    PesoTotalKg: 210.00,
    ProcesoBeneficiado: { TipoProceso: "Lavado", DuracionDias: NumberInt(15) },
    Certificaciones: [
      { NombreSello: "Orgánico USDA", EntidadEmisora: "USDA" }
    ]
  },
  {
    IdLote: NumberInt(10),
    CodigoTrazabilidad: "TRZ-26-CTM-010",
    IdParcela: NumberInt(10),
    Variedad: "Catimor",
    PesoTotalKg: 380.00,
    ProcesoBeneficiado: { TipoProceso: "Natural", DuracionDias: NumberInt(25) },
    Certificaciones: [
      { NombreSello: "Fairtrade", EntidadEmisora: "Fairtrade International" },
      { NombreSello: "Rainforest Alliance", EntidadEmisora: "Rainforest Org" }
    ]
  }
]);

// Inserción de 10 Fichas de Calidad
db.FichaCalidad.insertMany([
  {
    IdControl: NumberInt(1),
    IdLote: NumberInt(1),
    CodigoTrazabilidad: "TRZ-26-GSH-001",
    PorcentajeHumedad: 11.20,
    CantidadDefectos: NumberInt(2),
    PuntajeSCA: 88.50,
    NotasSensoriales: "Jazmín, miel, lima, postgusto prolongado.",
    CatadorResponsable: "Q-Grader Mario Vega"
  },
  {
    IdControl: NumberInt(2),
    IdLote: NumberInt(2),
    CodigoTrazabilidad: "TRZ-26-BRB-002",
    PorcentajeHumedad: 10.50,
    CantidadDefectos: NumberInt(1),
    PuntajeSCA: 89.25,
    NotasSensoriales: "Frutos rojos, panela, acidez brillante.",
    CatadorResponsable: "Q-Grader Ana Torres"
  },
  {
    IdControl: NumberInt(3),
    IdLote: NumberInt(3),
    CodigoTrazabilidad: "TRZ-26-TYP-003",
    PorcentajeHumedad: 11.80,
    CantidadDefectos: NumberInt(3),
    PuntajeSCA: 84.00,
    NotasSensoriales: "Chocolate oscuro, nueces, cuerpo medio.",
    CatadorResponsable: "Q-Grader Luis Gómez"
  },
  {
    IdControl: NumberInt(4),
    IdLote: NumberInt(4),
    CodigoTrazabilidad: "TRZ-26-GSH-004",
    PorcentajeHumedad: 10.80,
    CantidadDefectos: NumberInt(0),
    PuntajeSCA: 90.00,
    NotasSensoriales: "Bergamota, té negro, floral.",
    CatadorResponsable: "Q-Grader Mario Vega"
  },
  {
    IdControl: NumberInt(5),
    IdLote: NumberInt(5),
    CodigoTrazabilidad: "TRZ-26-CTI-005",
    PorcentajeHumedad: 11.00,
    CantidadDefectos: NumberInt(2),
    PuntajeSCA: 86.75,
    NotasSensoriales: "Caramelo, manzana, postgusto dulce.",
    CatadorResponsable: "Q-Grader Ana Torres"
  },
  {
    IdControl: NumberInt(6),
    IdLote: NumberInt(6),
    CodigoTrazabilidad: "TRZ-26-MRG-006",
    PorcentajeHumedad: 12.00,
    CantidadDefectos: NumberInt(4),
    PuntajeSCA: 82.50,
    NotasSensoriales: "Madera, herbal, acidez baja.",
    CatadorResponsable: "Q-Grader Luis Gómez"
  },
  {
    IdControl: NumberInt(7),
    IdLote: NumberInt(7),
    CodigoTrazabilidad: "TRZ-26-PCM-007",
    PorcentajeHumedad: 11.50,
    CantidadDefectos: NumberInt(1),
    PuntajeSCA: 88.00,
    NotasSensoriales: "Mandarina, miel, sedoso.",
    CatadorResponsable: "Q-Grader Mario Vega"
  },
  {
    IdControl: NumberInt(8),
    IdLote: NumberInt(8),
    CodigoTrazabilidad: "TRZ-26-CST-008",
    PorcentajeHumedad: 10.20,
    CantidadDefectos: NumberInt(0),
    PuntajeSCA: 89.50,
    NotasSensoriales: "Cereza, chocolate con leche, balanceado.",
    CatadorResponsable: "Q-Grader Ana Torres"
  },
  {
    IdControl: NumberInt(9),
    IdLote: NumberInt(9),
    CodigoTrazabilidad: "TRZ-26-SL8-009",
    PorcentajeHumedad: 11.40,
    CantidadDefectos: NumberInt(1),
    PuntajeSCA: 87.50,
    NotasSensoriales: "Grosella negra, almendras, jugoso.",
    CatadorResponsable: "Q-Grader Mario Vega"
  },
  {
    IdControl: NumberInt(10),
    IdLote: NumberInt(10),
    CodigoTrazabilidad: "TRZ-26-CTM-010",
    PorcentajeHumedad: 10.90,
    CantidadDefectos: NumberInt(2),
    PuntajeSCA: 85.25,
    NotasSensoriales: "Cacao, especias, cuerpo denso.",
    CatadorResponsable: "Q-Grader Luis Gómez"
  }
]);

/*=== CONSULTAS MONGODB ATLAS ===*/

//INTEGRANTE 1
use SpecialtyTraceDB;

db.ExpedienteLote.aggregate([
  {
    $lookup: {
      from: "FichaCalidad",
      localField: "CodigoTrazabilidad",
      foreignField: "CodigoTrazabilidad",
      as: "EvaluacionCalidad"
    }
  },
  { $unwind: "$EvaluacionCalidad" },
  {
    $project: {
      _id: 0,
      CodigoLote: "$CodigoTrazabilidad",
      Variedad: 1,
      MetodoProceso: "$ProcesoBeneficiado.TipoProceso",
      DiasFermentacionSecado: "$ProcesoBeneficiado.DuracionDias",
      HumedadPorcentaje: "$EvaluacionCalidad.PorcentajeHumedad",
      DefectosFisicos: "$EvaluacionCalidad.CantidadDefectos",
      PuntajeSCA: "$EvaluacionCalidad.PuntajeSCA",
      NotasCata: "$EvaluacionCalidad.NotasSensoriales",
      CatadorCertificado: "$EvaluacionCalidad.CatadorResponsable"
    }
  },
  { $sort: { PuntajeSCA: -1 } }
]);

use SpecialtyTraceDB;

db.ExpedienteLote.aggregate([
  {
    $match: { "ProcesoBeneficiado.TipoProceso": "Lavado" }
  },
  {
    $lookup: {
      from: "FichaCalidad",
      localField: "CodigoTrazabilidad",
      foreignField: "CodigoTrazabilidad",
      as: "Calidad"
    }
  },
  { $unwind: "$Calidad" },
  {
    $match: { "Calidad.PorcentajeHumedad": { $lte: 11.2 } }
  },
  {
    $project: {
      _id: 0,
      CodigoTrazabilidad: 1,
      Variedad: 1,
      PesoKg: "$PesoTotalKg",
      Humedad: "$Calidad.PorcentajeHumedad",
      PuntajeSCA: "$Calidad.PuntajeSCA"
    }
  }
]);


//INTEGRANTE 2
use SpecialtyTraceDB;

db.FichaCalidad.aggregate([
  {
    $group: {
      _id: "$CatadorResponsable",
      TotalCatas: { $sum: 1 },
      PromedioSCA: { $avg: "$PuntajeSCA" },
      PuntajeMinimo: { $min: "$PuntajeSCA" },
      PuntajeMaximo: { $max: "$PuntajeSCA" }
    }
  },
  {
    $project: {
      _id: 0,
      Catador: "$_id",
      TotalCatas: 1,
      PromedioSCA: { $round: ["$PromedioSCA", 2] },
      PuntajeMinimo: 1,
      PuntajeMaximo: 1,
      Criterio: {
        $cond: {
          if: { $gte: ["$PromedioSCA", 88.0] },
          then: "Perfil Alta Especialidad",
          else: "Perfil Estándar"
        }
      }
    }
  },
  { $sort: { PromedioSCA: -1 } }
]);


use SpecialtyTraceDB;

db.FichaCalidad.aggregate([
  {
    $match: { CantidadDefectos: 0 }
  },
  {
    $project: {
      _id: 0,
      CodigoTrazabilidad: 1,
      Defectos: "$CantidadDefectos",
      PuntajeSCA: 1,
      NotasSensoriales: 1,
      CatadorResponsable: 1
    }
  },
  { $sort: { PuntajeSCA: -1 } }
]);

// INTEGRANTE 3
use SpecialtyTraceDB;

db.ExpedienteLote.aggregate([
  {
    $match: { "Certificaciones.0": { $exists: true } }
  },
  { $unwind: "$Certificaciones" },
  {
    $group: {
      _id: "$Certificaciones.NombreSello",
      Entidad: { $first: "$Certificaciones.EntidadEmisora" },
      CantidadLotes: { $sum: 1 },
      TotalVolumenKg: { $sum: "$PesoTotalKg" },
      Variedades: { $addToSet: "$Variedad" }
    }
  },
  {
    $project: {
      _id: 0,
      Sello: "$_id",
      EntidadCertificadora: "$Entidad",
      CantidadLotes: 1,
      TotalVolumenKg: { $round: ["$TotalVolumenKg", 2] },
      Variedades: 1
    }
  },
  { $sort: { TotalVolumenKg: -1 } }
]);

use SpecialtyTraceDB;

db.ExpedienteLote.aggregate([
  {
    $addFields: {
      TotalCertificaciones: { $size: { $ifNull: ["$Certificaciones", []] } }
    }
  },
  {
    $match: { TotalCertificaciones: { $gte: 2 } }
  },
  {
    $project: {
      _id: 0,
      CodigoTrazabilidad: 1,
      Variedad: 1,
      PesoTotalKg: 1,
      TotalCertificaciones: 1,
      Sellos: "$Certificaciones.NombreSello"
    }
  },
  { $sort: { TotalCertificaciones: -1 } }
]);

//INTEGRANTE 4
use SpecialtyTraceDB;

db.ExpedienteLote.aggregate([
  {
    $lookup: {
      from: "FichaCalidad",
      localField: "CodigoTrazabilidad",
      foreignField: "CodigoTrazabilidad",
      as: "Calidad"
    }
  },
  { $unwind: "$Calidad" },
  {
    $group: {
      _id: "$ProcesoBeneficiado.TipoProceso",
      TotalLotes: { $sum: 1 },
      PromedioDias: { $avg: "$ProcesoBeneficiado.DuracionDias" },
      PromedioSCA: { $avg: "$Calidad.PuntajeSCA" },
      DefectosPromedio: { $avg: "$Calidad.CantidadDefectos" }
    }
  },
  {
    $project: {
      _id: 0,
      MetodoBeneficiado: "$_id",
      TotalLotes: 1,
      PromedioDias: { $round: ["$PromedioDias", 1] },
      PromedioSCA: { $round: ["$PromedioSCA", 2] },
      DefectosPromedio: { $round: ["$DefectosPromedio", 2] }
    }
  },
  { $sort: { PromedioSCA: -1 } }
]);



use SpecialtyTraceDB;

db.ExpedienteLote.aggregate([
  {
    $group: {
      _id: "$Variedad",
      CantidadLotes: { $sum: 1 },
      KilosTotales: { $sum: "$PesoTotalKg" },
      PesoPromedioPorLote: { $avg: "$PesoTotalKg" }
    }
  },
  {
    $project: {
      _id: 0,
      Variedad: "$_id",
      CantidadLotes: 1,
      KilosTotales: { $round: ["$KilosTotales", 2] },
      PesoPromedioPorLote: { $round: ["$PesoPromedioPorLote", 2] }
    }
  },
  { $sort: { KilosTotales: -1 } }
]);

// INTEGRANTE 5

use SpecialtyTraceDB;

db.ExpedienteLote.aggregate([
  {
    $lookup: {
      from: "FichaCalidad",
      localField: "CodigoTrazabilidad",
      foreignField: "CodigoTrazabilidad",
      as: "Ficha"
    }
  },
  { $unwind: "$Ficha" },
  {
    $facet: {
      "AltaEspecialidad": [
        { $match: { "Ficha.PuntajeSCA": { $gte: 88.0 } } },
        {
          $project: {
            _id: 0,
            Codigo: "$CodigoTrazabilidad",
            Variedad: 1,
            Puntaje: "$Ficha.PuntajeSCA",
            Notas: "$Ficha.NotasSensoriales"
          }
        },
        { $sort: { Puntaje: -1 } }
      ],
      "EspecialidadEstandar": [
        { $match: { "Ficha.PuntajeSCA": { $lt: 88.0 } } },
        {
          $project: {
            _id: 0,
            Codigo: "$CodigoTrazabilidad",
            Variedad: 1,
            Puntaje: "$Ficha.PuntajeSCA"
          }
        },
        { $sort: { Puntaje: -1 } }
      ]
    }
  }
]);


use SpecialtyTraceDB;

db.FichaCalidad.aggregate([
  {
    $match: { PuntajeSCA: { $gte: 85.0 } }
  },
  { $sort: { PuntajeSCA: -1 } },
  { $limit: 3 },
  {
    $project: {
      _id: 0,
      CodigoTrazabilidad: 1,
      PuntajeSCA: 1,
      NotasSensoriales: 1,
      Catador: "$CatadorResponsable"
    }
  }
]);