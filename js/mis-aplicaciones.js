        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
        import { getFirestore, collection, query, where, getDocs, orderBy, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

        // Inicializar Firebase
        const app = initializeApp(window.firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Verificar que el usuario este logueado
        const usuarioStr = localStorage.getItem('usuarioChambApp');
        if (!usuarioStr) {
            if (typeof toastError === 'function') {
                toastError('Debes iniciar sesion');
                setTimeout(() => window.location.href = 'login.html', 1000);
            } else {
                alert('Debes iniciar sesion');
                window.location.href = 'login.html';
            }
        }

        const usuario = JSON.parse(usuarioStr || '{}');

        // Verificar que sea empleador
        if (usuario.tipo !== 'empleador') {
            if (typeof toastError === 'function') {
                toastError('Solo los empleadores pueden ver aplicaciones');
                setTimeout(() => window.location.href = 'dashboard.html', 1000);
            } else {
                alert('Solo los empleadores pueden ver aplicaciones');
                window.location.href = 'dashboard.html';
            }
        }

        cargarAplicaciones();

        async function cargarAplicaciones() {
            try {
                // Obtener aplicaciones del empleador
                const q = query(
                    collection(db, 'aplicaciones'),
                    where('empleadorEmail', '==', usuario.email)
                );

                const querySnapshot = await getDocs(q);

                const loading = document.getElementById('loading');
                const container = document.getElementById('aplicaciones-container');
                const emptyState = document.getElementById('empty-state');

                loading.style.display = 'none';

                if (querySnapshot.empty) {
                    emptyState.style.display = 'block';
                    document.getElementById('total-aplicaciones').textContent = '0';
                    document.getElementById('pendientes').textContent = '0';
                    return;
                }

                // Agrupar aplicaciones por oferta
                const aplicacionesPorOferta = {};
                let totalPendientes = 0;

                querySnapshot.forEach((docSnap) => {
                    const aplicacion = docSnap.data();
                    aplicacion.id = docSnap.id;

                    if (aplicacion.estado === 'pendiente') totalPendientes++;

                    // Agrupar por ofertaId
                    const ofertaId = aplicacion.ofertaId || 'sin-oferta';
                    if (!aplicacionesPorOferta[ofertaId]) {
                        aplicacionesPorOferta[ofertaId] = {
                            titulo: aplicacion.ofertaTitulo || 'Oferta sin título',
                            categoria: aplicacion.ofertaCategoria || '',
                            aplicaciones: []
                        };
                    }
                    aplicacionesPorOferta[ofertaId].aplicaciones.push(aplicacion);
                });

                // Mostrar aplicaciones agrupadas
                container.style.display = 'flex';
                container.innerHTML = '';

                for (const ofertaId in aplicacionesPorOferta) {
                    const grupo = aplicacionesPorOferta[ofertaId];
                    container.innerHTML += crearGrupoOferta(ofertaId, grupo);
                }

                // Actualizar estadísticas
                document.getElementById('total-aplicaciones').textContent = querySnapshot.size;
                document.getElementById('pendientes').textContent = totalPendientes;

                // Contar ofertas activas
                const ofertasQuery = query(
                    collection(db, 'ofertas'),
                    where('empleadorEmail', '==', usuario.email)
                );
                const ofertasSnapshot = await getDocs(ofertasQuery);
                document.getElementById('ofertas-activas').textContent = ofertasSnapshot.size;

            } catch (error) {
                console.error('Error al cargar aplicaciones:', error);
                document.getElementById('loading').innerHTML = `
                    <div class="icon" style="font-size: 3rem;">❌</div>
                    <p style="color: #ef4444;">Error al cargar las aplicaciones</p>
                `;
            }
        }

        function crearGrupoOferta(ofertaId, grupo) {
            const categoriaLabel = getCategoriaLabel(grupo.categoria);
            const cantidadAplicantes = grupo.aplicaciones.length;

            let aplicacionesHTML = '';
            grupo.aplicaciones.forEach(aplicacion => {
                aplicacionesHTML += crearAplicacionCard(aplicacion);
            });

            return `
                <div class="oferta-grupo">
                    <div class="oferta-grupo-header">
                        <div class="oferta-grupo-info">
                            <h3 class="oferta-grupo-titulo">📋 ${grupo.titulo}</h3>
                            <div class="oferta-grupo-meta">
                                <span class="oferta-categoria-badge">${categoriaLabel}</span>
                                <span class="oferta-aplicantes-count">👥 ${cantidadAplicantes} postulante${cantidadAplicantes !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                    <div class="oferta-grupo-aplicaciones">
                        ${aplicacionesHTML}
                    </div>
                </div>
            `;
        }

        function crearAplicacionCard(aplicacion) {
            const estadoBadge = `<span class="badge ${aplicacion.estado || 'pendiente'}">${(aplicacion.estado || 'pendiente').toUpperCase()}</span>`;

            // Manejar campos que pueden estar undefined
            const telefono = aplicacion.aplicanteTelefono || null;
            const email = aplicacion.aplicanteEmail || 'No disponible';
            const nombre = aplicacion.aplicanteNombre || 'Trabajador';
            const mensaje = aplicacion.mensaje || 'Sin mensaje';
            const fecha = formatearFecha(aplicacion.fechaAplicacion);

            // Botones de contacto
            let botonesContacto = '';
            if (telefono) {
                botonesContacto += `<a href="tel:${telefono}" class="btn btn-primary btn-sm">📞 Llamar</a>`;
            }
            if (email && email !== 'No disponible') {
                botonesContacto += `<a href="mailto:${email}" class="btn btn-success btn-sm">📧 Email</a>`;
            }

            return `
                <div class="aplicacion-card">
                    <div class="aplicacion-header">
                        <div class="aplicacion-trabajador">
                            <div class="aplicacion-avatar">👤</div>
                            <div>
                                <div class="aplicacion-nombre">${nombre}</div>
                                <div class="aplicacion-email">${email}</div>
                            </div>
                        </div>
                        ${estadoBadge}
                    </div>

                    <div class="aplicacion-info">
                        ${telefono ? `
                        <div class="info-item">
                            <span class="info-label">📱 Teléfono</span>
                            <span class="info-value">${telefono}</span>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <span class="info-label">📅 Fecha postulación</span>
                            <span class="info-value">${fecha}</span>
                        </div>
                    </div>

                    <div class="aplicacion-mensaje">
                        <strong>💬 Mensaje del postulante:</strong><br>
                        ${mensaje}
                    </div>

                    <div class="aplicacion-actions">
                        ${botonesContacto || '<span class="sin-contacto">Sin datos de contacto disponibles</span>'}
                    </div>
                </div>
            `;
        }

        function getCategoriaLabel(categoria) {
            const labels = {
                'construccion': '🏗️ Construcción',
                'electricidad': '⚡ Electricidad',
                'gasfiteria': '🔧 Gasfitería',
                'pintura': '🎨 Pintura',
                'carpinteria': '🪵 Carpintería',
                'limpieza': '🧹 Limpieza',
                'jardineria': '🌿 Jardinería',
                'mecanica': '🔩 Mecánica',
                'otros': '📦 Otros'
            };
            return labels[categoria] || categoria || '📦 Sin categoría';
        }

        function formatearFecha(timestamp) {
            if (!timestamp) return 'Reciente';

            try {
                const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
                const ahora = new Date();
                const diff = ahora - fecha;
                const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

                if (dias === 0) return 'Hoy';
                if (dias === 1) return 'Ayer';
                if (dias < 7) return `Hace ${dias} días`;

                return fecha.toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            } catch (error) {
                return 'Reciente';
            }
        }
