CREATE DATABASE SpecialtyTraceDB;
GO


USE SpecialtyTraceDB;
GO

-- 1. Productor
CREATE TABLE Productor (
    IdProductor INT NOT NULL IDENTITY(1,1),
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    DocumentoIdentidad VARCHAR(20) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    Correo VARCHAR(100) NOT NULL,
    CONSTRAINT PK_Productor PRIMARY KEY (IdProductor),
    CONSTRAINT UQ_Productor_DocumentoIdentidad UNIQUE (DocumentoIdentidad)
);
GO

-- 2. Parcela
CREATE TABLE Parcela (
    IdParcela INT NOT NULL IDENTITY(1,1),
    IdProductor INT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    UbicacionGeo VARCHAR(200) NOT NULL,
    Altitud DECIMAL(6,2) NOT NULL,
    Hectareas DECIMAL(5,2) NOT NULL,
    CONSTRAINT PK_Parcela PRIMARY KEY (IdParcela),
    CONSTRAINT FK_Productor_TO_Parcela FOREIGN KEY (IdProductor) REFERENCES Productor (IdProductor)
);
GO

-- 3. Variedad
CREATE TABLE Variedad (
    IdVariedad INT NOT NULL IDENTITY(1,1),
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(300) NOT NULL,
    CONSTRAINT PK_Variedad PRIMARY KEY (IdVariedad),
    CONSTRAINT UQ_Variedad_Nombre UNIQUE (Nombre)
);
GO

-- 4. Cosecha
CREATE TABLE Cosecha (
    IdCosecha INT NOT NULL IDENTITY(1,1),
    IdParcela INT NOT NULL,
    FechaInicio DATE NOT NULL,
    FechaFin DATE NOT NULL,
    CantidadKg DECIMAL(8,2),
    CONSTRAINT PK_Cosecha PRIMARY KEY (IdCosecha),
    CONSTRAINT FK_Parcela_TO_Cosecha FOREIGN KEY (IdParcela) REFERENCES Parcela (IdParcela)
);
GO

-- 5. Lote
CREATE TABLE Lote (
    IdLote INT NOT NULL IDENTITY(1,1),
    IdCosecha INT NOT NULL,
    IdVariedad INT NOT NULL,
    CodigoTrazabilidad VARCHAR(50) NOT NULL,
    PesoTotalKg DECIMAL(8,2) NOT NULL,
    CONSTRAINT PK_Lote PRIMARY KEY (IdLote),
    CONSTRAINT UQ_Lote_CodigoTrazabilidad UNIQUE (CodigoTrazabilidad),
    CONSTRAINT FK_Cosecha_TO_Lote FOREIGN KEY (IdCosecha) REFERENCES Cosecha (IdCosecha),
    CONSTRAINT FK_Variedad_TO_Lote FOREIGN KEY (IdVariedad) REFERENCES Variedad (IdVariedad)
);
GO

-- 6. ProcesoBeneficiado (Relación 1:1 con Lote)
CREATE TABLE ProcesoBeneficiado (
    IdProceso INT NOT NULL IDENTITY(1,1),
    IdLote INT NOT NULL,
    TipoProceso VARCHAR(50) NOT NULL,
    FechaProceso DATE NOT NULL,
    DuracionDias INT NOT NULL,
    CONSTRAINT PK_ProcesoBeneficiado PRIMARY KEY (IdProceso),
    CONSTRAINT UQ_ProcesoBeneficiado_IdLote UNIQUE (IdLote),
    CONSTRAINT CK_TipoProceso CHECK (TipoProceso IN ('Lavado', 'Natural', 'Honey')),
    CONSTRAINT FK_Lote_TO_ProcesoBeneficiado FOREIGN KEY (IdLote) REFERENCES Lote (IdLote)
);
GO

-- 7. ControlCalidad
CREATE TABLE ControlCalidad (
    IdControl INT NOT NULL IDENTITY(1,1),
    IdLote INT NOT NULL,
    PorcentajeHumedad DECIMAL(5,2) NOT NULL,
    CantidadDefectos INT NOT NULL,
    FechaControl DATE NOT NULL,
    CONSTRAINT PK_ControlCalidad PRIMARY KEY (IdControl),
    CONSTRAINT FK_Lote_TO_ControlCalidad FOREIGN KEY (IdLote) REFERENCES Lote (IdLote)
);
GO

-- 8. Cata
CREATE TABLE Cata (
    IdCata INT NOT NULL IDENTITY(1,1),
    IdLote INT NOT NULL,
    PuntajeSCA DECIMAL(5,2) NOT NULL,
    NotasSensoriales VARCHAR(300) NOT NULL,
    CatadorResponsable VARCHAR(100) NOT NULL,
    CONSTRAINT PK_Cata PRIMARY KEY (IdCata),
    CONSTRAINT FK_Lote_TO_Cata FOREIGN KEY (IdLote) REFERENCES Lote (IdLote)
);
GO

-- 9. Certificacion
CREATE TABLE Certificacion (
    IdCertificacion INT NOT NULL IDENTITY(1,1),
    NombreSello VARCHAR(100) NOT NULL,
    EntidadEmisora VARCHAR(100) NOT NULL,
    CONSTRAINT PK_Certificacion PRIMARY KEY (IdCertificacion),
    CONSTRAINT UQ_Certificacion_NombreSello UNIQUE (NombreSello)
);
GO

