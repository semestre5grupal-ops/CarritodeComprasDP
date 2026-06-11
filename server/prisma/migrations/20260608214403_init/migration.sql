/*==============================================================*/
/* DBMS objetivo: PostgreSQL 12+ (script normalizado)           */
/* Origen:        PowerDesigner / PostgreSQL 8                   */
/* Generado:      script idempotente, tipos normalizados        */
/*==============================================================*/

-- Eliminacion idempotente (orden seguro: tablas con CASCADE y luego dominios)
drop table if exists AJUSTES cascade;
drop table if exists ASIENTOS cascade;
drop table if exists ASISTENCIA cascade;
drop table if exists BODEGA cascade;
drop table if exists CARGO cascade;
drop table if exists CATEGORIA cascade;
drop table if exists CATEGORIA_CUENTA cascade;
drop table if exists CIUDAD cascade;
drop table if exists CLIENTES cascade;
drop table if exists COLORES cascade;
drop table if exists COMPRA cascade;
drop table if exists CONTRATO cascade;
drop table if exists CUENTAS cascade;
drop table if exists CUENTASXASIENTO cascade;
drop table if exists CUOTAS cascade;
drop table if exists DEPARTAMENTO cascade;
drop table if exists DEPENDIENTES cascade;
drop table if exists DETALLEHORARIO cascade;
drop table if exists DEVOLUCIONES_COMPRA cascade;
drop table if exists DEVOLUCIONES_VENTAS cascade;
drop table if exists DIRECCIONES cascade;
drop table if exists DOCUMENTOS cascade;
drop table if exists DOCUMENTOXPAGO cascade;
drop table if exists EMPLEADOS cascade;
drop table if exists ENTREGAS cascade;
drop table if exists HORARIO cascade;
drop table if exists HORARIOXEMPLEADO cascade;
drop table if exists INTERACCIONES cascade;
drop table if exists INVENTARIO_BODEGAS cascade;
drop table if exists LOGISTICA cascade;
drop table if exists MARCAS cascade;
drop table if exists MATERIALES cascade;
drop table if exists META cascade;
drop table if exists METODOSPAGO cascade;
drop table if exists PERCHA cascade;
drop table if exists PERIODO cascade;
drop table if exists PERMISOS cascade;
drop table if exists PRODUCTOS cascade;
drop table if exists PRODUCTOSXDOCUMENTO cascade;
drop table if exists PRODUCTOSXLOGISTICA cascade;
drop table if exists PROVEEDOR cascade;
drop table if exists PROXAJU cascade;
drop table if exists PROXDEVC cascade;
drop table if exists PROXDEVEN cascade;
drop table if exists PROXENT cascade;
drop table if exists PROXOC cascade;
drop table if exists PROXREC cascade;
drop table if exists RECEPCIONES cascade;
drop table if exists ROLPAGOS cascade;
drop table if exists RUBROS cascade;
drop table if exists RUBROSXROL cascade;
drop table if exists TALLAS cascade;
drop table if exists TEMPORADAS cascade;
drop table if exists UBICACION_PRODUCTO cascade;
drop table if exists UNIDAD_MEDIDA cascade;
drop table if exists USUARIOS cascade;
drop table if exists VACACIONES cascade;
drop table if exists VARIANTES_PRODUCTO cascade;
drop table if exists VENDEDORES cascade;

drop domain if exists DOM_CALIDAD_CLIENTES cascade;
drop domain if exists DOM_CANALES_CONTACTO cascade;
drop domain if exists DOM_CMPESTADO cascade;
drop domain if exists DOM_DOCUMENTOS cascade;
drop domain if exists DOM_ESTADO cascade;
drop domain if exists DOM_ESTADOAJUSTE cascade;
drop domain if exists DOM_ESTADOASIENTO cascade;
drop domain if exists DOM_ESTADOCUENTA cascade;
drop domain if exists DOM_ESTADO_DOC cascade;
drop domain if exists DOM_ESTADO_LOG cascade;
drop domain if exists DOM_INTERACCIONES cascade;
drop domain if exists DOM_MOVIMIENTOESTADO cascade;
drop domain if exists DOM_STATUSEMP cascade;
drop domain if exists DOM_TIPOCUENTA cascade;


create domain DOM_CALIDAD_CLIENTES as INTEGER;

/*==============================================================*/
/* Domain: DOM_CANALES_CONTACTO                                 */
/*==============================================================*/
create domain DOM_CANALES_CONTACTO as CHAR(3);

/*==============================================================*/
/* Domain: DOM_CMPESTADO                                        */
/*==============================================================*/
create domain DOM_CMPESTADO as CHAR(3);

/*==============================================================*/
/* Domain: DOM_DOCUMENTOS                                       */
/*==============================================================*/
create domain DOM_DOCUMENTOS as CHAR(3);

/*==============================================================*/
/* Domain: DOM_ESTADO                                           */
/*==============================================================*/
create domain DOM_ESTADO as CHAR(3);

/*==============================================================*/
/* Domain: DOM_ESTADOAJUSTE                                     */
/*==============================================================*/
create domain DOM_ESTADOAJUSTE as CHAR(3);

/*==============================================================*/
/* Domain: DOM_ESTADOASIENTO                                    */
/*==============================================================*/
create domain DOM_ESTADOASIENTO as CHAR(3);

/*==============================================================*/
/* Domain: DOM_ESTADOCUENTA                                     */
/*==============================================================*/
create domain DOM_ESTADOCUENTA as CHAR(3);

/*==============================================================*/
/* Domain: DOM_ESTADO_DOC                                       */
/*==============================================================*/
create domain DOM_ESTADO_DOC as CHAR(3);

/*==============================================================*/
/* Domain: DOM_ESTADO_LOG                                       */
/*==============================================================*/
create domain DOM_ESTADO_LOG as CHAR(3);

/*==============================================================*/
/* Domain: DOM_INTERACCIONES                                    */
/*==============================================================*/
create domain DOM_INTERACCIONES as CHAR(3);

/*==============================================================*/
/* Domain: DOM_MOVIMIENTOESTADO                                 */
/*==============================================================*/
create domain DOM_MOVIMIENTOESTADO as CHAR(3);

/*==============================================================*/
/* Domain: DOM_STATUSEMP                                        */
/*==============================================================*/
create domain DOM_STATUSEMP as CHAR(3);

/*==============================================================*/
/* Domain: DOM_TIPOCUENTA                                       */
/*==============================================================*/
create domain DOM_TIPOCUENTA as CHAR(7);

/*==============================================================*/
/* Table: AJUSTES                                               */
/*==============================================================*/
create table AJUSTES (
   ID_AJUSTE            SERIAL               not null,
   ID_BODEGA            INTEGER                 not null,
   AJU_FECHAHORA        DATE                 not null,
   AJU_DESCRIPCION      VARCHAR(100)         not null,
   AJU_FECHARESOLUCION  DATE                 null,
   AJU_NUM_PRODUC_      INTEGER                 not null,
   USU_RESPONSABLE      VARCHAR(30)          not null,
   AJU_ESTADO           CHAR(3)              not null,
   constraint PK_AJUSTES primary key (ID_AJUSTE)
);

/*==============================================================*/
/* Index: AJSUTA_EN_FK                                          */
/*==============================================================*/
create  index AJSUTA_EN_FK on AJUSTES (
ID_BODEGA
);

/*==============================================================*/
/* Table: ASIENTOS                                              */
/*==============================================================*/
create table ASIENTOS (
   ID_ASIENTOCONTABLE3  CHAR(10)             not null,
   ASI_FECHAHORA        DATE                 not null,
   ASI_DESCRIPCION      CHAR(50)             not null,
   ASI_ESTADOASIENTO    DOM_ESTADOASIENTO    not null,
   ASI_TOTAL_DEBE       DECIMAL(7,2)         not null,
   ASI_TOTAL_HABER      NUMERIC(7,2)         not null,
   ASI_USERID           CHAR(16)             not null,
   constraint PK_ASIENTOS primary key (ID_ASIENTOCONTABLE3)
);

/*==============================================================*/
/* Table: ASISTENCIA                                            */
/*==============================================================*/
create table ASISTENCIA (
   ID_ASISTENCIA        SERIAL               not null,
   ID_EMPLEADO          INTEGER                 not null,
   FECHA_HORA           DATE                 not null,
   TIPO_MOVIMIENTO      CHAR(5)              not null,
   constraint PK_ASISTENCIA primary key (ID_ASISTENCIA)
);

/*==============================================================*/
/* Index: HAY_FK                                                */
/*==============================================================*/
create  index HAY_FK on ASISTENCIA (
ID_EMPLEADO
);

/*==============================================================*/
/* Table: BODEGA                                                */
/*==============================================================*/
create table BODEGA (
   ID_BODEGA            SERIAL               not null,
   BOD_NOMBRE_          VARCHAR(50)          not null,
   BOD_UBICACION        VARCHAR(100)         not null,
   ESTADO_BOD           CHAR(3)              not null,
   constraint PK_BODEGA primary key (ID_BODEGA)
);

/*==============================================================*/
/* Table: CARGO                                                 */
/*==============================================================*/
create table CARGO (
   ID_CARGO             SERIAL               not null,
   ID_DEPARTAMENTO      INTEGER                 not null,
   CAR_NOMBRE           CHAR(50)             not null,
   CAR_SUELDOBASE       DECIMAL(9,3)         not null,
   CAR_FECCREACION      DATE                 not null,
   constraint PK_CARGO primary key (ID_CARGO)
);

