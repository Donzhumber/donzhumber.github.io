/**
 * GOOGLE APPS SCRIPT - REGISTRO PRIVADO DE VISITAS CV HUMBERTO BERNAL
 * 
 * GUÍA DE INSTALACIÓN EN 2 MINUTOS:
 * 1. Entra a Google Drive (https://drive.google.com) y crea una nueva "Hoja de cálculo de Google".
 * 2. Nómbrala: "CV_Visitor_Log".
 * 3. En la fila 1 escribe estos encabezados:
 *    A1: Fecha y Hora | B1: País | C1: Ciudad | D1: IP | E1: Dispositivo | F1: Referrer | G1: Timestamp
 * 4. En el menú superior de la hoja: ve a "Extensiones" > "Apps Script".
 * 5. Borra el código de ejemplo y pega TODO este archivo.
 * 6. Haz clic en el botón azul arriba a la derecha: "Implementar" > "Nueva implementación".
 * 7. En el icono de engranaje elige "Aplicación web":
 *    - Descripción: "CV Visitor Webhook"
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquier persona" (para que las visitas se puedan registrar).
 * 8. Haz clic en "Implementar", autoriza el acceso con tu cuenta de Google y copia la "URL de la aplicación web".
 * 9. Pega esa URL en tu index.html en la variable GOOGLE_SHEET_WEBHOOK_URL.
 */

var SECRET_PIN = "2026"; // Puedes cambiar este PIN por la clave que prefieras

// RECIBE VISITAS (POST) - Se ejecuta automáticamente cada vez que alguien abre tu CV
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    
    var fechaActual = data.date || Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");
    
    sheet.appendRow([
      fechaActual,
      data.country || "Desconocido",
      data.city || "Desconocida",
      data.ip || "",
      data.userAgent || "",
      data.referrer || "Directo",
      new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// CONSULTA VISITAS (GET) - Solo te responde a TI cuando ingresas el PIN correcto en tu CV
function doGet(e) {
  try {
    var pin = (e && e.parameter && e.parameter.pin) ? e.parameter.pin : "";
    if (pin !== SECRET_PIN) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Acceso denegado. PIN incorrecto." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var results = [];
    
    // Leer en orden inverso (las visitas más recientes arriba)
    for (var i = rows.length - 1; i >= 1; i--) {
      if (rows[i][0]) {
        results.push({
          date: rows[i][0],
          country: rows[i][1],
          city: rows[i][2],
          ip: rows[i][3],
          device: rows[i][4],
          referrer: rows[i][5]
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: results.length, data: results }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