-- 10. LoteCertificacion (Tabla intermedia corregida para N:M real)
CREATE TABLE LoteCertificacion (
    IdLoteCertificacion INT NOT NULL IDENTITY(1,1),
    IdCertificacion INT NOT NULL,
    IdLote INT NOT NULL,
    CONSTRAINT PK_LoteCertificacion PRIMARY KEY (IdLoteCertificacion),
    CONSTRAINT UQ_Lote_Certificacion UNIQUE (IdLote, IdCertificacion), -- Evita duplicar el mismo sello al mismo lote
    CONSTRAINT FK_Certificacion_TO_LoteCertificacion FOREIGN KEY (IdCertificacion) REFERENCES Certificacion (IdCertificacion),
    CONSTRAINT FK_Lote_TO_LoteCertificacion FOREIGN KEY (IdLote) REFERENCES Lote (IdLote)
);
GO

-- 11. Comprador
CREATE TABLE Comprador (
    IdComprador INT NOT NULL IDENTITY(1,1),
    RazonSocial VARCHAR(150) NOT NULL,
    RUC VARCHAR(20) NOT NULL,
    TipoComprador VARCHAR(50) NOT NULL,
    PaisDestino VARCHAR(50) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    Correo VARCHAR(100),
    CONSTRAINT PK_Comprador PRIMARY KEY (IdComprador),
    CONSTRAINT UQ_Comprador_RUC UNIQUE (RUC)
);
GO

-- 12. Venta
CREATE TABLE Venta (
    IdVenta INT NOT NULL IDENTITY(1,1),
    IdLote INT NOT NULL,
    IdComprador INT NOT NULL,
    FechaVenta DATE NOT NULL,
    CantidadKgVendidos DECIMAL(8,2) NOT NULL,
    PrecioKiloUSD DECIMAL(6,2) NOT NULL,
    TotalMontoUSD DECIMAL(10,2) NOT NULL,
    CONSTRAINT PK_Venta PRIMARY KEY (IdVenta),
    CONSTRAINT FK_Lote_TO_Venta FOREIGN KEY (IdLote) REFERENCES Lote (IdLote),
    CONSTRAINT FK_Comprador_TO_Venta FOREIGN KEY (IdComprador) REFERENCES Comprador (IdComprador)
);
GO


-- carga de datos
USE SpecialtyTraceDB;
GO

-- 1. Inserción de 20 Productores
INSERT INTO Productor (Nombres, Apellidos, DocumentoIdentidad, Telefono, Correo) VALUES 
('Carlos', 'Mendoza', '72345671', '987654321', 'cmendoza@fincas.pe'),
('Lucia', 'Rojas', '71234562', '912345678', 'lrojas@cafeteros.pe'),
('Miguel', 'Quispe', '73456783', '923456789', 'mquispe@agro.pe'),
('Ana', 'Condori', '74567894', '934567890', 'acondori@fincas.pe'),
('Jorge', 'Salas', '75678905', '945678901', 'jsalas@cafe.pe'),
('Maria', 'Vargas', '76789016', '956789012', 'mvargas@agro.pe'),
('Pedro', 'Flores', '77890127', '967890123', 'pflores@cafeteros.pe'),
('Carmen', 'Perez', '78901238', '978901234', 'cperez@fincas.pe'),
('Luis', 'Gomez', '79012349', '989012345', 'lgomez@cafe.pe'),
('Rosa', 'Diaz', '70123450', '990123456', 'rdiaz@agro.pe'),
('Juan', 'Torres', '71234561', '901234567', 'jtorres@cafeteros.pe'),
('Elena', 'Ruiz', '72345672', '912345670', 'eruiz@fincas.pe'),
('Diego', 'Vega', '73456784', '923456781', 'dvega@cafe.pe'),
('Sofia', 'Castro', '74567895', '934567892', 'scastro@agro.pe'),
('Raul', 'Ortiz', '75678906', '945678903', 'rortiz@cafeteros.pe'),
('Laura', 'Rios', '76789017', '956789014', 'lrios@fincas.pe'),
('Andres', 'Silva', '77890128', '967890125', 'asilva@cafe.pe'),
('Paula', 'Luna', '78901239', '978901236', 'pluna@agro.pe'),
('Jose', 'Mora', '79012340', '989012347', 'jmora@cafeteros.pe'),
('Diana', 'Paz', '70123451', '990123458', 'dpaz@fincas.pe');
GO

-- 2. Inserción de 20 Variedades Botánicas
INSERT INTO Variedad (Nombre, Descripcion) VALUES 
('Geisha', 'Perfil floral complejo, acidez brillante y notas a jazmín.'),
('Bourbon Rosado', 'Cuerpo medio, dulzor a caramelo y notas a frutos rojos.'),
('Typica', 'Acidez dulce, cuerpo limpio y final prolongado.'),
('Caturra', 'Acidez cítrica brillante y cuerpo ligero a medio.'),
('Pache', 'Mutación de Typica, perfil suave y achocolatado.'),
('Catuai', 'Acidez media, cuerpo pleno y dulzor marcado.'),
('Maragogype', 'Grano gigante, acidez suave y notas frutales.'),
('Pacamara', 'Híbrido complejo, notas a frutas tropicales y especias.'),
('Castillo', 'Alta resistencia, cuerpo cremoso y notas a cacao.'),
('Catimor', 'Acidez baja, cuerpo pesado y notas herbales.'),
('Bourbon Rojo', 'Dulzura intensa, notas a vainilla y caramelo.'),
('Bourbon Amarillo', 'Mayor acidez que el rojo, notas cítricas dulces.'),
('Mundo Novo', 'Cuerpo robusto, dulzor moderado y final amargo.'),
('Villa Sarchi', 'Acidez elegante, notas a frutas de hueso.'),
('SL28', 'Acidez brillante a grosella negra y cuerpo jugoso.'),
('SL34', 'Perfil afrutado intenso, acidez compleja.'),
('Ruiru 11', 'Cuerpo pleno, notas a chocolate oscuro.'),
('Batian', 'Acidez cítrica, dulzor a caramelo claro.'),
('Timor', 'Perfil maderoso, baja acidez, gran cuerpo.'),
('Sarchimor', 'Notas a nueces, cuerpo denso y baja acidez.');
GO

