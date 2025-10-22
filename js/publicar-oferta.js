        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
        import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

        // Inicializar Firebase
        const app = initializeApp(window.firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Verificar que el usuario esté logueado
        const usuarioStr = localStorage.getItem('usuarioChambApp');
        if (!usuarioStr) {
            alert('Debes iniciar sesión para publicar ofertas');
            window.location.href = 'login.html';
        }

        const usuario = JSON.parse(usuarioStr);

        // Verificar que sea empleador
        if (usuario.tipo !== 'empleador') {
            alert('Solo los empleadores pueden publicar ofertas');
            window.location.href = 'dashboard.html';
        }

        const formOferta = document.getElementById('formOferta');
        const mensaje = document.getElementById('mensaje');

        formOferta.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titulo = document.getElementById('titulo').value;
            const categoria = document.getElementById('categoria').value;
            const descripcion = document.getElementById('descripcion').value;
            const ubicacion = document.getElementById('ubicacion').value;
            const salario = document.getElementById('salario').value;
            const duracion = document.getElementById('duracion').value;
            const horario = document.getElementById('horario').value;

            try {
                // Guardar oferta en Firestore
                const oferta = {
                    titulo: titulo,
                    categoria: categoria,
                    descripcion: descripcion,
                    ubicacion: ubicacion,
                    salario: salario,
                    duracion: duracion || 'No especificada',
                    horario: horario || 'No especificado',
                    empleadorId: auth.currentUser?.uid || 'demo',
                    empleadorNombre: usuario.nombre,
                    empleadorEmail: usuario.email,
                    estado: 'activa',
                    fechaCreacion: serverTimestamp(),
                    aplicaciones: 0
                };

                await addDoc(collection(db, 'ofertas'), oferta);

                // Mostrar mensaje de éxito
                mensaje.textContent = '✅ ¡Oferta publicada exitosamente!';
                mensaje.className = 'mensaje success';
                mensaje.style.display = 'block';

                // Limpiar formulario
                formOferta.reset();

                // Redirigir después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);

            } catch (error) {
                console.error('Error al publicar oferta:', error);
                mensaje.textContent = '❌ Error al publicar la oferta: ' + error.message;
                mensaje.className = 'mensaje error';
                mensaje.style.display = 'block';
            }
        });