/*==============================================================*/
/* Index: CONTIENE_FK                                           */
/*==============================================================*/
create  index CONTIENE_FK on CARGO (
ID_DEPARTAMENTO
);

/*==============================================================*/
/* Table: CATEGORIA                                             */
/*==============================================================*/
create table CATEGORIA (
   ID_CATEGORIA         SERIAL               not null,
   CAT_NOMBRE           CHAR(30)             not null,
   CAT_ESTADO           CHAR(3)              not null,
   constraint PK_CATEGORIA primary key (ID_CATEGORIA)
);

/*==============================================================*/
/* Table: CATEGORIA_CUENTA                                      */
/*==============================================================*/
create table CATEGORIA_CUENTA (
   ID_TIPOCUENTA3       CHAR(1)              not null,
   CAT_DESCRIPCION      CHAR(60)             not null,
   constraint PK_CATEGORIA_CUENTA primary key (ID_TIPOCUENTA3)
);

/*==============================================================*/
/* Table: CIUDAD                                                */
/*==============================================================*/
create table CIUDAD (
   ID_CIUDAD            SERIAL               not null,
   CIU_NOMBRE           CHAR(45)             not null,
   CIU_ABREVIADO        CHAR(5)              not null,
   CIU_ESTADO           BOOLEAN                 not null,
   constraint PK_CIUDAD primary key (ID_CIUDAD)
);

/*==============================================================*/
/* Table: CLIENTES                                              */
/*==============================================================*/
create table CLIENTES (
   ID_CLIENTE           SERIAL               not null,
   ID_CIUDAD            INTEGER                 not null,
   CLI_NOMBRE           VARCHAR(80)          not null,
   CLI_CIRUC            CHAR(13)             not null,
   CLI_CELULAR          CHAR(10)             not null,
   CLI_TELEFONO         CHAR(10)              not null,
   CLI_CORREO           VARCHAR(100)         not null,
   CLI_CATEGORIA        DOM_CALIDAD_CLIENTES not null,
   CLI_ESTADO           BOOLEAN                 not null,
   constraint PK_CLIENTES primary key (ID_CLIENTE)
);

/*==============================================================*/
/* Index: PERTENECE3_FK                                         */
/*==============================================================*/
create  index PERTENECE3_FK on CLIENTES (
ID_CIUDAD
);

/*==============================================================*/
/* Table: COLORES                                               */
/*==============================================================*/
create table COLORES (
   ID_COLOR             SERIAL               not null,
   COL_NOMBRE           VARCHAR(30)          not null,
   COL_FAMILIA          VARCHAR(20)          not null,
   COL_ESTADO           CHAR(3)              not null,
   constraint PK_COLORES primary key (ID_COLOR)
);

/*==============================================================*/
/* Table: COMPRA                                                */
/*==============================================================*/
create table COMPRA (
   ID_COMPRA            SERIAL               not null,
   ID_PROVEEDOR         INTEGER                 not null,
   OC_FECHA             DATE                 not null,
   OC_FECHAENTREGA      DATE                 null,
   OC_SUBTOTAL          DECIMAL(9,2)         not null,
   OC_IVA               NUMERIC(2)           not null,
   OC_TOTAL             DECIMAL(9,2)         not null,
   OC_ESTADO            CHAR(3)              not null,
   constraint PK_COMPRA primary key (ID_COMPRA)
);

/*==============================================================*/
/* Index: GENERA_FK                                             */
/*==============================================================*/
create  index GENERA_FK on COMPRA (
ID_PROVEEDOR
);

/*==============================================================*/
/* Table: CONTRATO                                              */
/*==============================================================*/
create table CONTRATO (
   ID_CONTRATO          SERIAL               not null,
   ID_EMPLEADO          INTEGER                 not null,
   ID_CARGO             INTEGER                 not null,
   CON_TIPO             CHAR(1)              not null,
   CON_SUELDOBASE       DECIMAL(9,3)         not null,
   CON_FECHAINICIO      DATE                 not null,
   CON_FECHA_FIN        DATE                 null,
   CON_MENSUALIZA_D3    BOOLEAN                 not null,
   CON_MENSUALIZA_D4    BOOLEAN                 not null,
   CON_MENSUALIZA_FR    BOOLEAN                 not null,
   CON_ESTADO           CHAR(3)              not null,
   CON_EMPFECHAINGRESO  DATE                 not null,
   constraint PK_CONTRATO primary key (ID_CONTRATO)
);

/*==============================================================*/
/* Index: TIENE_FK                                              */
/*==============================================================*/
create  index TIENE_FK on CONTRATO (
ID_EMPLEADO
);

/*==============================================================*/
/* Index: PERTENECE_FK                                          */
/*==============================================================*/
create  index PERTENECE_FK on CONTRATO (
ID_CARGO
);

/*==============================================================*/
/* Table: CUENTAS                                               */
/*==============================================================*/
create table CUENTAS (
   ID_CODIGOCUENTA3     CHAR(15)             not null,
   ID_TIPOCUENTA3       CHAR(1)              not null,
   CUE_NOMBRECUENTA     CHAR(25)             not null,
   CUE_DESCRIPCION      CHAR(60)             not null,
   CUE_TIPOCUENTA       DOM_TIPOCUENTA       not null,
   CUE_DEB00            DECIMAL(10,2)        not null,
   CUE_DEB01            DECIMAL(10,2)        not null,
   CUE_DEB02            DECIMAL(10,2)        not null,
   CUE_DEB03            DECIMAL(10,2)        not null,
   CUE_DEB04            DECIMAL(10,2)        not null,
   CUE_DEB05            DECIMAL(10,2)        not null,
   CUE_DEB06            DECIMAL(10,2)        not null,
   CUE_DEB07            DECIMAL(10,2)        not null,
   CUE_DEB08            DECIMAL(10,2)        not null,
   CUE_DEB09            DECIMAL(10,2)        not null,
   CUE_DEB10            DECIMAL(10,2)        not null,
   CUE_DEB11            DECIMAL(10,2)        not null,
   CUE_DEB12            DECIMAL(10,2)        not null,
   CUE_DEB13            DECIMAL(10,2)        not null,
   CUE_HAB00            DECIMAL(10,2)        not null,
   CUE_HAB01            DECIMAL(10,2)        not null,
   CUE_HAB02            DECIMAL(10,2)        not null,
   CUE_HAB03            DECIMAL(10,2)        not null,
   CUE_HAB04            DECIMAL(10,2)        not null,
   CUE_HAB05            DECIMAL(10,2)        not null,
   CUE_HAB06            DECIMAL(10,2)        not null,
   CUE_HAB07            DECIMAL(10,2)        not null,
   CUE_HAB08            DECIMAL(10,2)        not null,
   CUE_HAB09            DECIMAL(10,2)        not null,
   CUE_HAB10            DECIMAL(10,2)        not null,
   CUE_HAB11            DECIMAL(10,2)        not null,
   CUE_HAB12            DECIMAL(10,2)        not null,
   CUE_HAB13            DECIMAL(10,2)        not null,
   CUE_USERID           CHAR(16)             not null,
   CUE_ESTADOCUENTA     DOM_ESTADOCUENTA     not null,
   constraint PK_CUENTAS primary key (ID_CODIGOCUENTA3)
);

/*==============================================================*/
/* Index: DISPONE_FK                                            */
/*==============================================================*/
create  index DISPONE_FK on CUENTAS (
ID_TIPOCUENTA3
);

/*==============================================================*/
/* Table: CUENTASXASIENTO                                       */
/*==============================================================*/
create table CUENTASXASIENTO (
   ID_CODIGOCUENTA3     CHAR(15)             not null,
   ID_ASIENTOCONTABLE3  CHAR(10)             not null,
   CXA_MONTODEBE        DECIMAL(10,2)        not null,
   CXA_MONTOHABER       DECIMAL(10,2)        not null,
   CXA_DESCRIPCION      CHAR(80)             not null,
   CXA_ESTADOCXA        DOM_ESTADOASIENTO    not null,
   constraint PK_CUENTASXASIENTO primary key (ID_CODIGOCUENTA3, ID_ASIENTOCONTABLE3)
);

/*==============================================================*/
/* Index: CUENTASXASIENTO_FK                                    */
/*==============================================================*/
create  index CUENTASXASIENTO_FK on CUENTASXASIENTO (
ID_CODIGOCUENTA3
);

/*==============================================================*/
/* Index: CUENTASXASIENTO2_FK                                   */
/*==============================================================*/
create  index CUENTASXASIENTO2_FK on CUENTASXASIENTO (
ID_ASIENTOCONTABLE3
);

/*==============================================================*/
/* Table: CUOTAS                                                */
/*==============================================================*/
create table CUOTAS (
   ID_CUOTA             SERIAL               not null,
   ID_DOCUMENTO         INTEGER                 null,
   CUO_NUMERO           INTEGER                 not null,
   CUO_MONTO            DECIMAL(10,2)        not null,
   CUO_PENDIENTE        DECIMAL(10,2)        not null,
   CUO_FECHA_PAGADO     DATE                 null,
   CUO_FECHA_ESTIMADA   DATE                 not null,
   CUO_ESTADO           CHAR(3)              not null,
   constraint PK_CUOTAS primary key (ID_CUOTA)
);

/*==============================================================*/
/* Index: GENERAN_FK                                            */
/*==============================================================*/
create  index GENERAN_FK on CUOTAS (
ID_DOCUMENTO
);