-- 3. Inserción de 20 Parcelas Georreferenciadas
INSERT INTO Parcela (IdProductor, Nombre, UbicacionGeo, Altitud, Hectareas) VALUES 
(1, 'Finca El Mirador', 'Cusco, La Convención', 1850.50, 5.00),
(2, 'Finca Las Nubes', 'Cajamarca, Jaén', 1700.00, 3.50),
(3, 'Parcela La Esperanza', 'Junín, Chanchamayo', 1600.20, 4.20),
(4, 'Finca El Sol', 'Amazonas, Bagua', 1750.00, 6.00),
(5, 'Parcela Bella Vista', 'San Martín, Moyobamba', 1500.80, 2.80),
(6, 'Finca Los Pinos', 'Pasco, Oxapampa', 1800.00, 5.50),
(7, 'Parcela El Cedro', 'Cusco, Yanatile', 1900.50, 3.00),
(8, 'Finca La Lluvia', 'Cajamarca, San Ignacio', 1650.00, 4.80),
(9, 'Parcela El Valle', 'Junín, Satipo', 1550.00, 2.50),
(10, 'Finca Alta Gracia', 'Amazonas, Utcubamba', 1820.50, 7.00),
(11, 'Parcela San Jose', 'San Martín, Tarapoto', 1400.00, 3.20),
(12, 'Finca La Cascada', 'Pasco, Villa Rica', 1780.00, 5.20),
(13, 'Parcela El Naranjo', 'Cusco, Quillabamba', 1880.00, 4.50),
(14, 'Finca Los Angeles', 'Cajamarca, Cutervo', 1680.50, 3.80),
(15, 'Parcela La Floresta', 'Junín, Pichanaki', 1580.00, 2.90),
(16, 'Finca El Paraiso', 'Amazonas, Chachapoyas', 1850.00, 6.50),
(17, 'Parcela Buena Vista', 'San Martín, Rioja', 1450.50, 3.10),
(18, 'Finca El Puente', 'Pasco, Pozuzo', 1720.00, 4.00),
(19, 'Parcela Santa Cruz', 'Cusco, Santa Teresa', 1920.00, 5.80),
(20, 'Finca Las Rocas', 'Cajamarca, Chota', 1620.50, 3.40);
GO

-- 4. Inserción de 20 Cosechas
INSERT INTO Cosecha (IdParcela, FechaInicio, FechaFin, CantidadKg) VALUES 
(1, '2026-05-01', '2026-06-15', 1200.00),
(2, '2026-06-20', '2026-08-05', 950.00),
(3, '2026-05-10', '2026-06-25', 1100.50),
(4, '2026-07-01', '2026-08-20', 1350.00),
(5, '2026-04-15', '2026-05-30', 800.20),
(6, '2026-06-05', '2026-07-15', 1250.00),
(7, '2026-07-10', '2026-08-25', 900.50),
(8, '2026-05-25', '2026-07-05', 1150.00),
(9, '2026-04-20', '2026-06-10', 750.80),
(10, '2026-07-15', '2026-08-30', 1400.00),
(11, '2026-04-01', '2026-05-15', 850.00),
(12, '2026-06-10', '2026-07-25', 1300.50),
(13, '2026-07-05', '2026-08-15', 1050.00),
(14, '2026-05-15', '2026-06-30', 980.20),
(15, '2026-04-25', '2026-06-05', 820.00),
(16, '2026-07-20', '2026-09-05', 1450.50),
(17, '2026-04-10', '2026-05-20', 880.00),
(18, '2026-06-01', '2026-07-10', 1120.50),
(19, '2026-07-25', '2026-09-10', 1280.00),
(20, '2026-05-05', '2026-06-20', 920.80);
GO

-- 5. Inserción de 20 Lotes de Trazabilidad
INSERT INTO Lote (IdCosecha, IdVariedad, CodigoTrazabilidad, PesoTotalKg) VALUES 
(1, 1, 'TRZ-26-GSH-001', 250.00),
(2, 2, 'TRZ-26-BRB-002', 300.00),
(3, 3, 'TRZ-26-TYP-003', 280.50),
(4, 4, 'TRZ-26-CAT-004', 350.00),
(5, 5, 'TRZ-26-PCH-005', 200.20),
(6, 6, 'TRZ-26-CTI-006', 320.00),
(7, 7, 'TRZ-26-MRG-007', 260.50),
(8, 8, 'TRZ-26-PCM-008', 290.00),
(9, 9, 'TRZ-26-CST-009', 180.80),
(10, 10, 'TRZ-26-CTM-010', 380.00),
(11, 11, 'TRZ-26-BRR-011', 220.00),
(12, 12, 'TRZ-26-BAM-012', 310.50),
(13, 13, 'TRZ-26-MNV-013', 270.00),
(14, 14, 'TRZ-26-VLS-014', 240.20),
(15, 15, 'TRZ-26-SL8-015', 210.00),
(16, 16, 'TRZ-26-SL4-016', 360.50),
(17, 17, 'TRZ-26-RIR-017', 230.00),
(18, 18, 'TRZ-26-BTN-018', 285.50),
(19, 19, 'TRZ-26-TMR-019', 340.00),
(20, 20, 'TRZ-26-SRM-020', 245.80);
GO

