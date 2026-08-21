// Panel compartido del instructor (topbar + sidebar), estilo SofiaPlus.
// Un solo lugar para mantener el menú: cualquier cambio aquí se refleja en todas las páginas.

const GRUPOS_MENU = [
  {
    icono: '📋',
    titulo: 'Fichas',
    items: [
      { texto: 'Mis fichas', href: 'dashboard.html', id: 'dashboard' },
      { texto: '+ Crear ficha', href: 'crear-ficha.html', id: 'crear-ficha' },
    ],
  },
  {
    icono: '📊',
    titulo: 'Seguimiento',
    items: [
      { texto: 'Asistencia', href: 'asistencia.html', id: 'asistencia' },
      { texto: 'Calificaciones', href: 'calificaciones.html', id: 'calificaciones' },
      { texto: 'Reportes', href: 'reportes.html', id: 'reportes' },
      { texto: 'Llamado de Atención', href: 'llamado-atencion.html', id: 'llamado-atencion' },
      {
        texto: 'Plan de Mejoramiento',
        subitems: [
          { texto: 'Académico', href: 'https://aramis8984.github.io/llamado-atencion-sena/?ir=plan-academico' },
          { texto: 'Disciplinario', href: 'https://aramis8984.github.io/llamado-atencion-sena/?ir=plan-disciplinario' },
        ],
      },
    ],
  },
  {
    icono: '📚',
    titulo: 'Formación',
    items: [
      { texto: 'Material', href: 'material.html', id: 'material' },
      { texto: 'Exámenes', href: 'examenes.html', id: 'examenes' },
      { texto: 'Foro', href: 'foro.html', id: 'foro' },
    ],
  },
  {
    icono: '📝',
    titulo: 'Solicitudes',
    items: [
      { texto: 'Justificaciones', href: 'solicitudes.html', id: 'solicitudes' },
    ],
  },
];

// Dibuja un item del menú: link normal, link externo (nueva pestaña), o submenú expandible con sub-links
function renderItemMenu(item, paginaActiva) {
  if (item.subitems) {
    return `
      <div class="panel-subgrupo">
        <button type="button" class="panel-item panel-item-expandible" onclick="alternarSubmenu(this)">
          <span>${item.texto}</span>
          <span class="panel-chevron-sub">▸</span>
        </button>
        <div class="panel-subitems">
          ${item.subitems.map(si => `<a href="${si.href}" target="_blank" rel="noopener" class="panel-item panel-subitem">${si.texto}</a>`).join('')}
        </div>
      </div>
    `;
  }
  const atributosExterno = item.externo ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${item.href}"${atributosExterno} class="panel-item ${item.id === paginaActiva ? 'activo' : ''}">${item.texto}</a>`;
}

function alternarSubmenu(boton) {
  boton.parentElement.classList.toggle('abierto');
}

// paginaActiva: el id de la página actual (ej. 'asistencia'), para resaltarla y abrir su grupo
function montarPanelInstructor(paginaActiva) {
  const grupoActivo = GRUPOS_MENU.find(g => g.items.some(i => i.id === paginaActiva));

  const html = `
    <div class="panel-topbar">
      <button type="button" class="panel-hamburguesa" id="btn-hamburguesa" aria-label="Abrir menú">☰</button>
      <div class="panel-marca">Aula<span>SENA</span></div>
      <div class="panel-topbar-derecha">
        <span class="panel-usuario" id="panel-nombre-usuario">Instructor</span>
        <button type="button" class="panel-btn-salir" onclick="cerrarSesionInstructor()">Salir ⏻</button>
      </div>
    </div>
    <div class="panel-fondo-movil" id="panel-fondo-movil"></div>
    <div class="panel-body">
      <aside class="panel-sidebar" id="panel-sidebar">
        <div class="panel-selector-ficha">
          <select id="panel-select-ficha" onchange="if(this.value) window.location.href='ficha-detalle.html?id='+this.value;">
            <option value="">Selecciona una ficha</option>
          </select>
        </div>
        ${GRUPOS_MENU.map((g, i) => `
          <div class="panel-grupo ${grupoActivo === g ? 'abierto' : ''}">
            <button type="button" class="panel-grupo-titulo" onclick="alternarGrupoMenu(this)">
              <span class="panel-icono">✏️</span>
              <span class="panel-grupo-texto">${g.titulo}</span>
              <span class="panel-chevron">▸</span>
            </button>
            <div class="panel-grupo-items">
              ${g.items.map(item => renderItemMenu(item, paginaActiva)).join('')}
            </div>
          </div>
        `).join('')}
      </aside>
      <div class="panel-contenido" id="panel-contenido"></div>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', html);

  // Mueve todo lo que ya estaba en el body (el contenido original de la página) dentro del área de contenido
  const contenido = document.getElementById('panel-contenido');
  const nodosOriginales = Array.from(document.body.childNodes).filter(nodo => {
    return !(nodo.nodeType === 1 && (nodo.classList?.contains('panel-topbar') || nodo.classList?.contains('panel-body') || nodo.classList?.contains('panel-fondo-movil')));
  });
  nodosOriginales.forEach(nodo => {
    if (nodo.nodeType === 1 && (nodo.tagName === 'SCRIPT')) return; // los scripts se ejecutan solos, no hace falta moverlos
    contenido.appendChild(nodo);
  });

  // Menú hamburguesa (móvil)
  const sidebar = document.getElementById('panel-sidebar');
  const fondo = document.getElementById('panel-fondo-movil');
  document.getElementById('btn-hamburguesa').addEventListener('click', () => {
    sidebar.classList.toggle('abierto-movil');
    fondo.classList.toggle('visible');
  });
  fondo.addEventListener('click', () => {
    sidebar.classList.remove('abierto-movil');
    fondo.classList.remove('visible');
  });

  mostrarNombreInstructor();
  cargarSelectorFichas();
}

async function cargarSelectorFichas() {
  const select = document.getElementById('panel-select-ficha');
  if (!select) return;
  const { data: fichas, error } = await supabaseClient
    .from('fichas')
    .select('id, numero_ficha, nombre_grupo')
    .order('created_at', { ascending: false });

  if (error || !fichas) return;

  const parametros = new URLSearchParams(window.location.search);
  const idActual = parametros.get('id') || parametros.get('ficha');

  fichas.forEach(f => {
    const opcion = document.createElement('option');
    opcion.value = f.id;
    opcion.textContent = `${f.numero_ficha}${f.nombre_grupo ? ' — ' + f.nombre_grupo : ''}`;
    if (f.id === idActual) opcion.selected = true;
    select.appendChild(opcion);
  });
}

function alternarGrupoMenu(boton) {
  boton.parentElement.classList.toggle('abierto');
}

async function mostrarNombreInstructor() {
  try {
    const { data } = await supabaseClient.auth.getUser();
    const correo = data?.user?.email;
    if (correo) document.getElementById('panel-nombre-usuario').textContent = correo.split('@')[0];
  } catch (e) { /* silencioso: si falla, se queda "Instructor" */ }
}