/*==============================================================*/
/* Table: DEPARTAMENTO                                          */
/*==============================================================*/
create table DEPARTAMENTO (
   ID_DEPARTAMENTO      SERIAL               not null,
   DEP_NOMBRE           CHAR(50)             not null,
   DEP_ESTADO           CHAR(3)              not null,
   DEP_FECCREACION      DATE                 not null,
   constraint PK_DEPARTAMENTO primary key (ID_DEPARTAMENTO)
);

/*==============================================================*/
/* Table: DEPENDIENTES                                          */
/*==============================================================*/
create table DEPENDIENTES (
   ID_DEPENDIENTE       SERIAL               not null,
   ID_EMPLEADO          INTEGER                 not null,
   DEP_CEDDOC           NUMERIC(10)          not null,
   DEP_NOM1             CHAR(50)             not null,
   DEP_NOM2             CHAR(50)             null,
   DEP_AP1              CHAR(50)             not null,
   DEP_AP2              CHAR(50)             not null,
   DEP_FECHANACIMIENTO  DATE                 not null,
   DEP_SEXO             CHAR(1)              not null,
   DEP_PARENTESCO       CHAR(25)             not null,
   DEP_ESTADO           CHAR(3)              not null,
   constraint PK_DEPENDIENTES primary key (ID_DEPENDIENTE)
);

/*==============================================================*/
/* Index: MANTIENE2_FK                                          */
/*==============================================================*/
create  index MANTIENE2_FK on DEPENDIENTES (
ID_EMPLEADO
);

/*==============================================================*/
/* Table: DETALLEHORARIO                                        */
/*==============================================================*/
create table DETALLEHORARIO (
   ID_DETALLE           SERIAL               not null,
   ID_HORARIO           INTEGER                 not null,
   DET_DIA_SEMANA       CHAR(1)              null,
   DET_HORA_ENTRADA     DATE                 null,
   DET_HORA_SALIDA      DATE                 null,
   constraint PK_DETALLEHORARIO primary key (ID_DETALLE)
);

/*==============================================================*/
/* Index: TIEN_FK                                               */
/*==============================================================*/
create  index TIEN_FK on DETALLEHORARIO (
ID_HORARIO
);

/*==============================================================*/
/* Table: DEVOLUCIONES_COMPRA                                   */
/*==============================================================*/
create table DEVOLUCIONES_COMPRA (
   ID_DEVCOMPRA_PK      SERIAL               not null,
   ID_COMPRA            INTEGER                 not null,
   ID_BODEGA            INTEGER                 not null,
   DEVC_FECHAHORA       DATE                 not null,
   DEVC_MOTIVO          VARCHAR(100)         not null,
   DEVC_NUM_PRODUC      INTEGER                 not null,
   DEVC_FECHARESOLUCION DATE                 null,
   USU_RESPONSABLE      VARCHAR(30)          not null,
   DEVC_ESTADO          CHAR(3)              not null,
   constraint PK_DEVOLUCIONES_COMPRA primary key (ID_DEVCOMPRA_PK)
);

/*==============================================================*/
/* Index: CREA_FK                                               */
/*==============================================================*/
create  index CREA_FK on DEVOLUCIONES_COMPRA (
ID_COMPRA
);

/*==============================================================*/
/* Index: MANEJA_FK                                             */
/*==============================================================*/
create  index MANEJA_FK on DEVOLUCIONES_COMPRA (
ID_BODEGA
);

/*==============================================================*/
/* Table: DEVOLUCIONES_VENTAS                                   */
/*==============================================================*/
create table DEVOLUCIONES_VENTAS (
   ID_DEVOLUCION        SERIAL               not null,
   ID_BODEGA            INTEGER                 not null,
   ID_DOCUMENTO         INTEGER                 not null,
   DEV_FECHAHORA        DATE                 not null,
   DEV_MOTIVO           VARCHAR(100)         not null,
   DEV_NUM_PRODUC       INTEGER                 not null,
   DEV_FECHARESOLUCION  DATE                 null,
   USU_RESPONSABLE      VARCHAR(30)          not null,
   ESTADO_DEV           CHAR(3)              not null,
   constraint PK_DEVOLUCIONES_VENTAS primary key (ID_DEVOLUCION)
);

/*==============================================================*/
/* Index: SUFRE_FK                                              */
/*==============================================================*/
create  index SUFRE_FK on DEVOLUCIONES_VENTAS (
ID_BODEGA
);

/*==============================================================*/
/* Index: ASOCIA_FK                                             */
/*==============================================================*/
create  index ASOCIA_FK on DEVOLUCIONES_VENTAS (
ID_DOCUMENTO
);

/*==============================================================*/
/* Table: DIRECCIONES                                           */
/*==============================================================*/
create table DIRECCIONES (
   ID_DIRECCION         SERIAL               not null,
   ID_CIUDAD            INTEGER                 not null,
   ID_CLIENTE           INTEGER                 not null,
   DIR_SECTOR           VARCHAR(25)          not null,
   DIR_PRINCIPAL        VARCHAR(50)          not null,
   DIR_SECUNDARIA       VARCHAR(25)          null,
   DIR_REFERENCIA       VARCHAR(100)         not null,
   DIR_ESTADO           BOOLEAN                 not null,
   constraint PK_DIRECCIONES primary key (ID_DIRECCION)
);

/*==============================================================*/
/* Index: RESIDE_FK                                             */
/*==============================================================*/
create  index RESIDE_FK on DIRECCIONES (
ID_CLIENTE
);

/*==============================================================*/
/* Index: RADICA_FK                                             */
/*==============================================================*/
create  index RADICA_FK on DIRECCIONES (
ID_CIUDAD
);

/*==============================================================*/
/* Table: DOCUMENTOS                                            */
/*==============================================================*/
create table DOCUMENTOS (
   ID_DOCUMENTO         SERIAL               not null,
   ID_CLIENTE           INTEGER                 not null,
   DOC_ID_DOCUMENTO     INTEGER                 null,
   ID_VENDEDOR          INTEGER                 not null
      constraint CKC_ID_VENDEDOR_DOCUMENT check (ID_VENDEDOR >= serial),
   DOC_TIPO             DOM_DOCUMENTOS       not null,
   DOC_EMISION          DATE                 not null,
   DOC_PAGO             DATE                 null,
   DOC_DESCRIPCION      VARCHAR(50)          not null,
   DOC_SUBTOTAL         DECIMAL(12,4)        not null,
   DOC_IVA              DECIMAL(12,4)        not null,
   DOC_DESCUENTO        DECIMAL(12,4)        not null,
   DOC_TOTAL            DECIMAL(12,4)        not null,
   DOC_ESTADO           DOM_ESTADO_DOC       not null,
   constraint PK_DOCUMENTOS primary key (ID_DOCUMENTO)
);

/*==============================================================*/
/* Index: REGISTRA_FK                                           */
/*==============================================================*/
create  index REGISTRA_FK on DOCUMENTOS (
ID_CLIENTE
);

/*==============================================================*/
/* Index: REFIERE_FK                                            */
/*==============================================================*/
create  index REFIERE_FK on DOCUMENTOS (
DOC_ID_DOCUMENTO
);

/*==============================================================*/
/* Index: CREA2_FK                                              */
/*==============================================================*/
create  index CREA2_FK on DOCUMENTOS (
ID_VENDEDOR
);

/*==============================================================*/
/* Table: DOCUMENTOXPAGO                                        */
/*==============================================================*/
create table DOCUMENTOXPAGO (
   ID_DOCUMENTO         INTEGER                 not null,
   ID_METODOPAGO        INTEGER                 not null,
   DXP_MONTO_ABOONADO   DECIMAL(10,2)        not null,
   DXP_REFERENCIA       CHAR(13)             null,
   DXP_MESESPLAZO       INTEGER                 null,
   constraint PK_DOCUMENTOXPAGO primary key (ID_DOCUMENTO, ID_METODOPAGO)
);

/*==============================================================*/
/* Index: DOCUMENTOXPAGO_FK                                     */
/*==============================================================*/
create  index DOCUMENTOXPAGO_FK on DOCUMENTOXPAGO (
ID_DOCUMENTO
);

/*==============================================================*/
/* Index: DOCUMENTOXPAGO2_FK                                    */
/*==============================================================*/
create  index DOCUMENTOXPAGO2_FK on DOCUMENTOXPAGO (
ID_METODOPAGO
);

/*==============================================================*/
/* Table: EMPLEADOS                                             */
/*==============================================================*/
create table EMPLEADOS (
   ID_EMPLEADO          SERIAL               not null,
   EMP_CEDULA           CHAR(10)             not null,
   EMP_NOM1             VARCHAR(50)          not null,
   EMP_NOM2             VARCHAR(50)          null,
   EMP_AP1              VARCHAR(50)          not null,
   EMP_AP2              VARCHAR(50)          null,
   EMP_SEXO             CHAR(1)              not null,
   EMP_FECHANACIMIENTO  DATE                 not null,
   EMP_EMAIL            CHAR(100)            not null,
   EMP_DIRECCION        CHAR(50)             not null,
   EMP_TELEFONO         CHAR(10)             not null,
   constraint PK_EMPLEADOS primary key (ID_EMPLEADO)
);