-- 6. Inserción de 20 Procesos de Beneficiado (1:1)
INSERT INTO ProcesoBeneficiado (IdLote, TipoProceso, FechaProceso, DuracionDias) VALUES 
(1, 'Lavado', '2026-06-16', 15),
(2, 'Honey', '2026-08-06', 20),
(3, 'Natural', '2026-06-26', 30),
(4, 'Lavado', '2026-08-21', 14),
(5, 'Honey', '2026-05-31', 22),
(6, 'Natural', '2026-07-16', 28),
(7, 'Lavado', '2026-08-26', 16),
(8, 'Honey', '2026-07-06', 21),
(9, 'Natural', '2026-06-11', 35),
(10, 'Lavado', '2026-08-31', 13),
(11, 'Honey', '2026-05-16', 19),
(12, 'Natural', '2026-07-26', 32),
(13, 'Lavado', '2026-08-16', 15),
(14, 'Honey', '2026-07-01', 24),
(15, 'Natural', '2026-06-06', 29),
(16, 'Lavado', '2026-09-06', 17),
(17, 'Honey', '2026-05-21', 18),
(18, 'Natural', '2026-07-11', 31),
(19, 'Lavado', '2026-09-11', 14),
(20, 'Honey', '2026-06-21', 23);
GO

-- 7. Inserción de 20 Controles de Calidad Física
INSERT INTO ControlCalidad (IdLote, PorcentajeHumedad, CantidadDefectos, FechaControl) VALUES 
(1, 11.20, 2, '2026-07-05'),
(2, 10.80, 0, '2026-08-30'),
(3, 12.00, 1, '2026-07-20'),
(4, 11.50, 3, '2026-09-10'),
(5, 10.50, 0, '2026-06-25'),
(6, 11.80, 2, '2026-08-15'),
(7, 12.20, 4, '2026-09-15'),
(8, 11.00, 1, '2026-08-01'),
(9, 10.20, 0, '2026-07-10'),
(10, 11.70, 2, '2026-09-20'),
(11, 10.90, 1, '2026-06-10'),
(12, 12.10, 3, '2026-08-25'),
(13, 11.30, 2, '2026-09-05'),
(14, 10.70, 0, '2026-07-25'),
(15, 11.90, 1, '2026-07-05'),
(16, 12.30, 4, '2026-09-30'),
(17, 10.60, 0, '2026-06-15'),
(18, 11.40, 2, '2026-08-10'),
(19, 12.00, 3, '2026-10-05'),
(20, 11.10, 1, '2026-07-15');
GO

-- 8. Inserción de 20 Evaluaciones Sensoriales (Cata SCA)
INSERT INTO Cata (IdLote, PuntajeSCA, NotasSensoriales, CatadorResponsable) VALUES 
(1, 88.50, 'Jazmín, miel, lima, postgusto prolongado.', 'Q-Grader Mario Vega'),
(2, 86.75, 'Caramelo, cereza, chocolate con leche.', 'Q-Grader Ana Silva'),
(3, 85.00, 'Nueces, pan tostado, acidez cítrica suave.', 'Q-Grader Luis Torres'),
(4, 87.25, 'Frutos rojos, vainilla, cuerpo sedoso.', 'Q-Grader Carlos Ruiz'),
(5, 84.50, 'Chocolate oscuro, caramelo, final especiado.', 'Q-Grader Elena Paz'),
(6, 86.00, 'Manzana verde, almendras, dulzor a miel.', 'Q-Grader Mario Vega'),
(7, 85.75, 'Durazno, flor de naranja, cuerpo jugoso.', 'Q-Grader Ana Silva'),
(8, 88.00, 'Mora, cacao, acidez brillante y compleja.', 'Q-Grader Luis Torres'),
(9, 83.50, 'Herbal, nuez moscada, final seco.', 'Q-Grader Carlos Ruiz'),
(10, 87.50, 'Cereza negra, chocolate amargo, melaza.', 'Q-Grader Elena Paz'),
(11, 85.25, 'Lima, caramelo claro, cuerpo ligero.', 'Q-Grader Mario Vega'),
(12, 86.50, 'Ciruela, panela, acidez tartárica jugosa.', 'Q-Grader Ana Silva'),
(13, 84.75, 'Chocolate con leche, avellana, dulzor medio.', 'Q-Grader Luis Torres'),
(14, 87.00, 'Uva pasa, vainilla, cuerpo cremoso.', 'Q-Grader Carlos Ruiz'),
(15, 85.50, 'Grosella, miel de abeja, final limpio.', 'Q-Grader Elena Paz'),
(16, 88.25, 'Frambuesa, jazmín, acidez málica vibrante.', 'Q-Grader Mario Vega'),
(17, 84.00, 'Caramelo oscuro, nueces tostadas, herbal.', 'Q-Grader Ana Silva'),
(18, 86.25, 'Mandarina, chocolate blanco, dulzor floral.', 'Q-Grader Luis Torres'),
(19, 87.75, 'Albaricoque, miel, cuerpo denso y prolongado.', 'Q-Grader Carlos Ruiz'),
(20, 85.00, 'Cacao nibs, manzana roja, acidez equilibrada.', 'Q-Grader Elena Paz');
GO

