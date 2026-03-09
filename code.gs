/**
 * Sirve la interfaz de usuario al acceder a la URL de la Web App.
 * Este script solo se encarga de mostrar el formulario generador.
 *
 * REQUISITO DE DESPLIEGUE:
 * - "Ejecutar como": Yo (el propietario del script)
 * - "Quién puede acceder": Cualquier usuario con cuenta de Google
 *
 * Con "Ejecutar como: Yo", el script siempre se ejecuta con los permisos
 * del propietario. La autorización de cada usuario se gestiona aquí dentro,
 * mostrando la página de acceso restringido si no está en AUTHORIZED_USERS_DATA.
 */
function doGet() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const adminEmail = scriptProperties.getProperty('ADMIN_EMAIL') || '';

  try {
    const userEmail = Session.getActiveUser().getEmail();

    // Si el email está vacío, el usuario no está logueado o no tiene sesión activa.
    // En ese caso, siempre mostramos la página de no autorizado.
    if (!userEmail) {
      const template = HtmlService.createTemplateFromFile('unauthorized_static_page');
      template.userEmail = 'desconocido';
      template.ADMIN_EMAIL = adminEmail;
      return template.evaluate()
        .setTitle('Acceso Restringido')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // Carga los datos de los usuarios autorizados desde las propiedades del script.
    const authorizedUsersDataString = scriptProperties.getProperty('AUTHORIZED_USERS_DATA') || '{}';
    const authorizedUsers = JSON.parse(authorizedUsersDataString);

    if (!authorizedUsers.hasOwnProperty(userEmail)) {
      const template = HtmlService.createTemplateFromFile('unauthorized_static_page');
      template.userEmail = userEmail;
      template.ADMIN_EMAIL = adminEmail;
      return template.evaluate()
        .setTitle('Acceso Restringido')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // Crea una plantilla a partir del HTML para poder pasarle variables.
    const template = HtmlService.createTemplateFromFile('generador');
    template.techId = userEmail;
    template.techniciansData = authorizedUsersDataString;

    return template.evaluate()
        .setTitle('Generador de Emails de Soporte')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (e) {
    // Fallback de seguridad: si ocurre cualquier error inesperado,
    // mostramos la página de no autorizado en lugar de un error de Drive.
    Logger.log('Error en doGet: ' + e.toString());
    const template = HtmlService.createTemplateFromFile('unauthorized_static_page');
    template.userEmail = 'desconocido';
    template.ADMIN_EMAIL = adminEmail;
    return template.evaluate()
      .setTitle('Acceso Restringido')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}