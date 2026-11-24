use("SpecialtyTraceDB");

// 1. Limpiar colecciones previas
db.Productores.drop();
db.ExpedienteLote.drop();
db.FichaCalidad.drop();
db.Compradores.drop();
db.Ventas.drop();

// =========================================================================
// 2. CREACIÓN DE COLECCIONES CON VALIDACIÓN DE ESQUEMA ($jsonSchema)
// =========================================================================

// 2.1 Colección: Productores (Embebido 1:N con Parcelas)
db.createCollection("Productores", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "IdProductor",
        "Nombres",
        "Apellidos",
        "DocumentoIdentidad",
        "Telefono",
        "Parcelas",
      ],
      properties: {
        IdProductor: { bsonType: "int" },
        Nombres: { bsonType: "string" },
        Apellidos: { bsonType: "string" },
        DocumentoIdentidad: { bsonType: "string" },
        Telefono: { bsonType: "string" },
        Correo: { bsonType: "string" },
        Parcelas: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: [
              "IdParcela",
              "Nombre",
              "UbicacionGeo",
              "Altitud",
              "Hectareas",
            ],
            properties: {
              IdParcela: { bsonType: "int" },
              Nombre: { bsonType: "string" },
              UbicacionGeo: { bsonType: "string" },
              Altitud: { bsonType: ["double", "decimal", "int"], minimum: 1 },
              Hectareas: {
                bsonType: ["double", "decimal", "int"],
                minimum: 0.1,
              },
            },
          },
        },
      },
    },
  },
});

// 2.2 Colección: ExpedienteLote (Híbrido: Referencial + Embebido 1:1 y 1:N)
db.createCollection("ExpedienteLote", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "IdLote",
        "IdProductor",
        "CodigoTrazabilidad",
        "IdParcela",
        "Variedad",
        "PesoTotalKg",
        "Cosecha",
        "ProcesoBeneficiado",
      ],
      properties: {
        IdLote: { bsonType: "int" },
        IdProductor: { bsonType: "int" },
        CodigoTrazabilidad: { bsonType: "string" },
        IdParcela: { bsonType: "int" },
        Variedad: { bsonType: "string" },
        PesoTotalKg: {
          bsonType: ["double", "decimal", "int", "long"],
          minimum: 0.01,
        },
        Cosecha: {
          bsonType: "object",
          required: ["IdCosecha", "FechaInicio", "FechaFin", "CantidadKg"],
          properties: {
            IdCosecha: { bsonType: "int" },
            FechaInicio: { bsonType: "date" },
            FechaFin: { bsonType: "date" },
            CantidadKg: {
              bsonType: ["double", "decimal", "int"],
              minimum: 0.01,
            },
          },
        },
        ProcesoBeneficiado: {
          bsonType: "object",
          required: ["TipoProceso", "DuracionDias"],
          properties: {
            TipoProceso: { enum: ["Lavado", "Natural", "Honey"] },
            DuracionDias: { bsonType: "int", minimum: 1 },
          },
        },
        Certificaciones: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["NombreSello", "EntidadEmisora"],
            properties: {
              NombreSello: { bsonType: "string" },
              EntidadEmisora: { bsonType: "string" },
            },
          },
        },
      },
    },
  },
});

// 2.3 Colección: FichaCalidad (Subset / Extended Reference Pattern)
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
        "CatadorResponsable",
      ],
      properties: {
        IdControl: { bsonType: "int" },
        IdLote: { bsonType: "int" },
        CodigoTrazabilidad: { bsonType: "string" },
        PorcentajeHumedad: {
          bsonType: ["double", "decimal", "int"],
          minimum: 9.0,
          maximum: 13.0,
        },
        CantidadDefectos: { bsonType: "int", minimum: 0 },
        PuntajeSCA: {
          bsonType: ["double", "decimal", "int"],
          minimum: 0.0,
          maximum: 100.0,
        },
        NotasSensoriales: { bsonType: "string" },
        CatadorResponsable: { bsonType: "string" },
      },
    },
  },
});

// 2.4 Colección: Compradores
db.createCollection("Compradores", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "IdComprador",
        "RazonSocial",
        "RUC",
        "TipoComprador",
        "PaisDestino",
        "Telefono",
      ],
      properties: {
        IdComprador: { bsonType: "int" },
        RazonSocial: { bsonType: "string" },
        RUC: { bsonType: "string" },
        TipoComprador: { bsonType: "string" },
        PaisDestino: { bsonType: "string" },
        Telefono: { bsonType: "string" },
        Correo: { bsonType: "string" },
      },
    },
  },
});

