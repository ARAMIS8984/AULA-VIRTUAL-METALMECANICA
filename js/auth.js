// AulaSENA - auth.js
// Maneja login de instructor (Supabase Auth) y acceso de aprendiz (ficha + documento).

function cambiarRol(rol) {
  const esInstructor = rol === 'instructor';
  document.getElementById('btn-rol-instructor').classList.toggle('activo', esInstructor);
  document.getElementById('btn-rol-aprendiz').classList.toggle('activo', !esInstructor);
  document.getElementById('form-instructor').classList.toggle('oculto', !esInstructor);
  document.getElementById('form-aprendiz').classList.toggle('oculto', esInstructor);
  ocultarError();
}

function mostrarError(texto) {
  const el = document.getElementById('mensaje-error');
  el.textContent = texto;
  el.classList.add('visible');
}

function ocultarError() {
  const el = document.getElementById('mensaje-error');
  el.classList.remove('visible');
}

async function iniciarSesionInstructor(evento) {
  evento.preventDefault();
  ocultarError();

  const email = document.getElementById('email-instructor').value.trim();
  const clave = document.getElementById('clave-instructor').value;
  const boton = document.getElementById('btn-instructor');

  boton.disabled = true;
  boton.textContent = 'Ingresando...';

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: clave });

  if (error) {
    mostrarError('Correo o contraseña incorrectos.');
    boton.disabled = false;
    boton.textContent = 'Ingresar';
    return false;
  }

  window.location.href = 'instructor/dashboard.html';
  return false;
}

async function iniciarSesionAprendiz(evento) {
  evento.preventDefault();
  ocultarError();

  const numeroFicha = document.getElementById('ficha-aprendiz').value.trim();
  const numeroDocumento = document.getElementById('documento-aprendiz').value.trim();
  const boton = document.getElementById('btn-aprendiz');

  boton.disabled = true;
  boton.textContent = 'Ingresando...';

  // Buscar la ficha
  const { data: ficha, error: errorFicha } = await supabaseClient
    .from('fichas')
    .select('id, numero_ficha, programa')
    .eq('numero_ficha', numeroFicha)
    .single();

  if (errorFicha || !ficha) {
    mostrarError('No se encontró esa ficha. Verifica el número.');
    boton.disabled = false;
    boton.textContent = 'Ingresar';
    return false;
  }

  // Buscar el aprendiz dentro de esa ficha
  const { data: aprendiz, error: errorAprendiz } = await supabaseClient
    .from('aprendices')
    .select('id, nombre_completo, numero_documento')
    .eq('ficha_id', ficha.id)
    .eq('numero_documento', numeroDocumento)
    .single();

  if (errorAprendiz || !aprendiz) {
    mostrarError('No se encontró tu documento en esa ficha. Verifica los datos.');
    boton.disabled = false;
    boton.textContent = 'Ingresar';
    return false;
  }

  // Guardar sesión simple de aprendiz (no usa Supabase Auth)
  sessionStorage.setItem('aulasena_aprendiz', JSON.stringify({
    id: aprendiz.id,
    nombre: aprendiz.nombre_completo,
    ficha_id: ficha.id,
    numero_ficha: ficha.numero_ficha,
    programa: ficha.programa,
  }));

  window.location.href = 'aprendiz/perfil.html';
  return false;
}

// --- Protección de páginas ---

// Llamar al cargar cualquier página del instructor
async function requerirSesionInstructor() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = '../index.html';
  }
}

// Llamar al cargar cualquier página del aprendiz
function requerirSesionAprendiz() {
  const datos = sessionStorage.getItem('aulasena_aprendiz');
  if (!datos) {
    window.location.href = '../index.html';
    return null;
  }
  return JSON.parse(datos);
}

async function cerrarSesionInstructor() {
  await supabaseClient.auth.signOut();
  window.location.href = '../index.html';
}

function cerrarSesionAprendiz() {
  sessionStorage.removeItem('aulasena_aprendiz');
  window.location.href = '../index.html';
}
