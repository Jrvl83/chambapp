        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
        import { getFirestore, collection, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

                // Mostrar aplicaciones
                container.style.display = 'flex';
                let totalPendientes = 0;

                querySnapshot.forEach((doc) => {
                    const aplicacion = doc.data();
                    if (aplicacion.estado === 'pendiente') totalPendientes++;

                    const card = crearAplicacionCard(aplicacion, doc.id);
                    container.innerHTML += card;
                });

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

        function crearAplicacionCard(aplicacion, id) {
            const estadoBadge = `<span class="badge ${aplicacion.estado}">${aplicacion.estado.toUpperCase()}</span>`;
            
            return `
                <div class="aplicacion-card">
                    <div class="aplicacion-header">
                        <div>
                            <div class="aplicacion-titulo">👤 ${aplicacion.aplicanteNombre}</div>
                            <div class="aplicacion-oferta">Para: "${aplicacion.ofertaTitulo}"</div>
                        </div>
                        ${estadoBadge}
                    </div>

                    <div class="aplicacion-info">
                        <div class="info-item">
                            <span class="info-label">📧 Email</span>
                            <span class="info-value">${aplicacion.aplicanteEmail}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">📱 Teléfono</span>
                            <span class="info-value">${aplicacion.aplicanteTelefono}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">🏷️ Categoría</span>
                            <span class="info-value">${aplicacion.ofertaCategoria}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">📅 Fecha</span>
                            <span class="info-value">Reciente</span>
                        </div>
                    </div>

                    <div class="aplicacion-mensaje">
                        <strong>💬 Mensaje:</strong><br>
                        ${aplicacion.mensaje}
                    </div>

                    <div class="aplicacion-actions">
                        <a href="tel:${aplicacion.aplicanteTelefono}" class="btn btn-primary">📞 Llamar</a>
                        <a href="mailto:${aplicacion.aplicanteEmail}" class="btn btn-success">📧 Email</a>
                    </div>
                </div>
            `;
        }