// 2.5 Colección: Ventas (Referencial hacia ExpedienteLote y Compradores)
db.createCollection("Ventas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "IdVenta",
        "IdLote",
        "CodigoTrazabilidad",
        "IdComprador",
        "FechaVenta",
        "CantidadKgVendidos",
        "PrecioKiloUSD",
        "TotalMontoUSD",
      ],
      properties: {
        IdVenta: { bsonType: "int" },
        IdLote: { bsonType: "int" },
        CodigoTrazabilidad: { bsonType: "string" },
        IdComprador: { bsonType: "int" },
        FechaVenta: { bsonType: "date" },
        CantidadKgVendidos: {
          bsonType: ["double", "decimal", "int"],
          minimum: 0.01,
        },
        PrecioKiloUSD: {
          bsonType: ["double", "decimal", "int"],
          minimum: 0.01,
        },
        TotalMontoUSD: {
          bsonType: ["double", "decimal", "int"],
          minimum: 0.01,
        },
      },
    },
  },
});

// =========================================================================
// 3. CARGA MASIVA DE DATOS DE PRUEBA (10 DOCUMENTOS POR COLECCIÓN)
// =========================================================================

// 3.1 Productores con Parcelas embebidas
db.Productores.insertMany([
  {
    IdProductor: NumberInt(1),
    Nombres: "Carlos",
    Apellidos: "Mendoza",
    DocumentoIdentidad: "72345671",
    Telefono: "987654321",
    Correo: "cmendoza@fincas.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(1),
        Nombre: "Finca El Mirador",
        UbicacionGeo: "Cusco, La Convención",
        Altitud: 1850.5,
        Hectareas: 5.0,
      },
    ],
  },
  {
    IdProductor: NumberInt(2),
    Nombres: "Lucia",
    Apellidos: "Rojas",
    DocumentoIdentidad: "71234562",
    Telefono: "912345678",
    Correo: "lrojas@cafeteros.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(2),
        Nombre: "Finca Las Nubes",
        UbicacionGeo: "Cajamarca, Jaén",
        Altitud: 1700.0,
        Hectareas: 3.5,
      },
    ],
  },
  {
    IdProductor: NumberInt(3),
    Nombres: "Miguel",
    Apellidos: "Quispe",
    DocumentoIdentidad: "73456783",
    Telefono: "923456789",
    Correo: "mquispe@agro.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(3),
        Nombre: "Parcela La Esperanza",
        UbicacionGeo: "Junín, Chanchamayo",
        Altitud: 1600.2,
        Hectareas: 4.2,
      },
    ],
  },
  {
    IdProductor: NumberInt(4),
    Nombres: "Ana",
    Apellidos: "Condori",
    DocumentoIdentidad: "74567894",
    Telefono: "934567890",
    Correo: "acondori@fincas.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(4),
        Nombre: "Finca El Sol",
        UbicacionGeo: "Amazonas, Bagua",
        Altitud: 1750.0,
        Hectareas: 6.0,
      },
    ],
  },
  {
    IdProductor: NumberInt(5),
    Nombres: "Jorge",
    Apellidos: "Salas",
    DocumentoIdentidad: "75678905",
    Telefono: "945678901",
    Correo: "jsalas@cafe.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(5),
        Nombre: "Parcela Bella Vista",
        UbicacionGeo: "San Martín, Moyobamba",
        Altitud: 1500.8,
        Hectareas: 2.8,
      },
    ],
  },
  {
    IdProductor: NumberInt(6),
    Nombres: "Maria",
    Apellidos: "Vargas",
    DocumentoIdentidad: "76789016",
    Telefono: "956789012",
    Correo: "mvargas@agro.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(6),
        Nombre: "Finca Los Pinos",
        UbicacionGeo: "Pasco, Oxapampa",
        Altitud: 1800.0,
        Hectareas: 5.5,
      },
    ],
  },
  {
    IdProductor: NumberInt(7),
    Nombres: "Pedro",
    Apellidos: "Flores",
    DocumentoIdentidad: "77890127",
    Telefono: "967890123",
    Correo: "pflores@cafeteros.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(7),
        Nombre: "Parcela El Cedro",
        UbicacionGeo: "Cusco, Yanatile",
        Altitud: 1900.5,
        Hectareas: 3.0,
      },
    ],
  },
  {
    IdProductor: NumberInt(8),
    Nombres: "Carmen",
    Apellidos: "Perez",
    DocumentoIdentidad: "78901238",
    Telefono: "978901234",
    Correo: "cperez@fincas.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(8),
        Nombre: "Finca La Lluvia",
        UbicacionGeo: "Cajamarca, San Ignacio",
        Altitud: 1650.0,
        Hectareas: 4.8,
      },
    ],
  },
  {
    IdProductor: NumberInt(9),
    Nombres: "Luis",
    Apellidos: "Gomez",
    DocumentoIdentidad: "79012349",
    Telefono: "989012345",
    Correo: "lgomez@cafe.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(9),
        Nombre: "Parcela El Valle",
        UbicacionGeo: "Junín, Satipo",
        Altitud: 1550.0,
        Hectareas: 2.5,
      },
    ],
  },
  {
    IdProductor: NumberInt(10),
    Nombres: "Rosa",
    Apellidos: "Diaz",
    DocumentoIdentidad: "70123450",
    Telefono: "990123456",
    Correo: "rdiaz@agro.pe",
    Parcelas: [
      {
        IdParcela: NumberInt(10),
        Nombre: "Finca Alta Gracia",
        UbicacionGeo: "Amazonas, Utcubamba",
        Altitud: 1820.5,
        Hectareas: 7.0,
      },
    ],
  },
]);