/*==============================================================*/
/* Table: ENTREGAS                                              */
/*==============================================================*/
create table ENTREGAS (
   ID_ENTREGA           SERIAL               not null,
   ID_DOCUMENTO         INTEGER                 not null,
   ID_BODEGA            INTEGER                 not null,
   ENT_FECHAHORA_       DATE                 not null,
   ENT_DESCRIPCION      VARCHAR(100)         not null,
   ENT_NUM_PRODUC       INTEGER                 not null,
   ENT_FECHARESOLUCION_ DATE                 null,
   USU_RESPONSABLE      VARCHAR(30)          not null,
   ENT_ESTADO           CHAR(3)              not null,
   constraint PK_ENTREGAS primary key (ID_ENTREGA)
);

/*==============================================================*/
/* Index: ENTREGA_EN_FK                                         */
/*==============================================================*/
create  index ENTREGA_EN_FK on ENTREGAS (
ID_BODEGA
);

/*==============================================================*/
/* Index: GESTIONA_FK                                           */
/*==============================================================*/
create  index GESTIONA_FK on ENTREGAS (
ID_DOCUMENTO
);

/*==============================================================*/
/* Table: HORARIO                                               */
/*==============================================================*/
create table HORARIO (
   ID_HORARIO           SERIAL               not null,
   HOR_NOMBRE_HORARIO   CHAR(30)             not null,
   HOR_HORASTOTAL       INTEGER                 not null,
   constraint PK_HORARIO primary key (ID_HORARIO)
);

/*==============================================================*/
/* Table: HORARIOXEMPLEADO                                      */
/*==============================================================*/
create table HORARIOXEMPLEADO (
   ID_HORARIO           INTEGER                 not null,
   ID_EMPLEADO          INTEGER                 not null,
   FECHA_INICIO_ASIGNACION DATE                 not null,
   FECHA_FIN_ASIGNACION DATE                 null,
   constraint PK_HORARIOXEMPLEADO primary key (ID_HORARIO, ID_EMPLEADO)
);

/*==============================================================*/
/* Index: HORARIOXEMPLEADO_FK                                   */
/*==============================================================*/
create  index HORARIOXEMPLEADO_FK on HORARIOXEMPLEADO (
ID_HORARIO
);

/*==============================================================*/
/* Index: HORARIOXEMPLEADO2_FK                                  */
/*==============================================================*/
create  index HORARIOXEMPLEADO2_FK on HORARIOXEMPLEADO (
ID_EMPLEADO
);

/*==============================================================*/
/* Table: INTERACCIONES                                         */
/*==============================================================*/
create table INTERACCIONES (
   ID_INTERACCION       SERIAL               not null,
   ID_CLIENTE           INTEGER                 not null,
   ID_DOCUMENTO         INTEGER                 not null,
   INT_TIPO             DOM_INTERACCIONES    not null,
   INT_CANAL            DOM_CANALES_CONTACTO not null,
   INT_INCONVENIENTE    VARCHAR(200)         not null,
   INT_APERTURA         DATE                 not null,
   INT_CIERRE           DATE                 null,
   INT_ESTADO           DOM_INTERACCIONES    not null,
   constraint PK_INTERACCIONES primary key (ID_INTERACCION)
);

/*==============================================================*/
/* Index: REALIZA_FK                                            */
/*==============================================================*/
create  index REALIZA_FK on INTERACCIONES (
ID_CLIENTE
);

/*==============================================================*/
/* Index: REFERENCIA_FK                                         */
/*==============================================================*/
create  index REFERENCIA_FK on INTERACCIONES (
ID_DOCUMENTO
);

/*==============================================================*/
/* Table: INVENTARIO_BODEGAS                                    */
/*==============================================================*/
create table INVENTARIO_BODEGAS (
   ID_BODEGA            INTEGER                 not null,
   ID_VARIANTE          INTEGER                 not null,
   INV_PERIODO          CHAR(7)              not null,
   INV_SALDO_INICIAL    INTEGER                 not null,
   INV_QTY_INGRESOS     INTEGER                 not null,
   INV_QTY_EGRESOS      INTEGER                 not null,
   INV_QTY_AJUSTES      INTEGER                 not null,
   INV_SALDO_FINAL      INTEGER                 not null,
   constraint PK_INVENTARIO_BODEGAS primary key (ID_BODEGA, ID_VARIANTE, INV_PERIODO)
);

/*==============================================================*/
/* Index: INVENTARIO_BODEGAS2_FK                                */
/*==============================================================*/
create  index INVENTARIO_BODEGAS2_FK on INVENTARIO_BODEGAS (
ID_BODEGA
);

/*==============================================================*/
/* Index: INVENTARIO_BODEGAS_FK                                 */
/*==============================================================*/
create  index INVENTARIO_BODEGAS_FK on INVENTARIO_BODEGAS (
ID_VARIANTE
);

/*==============================================================*/
/* Table: LOGISTICA                                             */
/*==============================================================*/
create table LOGISTICA (
   ID_LOGISTICA         SERIAL               not null,
   ID_DIRECCION         INTEGER                 not null,
   ID_DOCUMENTO         INTEGER                 not null,
   LOG_DESPACHO         DATE                 not null,
   LOG_ESTIMADA         DATE                 not null,
   LOG_REAL             DATE                 null,
   LOG_ESTADO           DOM_ESTADO_LOG       not null,
   constraint PK_LOGISTICA primary key (ID_LOGISTICA)
);

/*==============================================================*/
/* Index: ENTREGA_FK                                            */
/*==============================================================*/
create  index ENTREGA_FK on LOGISTICA (
ID_DOCUMENTO
);

/*==============================================================*/
/* Index: DESPACHA_FK                                           */
/*==============================================================*/
create  index DESPACHA_FK on LOGISTICA (
ID_DIRECCION
);

/*==============================================================*/
/* Table: MARCAS                                                */
/*==============================================================*/
create table MARCAS (
   ID_MARCA             SERIAL               not null,
   MAR_NOMBRE           VARCHAR(60)          not null,
   MAR_ESTADO           CHAR(3)              not null,
   constraint PK_MARCAS primary key (ID_MARCA)
);

/*==============================================================*/
/* Table: MATERIALES                                            */
/*==============================================================*/
create table MATERIALES (
   ID_MATERIAL          SERIAL               not null,
   MAT_NOMBRE           VARCHAR(60)          not null,
   MAT_CUIDADOS         VARCHAR(200)         not null,
   MAT_ESTADO           CHAR(3)              not null,
   constraint PK_MATERIALES primary key (ID_MATERIAL)
);

/*==============================================================*/
/* Table: META                                                  */
/*==============================================================*/
create table META (
   ID_META              SERIAL               not null,
   ID_ROLPAGO2          VARCHAR(10)          null,
   ID_CONTRATO          INTEGER                 null,
   MET_OBJETIVO         NUMERIC(9,3)         not null,
   MET_ALCANZO          NUMERIC(9,3)         not null,
   MET_PORCENTAJE       NUMERIC(5,3)         not null,
   MET_ESTADO           CHAR(3)              not null,
   MET_OBSERVACION      CHAR(200)            not null,
   constraint PK_META primary key (ID_META)
);

/*==============================================================*/
/* Index: RELATIONSHIP_12_FK                                    */
/*==============================================================*/
create  index RELATIONSHIP_12_FK on META (
ID_CONTRATO
);

/*==============================================================*/
/* Index: RELATIONSHIP_13_FK                                    */
/*==============================================================*/
create  index RELATIONSHIP_13_FK on META (
ID_ROLPAGO2
);

/*==============================================================*/
/* Table: METODOSPAGO                                           */
/*==============================================================*/
create table METODOSPAGO (
   ID_METODOPAGO        SERIAL               not null,
   MPG_NOMBRE           CHAR(15)             not null,
   MPG_DIFERIDO         BOOLEAN                 not null,
   MPG_PLAZOS           INTEGER                 null,
   MPG_ESTADO           BOOLEAN                 not null,
   MPG_NUMERO_REFERENCIA BOOLEAN                 null,
   constraint PK_METODOSPAGO primary key (ID_METODOPAGO)
);

/*==============================================================*/
/* Table: PERCHA                                                */
/*==============================================================*/
create table PERCHA (
   ID_PERCHA            SERIAL               not null,
   ID_BODEGA            INTEGER                 not null,
   PER_NIVEL            CHAR(10)             not null,
   PER_CAPACIDAD        INTEGER                 not null,
   PER_DESCRIPCION      CHAR(100)            not null,
   PER_ESTADO           CHAR(3)              not null,
   constraint PK_PERCHA primary key (ID_PERCHA)
);

/*==============================================================*/
/* Index: TENER_FK                                              */
/*==============================================================*/
create  index TENER_FK on PERCHA (
ID_BODEGA
);

/*==============================================================*/
/* Table: PERIODO                                               */
/*==============================================================*/
create table PERIODO (
   ID_ROLPAGO2          VARCHAR(10)          not null,
   PER_DESCRIPCION      CHAR(100)            not null,
   PER_FECHAINICIO      DATE                 not null,
   PER_FECHAFIN         DATE                 not null,
   PER_ESTADO           CHAR(3)              not null,
   constraint PK_PERIODO primary key (ID_ROLPAGO2)
);

/*==============================================================*/
/* Table: PERMISOS                                              */
/*==============================================================*/
create table PERMISOS (
   ID_PERMISO           SERIAL               not null,
   ID_EMPLEADO          INTEGER                 not null,
   PER_FECHA_INICIO     DATE                 not null,
   PER_FECHA_FIN        DATE                 not null,
   PER_ESTADO           CHAR(3)              not null,
   PER_OBSERVACION      CHAR(50)             not null,
   constraint PK_PERMISOS primary key (ID_PERMISO)
);