-- 9. Inserción de Catálogo de Certificaciones (10 sellos globales)
INSERT INTO Certificacion (NombreSello, EntidadEmisora) VALUES 
('Orgánico USDA', 'Departamento de Agricultura de EE. UU.'),
('Fairtrade', 'Fairtrade International'),
('Rainforest Alliance', 'Rainforest Alliance Org.'),
('Bird Friendly', 'Smithsonian Migratory Bird Center'),
('UTZ Certified', 'Fundación UTZ'),
('C.A.F.E. Practices', 'Starbucks / SCS Global Services'),
('JAS Organic', 'Ministry of Agriculture, Forestry and Fisheries Japan'),
('EU Organic', 'European Commission Agriculture'),
('Demeter Biodynamic', 'Demeter International'),
('Global G.A.P.', 'FoodPLUS GmbH');
GO

-- 10. Inserción en Tabla Intermedia (Relación N:M)
INSERT INTO LoteCertificacion (IdCertificacion, IdLote) VALUES 
(1, 1), (2, 1), (3, 1),
(2, 2), (3, 2),
(1, 3), (4, 3),
(3, 4), (5, 4),
(6, 5), (1, 5),
(1, 6), (3, 6), (8, 6),
(7, 7), (2, 7),
(2, 8), (8, 8), (4, 8),
(9, 9), (1, 9),
(3, 10), (10, 10), (5, 10),
(1, 11), (2, 11),
(3, 12), (6, 12),
(4, 13), (7, 13),
(5, 14), (8, 14),
(6, 15), (9, 15),
(7, 16), (10, 16),
(8, 17), (1, 17),
(9, 18), (2, 18),
(10, 19), (3, 19),
(1, 20), (4, 20);
GO

-- 11. Inserción de 20 Compradores Internacionales y Locales
INSERT INTO Comprador (RazonSocial, RUC, TipoComprador, PaisDestino, Telefono, Correo) VALUES 
('Cafetalera Andina SAC', '20123456781', 'Exportador', 'Estados Unidos', '01-4455661', 'compras@andina.pe'),
('Peruvian Coffee Roasters', '20234567892', 'Tostador', 'Japón', '01-4455662', 'info@peruvianroasters.pe'),
('Specialty Beans Ltd.', '20345678903', 'Importador', 'Reino Unido', '01-4455663', 'contact@specialtybeans.uk'),
('EcoCafe Global', '20456789014', 'Exportador', 'Alemania', '01-4455664', 'hello@ecocafe.de'),
('Inca Trail Coffee', '20567890125', 'Tostador', 'Corea del Sur', '01-4455665', 'sales@incatrail.com'),
('Kaffeehaus Berlin', '20678901236', 'Cafetería de Especialidad', 'Alemania', '01-4455666', 'einkauf@kaffeehaus.de'),
('Blue Mountain Peru', '20789012347', 'Exportador', 'Canadá', '01-4455667', 'logistics@bluemountain.pe'),
('Nippon Coffee Import', '20890123458', 'Importador', 'Japón', '01-4455668', 'import@nipponcoffee.jp'),
('Andes Premium Beans', '20901234569', 'Exportador', 'Estados Unidos', '01-4455669', 'export@andespremium.com'),
('Swiss Roast Co.', '20012345670', 'Tostador', 'Suiza', '01-4455670', 'beans@swissroast.ch'),
('Gourmet Cup SAC', '20112233441', 'Tostador Local', 'Perú', '01-5566771', 'pedidos@gourmetcup.pe'),
('Nordic Beans AB', '20223344552', 'Importador', 'Suecia', '01-5566772', 'purchasing@nordicbeans.se'),
('Melbourne Coffee Roasters', '20334455663', 'Tostador', 'Australia', '01-5566773', 'sourcing@melbourneroasters.au'),
('Cafe de Altura EIRL', '20445566774', 'Exportador', 'Italia', '01-5566774', 'ventas@cafedealtura.pe'),
('Oasis Coffee Shop', '20556677885', 'Cafetería de Especialidad', 'Emiratos Árabes', '01-5566775', 'supply@oasiscoffee.ae'),
('Red Leaf Roasters', '20667788996', 'Tostador', 'Canadá', '01-5566776', 'greenbeans@redleaf.ca'),
('Fincas Unidas SA', '20778899007', 'Cooperativa Exportadora', 'Bélgica', '01-5566777', 'logistica@fincasunidas.pe'),
('Artisan Coffee Madrid', '20889900118', 'Tostador', 'España', '01-5566778', 'grano@artisancoffee.es'),
('Pacific Specialty Imports', '20990011229', 'Importador', 'Nueva Zelanda', '01-5566779', 'procurement@pacificimports.nz'),
('Lima Roastery SAC', '20001122330', 'Tostador Local', 'Perú', '01-5566780', 'compras@limaroastery.pe');
GO