// 3.2 ExpedienteLote (Con Cosecha, ProcesoBeneficiado y Certificaciones embebidos)
db.ExpedienteLote.insertMany([
  {
    IdLote: NumberInt(1),
    IdProductor: NumberInt(1),
    CodigoTrazabilidad: "TRZ-26-GSH-001",
    IdParcela: NumberInt(1),
    Variedad: "Geisha",
    PesoTotalKg: 250.0,
    Cosecha: {
      IdCosecha: NumberInt(1),
      FechaInicio: new Date("2026-05-01"),
      FechaFin: new Date("2026-06-15"),
      CantidadKg: 1200.0,
    },
    ProcesoBeneficiado: { TipoProceso: "Lavado", DuracionDias: NumberInt(15) },
    Certificaciones: [
      { NombreSello: "Orgánico USDA", EntidadEmisora: "USDA" },
      { NombreSello: "Fairtrade", EntidadEmisora: "Fairtrade International" },
    ],
  },
  {
    IdLote: NumberInt(2),
    IdProductor: NumberInt(2),
    CodigoTrazabilidad: "TRZ-26-BRB-002",
    IdParcela: NumberInt(2),
    Variedad: "Bourbon Rosado",
    PesoTotalKg: 300.0,
    Cosecha: {
      IdCosecha: NumberInt(2),
      FechaInicio: new Date("2026-06-20"),
      FechaFin: new Date("2026-08-05"),
      CantidadKg: 950.0,
    },
    ProcesoBeneficiado: { TipoProceso: "Honey", DuracionDias: NumberInt(20) },
    Certificaciones: [
      { NombreSello: "Rainforest Alliance", EntidadEmisora: "Rainforest Org" },
    ],
  },
  {
    IdLote: NumberInt(3),
    IdProductor: NumberInt(3),
    CodigoTrazabilidad: "TRZ-26-TYP-003",
    IdParcela: NumberInt(3),
    Variedad: "Typica",
    PesoTotalKg: 280.5,
    Cosecha: {
      IdCosecha: NumberInt(3),
      FechaInicio: new Date("2026-05-10"),
      FechaFin: new Date("2026-06-25"),
      CantidadKg: 1100.5,
    },
    ProcesoBeneficiado: { TipoProceso: "Natural", DuracionDias: NumberInt(30) },
    Certificaciones: [{ NombreSello: "Orgánico USDA", EntidadEmisora: "USDA" }],
  },
  {
    IdLote: NumberInt(4),
    IdProductor: NumberInt(4),
    CodigoTrazabilidad: "TRZ-26-GSH-004",
    IdParcela: NumberInt(4),
    Variedad: "Geisha",
    PesoTotalKg: 350.0,
    Cosecha: {
      IdCosecha: NumberInt(4),
      FechaInicio: new Date("2026-07-01"),
      FechaFin: new Date("2026-08-20"),
      CantidadKg: 1350.0,
    },
    ProcesoBeneficiado: { TipoProceso: "Lavado", DuracionDias: NumberInt(14) },
    Certificaciones: [
      { NombreSello: "Fairtrade", EntidadEmisora: "Fairtrade International" },
    ],
  },
  {
    IdLote: NumberInt(5),
    IdProductor: NumberInt(5),
    CodigoTrazabilidad: "TRZ-26-CTI-005",
    IdParcela: NumberInt(5),
    Variedad: "Catuai",
    PesoTotalKg: 200.2,
    Cosecha: {
      IdCosecha: NumberInt(5),
      FechaInicio: new Date("2026-04-15"),
      FechaFin: new Date("2026-05-30"),
      CantidadKg: 800.2,
    },
    ProcesoBeneficiado: { TipoProceso: "Honey", DuracionDias: NumberInt(22) },
    Certificaciones: [
      { NombreSello: "Rainforest Alliance", EntidadEmisora: "Rainforest Org" },
    ],
  },
  {
    IdLote: NumberInt(6),
    IdProductor: NumberInt(6),
    CodigoTrazabilidad: "TRZ-26-MRG-006",
    IdParcela: NumberInt(6),
    Variedad: "Maragogype",
    PesoTotalKg: 320.0,
    Cosecha: {
      IdCosecha: NumberInt(6),
      FechaInicio: new Date("2026-06-05"),
      FechaFin: new Date("2026-07-15"),
      CantidadKg: 1250.0,
    },
    ProcesoBeneficiado: { TipoProceso: "Natural", DuracionDias: NumberInt(28) },
    Certificaciones: [{ NombreSello: "Orgánico USDA", EntidadEmisora: "USDA" }],
  },
  {
    IdLote: NumberInt(7),
    IdProductor: NumberInt(7),
    CodigoTrazabilidad: "TRZ-26-PCM-007",
    IdParcela: NumberInt(7),
    Variedad: "Pacamara",
    PesoTotalKg: 260.5,
    Cosecha: {
      IdCosecha: NumberInt(7),
      FechaInicio: new Date("2026-07-10"),
      FechaFin: new Date("2026-08-25"),
      CantidadKg: 900.5,
    },
    ProcesoBeneficiado: { TipoProceso: "Lavado", DuracionDias: NumberInt(16) },
    Certificaciones: [
      { NombreSello: "Fairtrade", EntidadEmisora: "Fairtrade International" },
    ],
  },
  {
    IdLote: NumberInt(8),
    IdProductor: NumberInt(8),
    CodigoTrazabilidad: "TRZ-26-CST-008",
    IdParcela: NumberInt(8),
    Variedad: "Castillo",
    PesoTotalKg: 290.0,
    Cosecha: {
      IdCosecha: NumberInt(8),
      FechaInicio: new Date("2026-05-25"),
      FechaFin: new Date("2026-07-05"),
      CantidadKg: 1150.0,
    },
    ProcesoBeneficiado: { TipoProceso: "Honey", DuracionDias: NumberInt(21) },
    Certificaciones: [
      { NombreSello: "Rainforest Alliance", EntidadEmisora: "Rainforest Org" },
    ],
  },
  {
    IdLote: NumberInt(9),
    IdProductor: NumberInt(9),
    CodigoTrazabilidad: "TRZ-26-SL8-009",
    IdParcela: NumberInt(9),
    Variedad: "SL28",
    PesoTotalKg: 210.0,
    Cosecha: {
      IdCosecha: NumberInt(9),
      FechaInicio: new Date("2026-04-20"),
      FechaFin: new Date("2026-06-10"),
      CantidadKg: 750.8,
    },
    ProcesoBeneficiado: { TipoProceso: "Lavado", DuracionDias: NumberInt(15) },
    Certificaciones: [{ NombreSello: "Orgánico USDA", EntidadEmisora: "USDA" }],
  },
  {
    IdLote: NumberInt(10),
    IdProductor: NumberInt(10),
    CodigoTrazabilidad: "TRZ-26-CTM-010",
    IdParcela: NumberInt(10),
    Variedad: "Catimor",
    PesoTotalKg: 380.0,
    Cosecha: {
      IdCosecha: NumberInt(10),
      FechaInicio: new Date("2026-07-15"),
      FechaFin: new Date("2026-08-30"),
      CantidadKg: 1400.0,
    },
    ProcesoBeneficiado: { TipoProceso: "Natural", DuracionDias: NumberInt(25) },
    Certificaciones: [
      { NombreSello: "Fairtrade", EntidadEmisora: "Fairtrade International" },
      { NombreSello: "Rainforest Alliance", EntidadEmisora: "Rainforest Org" },
    ],
  },
]);