/*==============================================================*/
/* Index: CONT_FK                                               */
/*==============================================================*/
create  index CONT_FK on PERMISOS (
ID_EMPLEADO
);

/*==============================================================*/
/* Table: PRODUCTOS                                             */
/*==============================================================*/
create table PRODUCTOS (
   ID_PRODUCTO          SERIAL               not null,
   ID_MARCA             INTEGER                 not null,
   ID_TEMPORADA         INTEGER                 not null,
   ID_UNIDADMEDIDA      INTEGER                 not null,
   ID_CATEGORIA         INTEGER                 not null,
   UNI_ID_UNIDADMEDIDA  INTEGER                 not null,
   ID_MATERIAL          INTEGER                 not null,
   PRO_DESCRIPCION      VARCHAR(50)          not null,
   PRO_FACTOR_CONVERSION_ INTEGER                 not null,
   PRO_VALOR_COMPRA     DECIMAL(7,3)         not null,
   PRO_GENERO_          CHAR(1)              not null,
   PRO_ESTADO           CHAR(3)              not null,
   PRO_IMAGEN          TEXT,
   constraint PK_PRODUCTOS primary key (ID_PRODUCTO)
);

/*==============================================================*/
/* Index: PERTENECE2_FK                                         */
/*==============================================================*/
create  index PERTENECE2_FK on PRODUCTOS (
ID_CATEGORIA
);

/*==============================================================*/
/* Index: EMPLEA_FK                                             */
/*==============================================================*/
create  index EMPLEA_FK on PRODUCTOS (
UNI_ID_UNIDADMEDIDA
);

/*==============================================================*/
/* Index: EMPLE_FK                                              */
/*==============================================================*/
create  index EMPLE_FK on PRODUCTOS (
ID_UNIDADMEDIDA
);

/*==============================================================*/
/* Index: RELATIONSHIP_25_FK                                    */
/*==============================================================*/
create  index RELATIONSHIP_25_FK on PRODUCTOS (
ID_MATERIAL
);

/*==============================================================*/
/* Index: RELATIONSHIP_28_FK                                    */
/*==============================================================*/
create  index RELATIONSHIP_28_FK on PRODUCTOS (
ID_MARCA
);

/*==============================================================*/
/* Index: RELATIONSHIP_29_FK                                    */
/*==============================================================*/
create  index RELATIONSHIP_29_FK on PRODUCTOS (
ID_TEMPORADA
);

/*==============================================================*/
/* Table: PRODUCTOSXDOCUMENTO                                   */
/*==============================================================*/
create table PRODUCTOSXDOCUMENTO (
   ID_DOCUMENTO         INTEGER                 not null,
   ID_VARIANTE          INTEGER                 not null,
   PXD_CANTIDAD         INTEGER                 not null,
   PXD_VALOR_UNITARIO   DECIMAL(10,2)        not null,
   PXD_VALOR_SUBTOTAL   DECIMAL(10,2)        not null,
   PXD_ESTADO           DOM_ESTADO_DOC       not null,
   constraint PK_PRODUCTOSXDOCUMENTO primary key (ID_DOCUMENTO, ID_VARIANTE)
);

/*==============================================================*/
/* Index: PRODUCTOSXDOCUMENTO_FK                                */
/*==============================================================*/
create  index PRODUCTOSXDOCUMENTO_FK on PRODUCTOSXDOCUMENTO (
ID_DOCUMENTO
);

/*==============================================================*/
/* Index: REF_PRODUCTOS_DOC_3_FK                                */
/*==============================================================*/
create  index REF_PRODUCTOS_DOC_3_FK on PRODUCTOSXDOCUMENTO (
ID_VARIANTE
);

/*==============================================================*/
/* Table: PRODUCTOSXLOGISTICA                                   */
/*==============================================================*/
create table PRODUCTOSXLOGISTICA (
   ID_LOGISTICA         INTEGER                 not null,
   ID_VARIANTE          INTEGER                 not null,
   PXL_CANTIDAD         INTEGER                 not null,
   PXL_ESTADO           CHAR(3)              not null,
   constraint PK_PRODUCTOSXLOGISTICA primary key (ID_LOGISTICA, ID_VARIANTE)
);

/*==============================================================*/
/* Index: PRODUCTOSXLOGISTICA_FK                                */
/*==============================================================*/
create  index PRODUCTOSXLOGISTICA_FK on PRODUCTOSXLOGISTICA (
ID_LOGISTICA
);

/*==============================================================*/
/* Index: REF_PRODUCTOS_LOG_3_FK                                */
/*==============================================================*/
create  index REF_PRODUCTOS_LOG_3_FK on PRODUCTOSXLOGISTICA (
ID_VARIANTE
);

/*==============================================================*/
/* Table: PROVEEDOR                                             */
/*==============================================================*/
create table PROVEEDOR (
   ID_PROVEEDOR         SERIAL               not null,
   ID_CIUDAD            INTEGER                 not null,
   PRV_NOMBRE           CHAR(40)             not null,
   PRV_CIRUC            CHAR(13)             not null,
   PRV_TELEFONO         CHAR(10)             not null,
   PRV_MAIL             CHAR(60)             not null,
   PRV_CELULAR          CHAR(10)             not null,
   PRV_DIRECCION        CHAR(60)             not null,
   PRV_ESTADO           CHAR(3)              not null,
   constraint PK_PROVEEDOR primary key (ID_PROVEEDOR)
);

/*==============================================================*/
/* Index: RELATIONSHIP_47_FK                                    */
/*==============================================================*/
create  index RELATIONSHIP_47_FK on PROVEEDOR (
ID_CIUDAD
);

/*==============================================================*/
/* Table: PROXAJU                                               */
/*==============================================================*/
create table PROXAJU (
   ID_VARIANTE          INTEGER                 not null,
   ID_AJUSTE            INTEGER                 not null,
   PXA_STOCK_SISTEMA    INTEGER                 not null,
   PXA_STOCK_FISICO_REAL INTEGER                 not null,
   PXA_QTY_AJUSTADA     INTEGER                 not null,
   PXA_TIPO_AJUSTE      CHAR(1)              not null,
   PXA_MOTIVO_AJUSTE    VARCHAR(100)         not null,
   PXA_ESTADO           CHAR(3)              not null,
   constraint PK_PROXAJU primary key (ID_VARIANTE, ID_AJUSTE)
);

/*==============================================================*/
/* Index: PRODUCTOSXAJUSTE_FK                                   */
/*==============================================================*/
create  index PRODUCTOSXAJUSTE_FK on PROXAJU (
ID_VARIANTE
);

/*==============================================================*/
/* Index: PRODUCTOSXAJUSTE2_FK                                  */
/*==============================================================*/
create  index PRODUCTOSXAJUSTE2_FK on PROXAJU (
ID_AJUSTE
);

/*==============================================================*/
/* Table: PROXDEVC                                              */
/*==============================================================*/
create table PROXDEVC (
   ID_VARIANTE          INTEGER                 not null,
   ID_DEVCOMPRA_PK      INTEGER                 not null,
   PXDC_CANTIDAD_RECIBIDA INTEGER                 not null,
   PXDC_CANTIDAD_DEVUELTA INTEGER                 not null,
   PXDC_DIFERENCIA      INTEGER                 not null,
   PXDC_MOTIVO          VARCHAR(100)         null,
   PXDC_ESTADO          CHAR(3)              not null,
   constraint PK_PROXDEVC primary key (ID_VARIANTE, ID_DEVCOMPRA_PK)
);

/*==============================================================*/
/* Index: PROXDEVC_FK                                           */
/*==============================================================*/
create  index PROXDEVC_FK on PROXDEVC (
ID_VARIANTE
);

/*==============================================================*/
/* Index: PROXDEVC2_FK                                          */
/*==============================================================*/
create  index PROXDEVC2_FK on PROXDEVC (
ID_DEVCOMPRA_PK
);

/*==============================================================*/
/* Table: PROXDEVEN                                             */
/*==============================================================*/
create table PROXDEVEN (
   ID_DEVOLUCION        INTEGER                 not null,
   ID_VARIANTE          INTEGER                 not null,
   PXDV_CANTIDAD_FACTURADA INTEGER                 not null,
   PXDV_CANTIDAD_DEVUELTA INTEGER                 not null,
   PXDV_DIFERENCIA      INTEGER                 not null,
   PXD_MOTIVO_DIFERENCIA VARCHAR(100)         null,
   PXDV_ESTADO          CHAR(3)              not null,
   constraint PK_PROXDEVEN primary key (ID_DEVOLUCION, ID_VARIANTE)
);

/*==============================================================*/
/* Index: PROXDEVEN_FK                                          */
/*==============================================================*/
create  index PROXDEVEN_FK on PROXDEVEN (
ID_DEVOLUCION
);

/*==============================================================*/
/* Index: PROXDEVEN2_FK                                         */
/*==============================================================*/
create  index PROXDEVEN2_FK on PROXDEVEN (
ID_VARIANTE
);

/*==============================================================*/
/* Table: PROXENT                                               */
/*==============================================================*/
create table PROXENT (
   ID_VARIANTE          INTEGER                 not null,
   ID_ENTREGA           INTEGER                 not null,
   PXE_CANTIDAD_FACTURADA INTEGER                 not null,
   PXE_QTY_ENTREGADA    INTEGER                 not null,
   PXE_DIFERENCIA       INTEGER                 null,
   PXE_MOTIVO_DIFERENCIA VARCHAR(100)         null,
   PXE_ESTADO           CHAR(3)              not null,
   constraint PK_PROXENT primary key (ID_VARIANTE, ID_ENTREGA)
);