-- 12. Inserción de 20 Transacciones de Venta
INSERT INTO Venta (IdLote, IdComprador, FechaVenta, CantidadKgVendidos, PrecioKiloUSD, TotalMontoUSD) VALUES 
(1, 1, '2026-08-10', 250.00, 8.50, 2125.00),
(2, 2, '2026-09-15', 300.00, 7.80, 2340.00),
(3, 3, '2026-08-25', 280.50, 7.20, 2019.60),
(4, 4, '2026-10-05', 350.00, 8.10, 2835.00),
(5, 5, '2026-07-20', 200.20, 6.90, 1381.38),
(6, 6, '2026-09-01', 320.00, 7.50, 2400.00),
(7, 7, '2026-10-10', 260.50, 7.30, 1901.65),
(8, 8, '2026-08-20', 290.00, 8.40, 2436.00),
(9, 9, '2026-07-30', 180.80, 6.50, 1175.20),
(10, 10, '2026-10-15', 380.00, 8.20, 3116.00),
(11, 11, '2026-07-15', 220.00, 7.00, 1540.00),
(12, 12, '2026-09-10', 310.50, 7.60, 2359.80),
(13, 13, '2026-09-25', 270.00, 6.80, 1836.00),
(14, 14, '2026-08-15', 240.20, 8.00, 1921.60),
(15, 15, '2026-07-25', 210.00, 7.10, 1491.00),
(16, 16, '2026-10-20', 360.50, 8.70, 3136.35),
(17, 17, '2026-07-05', 230.00, 6.60, 1518.00),
(18, 18, '2026-09-05', 285.50, 7.40, 2112.70),
(19, 19, '2026-10-25', 340.00, 8.30, 2822.00),
(20, 20, '2026-08-05', 245.80, 6.70, 1646.86);
GO


select * from Variedad;
select * from comprador;
select * from Parcela


-- ============== CONSULTAS, FUNCIONES Y PROCEDIMIENTOS ALMACENADOS ===
-- integrante 1:
use SpecialtyTraceDB;
go

SELECT 
    p.IdProductor,
    CONCAT(p.Nombres, ' ', p.Apellidos) AS Productor,
    COUNT(DISTINCT pa.IdParcela) AS TotalParcelas,
    SUM(pa.Hectareas) AS TotalHectareas,
    SUM(c.CantidadKg) AS TotalKgCosechados,
    ROUND(SUM(c.CantidadKg) / NULLIF(SUM(pa.Hectareas), 0), 2) AS RendimientoKgPorHa
FROM Productor p
INNER JOIN Parcela pa ON p.IdProductor = pa.IdProductor
INNER JOIN Cosecha c ON pa.IdParcela = c.IdParcela
GROUP BY p.IdProductor, p.Nombres, p.Apellidos
HAVING (SUM(c.CantidadKg) / NULLIF(SUM(pa.Hectareas), 0)) > 200.00
ORDER BY RendimientoKgPorHa DESC;

--------------------

CREATE OR ALTER PROCEDURE sp_RegistrarNuevaParcela
    @IdProductor INT,
    @Nombre VARCHAR(100),
    @UbicacionGeo VARCHAR(150),
    @Altitud DECIMAL(6,2),
    @Hectareas DECIMAL(4,2)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Productor WHERE IdProductor = @IdProductor)
    BEGIN
        RAISERROR('El productor especificado no existe.', 16, 1);
        RETURN;
    END

    IF @Altitud < 1200.00
    BEGIN
        RAISERROR('La altitud debe ser mayor o igual a 1200 msnm para café de especialidad.', 16, 1);
        RETURN;
    END

    INSERT INTO Parcela (IdProductor, Nombre, UbicacionGeo, Altitud, Hectareas)
    VALUES (@IdProductor, @Nombre, @UbicacionGeo, @Altitud, @Hectareas);

    SELECT SCOPE_IDENTITY() AS IdParcelaGenerada, 'Parcela registrada con éxito.' AS Mensaje;
END;
GO

EXEC sp_RegistrarNuevaParcela 
    @IdProductor = 1, 
    @Nombre = 'Parcela Los Eucaliptos', 
    @UbicacionGeo = 'Cusco, Santa Ana', 
    @Altitud = 1650.00, 
    @Hectareas = 3.20;

    select * from Parcela;

---
CREATE OR ALTER FUNCTION fn_TotalHectareasProductor (@IdProductor INT)
RETURNS DECIMAL(6,2)
AS
BEGIN
    DECLARE @TotalHa DECIMAL(6,2);
    SELECT @TotalHa = ISNULL(SUM(Hectareas), 0.00)
    FROM Parcela
    WHERE IdProductor = @IdProductor;
    RETURN @TotalHa;
END;
GO

SELECT 
    IdProductor, 
    CONCAT(Nombres, ' ', Apellidos) AS Productor,
    dbo.fn_TotalHectareasProductor(IdProductor) AS HectareasTotales
FROM Productor
WHERE IdProductor = 1;

-- integrante 2
SELECT 
    l.CodigoTrazabilidad,
    v.Nombre AS Variedad,
    cc.PorcentajeHumedad,
    cc.CantidadDefectos,
    ca.PuntajeSCA,
    ca.CatadorResponsable,
    CASE 
        WHEN ca.PuntajeSCA >= 90.00 THEN 'Presidencial / Excepcional'
        WHEN ca.PuntajeSCA >= 85.00 THEN 'Especialidad Excelente'
        ELSE 'Especialidad Estándar'
    END AS NivelCalidad
FROM Lote l
INNER JOIN Variedad v ON l.IdVariedad = v.IdVariedad
INNER JOIN ControlCalidad cc ON l.IdLote = cc.IdLote
INNER JOIN Cata ca ON l.IdLote = ca.IdLote
WHERE cc.PorcentajeHumedad BETWEEN 10.00 AND 12.00
  AND ca.PuntajeSCA >= 85.00