// 3.3 FichaCalidad
db.FichaCalidad.insertMany([
  {
    IdControl: NumberInt(1),
    IdLote: NumberInt(1),
    CodigoTrazabilidad: "TRZ-26-GSH-001",
    PorcentajeHumedad: 11.2,
    CantidadDefectos: NumberInt(2),
    PuntajeSCA: 88.5,
    NotasSensoriales: "Jazmín, miel, lima, postgusto prolongado.",
    CatadorResponsable: "Q-Grader Mario Vega",
  },
  {
    IdControl: NumberInt(2),
    IdLote: NumberInt(2),
    CodigoTrazabilidad: "TRZ-26-BRB-002",
    PorcentajeHumedad: 10.5,
    CantidadDefectos: NumberInt(1),
    PuntajeSCA: 89.25,
    NotasSensoriales: "Frutos rojos, panela, acidez brillante.",
    CatadorResponsable: "Q-Grader Ana Torres",
  },
  {
    IdControl: NumberInt(3),
    IdLote: NumberInt(3),
    CodigoTrazabilidad: "TRZ-26-TYP-003",
    PorcentajeHumedad: 11.8,
    CantidadDefectos: NumberInt(3),
    PuntajeSCA: 84.0,
    NotasSensoriales: "Chocolate oscuro, nueces, cuerpo medio.",
    CatadorResponsable: "Q-Grader Luis Gómez",
  },
  {
    IdControl: NumberInt(4),
    IdLote: NumberInt(4),
    CodigoTrazabilidad: "TRZ-26-GSH-004",
    PorcentajeHumedad: 10.8,
    CantidadDefectos: NumberInt(0),
    PuntajeSCA: 90.0,
    NotasSensoriales: "Bergamota, té negro, floral.",
    CatadorResponsable: "Q-Grader Mario Vega",
  },
  {
    IdControl: NumberInt(5),
    IdLote: NumberInt(5),
    CodigoTrazabilidad: "TRZ-26-CTI-005",
    PorcentajeHumedad: 11.0,
    CantidadDefectos: NumberInt(2),
    PuntajeSCA: 86.75,
    NotasSensoriales: "Caramelo, manzana, postgusto dulce.",
    CatadorResponsable: "Q-Grader Ana Torres",
  },
  {
    IdControl: NumberInt(6),
    IdLote: NumberInt(6),
    CodigoTrazabilidad: "TRZ-26-MRG-006",
    PorcentajeHumedad: 12.0,
    CantidadDefectos: NumberInt(4),
    PuntajeSCA: 82.5,
    NotasSensoriales: "Madera, herbal, acidez baja.",
    CatadorResponsable: "Q-Grader Luis Gómez",
  },
  {
    IdControl: NumberInt(7),
    IdLote: NumberInt(7),
    CodigoTrazabilidad: "TRZ-26-PCM-007",
    PorcentajeHumedad: 11.5,
    CantidadDefectos: NumberInt(1),
    PuntajeSCA: 88.0,
    NotasSensoriales: "Mandarina, miel, sedoso.",
    CatadorResponsable: "Q-Grader Mario Vega",
  },
  {
    IdControl: NumberInt(8),
    IdLote: NumberInt(8),
    CodigoTrazabilidad: "TRZ-26-CST-008",
    PorcentajeHumedad: 10.2,
    CantidadDefectos: NumberInt(0),
    PuntajeSCA: 89.5,
    NotasSensoriales: "Cereza, chocolate con leche, balanceado.",
    CatadorResponsable: "Q-Grader Ana Torres",
  },
  {
    IdControl: NumberInt(9),
    IdLote: NumberInt(9),
    CodigoTrazabilidad: "TRZ-26-SL8-009",
    PorcentajeHumedad: 11.4,
    CantidadDefectos: NumberInt(1),
    PuntajeSCA: 87.5,
    NotasSensoriales: "Grosella negra, almendras, jugoso.",
    CatadorResponsable: "Q-Grader Mario Vega",
  },
  {
    IdControl: NumberInt(10),
    IdLote: NumberInt(10),
    CodigoTrazabilidad: "TRZ-26-CTM-010",
    PorcentajeHumedad: 10.9,
    CantidadDefectos: NumberInt(2),
    PuntajeSCA: 85.25,
    NotasSensoriales: "Cacao, especias, cuerpo denso.",
    CatadorResponsable: "Q-Grader Luis Gómez",
  },
]);