/*==============================================================*/
/* Index: PRODUCTOSENTREGA_FK                                   */
/*==============================================================*/
create  index PRODUCTOSENTREGA_FK on PROXENT (
ID_VARIANTE
);

/*==============================================================*/
/* Index: PRODUCTOSENTREGA2_FK                                  */
/*==============================================================*/
create  index PRODUCTOSENTREGA2_FK on PROXENT (
ID_ENTREGA
);

/*==============================================================*/
/* Table: PROXOC                                                */
/*==============================================================*/
create table PROXOC (
   ID_COMPRA            INTEGER                 not null,
   ID_VARIANTE          INTEGER                 not null,
   PXO_CANTIDAD         INTEGER                 not null,
   PXO_VALOR            DECIMAL(9,2)         not null,
   PXO_SUBTOTAL         DECIMAL(9,2)         not null,
   PXO_ESTADO           CHAR(3)              not null,
   constraint PK_PROXOC primary key (ID_COMPRA, ID_VARIANTE)
);

/*==============================================================*/
/* Index: PROXOC_FK                                             */
/*==============================================================*/
create  index PROXOC_FK on PROXOC (
ID_COMPRA
);

/*==============================================================*/
/* Index: PROXOC2_FK                                            */
/*==============================================================*/
create  index PROXOC2_FK on PROXOC (
ID_VARIANTE
);

/*==============================================================*/
/* Table: PROXREC                                               */
/*==============================================================*/
create table PROXREC (
   ID_RECEPCION         INTEGER                 not null,
   ID_VARIANTE          INTEGER                 not null,
   PXR_CANTIDAD_SOLICITADA INTEGER                 not null,
   PXR_QTY_RECIBIDA     INTEGER                 not null,
   PXR_DIFERENCIA       INTEGER                 not null,
   PXR_MOTIVO_DIFERENCIA VARCHAR(100)         null,
   PXR_ESTADO           DOM_MOVIMIENTOESTADO not null,
   constraint PK_PROXREC primary key (ID_RECEPCION, ID_VARIANTE)
);

/*==============================================================*/
/* Index: PROXREC_FK                                            */
/*==============================================================*/
create  index PROXREC_FK on PROXREC (
ID_RECEPCION
);

/*==============================================================*/
/* Index: PROXREC2_FK                                           */
/*==============================================================*/
create  index PROXREC2_FK on PROXREC (
ID_VARIANTE
);

/*==============================================================*/
/* Table: RECEPCIONES                                           */
/*==============================================================*/
create table RECEPCIONES (
   ID_RECEPCION         SERIAL               not null,
   ID_COMPRA            INTEGER                 not null,
   ID_BODEGA            INTEGER                 not null,
   REC_DESCRIPCION      VARCHAR(100)         not null,
   REC_FECHAHORA        DATE                 not null,
   REC_NUM_PRODUCTOS    INTEGER                 not null,
   REC_FECHARESOLUCION  DATE                 null,
   USU_RESPONSABLE      VARCHAR(30)          not null,
   REC_ESTADO           CHAR(3)              not null,
   constraint PK_RECEPCIONES primary key (ID_RECEPCION)
);

/*==============================================================*/
/* Index: PROCESA_FK                                            */
/*==============================================================*/
create  index PROCESA_FK on RECEPCIONES (
ID_COMPRA
);

/*==============================================================*/
/* Index: RECEPTA_EN_FK                                         */
/*==============================================================*/
create  index RECEPTA_EN_FK on RECEPCIONES (
ID_BODEGA
);

/*==============================================================*/
/* Table: ROLPAGOS                                              */
/*==============================================================*/
create table ROLPAGOS (
   ID_ROL               SERIAL               not null,
   ID_ROLPAGO2          VARCHAR(10)          not null,
   ID_EMPLEADO          INTEGER                 not null,
   ROL_DESTOTAL         DECIMAL(9,3)         not null,
   ROL_BONTOTAL         DECIMAL(9,3)         not null,
   ROL_NETO             DECIMAL(9,3)         not null,
   ROL_ESTADO           CHAR(3)              not null,
   ROL_DIAS_TRABAJADOS  INTEGER                 not null,
   ROL_COMTOTAL         NUMERIC(9,3)         not null,
   constraint PK_ROLPAGOS primary key (ID_ROL)
);

/*==============================================================*/
/* Index: OBTIENE_FK                                            */
/*==============================================================*/
create  index OBTIENE_FK on ROLPAGOS (
ID_EMPLEADO
);

/*==============================================================*/
/* Index: ESTA_FK                                               */
/*==============================================================*/
create  index ESTA_FK on ROLPAGOS (
ID_ROLPAGO2
);

/*==============================================================*/
/* Table: RUBROS                                                */
/*==============================================================*/
create table RUBROS (
   ID_RUBROS            SERIAL               not null,
   RUB_DESCRIPCION      CHAR(100)            not null,
   RUB_ESTADO           CHAR(3)              not null,
   RUB_TIPO             BOOLEAN                 not null,
   RUB_CALCULABLE       BOOLEAN                 not null,
   constraint PK_RUBROS primary key (ID_RUBROS)
);

/*==============================================================*/
/* Table: RUBROSXROL                                            */
/*==============================================================*/
create table RUBROSXROL (
   ID_ROL               INTEGER                 not null,
   ID_RUBROS            INTEGER                 not null,
   DXE_CANTIDAD         DECIMAL(9,3)         not null,
   DXE_ESTADO           CHAR(3)              not null,
   constraint PK_RUBROSXROL primary key (ID_ROL, ID_RUBROS)
);

/*==============================================================*/
/* Index: RUBROSXROL_FK                                         */
/*==============================================================*/
create  index RUBROSXROL_FK on RUBROSXROL (
ID_ROL
);

/*==============================================================*/
/* Index: RUBROSXROL2_FK                                        */
/*==============================================================*/
create  index RUBROSXROL2_FK on RUBROSXROL (
ID_RUBROS
);

/*==============================================================*/
/* Table: TALLAS                                                */
/*==============================================================*/
create table TALLAS (
   ID_TALLA             SERIAL               not null,
   TAL_CODIGO           VARCHAR(5)           not null,
   TAL_DESCRIPCION      VARCHAR(40)          not null,
   TAL_SISTEMA          VARCHAR(3)           not null,
   TAL_ORDEN            INTEGER                 not null,
   TAL_ESTADO           CHAR(3)              not null,
   constraint PK_TALLAS primary key (ID_TALLA)
);

/*==============================================================*/
/* Table: TEMPORADAS                                            */
/*==============================================================*/
create table TEMPORADAS (
   ID_TEMPORADA         SERIAL               not null,
   TEM_NOMBRE           VARCHAR(60)          not null,
   TEM_FECHA_INICIO     DATE                 not null,
   TEM_FECHA_FIN        DATE                 not null,
   TEM_ESTADO           CHAR(3)              not null,
   constraint PK_TEMPORADAS primary key (ID_TEMPORADA)
);

/*==============================================================*/
/* Table: UBICACION_PRODUCTO                                    */
/*==============================================================*/
create table UBICACION_PRODUCTO (
   ID_PERCHA            INTEGER                 not null,
   ID_VARIANTE          INTEGER                 not null,
   UBI_FECHA_DESDE      DATE                 not null,
   UBI_FECHA_HASTA      DATE                 null,
   UBI_OBSERVACION      VARCHAR(100)         null,
   UBI_ESTADO           CHAR(3)              not null,
   constraint PK_UBICACION_PRODUCTO primary key (ID_PERCHA, ID_VARIANTE)
);

/*==============================================================*/
/* Index: UBICACION_PRODUCTO_FK                                 */
/*==============================================================*/
create  index UBICACION_PRODUCTO_FK on UBICACION_PRODUCTO (
ID_PERCHA
);

/*==============================================================*/
/* Index: UBICACION_PRODUCTO2_FK                                */
/*==============================================================*/
create  index UBICACION_PRODUCTO2_FK on UBICACION_PRODUCTO (
ID_VARIANTE
);

/*==============================================================*/
/* Table: UNIDAD_MEDIDA                                         */
/*==============================================================*/
create table UNIDAD_MEDIDA (
   ID_UNIDADMEDIDA      SERIAL               not null,
   UMD_ABREVIADO        CHAR(5)              not null,
   UMD_DESCRIPCION      VARCHAR(30)          not null,
   UM_ESTADO            CHAR(3)              not null,
   constraint PK_UNIDAD_MEDIDA primary key (ID_UNIDADMEDIDA)
);

/*==============================================================*/
/* Table: USUARIOS                                              */
/*==============================================================*/
create table USUARIOS (
   ID_USUARIO           SERIAL               not null,
   ID_EMPLEADO          INTEGER                 null,
   USU_NOMBRE           VARCHAR(30)          not null,
   USU_CLAVE            VARCHAR(60)          not null,
   USU_NOMBREREAL       VARCHAR(100)         not null,
   USU_ROL              CHAR(4)              not null,
   USU_ESTADO_          CHAR(3)              not null,
   constraint PK_USUARIOS primary key (ID_USUARIO)
);

/*==============================================================*/
/* Index: ASOCIAR2_FK                                           */
/*==============================================================*/
create  index ASOCIAR2_FK on USUARIOS (
ID_EMPLEADO
);