ORDER BY ca.PuntajeSCA DESC;

----

CREATE OR ALTER PROCEDURE sp_RegistrarEvaluacionCata
    @IdLote INT,
    @PuntajeSCA DECIMAL(4,2),
    @NotasSensoriales VARCHAR(255),
    @CatadorResponsable VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    IF @FechaVenta > CAST(GETDATE() AS DATE)
    BEGIN
        RAISERROR('La fecha de venta no puede ser posterior a la fecha actual.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Lote WHERE IdLote = @IdLote)
    BEGIN
        RAISERROR('El lote indicado no existe.', 16, 1);
        RETURN;
    END

    IF @PuntajeSCA < 0.00 OR @PuntajeSCA > 100.00
    BEGIN
        RAISERROR('El puntaje SCA debe estar entre 0.00 y 100.00.', 16, 1);
        RETURN;
    END

    INSERT INTO Cata (IdLote, PuntajeSCA, NotasSensoriales, CatadorResponsable)
    VALUES (@IdLote, @PuntajeSCA, @NotasSensoriales, @CatadorResponsable);

    SELECT 'Evaluación sensorial registrada correctamente.' AS Mensaje;
END;
GO

EXEC sp_RegistrarEvaluacionCata 
    @IdLote = 1, 
    @PuntajeSCA = 89.00, 
    @NotasSensoriales = 'Notas cítricas a mandarina, panela y jazmín.', 
    @CatadorResponsable = 'Q-Grader Mario Vega';

SELECT * from Cata

---
CREATE OR ALTER FUNCTION fn_ClasificarPuntajeSCA (@Puntaje DECIMAL(4,2))
RETURNS VARCHAR(50)
AS
BEGIN
    DECLARE @Categoria VARCHAR(50);
    IF @Puntaje >= 90.00
        SET @Categoria = 'Excepcional (90-100)';
    ELSE IF @Puntaje >= 85.00
        SET @Categoria = 'Excelente (85-89.99)';
    ELSE IF @Puntaje >= 80.00
        SET @Categoria = 'Muy Bueno (80-84.99)';
    ELSE
        SET @Categoria = 'Sub-estándar / Comercial (<80)';
    RETURN @Categoria;
END;
GO

SELECT 
    IdCata,
    PuntajeSCA,
    dbo.fn_ClasificarPuntajeSCA(PuntajeSCA) AS CategoriaOficial
FROM Cata;


-- integrante 3
SELECT 
    l.IdLote,
    l.CodigoTrazabilidad,
    v.Nombre AS Variedad,
    pb.TipoProceso,
    COUNT(lc.IdCertificacion) AS TotalSellos,
    STRING_AGG(c.NombreSello, ', ') WITHIN GROUP (ORDER BY c.NombreSello) AS SellosActivos
FROM Lote l
INNER JOIN Variedad v ON l.IdVariedad = v.IdVariedad
INNER JOIN ProcesoBeneficiado pb ON l.IdLote = pb.IdLote
INNER JOIN LoteCertificacion lc ON l.IdLote = lc.IdLote
INNER JOIN Certificacion c ON lc.IdCertificacion = c.IdCertificacion
GROUP BY l.IdLote, l.CodigoTrazabilidad, v.Nombre, pb.TipoProceso
HAVING COUNT(lc.IdCertificacion) > 1
ORDER BY TotalSellos DESC;

----

CREATE OR ALTER PROCEDURE sp_AsignarCertificacionLote
    @IdCertificacion INT,
    @IdLote INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Lote WHERE IdLote = @IdLote)
    BEGIN
        RAISERROR('El lote no existe.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Certificacion WHERE IdCertificacion = @IdCertificacion)
    BEGIN
        RAISERROR('La certificación especificada no existe.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM LoteCertificacion WHERE IdCertificacion = @IdCertificacion AND IdLote = @IdLote)
    BEGIN
        RAISERROR('El lote ya posee esta certificación asignada.', 16, 1);
        RETURN;
    END

    INSERT INTO LoteCertificacion (IdCertificacion, IdLote)
    VALUES (@IdCertificacion, @IdLote);

    SELECT 'Certificación asignada exitosamente al lote.' AS Mensaje;
END;
GO

EXEC sp_AsignarCertificacionLote 
    @IdCertificacion = 5, 
    @IdLote = 2;


---
CREATE OR ALTER FUNCTION fn_ListarCertificacionesPorLote (@IdLote INT)
RETURNS TABLE
AS
RETURN (
    SELECT 
        c.IdCertificacion,
        c.NombreSello,
        c.EntidadEmisora
    FROM Certificacion c
    INNER JOIN LoteCertificacion lc ON c.IdCertificacion = lc.IdCertificacion
    WHERE lc.IdLote = @IdLote
);
GO

SELECT * FROM dbo.fn_ListarCertificacionesPorLote(1);

 -- Integrante 4 --
 SELECT 
    c.IdComprador,
    c.RazonSocial,
    c.PaisDestino,
    c.TipoComprador,
    COUNT(v.IdVenta) AS CantidadCompras,
    SUM(v.CantidadKgVendidos) AS KilosComprados,
    ROUND(AVG(v.PrecioKiloUSD), 2) AS PrecioPromedioKilo,
    SUM(v.TotalMontoUSD) AS FacturacionTotalUSD
FROM Comprador c
INNER JOIN Venta v ON c.IdComprador = v.IdComprador
GROUP BY c.IdComprador, c.RazonSocial, c.PaisDestino, c.TipoComprador
ORDER BY FacturacionTotalUSD DESC;

-------
CREATE OR ALTER PROCEDURE sp_RegistrarTransaccionVenta
    @IdLote INT,
    @IdComprador INT,
    @FechaVenta DATE,
    @CantidadKgVendidos DECIMAL(8,2),
    @PrecioKiloUSD DECIMAL(6,2)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Lote WHERE IdLote = @IdLote)
    BEGIN
        RAISERROR('El lote indicado no existe.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Comprador WHERE IdComprador = @IdComprador)
    BEGIN
        RAISERROR('El comprador indicado no existe.', 16, 1);
        RETURN;
    END

    DECLARE @TotalCalculado DECIMAL(10,2) = @CantidadKgVendidos * @PrecioKiloUSD;

    INSERT INTO Venta (IdLote, IdComprador, FechaVenta, CantidadKgVendidos, PrecioKiloUSD, TotalMontoUSD)
    VALUES (@IdLote, @IdComprador, @FechaVenta, @CantidadKgVendidos, @PrecioKiloUSD, @TotalCalculado);

    SELECT SCOPE_IDENTITY() AS IdVentaGenerada, @TotalCalculado AS TotalFacturadoUSD;
END;
GO

EXEC sp_RegistrarTransaccionVenta 
    @IdLote = 3, 
    @IdComprador = 2, 
    @FechaVenta = '2026-11-01', 
    @CantidadKgVendidos = 100.00, 
    @PrecioKiloUSD = 8.50;

-------
CREATE OR ALTER FUNCTION fn_TotalFacturadoPorComprador (@IdComprador INT)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @Total DECIMAL(10,2);
    SELECT @Total = ISNULL(SUM(TotalMontoUSD), 0.00)
    FROM Venta
    WHERE IdComprador = @IdComprador;
    RETURN @Total;
END;
GO

SELECT 
    IdComprador, 
    RazonSocial, 
    PaisDestino,
    dbo.fn_TotalFacturadoPorComprador(IdComprador) AS TotalCompradoUSD
FROM Comprador
WHERE IdComprador = 1;

-- Integrante 5
SELECT 
    var.Nombre AS Variedad,
    COUNT(DISTINCT l.IdLote) AS LotesVendidos,
    ROUND(AVG(ca.PuntajeSCA), 2) AS PromedioSCA,
    ROUND(AVG(v.PrecioKiloUSD), 2) AS PrecioPromedioUSD,
    SUM(v.TotalMontoUSD) AS IngresosTotalesUSD,
    DENSE_RANK() OVER (ORDER BY SUM(v.TotalMontoUSD) DESC) AS PosicionRentabilidad
FROM Variedad var
INNER JOIN Lote l ON var.IdVariedad = l.IdVariedad
INNER JOIN Cata ca ON l.IdLote = ca.IdLote
INNER JOIN Venta v ON l.IdLote = v.IdLote
GROUP BY var.Nombre
ORDER BY PosicionRentabilidad ASC;


----
CREATE OR ALTER PROCEDURE sp_ReporteLiquidacionProductor
    @IdProductor INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Productor WHERE IdProductor = @IdProductor)
    BEGIN
        RAISERROR('El productor especificado no existe.', 16, 1);
        RETURN;
    END

    SELECT 
        CONCAT(p.Nombres, ' ', p.Apellidos) AS Productor,
        p.DocumentoIdentidad,
        pa.Nombre AS Parcela,
        l.CodigoTrazabilidad,
        v.FechaVenta,
        v.CantidadKgVendidos,
        v.PrecioKiloUSD,
        v.TotalMontoUSD
    FROM Productor p
    INNER JOIN Parcela pa ON p.IdProductor = pa.IdProductor
    INNER JOIN Cosecha c ON pa.IdParcela = c.IdParcela
    INNER JOIN Lote l ON c.IdCosecha = l.IdCosecha
    INNER JOIN Venta v ON l.IdLote = v.IdLote
    WHERE p.IdProductor = @IdProductor
    ORDER BY v.FechaVenta DESC;
END;
GO

EXEC sp_ReporteLiquidacionProductor @IdProductor = 1;

---
CREATE OR ALTER FUNCTION fn_AuditoriaTrazabilidadLote (@CodigoTrazabilidad VARCHAR(50))
RETURNS TABLE
AS
RETURN (
    SELECT 
        l.CodigoTrazabilidad,
        CONCAT(p.Nombres, ' ', p.Apellidos) AS Productor,
        pa.Nombre AS Parcela,
        pa.Altitud,
        v.Nombre AS Variedad,
        pb.TipoProceso,
        ca.PuntajeSCA,
        ca.CatadorResponsable
    FROM Lote l
    INNER JOIN Variedad v ON l.IdVariedad = v.IdVariedad
    INNER JOIN Cosecha c ON l.IdCosecha = c.IdCosecha
    INNER JOIN Parcela pa ON c.IdParcela = pa.IdParcela
    INNER JOIN Productor p ON pa.IdProductor = p.IdProductor
    INNER JOIN ProcesoBeneficiado pb ON l.IdLote = pb.IdLote
    INNER JOIN Cata ca ON l.IdLote = ca.IdLote
    WHERE l.CodigoTrazabilidad = @CodigoTrazabilidad
);
GO

SELECT * FROM dbo.fn_AuditoriaTrazabilidadLote('TRZ-26-GSH-001');