// 3.4 Compradores
db.Compradores.insertMany([
  {
    IdComprador: NumberInt(1),
    RazonSocial: "Cafetalera Andina SAC",
    RUC: "20123456781",
    TipoComprador: "Exportador",
    PaisDestino: "Estados Unidos",
    Telefono: "01-4455661",
    Correo: "compras@andina.pe",
  },
  {
    IdComprador: NumberInt(2),
    RazonSocial: "Peruvian Coffee Roasters",
    RUC: "20234567892",
    TipoComprador: "Tostador",
    PaisDestino: "Japón",
    Telefono: "01-4455662",
    Correo: "info@peruvianroasters.pe",
  },
  {
    IdComprador: NumberInt(3),
    RazonSocial: "Specialty Beans Ltd.",
    RUC: "20345678903",
    TipoComprador: "Importador",
    PaisDestino: "Reino Unido",
    Telefono: "01-4455663",
    Correo: "contact@specialtybeans.uk",
  },
  {
    IdComprador: NumberInt(4),
    RazonSocial: "EcoCafe Global",
    RUC: "20456789014",
    TipoComprador: "Exportador",
    PaisDestino: "Alemania",
    Telefono: "01-4455664",
    Correo: "hello@ecocafe.de",
  },
  {
    IdComprador: NumberInt(5),
    RazonSocial: "Inca Trail Coffee",
    RUC: "20567890125",
    TipoComprador: "Tostador",
    PaisDestino: "Corea del Sur",
    Telefono: "01-4455665",
    Correo: "sales@incatrail.com",
  },
  {
    IdComprador: NumberInt(6),
    RazonSocial: "Kaffeehaus Berlin",
    RUC: "20678901236",
    TipoComprador: "Cafetería de Especialidad",
    PaisDestino: "Alemania",
    Telefono: "01-4455666",
    Correo: "einkauf@kaffeehaus.de",
  },
  {
    IdComprador: NumberInt(7),
    RazonSocial: "Blue Mountain Peru",
    RUC: "20789012347",
    TipoComprador: "Exportador",
    PaisDestino: "Canadá",
    Telefono: "01-4455667",
    Correo: "logistics@bluemountain.pe",
  },
  {
    IdComprador: NumberInt(8),
    RazonSocial: "Nippon Coffee Import",
    RUC: "20890123458",
    TipoComprador: "Importador",
    PaisDestino: "Japón",
    Telefono: "01-4455668",
    Correo: "import@nipponcoffee.jp",
  },
  {
    IdComprador: NumberInt(9),
    RazonSocial: "Andes Premium Beans",
    RUC: "20901234569",
    TipoComprador: "Exportador",
    PaisDestino: "Estados Unidos",
    Telefono: "01-4455669",
    Correo: "export@andespremium.com",
  },
  {
    IdComprador: NumberInt(10),
    RazonSocial: "Swiss Roast Co.",
    RUC: "20012345670",
    TipoComprador: "Tostador",
    PaisDestino: "Suiza",
    Telefono: "01-4455670",
    Correo: "beans@swissroast.ch",
  },
]);