/*==============================================================*/
/* Table: VACACIONES                                            */
/*==============================================================*/
create table VACACIONES (
   ID_VACACION          SERIAL               not null,
   ID_CONTRATO          INTEGER                 not null,
   VAC_PERIODO          CHAR(10)             not null,
   VAC_DIASG            INTEGER                 not null,
   VAC_DIASP            INTEGER                 not null,
   VAC_SALDO            INTEGER                 not null,
   constraint PK_VACACIONES primary key (ID_VACACION)
);

/*==============================================================*/
/* Index: GOZA_FK                                               */
/*==============================================================*/
create  index GOZA_FK on VACACIONES (
ID_CONTRATO
);

/*==============================================================*/
/* Table: VARIANTES_PRODUCTO                                    */
/*==============================================================*/
create table VARIANTES_PRODUCTO (
   ID_VARIANTE          SERIAL               not null,
   ID_PRODUCTO          INTEGER                 not null,
   ID_COLOR             INTEGER                 not null,
   ID_TALLA             INTEGER                 not null,
   VAR_COD_BARRAS       VARCHAR(20)          not null,
   VAR_PRECIO_VENTA     NUMERIC(7,3)         not null,
   VAR_ESTADO           CHAR(3)              not null,
   constraint PK_VARIANTES_PRODUCTO primary key (ID_VARIANTE)
);

/*==============================================================*/
/* Index: RELATIONSHIP_24_FK                                    */
/*==============================================================*/
create  index RELATIONSHIP_24_FK on VARIANTES_PRODUCTO (
ID_PRODUCTO
);

/*==============================================================*/
/* Index: RELATIONSHIP_26_FK                                    */
/*==============================================================*/
create  index RELATIONSHIP_26_FK on VARIANTES_PRODUCTO (
ID_TALLA
);

/*==============================================================*/
/* Index: RELATIONSHIP_27_FK                                    */
/*==============================================================*/
create  index RELATIONSHIP_27_FK on VARIANTES_PRODUCTO (
ID_COLOR
);

/*==============================================================*/
/* Table: VENDEDORES                                            */
/*==============================================================*/
create table VENDEDORES (
   ID_VENDEDOR          SERIAL               not null
      constraint CKC_ID_VENDEDOR_VENDEDOR check (ID_VENDEDOR >= serial),
   ID_EMPLEADO          INTEGER                 not null,
   VEN_COMISION         DECIMAL(2,1)         not null,
   VEN_META             INTEGER                 not null,
   VEN_ESTADO           CHAR(3)              not null,
   constraint PK_VENDEDORES primary key (ID_VENDEDOR)
);

/*==============================================================*/
/* Index: ES_FK                                                 */
/*==============================================================*/
create  index ES_FK on VENDEDORES (
ID_EMPLEADO
);

alter table AJUSTES
   add constraint FK_AJUSTES_AJSUTA_EN_BODEGA foreign key (ID_BODEGA)
      references BODEGA (ID_BODEGA)
      on delete restrict on update restrict;

alter table ASISTENCIA
   add constraint FK_ASISTENC_HAY_EMPLEADO foreign key (ID_EMPLEADO)
      references EMPLEADOS (ID_EMPLEADO)
      on delete restrict on update restrict;

alter table CARGO
   add constraint FK_CARGO_CONTIENE_DEPARTAM foreign key (ID_DEPARTAMENTO)
      references DEPARTAMENTO (ID_DEPARTAMENTO)
      on delete restrict on update restrict;

alter table CLIENTES
   add constraint FK_CLIENTES_PERTENECE_CIUDAD foreign key (ID_CIUDAD)
      references CIUDAD (ID_CIUDAD)
      on delete restrict on update restrict;

alter table COMPRA
   add constraint FK_COMPRA_GENERA_PROVEEDO foreign key (ID_PROVEEDOR)
      references PROVEEDOR (ID_PROVEEDOR)
      on delete restrict on update restrict;

alter table CONTRATO
   add constraint FK_CONTRATO_PERTENECE_CARGO foreign key (ID_CARGO)
      references CARGO (ID_CARGO)
      on delete restrict on update restrict;

alter table CONTRATO
   add constraint FK_CONTRATO_TIENE_EMPLEADO foreign key (ID_EMPLEADO)
      references EMPLEADOS (ID_EMPLEADO)
      on delete restrict on update restrict;

alter table CUENTAS
   add constraint FK_CUENTAS_DISPONE_CATEGORI foreign key (ID_TIPOCUENTA3)
      references CATEGORIA_CUENTA (ID_TIPOCUENTA3)
      on delete restrict on update restrict;

alter table CUENTASXASIENTO
   add constraint FK_CUENTASX_CUENTASXA_CUENTAS foreign key (ID_CODIGOCUENTA3)
      references CUENTAS (ID_CODIGOCUENTA3)
      on delete restrict on update restrict;

alter table CUENTASXASIENTO
   add constraint FK_CUENTASX_CUENTASXA_ASIENTOS foreign key (ID_ASIENTOCONTABLE3)
      references ASIENTOS (ID_ASIENTOCONTABLE3)
      on delete restrict on update restrict;

alter table CUOTAS
   add constraint FK_CUOTAS_GENERAN_DOCUMENT foreign key (ID_DOCUMENTO)
      references DOCUMENTOS (ID_DOCUMENTO)
      on delete restrict on update restrict;

alter table DEPENDIENTES
   add constraint FK_DEPENDIE_MANTIENE2_EMPLEADO foreign key (ID_EMPLEADO)
      references EMPLEADOS (ID_EMPLEADO)
      on delete restrict on update restrict;

alter table DETALLEHORARIO
   add constraint FK_DETALLEH_TIEN_HORARIO foreign key (ID_HORARIO)
      references HORARIO (ID_HORARIO)
      on delete restrict on update restrict;

alter table DEVOLUCIONES_COMPRA
   add constraint FK_DEVOLUCI_CREA_COMPRA foreign key (ID_COMPRA)
      references COMPRA (ID_COMPRA)
      on delete restrict on update restrict;

alter table DEVOLUCIONES_COMPRA
   add constraint FK_DEVOLUCI_MANEJA_BODEGA foreign key (ID_BODEGA)
      references BODEGA (ID_BODEGA)
      on delete restrict on update restrict;

alter table DEVOLUCIONES_VENTAS
   add constraint FK_DEVOLUCI_ASOCIA_DOCUMENT foreign key (ID_DOCUMENTO)
      references DOCUMENTOS (ID_DOCUMENTO)
      on delete restrict on update restrict;

alter table DEVOLUCIONES_VENTAS
   add constraint FK_DEVOLUCI_SUFRE_BODEGA foreign key (ID_BODEGA)
      references BODEGA (ID_BODEGA)
      on delete restrict on update restrict;

alter table DIRECCIONES
   add constraint FK_DIRECCIO_RADICA_CIUDAD foreign key (ID_CIUDAD)
      references CIUDAD (ID_CIUDAD)
      on delete restrict on update restrict;

alter table DIRECCIONES
   add constraint FK_DIRECCIO_RESIDE_CLIENTES foreign key (ID_CLIENTE)
      references CLIENTES (ID_CLIENTE)
      on delete restrict on update restrict;

alter table DOCUMENTOS
   add constraint FK_DOCUMENT_CREA2_VENDEDOR foreign key (ID_VENDEDOR)
      references VENDEDORES (ID_VENDEDOR)
      on delete restrict on update restrict;

alter table DOCUMENTOS
   add constraint FK_DOCUMENT_REFIERE_DOCUMENT foreign key (DOC_ID_DOCUMENTO)
      references DOCUMENTOS (ID_DOCUMENTO)
      on delete restrict on update restrict;

alter table DOCUMENTOS
   add constraint FK_DOCUMENT_REGISTRA_CLIENTES foreign key (ID_CLIENTE)
      references CLIENTES (ID_CLIENTE)
      on delete restrict on update restrict;

alter table DOCUMENTOXPAGO
   add constraint FK_DOCUMENT_DOCUMENTO_DOCUMENT foreign key (ID_DOCUMENTO)
      references DOCUMENTOS (ID_DOCUMENTO)
      on delete restrict on update restrict;

alter table DOCUMENTOXPAGO
   add constraint FK_DOCUMENT_DOCUMENTO_METODOSP foreign key (ID_METODOPAGO)
      references METODOSPAGO (ID_METODOPAGO)
      on delete restrict on update restrict;

alter table ENTREGAS
   add constraint FK_ENTREGAS_ENTREGA_E_BODEGA foreign key (ID_BODEGA)
      references BODEGA (ID_BODEGA)
      on delete restrict on update restrict;

alter table ENTREGAS
   add constraint FK_ENTREGAS_GESTIONA_DOCUMENT foreign key (ID_DOCUMENTO)
      references DOCUMENTOS (ID_DOCUMENTO)
      on delete restrict on update restrict;

alter table HORARIOXEMPLEADO
   add constraint FK_HORARIOX_HORARIOXE_HORARIO foreign key (ID_HORARIO)
      references HORARIO (ID_HORARIO)
      on delete restrict on update restrict;

alter table HORARIOXEMPLEADO
   add constraint FK_HORARIOX_HORARIOXE_EMPLEADO foreign key (ID_EMPLEADO)
      references EMPLEADOS (ID_EMPLEADO)
      on delete restrict on update restrict;

alter table INTERACCIONES
   add constraint FK_INTERACC_REALIZA_CLIENTES foreign key (ID_CLIENTE)
      references CLIENTES (ID_CLIENTE)
      on delete restrict on update restrict;