// 3.5 Ventas
db.Ventas.insertMany([
  {
    IdVenta: NumberInt(1),
    IdLote: NumberInt(1),
    CodigoTrazabilidad: "TRZ-26-GSH-001",
    IdComprador: NumberInt(1),
    FechaVenta: new Date("2026-08-10"),
    CantidadKgVendidos: 250.0,
    PrecioKiloUSD: 8.5,
    TotalMontoUSD: 2125.0,
  },
  {
    IdVenta: NumberInt(2),
    IdLote: NumberInt(2),
    CodigoTrazabilidad: "TRZ-26-BRB-002",
    IdComprador: NumberInt(2),
    FechaVenta: new Date("2026-09-15"),
    CantidadKgVendidos: 300.0,
    PrecioKiloUSD: 7.8,
    TotalMontoUSD: 2340.0,
  },
  {
    IdVenta: NumberInt(3),
    IdLote: NumberInt(3),
    CodigoTrazabilidad: "TRZ-26-TYP-003",
    IdComprador: NumberInt(3),
    FechaVenta: new Date("2026-08-25"),
    CantidadKgVendidos: 280.5,
    PrecioKiloUSD: 7.2,
    TotalMontoUSD: 2019.6,
  },
  {
    IdVenta: NumberInt(4),
    IdLote: NumberInt(4),
    CodigoTrazabilidad: "TRZ-26-GSH-004",
    IdComprador: NumberInt(4),
    FechaVenta: new Date("2026-10-05"),
    CantidadKgVendidos: 350.0,
    PrecioKiloUSD: 8.1,
    TotalMontoUSD: 2835.0,
  },
  {
    IdVenta: NumberInt(5),
    IdLote: NumberInt(5),
    CodigoTrazabilidad: "TRZ-26-CTI-005",
    IdComprador: NumberInt(5),
    FechaVenta: new Date("2026-07-20"),
    CantidadKgVendidos: 200.2,
    PrecioKiloUSD: 6.9,
    TotalMontoUSD: 1381.38,
  },
  {
    IdVenta: NumberInt(6),
    IdLote: NumberInt(6),
    CodigoTrazabilidad: "TRZ-26-MRG-006",
    IdComprador: NumberInt(6),
    FechaVenta: new Date("2026-09-01"),
    CantidadKgVendidos: 320.0,
    PrecioKiloUSD: 7.5,
    TotalMontoUSD: 2400.0,
  },
  {
    IdVenta: NumberInt(7),
    IdLote: NumberInt(7),
    CodigoTrazabilidad: "TRZ-26-PCM-007",
    IdComprador: NumberInt(7),
    FechaVenta: new Date("2026-10-10"),
    CantidadKgVendidos: 260.5,
    PrecioKiloUSD: 7.3,
    TotalMontoUSD: 1901.65,
  },
  {
    IdVenta: NumberInt(8),
    IdLote: NumberInt(8),
    CodigoTrazabilidad: "TRZ-26-CST-008",
    IdComprador: NumberInt(8),
    FechaVenta: new Date("2026-08-20"),
    CantidadKgVendidos: 290.0,
    PrecioKiloUSD: 8.4,
    TotalMontoUSD: 2436.0,
  },
  {
    IdVenta: NumberInt(9),
    IdLote: NumberInt(9),
    CodigoTrazabilidad: "TRZ-26-SL8-009",
    IdComprador: NumberInt(9),
    FechaVenta: new Date("2026-07-30"),
    CantidadKgVendidos: 180.8,
    PrecioKiloUSD: 6.5,
    TotalMontoUSD: 1175.2,
  },
  {
    IdVenta: NumberInt(10),
    IdLote: NumberInt(10),
    CodigoTrazabilidad: "TRZ-26-CTM-010",
    IdComprador: NumberInt(10),
    FechaVenta: new Date("2026-10-15"),
    CantidadKgVendidos: 380.0,
    PrecioKiloUSD: 8.2,
    TotalMontoUSD: 3116.0,
  },
]);

//Consultas por integrante

// Integrante 1: U20251k871 Aaron Andre Calixto Cherrepano

db.ExpedienteLote.aggregate([
  {
    $lookup: {
      from: "Productores",
      localField: "IdProductor",
      foreignField: "IdProductor",
      as: "InfoProductor",
    },
  },
  { $unwind: "$InfoProductor" },
  {
    $lookup: {
      from: "FichaCalidad",
      localField: "CodigoTrazabilidad",
      foreignField: "CodigoTrazabilidad",
      as: "Calidad",
    },
  },
  { $unwind: "$Calidad" },
  {
    $addFields: {
      ParcelaOrigen: { $arrayElemAt: ["$InfoProductor.Parcelas", 0] },
    },
  },
  {
    $project: {
      _id: 0,
      CodigoLote: "$CodigoTrazabilidad",
      Productor: {
        $concat: ["$InfoProductor.Nombres", " ", "$InfoProductor.Apellidos"],
      },
      Finca: "$ParcelaOrigen.Nombre",
      Ubicacion: "$ParcelaOrigen.UbicacionGeo",
      AltitudMSNM: "$ParcelaOrigen.Altitud",
      Variedad: 1,
      MetodoProceso: "$ProcesoBeneficiado.TipoProceso",
      PuntajeSCA: "$Calidad.PuntajeSCA",
      CatadorCertificado: "$Calidad.CatadorResponsable",
    },
  },
  { $sort: { PuntajeSCA: -1 } },
]);

db.Productores.aggregate([
  { $unwind: "$Parcelas" },
  {
    $match: { "Parcelas.Altitud": { $gte: 1750.0 } },
  },
  {
    $group: {
      _id: "$IdProductor",
      Productor: { $first: { $concat: ["$Nombres", " ", "$Apellidos"] } },
      DNI: { $first: "$DocumentoIdentidad" },
      Finca: { $first: "$Parcelas.Nombre" },
      Region: { $first: "$Parcelas.UbicacionGeo" },
      AltitudMaxima: { $max: "$Parcelas.Altitud" },
      TotalHectareas: { $sum: "$Parcelas.Hectareas" },
    },
  },
  {
    $project: {
      _id: 0,
      Productor: 1,
      DNI: 1,
      Finca: 1,
      Region: 1,
      AltitudMaxima: 1,
      TotalHectareas: { $round: ["$TotalHectareas", 2] },
    },
  },
  { $sort: { AltitudMaxima: -1 } },
]);

// Integrante 2: U20241J259 Yenner Jesús López Calle

db.FichaCalidad.aggregate([
  {
    $group: {
      _id: "$CatadorResponsable",
      TotalCatas: { $sum: 1 },
      PromedioSCA: { $avg: "$PuntajeSCA" },
      PuntajeMinimo: { $min: "$PuntajeSCA" },
      PuntajeMaximo: { $max: "$PuntajeSCA" },
    },
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
          else: "Perfil Estándar",
        },
      },
    },
  },
  { $sort: { PromedioSCA: -1 } },
]);

db.FichaCalidad.aggregate([
  {
    $match: { CantidadDefectos: 0 },
  },
  {
    $lookup: {
      from: "ExpedienteLote",
      localField: "IdLote",
      foreignField: "IdLote",
      as: "LoteInfo",
    },
  },
  { $unwind: "$LoteInfo" },
  {
    $project: {
      _id: 0,
      CodigoTrazabilidad: 1,
      Variedad: "$LoteInfo.Variedad",
      KgCosechados: "$LoteInfo.Cosecha.CantidadKg",
      PesoNetoLoteKg: "$LoteInfo.PesoTotalKg",
      Defectos: "$CantidadDefectos",
      PuntajeSCA: 1,
      NotasSensoriales: 1,
    },
  },
  { $sort: { PuntajeSCA: -1 } },
]);

// Integrante 3: U202523743 Fredy Adriano Tello Quispe

db.ExpedienteLote.aggregate([
  { $unwind: "$Certificaciones" },
  {
    $lookup: {
      from: "Ventas",
      localField: "IdLote",
      foreignField: "IdLote",
      as: "VentaInfo",
    },
  },
  { $unwind: "$VentaInfo" },
  {
    $group: {
      _id: "$Certificaciones.NombreSello",
      Entidad: { $first: "$Certificaciones.EntidadEmisora" },
      CantidadLotes: { $sum: 1 },
      TotalVolumenKg: { $sum: "$PesoTotalKg" },
      IngresosGeneradosUSD: { $sum: "$VentaInfo.TotalMontoUSD" },
    },
  },
  {
    $project: {
      _id: 0,
      Sello: "$_id",
      EntidadCertificadora: "$Entidad",
      CantidadLotes: 1,
      TotalVolumenKg: { $round: ["$TotalVolumenKg", 2] },
      IngresosGeneradosUSD: { $round: ["$IngresosGeneradosUSD", 2] },
    },
  },
  { $sort: { IngresosGeneradosUSD: -1 } },
]);

db.ExpedienteLote.aggregate([
  {
    $addFields: {
      TotalCertificaciones: { $size: { $ifNull: ["$Certificaciones", []] } },
    },
  },
  {
    $match: { TotalCertificaciones: { $gte: 2 } },
  },
  {
    $project: {
      _id: 0,
      CodigoTrazabilidad: 1,
      Variedad: 1,
      PesoTotalKg: 1,
      TotalCertificaciones: 1,
      Sellos: "$Certificaciones.NombreSello",
    },
  },
  { $sort: { TotalCertificaciones: -1 } },
]);

// Integrante 4: U20251G950 Oliver Vidal De La Cruz Huamani