alter table INTERACCIONES
   add constraint FK_INTERACC_REFERENCI_DOCUMENT foreign key (ID_DOCUMENTO)
      references DOCUMENTOS (ID_DOCUMENTO)
      on delete restrict on update restrict;

alter table INVENTARIO_BODEGAS
   add constraint FK_INVENTAR_INVENTARI_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table INVENTARIO_BODEGAS
   add constraint FK_INVENTAR_INVENTARI_BODEGA foreign key (ID_BODEGA)
      references BODEGA (ID_BODEGA)
      on delete restrict on update restrict;

alter table LOGISTICA
   add constraint FK_LOGISTIC_DESPACHA_DIRECCIO foreign key (ID_DIRECCION)
      references DIRECCIONES (ID_DIRECCION)
      on delete restrict on update restrict;

alter table LOGISTICA
   add constraint FK_LOGISTIC_ENTREGA_DOCUMENT foreign key (ID_DOCUMENTO)
      references DOCUMENTOS (ID_DOCUMENTO)
      on delete restrict on update restrict;

alter table META
   add constraint FK_META_RELATIONS_CONTRATO foreign key (ID_CONTRATO)
      references CONTRATO (ID_CONTRATO)
      on delete restrict on update restrict;

alter table META
   add constraint FK_META_RELATIONS_PERIODO foreign key (ID_ROLPAGO2)
      references PERIODO (ID_ROLPAGO2)
      on delete restrict on update restrict;

alter table PERCHA
   add constraint FK_PERCHA_TENER_BODEGA foreign key (ID_BODEGA)
      references BODEGA (ID_BODEGA)
      on delete restrict on update restrict;

alter table PERMISOS
   add constraint FK_PERMISOS_CONT_EMPLEADO foreign key (ID_EMPLEADO)
      references EMPLEADOS (ID_EMPLEADO)
      on delete restrict on update restrict;

alter table PRODUCTOS
   add constraint FK_PRODUCTO_EMPLE_UNIDAD_M foreign key (ID_UNIDADMEDIDA)
      references UNIDAD_MEDIDA (ID_UNIDADMEDIDA)
      on delete restrict on update restrict;

alter table PRODUCTOS
   add constraint FK_PRODUCTO_EMPLEA_UNIDAD_M foreign key (UNI_ID_UNIDADMEDIDA)
      references UNIDAD_MEDIDA (ID_UNIDADMEDIDA)
      on delete restrict on update restrict;

alter table PRODUCTOS
   add constraint FK_PRODUCTO_PERTENECE_CATEGORI foreign key (ID_CATEGORIA)
      references CATEGORIA (ID_CATEGORIA)
      on delete restrict on update restrict;

alter table PRODUCTOS
   add constraint FK_PRODUCTO_RELATIONS_MATERIAL foreign key (ID_MATERIAL)
      references MATERIALES (ID_MATERIAL)
      on delete restrict on update restrict;

alter table PRODUCTOS
   add constraint FK_PRODUCTO_RELATIONS_MARCAS foreign key (ID_MARCA)
      references MARCAS (ID_MARCA)
      on delete restrict on update restrict;

alter table PRODUCTOS
   add constraint FK_PRODUCTO_RELATIONS_TEMPORAD foreign key (ID_TEMPORADA)
      references TEMPORADAS (ID_TEMPORADA)
      on delete restrict on update restrict;

alter table PRODUCTOSXDOCUMENTO
   add constraint FK_PRODUCTO_PRODUCTOS_DOCUMENT foreign key (ID_DOCUMENTO)
      references DOCUMENTOS (ID_DOCUMENTO)
      on delete restrict on update restrict;

alter table PRODUCTOSXDOCUMENTO
   add constraint FK_PRODUCTO_REF_PRODU_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table PRODUCTOSXLOGISTICA
   add constraint FK_PRODUCTO_PRODUCTOS_LOGISTIC foreign key (ID_LOGISTICA)
      references LOGISTICA (ID_LOGISTICA)
      on delete restrict on update restrict;

alter table PRODUCTOSXLOGISTICA
   add constraint FK_PRODUCTO_REF_PRODU_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table PROVEEDOR
   add constraint FK_PROVEEDO_RELATIONS_CIUDAD foreign key (ID_CIUDAD)
      references CIUDAD (ID_CIUDAD)
      on delete restrict on update restrict;

alter table PROXAJU
   add constraint FK_PROXAJU_PRODUCTOS_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table PROXAJU
   add constraint FK_PROXAJU_PRODUCTOS_AJUSTES foreign key (ID_AJUSTE)
      references AJUSTES (ID_AJUSTE)
      on delete restrict on update restrict;

alter table PROXDEVC
   add constraint FK_PROXDEVC_PROXDEVC_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table PROXDEVC
   add constraint FK_PROXDEVC_PROXDEVC2_DEVOLUCI foreign key (ID_DEVCOMPRA_PK)
      references DEVOLUCIONES_COMPRA (ID_DEVCOMPRA_PK)
      on delete restrict on update restrict;

alter table PROXDEVEN
   add constraint FK_PROXDEVE_PROXDEVEN_DEVOLUCI foreign key (ID_DEVOLUCION)
      references DEVOLUCIONES_VENTAS (ID_DEVOLUCION)
      on delete restrict on update restrict;

alter table PROXDEVEN
   add constraint FK_PROXDEVE_PROXDEVEN_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table PROXENT
   add constraint FK_PROXENT_PRODUCTOS_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table PROXENT
   add constraint FK_PROXENT_PRODUCTOS_ENTREGAS foreign key (ID_ENTREGA)
      references ENTREGAS (ID_ENTREGA)
      on delete restrict on update restrict;

alter table PROXOC
   add constraint FK_PROXOC_PROXOC_COMPRA foreign key (ID_COMPRA)
      references COMPRA (ID_COMPRA)
      on delete restrict on update restrict;

alter table PROXOC
   add constraint FK_PROXOC_PROXOC2_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table PROXREC
   add constraint FK_PROXREC_PROXREC_RECEPCIO foreign key (ID_RECEPCION)
      references RECEPCIONES (ID_RECEPCION)
      on delete restrict on update restrict;

alter table PROXREC
   add constraint FK_PROXREC_PROXREC2_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table RECEPCIONES
   add constraint FK_RECEPCIO_PROCESA_COMPRA foreign key (ID_COMPRA)
      references COMPRA (ID_COMPRA)
      on delete restrict on update restrict;

alter table RECEPCIONES
   add constraint FK_RECEPCIO_RECEPTA_E_BODEGA foreign key (ID_BODEGA)
      references BODEGA (ID_BODEGA)
      on delete restrict on update restrict;

alter table ROLPAGOS
   add constraint FK_ROLPAGOS_ESTA_PERIODO foreign key (ID_ROLPAGO2)
      references PERIODO (ID_ROLPAGO2)
      on delete restrict on update restrict;

alter table ROLPAGOS
   add constraint FK_ROLPAGOS_OBTIENE_EMPLEADO foreign key (ID_EMPLEADO)
      references EMPLEADOS (ID_EMPLEADO)
      on delete restrict on update restrict;

alter table RUBROSXROL
   add constraint FK_RUBROSXR_RUBROSXRO_ROLPAGOS foreign key (ID_ROL)
      references ROLPAGOS (ID_ROL)
      on delete restrict on update restrict;

alter table RUBROSXROL
   add constraint FK_RUBROSXR_RUBROSXRO_RUBROS foreign key (ID_RUBROS)
      references RUBROS (ID_RUBROS)
      on delete restrict on update restrict;

alter table UBICACION_PRODUCTO
   add constraint FK_UBICACIO_UBICACION_PERCHA foreign key (ID_PERCHA)
      references PERCHA (ID_PERCHA)
      on delete restrict on update restrict;

alter table UBICACION_PRODUCTO
   add constraint FK_UBICACIO_UBICACION_VARIANTE foreign key (ID_VARIANTE)
      references VARIANTES_PRODUCTO (ID_VARIANTE)
      on delete restrict on update restrict;

alter table USUARIOS
   add constraint FK_USUARIOS_ASOCIAR2_EMPLEADO foreign key (ID_EMPLEADO)
      references EMPLEADOS (ID_EMPLEADO)
      on delete restrict on update restrict;

alter table VACACIONES
   add constraint FK_VACACION_GOZA_CONTRATO foreign key (ID_CONTRATO)
      references CONTRATO (ID_CONTRATO)
      on delete restrict on update restrict;

alter table VARIANTES_PRODUCTO
   add constraint FK_VARIANTE_RELATIONS_PRODUCTO foreign key (ID_PRODUCTO)
      references PRODUCTOS (ID_PRODUCTO)
      on delete restrict on update restrict;

alter table VARIANTES_PRODUCTO
   add constraint FK_VARIANTE_RELATIONS_TALLAS foreign key (ID_TALLA)
      references TALLAS (ID_TALLA)
      on delete restrict on update restrict;

alter table VARIANTES_PRODUCTO
   add constraint FK_VARIANTE_RELATIONS_COLORES foreign key (ID_COLOR)
      references COLORES (ID_COLOR)
      on delete restrict on update restrict;

alter table VENDEDORES
   add constraint FK_VENDEDOR_ES_EMPLEADO foreign key (ID_EMPLEADO)
      references EMPLEADOS (ID_EMPLEADO)
      on delete restrict on update restrict;