db.Ventas.aggregate([
  {
    $lookup: {
      from: "Compradores",
      localField: "IdComprador",
      foreignField: "IdComprador",
      as: "Cliente",
    },
  },
  { $unwind: "$Cliente" },
  {
    $group: {
      _id: "$Cliente.RazonSocial",
      PaisDestino: { $first: "$Cliente.PaisDestino" },
      TipoComprador: { $first: "$Cliente.TipoComprador" },
      Operaciones: { $sum: 1 },
      TotalKgComprados: { $sum: "$CantidadKgVendidos" },
      PrecioPromedioUSD: { $avg: "$PrecioKiloUSD" },
      FacturacionTotalUSD: { $sum: "$TotalMontoUSD" },
    },
  },
  {
    $project: {
      _id: 0,
      Comprador: "$_id",
      PaisDestino: 1,
      TipoComprador: 1,
      Operaciones: 1,
      TotalKgComprados: { $round: ["$TotalKgComprados", 2] },
      PrecioPromedioUSD: { $round: ["$PrecioPromedioUSD", 2] },
      FacturacionTotalUSD: { $round: ["$FacturacionTotalUSD", 2] },
    },
  },
  { $sort: { FacturacionTotalUSD: -1 } },
]);

db.ExpedienteLote.aggregate([
  {
    $lookup: {
      from: "FichaCalidad",
      localField: "CodigoTrazabilidad",
      foreignField: "CodigoTrazabilidad",
      as: "Calidad",
    },
  },
  { $unwind: "$Calidad" },
  {
    $group: {
      _id: "$ProcesoBeneficiado.TipoProceso",
      TotalLotes: { $sum: 1 },
      PromedioDias: { $avg: "$ProcesoBeneficiado.DuracionDias" },
      TotalCerezaCosechadaKg: { $sum: "$Cosecha.CantidadKg" },
      TotalOroVerdeKg: { $sum: "$PesoTotalKg" },
      PromedioSCA: { $avg: "$Calidad.PuntajeSCA" },
    },
  },
  {
    $project: {
      _id: 0,
      MetodoBeneficiado: "$_id",
      TotalLotes: 1,
      PromedioDias: { $round: ["$PromedioDias", 1] },
      TotalCerezaCosechadaKg: { $round: ["$TotalCerezaCosechadaKg", 2] },
      TotalOroVerdeKg: { $round: ["$TotalOroVerdeKg", 2] },
      PromedioSCA: { $round: ["$PromedioSCA", 2] },
    },
  },
  { $sort: { PromedioSCA: -1 } },
]);

// Integrante 5: U20251J978 Alessandro Manuel Cotrina Antayhua
db.ExpedienteLote.aggregate([
  {
    $lookup: {
      from: "FichaCalidad",
      localField: "CodigoTrazabilidad",
      foreignField: "CodigoTrazabilidad",
      as: "Ficha",
    },
  },
  { $unwind: "$Ficha" },
  {
    $lookup: {
      from: "Ventas",
      localField: "IdLote",
      foreignField: "IdLote",
      as: "Venta",
    },
  },
  { $unwind: "$Venta" },
  {
    $facet: {
      AltaEspecialidad: [
        { $match: { "Ficha.PuntajeSCA": { $gte: 88.0 } } },
        {
          $project: {
            _id: 0,
            Codigo: "$CodigoTrazabilidad",
            Variedad: 1,
            PuntajeSCA: "$Ficha.PuntajeSCA",
            PrecioKiloUSD: "$Venta.PrecioKiloUSD",
            MontoTotalUSD: "$Venta.TotalMontoUSD",
          },
        },
        { $sort: { PuntajeSCA: -1 } },
      ],
      EspecialidadEstandar: [
        { $match: { "Ficha.PuntajeSCA": { $lt: 88.0 } } },
        {
          $project: {
            _id: 0,
            Codigo: "$CodigoTrazabilidad",
            Variedad: 1,
            PuntajeSCA: "$Ficha.PuntajeSCA",
            PrecioKiloUSD: "$Venta.PrecioKiloUSD",
            MontoTotalUSD: "$Venta.TotalMontoUSD",
          },
        },
        { $sort: { PuntajeSCA: -1 } },
      ],
    },
  },
]);

db.Productores.aggregate([
  {
    $lookup: {
      from: "ExpedienteLote",
      localField: "IdProductor",
      foreignField: "IdProductor",
      as: "Lotes",
    },
  },
  { $unwind: "$Lotes" },
  {
    $lookup: {
      from: "Ventas",
      localField: "Lotes.IdLote",
      foreignField: "IdLote",
      as: "VentasLote",
    },
  },
  { $unwind: "$VentasLote" },
  {
    $group: {
      _id: "$IdProductor",
      Caficultor: { $first: { $concat: ["$Nombres", " ", "$Apellidos"] } },
      LotesVendidos: { $sum: 1 },
      TotalKilosVendidos: { $sum: "$VentasLote.CantidadKgVendidos" },
      IngresosTotalesUSD: { $sum: "$VentasLote.TotalMontoUSD" },
    },
  },
  {
    $project: {
      _id: 0,
      Caficultor: 1,
      LotesVendidos: 1,
      TotalKilosVendidos: { $round: ["$TotalKilosVendidos", 2] },
      IngresosTotalesUSD: { $round: ["$IngresosTotalesUSD", 2] },
    },
  },
  { $sort: { IngresosTotalesUSD: -1 } },
]);
