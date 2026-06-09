/* ============================================================
   MAIN.JS — Emes Agencia Creativa
   Archivo JS unificado. Extrae y ordena todo el JavaScript
   inline que estaba distribuido en los HTML de:
     - index.html (home)
     - servicios/index.html
     - contacto/index.html
     - proyectos/index.html
     - la-agencia/index.html
     - archivo-proyectos/floristeria/index.html
     - archivo-proyectos/turnesole/index.html
     - archivo-proyectos/oh-varina/index.html
     - archivo-proyectos/salirse_de_madre/index.html
     - uso de datos/* (sin JS propio)

   Cada bloque está guardado con un if(document.querySelector(...))
   para que solo se ejecute en la página que contiene el elemento.
   ============================================================ */


/* ============================================================
   1. COMÚN — TODAS LAS PÁGINAS
   ============================================================ */

// BOTÓN SCROLL TO TOP
// Aparece cuando el footer entra en pantalla (IntersectionObserver).
// Al hacer clic vuelve suavemente al inicio de la página.
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY + window.innerHeight;
        const total = document.documentElement.scrollHeight;
        scrollTopBtn.classList.toggle('is-visible', scrolled >= total * 0.80);
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// TRANSPARENCIA HEADER AL HACER SCROLL
// Escucha el evento scroll. Si el usuario ha bajado más de 10px añade
// la clase nav--scrolled al header; si no, la quita.
const nav = document.getElementById('main-nav');
if (nav) {
    window.addEventListener('scroll', () => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 10);
    });
}

// HEADER BLANCO SOBRE PORTADA OSCURA (u-header-blanco + js-dark-portada)
// Comprueba en cada scroll si el borde inferior de la portada sigue por debajo
// del header. Mientras sí → is-over-dark activo (header blanco).
// En cuanto la portada pasa por encima del header → is-over-dark se quita.
const headerBlanco = document.querySelector('.u-header-blanco');
const darkPortada  = document.querySelector('.js-dark-portada');
if (headerBlanco && darkPortada) {
    // El contenido claro que viene después de la portada
    const contenidoTrasPortada = darkPortada.nextElementSibling;

    function checkPortada() {
        if (contenidoTrasPortada) {
            // Cambia cuando el contenido claro sube hasta cubrir el header
            const rect = contenidoTrasPortada.getBoundingClientRect();
            headerBlanco.classList.toggle('is-over-dark', rect.top > headerBlanco.offsetHeight + 220);
        } else {
            headerBlanco.classList.toggle('is-over-dark', window.scrollY < window.innerHeight);
        }
    }

    window.addEventListener('scroll', checkPortada, { passive: true });
    checkPortada();
}

// HEADER NEGRO SOBRE VÍDEO (u-header-negro + js-video-portada)
// Activa is-over-video mientras el vídeo hero es visible.
// Al pasar de él, el header vuelve a su color original (púrpura).
const headerNegro  = document.querySelector('.u-header-negro');
const videoPortada = document.querySelector('.js-video-portada');
if (headerNegro && videoPortada) {
    function checkVideo() {
        headerNegro.classList.toggle('is-over-video', window.scrollY < videoPortada.offsetHeight - 80);
    }
    window.addEventListener('scroll', checkVideo, { passive: true });
    checkVideo();
}

// BLOQUEAR SCROLL CUANDO EL OVERLAY ESTÁ ABIERTO
// Cuando el checkbox del menú se marca guarda la posición de scroll y fija
// el body (position:fixed) para que la página no se mueva mientras el overlay
// está abierto. Al cerrar espera 500ms (= duración de la animación de salida
// del overlay) antes de restaurar el scroll, evitando el salto visual.
const menuToggle = document.getElementById('menu-toggle');
if (menuToggle) {
    let scrollPosition = 0;

    menuToggle.addEventListener('change', () => {
        if (menuToggle.checked) {
            scrollPosition = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${scrollPosition}px`;
        } else {
            setTimeout(() => {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                window.scrollTo(0, scrollPosition);
            }, 500);
        }
    });
}


/* ============================================================
   2. HOME — index.html
   Guarda: .seccion-servicios, .proyectos__slider-wrapper (home),
           .svg-animation-section con soporte tablet (#logo-animado-tablet)
   ============================================================ */

// INTERSECTION OBSERVER PARA SERVICIOS (MÓVIL Y DESKTOP)
// Texto: threshold 0.6 (elemento pequeño, se puede exigir más visibilidad)
// Icono: threshold 0.2 (elemento grande en desktop, se activa antes)
// ANIMACIÓN DE SCROLL EN SERVICIOS (MÓVIL Y DESKTOP)
// Observa el contenedor .servicio completo. Al entrar en pantalla añade
// .is-visible y el CSS gestiona las animaciones de hijos (icono, texto, nombre).
const servicios = document.querySelectorAll('.servicio');
if (servicios.length > 0) {
    const servicioObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
    }, { threshold: 0.2 });

    servicios.forEach(servicio => servicioObserver.observe(servicio));
}

// SLIDER DE PROYECTOS (HOME)
// Loop infinito real: clona los ítems al INICIO y al FINAL.
// La posición de partida apunta al primer ítem original (saltando los clones del inicio).
// Al terminar la transición (transitionend) se comprueba si estamos en zona de clones
// y se hace un salto silencioso (sin transición) al conjunto original equivalente.
// Autoplay con rAF a 0.5px/frame. Pausa al hacer hover o touch.
const homeSliderWrapper = document.querySelector('.proyectos__slider-wrapper:not(.proyectos__slider-wrapper-flores)');
if (homeSliderWrapper) {
    const slider = homeSliderWrapper.querySelector('.proyectos__slider');
    const originalItems = Array.from(homeSliderWrapper.querySelectorAll('.proyecto'));
    const flechaPrev = document.querySelector('.proyectos__flecha--prev');
    const flechaNext = document.querySelector('.proyectos__flecha--next');

    if (originalItems.length === 0) {
        // noop — evitar errores si no hay items
    } else {
        // Clonar al final
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            slider.appendChild(clone);
        });
        // Clonar al inicio (insertar antes del primer ítem original)
        [...originalItems].reverse().forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            slider.insertBefore(clone, slider.firstChild);
        });

        const totalItems = originalItems.length;
        let isHovered = false;
        let isTransitioning = false;

        function getItemWidth() {
            return slider.querySelector('.proyecto').offsetWidth + 10;
        }

        // Posición inicial: apunta al primer ítem original (tras los clones del inicio)
        let position = getItemWidth() * totalItems;
        slider.style.transition = 'none';
        slider.style.transform = `translateX(-${position}px)`;

        // Snap silencioso al salir de zona de clones
        slider.addEventListener('transitionend', () => {
            isTransitioning = false;
            const loopWidth = getItemWidth() * totalItems;
            // Zona de clones del final
            if (position >= loopWidth * 2) {
                position -= loopWidth;
                slider.style.transition = 'none';
                slider.style.transform = `translateX(-${position}px)`;
            }
            // Zona de clones del inicio
            if (position < loopWidth) {
                position += loopWidth;
                slider.style.transition = 'none';
                slider.style.transform = `translateX(-${position}px)`;
            }
        });

        function animateSlider() {
            if (!isHovered && !isTransitioning) {
                position += 0.5;
                const loopWidth = getItemWidth() * totalItems;
                // Snap silencioso (autoplay, sin transición CSS)
                if (position >= loopWidth * 2) position -= loopWidth;
                slider.style.transition = 'none';
                slider.style.transform = `translateX(-${position}px)`;
            }
            requestAnimationFrame(animateSlider);
        }

        // Flechas — saltos manuales
        if (flechaNext) {
            flechaNext.addEventListener('click', () => {
                if (isTransitioning) return;
                isTransitioning = true;
                position += getItemWidth();
                slider.style.transition = 'transform 0.5s ease';
                slider.style.transform = `translateX(-${position}px)`;
            });
            flechaNext.addEventListener('mouseenter', () => { isHovered = true; });
            flechaNext.addEventListener('mouseleave', () => { isHovered = false; });
        }

        if (flechaPrev) {
            flechaPrev.addEventListener('click', () => {
                if (isTransitioning) return;
                isTransitioning = true;
                position -= getItemWidth();
                slider.style.transition = 'transform 0.5s ease';
                slider.style.transform = `translateX(-${position}px)`;
            });
            flechaPrev.addEventListener('mouseenter', () => { isHovered = true; });
            flechaPrev.addEventListener('mouseleave', () => { isHovered = false; });
        }

        // Pausa al hacer hover sobre el slider
        slider.addEventListener('mouseenter', () => { isHovered = true; });
        slider.addEventListener('mouseleave', () => { isHovered = false; });

        // Touch móvil
        let touchStartX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            isHovered = true;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50 && !isTransitioning) {
                isTransitioning = true;
                position += diff > 0 ? getItemWidth() : -getItemWidth();
                slider.style.transition = 'transform 0.5s ease';
                slider.style.transform = `translateX(-${position}px)`;
            }
            isHovered = false;
        }, { passive: true });

        // IntersectionObserver para mostrar el texto en móvil
        const proyectoInfos = homeSliderWrapper.querySelectorAll('.proyecto__info');
        const infoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.6 });

        proyectoInfos.forEach(info => infoObserver.observe(info));

        animateSlider();
    }
}

// SECCIÓN PATH (HOME) — con soporte de tablet
// El SVG se dibuja a medida que el usuario hace scroll.
// En home hay tres versiones del SVG: móvil, tablet y desktop.
// El contact-content (#contact-content) se muestra al 90% de progreso.
document.addEventListener('DOMContentLoaded', () => {
    const svgAnimSectionHome = document.querySelector('.svg-animation-section');
    const hasTablet = document.getElementById('logo-animado-tablet');

    if (svgAnimSectionHome && hasTablet !== undefined && document.querySelector('.seccion-servicios')) {
        const width = window.innerWidth;
        const isSmallMobile = width <= 380;
        const isMobile = width <= 768;
        const isTablet = width >= 769 && width <= 976;

        let activeSvg;
        if (isSmallMobile) {
            activeSvg = document.getElementById('logo-animado-smallmobile');
        } else if (isMobile) {
            activeSvg = document.getElementById('logo-animado-mobile');
        } else if (isTablet) {
            activeSvg = document.getElementById('logo-animado-tablet');
        } else {
            activeSvg = document.getElementById('logo-animado-desktop');
        }

        if (!activeSvg) return;

        const activePaths = activeSvg.querySelectorAll('.st3, .st4, .st5, .st6');
        const lengths = Array.from(activePaths).map(path => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            return length;
        });

        window.addEventListener('scroll', () => {
            const sectionRect = svgAnimSectionHome.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const scrollHeight = svgAnimSectionHome.offsetHeight - viewportHeight;
            const earlyStart = isMobile
                ? viewportHeight * 0.3
                : (isTablet ? viewportHeight * 0.4 : viewportHeight * 0.5);

            let progress = (earlyStart - sectionRect.top) / scrollHeight;
            progress = Math.max(0, Math.min(1, progress));

            activePaths.forEach((path, index) => {
                const start = index / activePaths.length;
                const end = (index + 1) / activePaths.length;
                const pathProgress = Math.max(0, Math.min(1, (progress - start) / (end - start)));
                path.style.strokeDashoffset = lengths[index] * (1 - pathProgress);
            });

            const contactContent = document.getElementById('contact-content');
            if (contactContent) {
                contactContent.classList.toggle('is-visible', progress > 0.90);
            }
        });
    }
});


/* ============================================================
   3. LA AGENCIA — la-agencia/index.html
   Guarda: .seccion-galeria, .svg-animation-section sin tablet
   ============================================================ */

// SECCIÓN GALERÍA
// Calcula dinámicamente el número de columnas y filas óptimo para que
// las 60 celdas llenen el stage exactamente, sin deformarse. En móvil
// muestra imágenes aleatorias cada 800ms para compensar la falta de hover.
const galeriaStage = document.getElementById('galeria-stage');
if (galeriaStage) {
    const TOTAL = 60;
    const GAP = 0;

    const pairs = [];
    for (let cols = 1; cols <= TOTAL; cols++) {
        if (TOTAL % cols === 0) pairs.push({ cols, rows: TOTAL / cols });
    }

    const grid = document.getElementById('galeria-grid');

    for (let i = 1; i <= TOTAL; i++) {
        const cell = document.createElement('div');
        cell.className = 'galeria__cell';
        cell.style.backgroundImage = `url('assets/img-galeria/img-galeria-${i}.avif')`;
        grid.appendChild(cell);
    }

    function layoutGaleria() {
        const W = galeriaStage.clientWidth;
        const H = galeriaStage.clientHeight;
        if (!W || !H) return;

        let bestSize = 0, bestCols = 6, bestRows = 10;

        for (const { cols, rows } of pairs) {
            const s = Math.min(
                (W - GAP * (cols - 1)) / cols,
                (H - GAP * (rows - 1)) / rows
            );
            if (s > bestSize) { bestSize = s; bestCols = cols; bestRows = rows; }
        }

        const cellPx = Math.floor(bestSize);
        grid.style.gridTemplateColumns = `repeat(${bestCols}, ${cellPx}px)`;
        grid.style.gridTemplateRows    = `repeat(${bestRows}, ${cellPx}px)`;
        grid.style.width  = `${cellPx * bestCols + GAP * (bestCols - 1)}px`;
        grid.style.height = `${cellPx * bestRows + GAP * (bestRows - 1)}px`;
    }

    layoutGaleria();

    let rafLayout;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(rafLayout);
        rafLayout = requestAnimationFrame(layoutGaleria);
    });
    screen.orientation?.addEventListener('change', layoutGaleria);

    // Efecto hover en móvil: muestra imágenes aleatorias
    function isMobileGaleria() {
        return window.innerWidth < 768;
    }

    function mostrarImagenAleatoria() {
        if (!isMobileGaleria()) return;
        const cells = document.querySelectorAll('.galeria__cell');
        const cell = cells[Math.floor(Math.random() * cells.length)];
        cell.classList.add('visible-mobile');
        setTimeout(() => cell.classList.remove('visible-mobile'), 2000);
    }

    if (isMobileGaleria()) {
        setInterval(mostrarImagenAleatoria, 800);
    }
}

// SECCIÓN PATH (LA AGENCIA) — sin soporte tablet, con listener de resize
// Igual que en home pero sin la variante tablet. Se reconfigura al cambiar
// el tamaño de pantalla para elegir el SVG correcto (móvil / desktop).
document.addEventListener('DOMContentLoaded', () => {
    const svgAnimSectionAgencia = document.querySelector('.svg-animation-section');

    if (svgAnimSectionAgencia && galeriaStage) {
        let activePaths = [];
        let lengths = [];

        const setupSvgAnimation = () => {
            const width = window.innerWidth;
            const isSmallMobile = width <= 380;
            const isMobile = width < 768;
            const svgId = isSmallMobile ? 'logo-animado-smallmobile' : (isMobile ? 'logo-animado-mobile' : 'logo-animado-desktop');
            const svg = document.getElementById(svgId);
            if (!svg) return;

            activePaths = [
                svg.querySelector('.st3'),
                svg.querySelector('.st4'),
                svg.querySelector('.st5'),
                svg.querySelector('.st6')
            ].filter(p => p !== null);

            lengths = activePaths.map(path => {
                const length = path.getTotalLength();
                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = length;
                return length;
            });
        };

        setupSvgAnimation();
        window.addEventListener('resize', setupSvgAnimation);

        window.addEventListener('scroll', () => {
            const sectionRect = svgAnimSectionAgencia.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const scrollHeight = svgAnimSectionAgencia.offsetHeight - viewportHeight;
            const isMobile = window.innerWidth < 768;
            const earlyStart = isMobile ? viewportHeight * 0.01 : viewportHeight * 0.5;

            let progress = (earlyStart - sectionRect.top) / scrollHeight;
            progress = Math.max(0, Math.min(1, progress));

            activePaths.forEach((path, index) => {
                const start = index / activePaths.length;
                const end = (index + 1) / activePaths.length;
                const pathProgress = Math.max(0, Math.min(1, (progress - start) / (end - start)));
                path.style.strokeDashoffset = lengths[index] * (1 - pathProgress);
            });

            const contactContent = document.getElementById('contact-content');
            if (contactContent) {
                contactContent.classList.toggle('is-visible', progress > 0.90);
            }
        });
    }
});


/* ============================================================
   4. PÁGINA SERVICIOS — servicios/index.html
   Guarda: .pagina-servicios, #camino-pelota-fijo
   ============================================================ */

// SERVICIOS DETALLE — Observer de entrada
// Añade js-loaded al body para activar los estilos de animación CSS.
// Usa IntersectionObserver para añadir .visible a cada .servicio-detalle
// cuando el 30% del elemento entra en pantalla.
if (document.querySelector('.pagina-servicios')) {
    document.body.classList.add('js-loaded');

    setTimeout(() => {
        const servicios = document.querySelectorAll('.servicio-detalle');
        const servicioDetalleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.remove('visible');
                }
            });
        }, { threshold: 0.3 });

        servicios.forEach(s => servicioDetalleObserver.observe(s));
    }, 0);
}

// ANIMACIÓN SVG PELOTA (SERVICIOS)
// La pelota recorre el trazado SVG de fondo en función del progreso
// de scroll de la página. Usa getPointAtLength para calcular la posición exacta.
document.addEventListener('DOMContentLoaded', () => {
    const trazado = document.getElementById('camino-pelota-fijo');
    const pelota  = document.getElementById('pelota-scroll-fija');
    if (!trazado || !pelota) return;

    // Medimos la longitud total del trazo (escala 1440×900)
    const longitudTrazado = trazado.getTotalLength();

    // Desfase para que la pelota ruede sobre la superficie: radio + mitad del grosor del trazo
    const radioPelota = 20.26;
    const mitadGrosorLinea = 23;
    const desfaseSuperficie = radioPelota + mitadGrosorLinea;

    const actualizarPosicionPelota = () => {
        const totalScrollMaximo = document.documentElement.scrollHeight - window.innerHeight;
        const scrollActual = window.scrollY;
        if (totalScrollMaximo <= 0) return;

        let progresoGlobal = scrollActual / totalScrollMaximo;
        progresoGlobal = Math.max(0, Math.min(1, progresoGlobal));

        const distanciaCamino = progresoGlobal * longitudTrazado;
        const coordenadas = trazado.getPointAtLength(distanciaCamino);

        pelota.setAttribute('cx', coordenadas.x);
        pelota.setAttribute('cy', coordenadas.y - desfaseSuperficie);
    };

    window.addEventListener('scroll', actualizarPosicionPelota);
    window.addEventListener('resize', actualizarPosicionPelota);
    actualizarPosicionPelota(); // Inicialización
});


/* ============================================================
   5. PÁGINA PROYECTOS — proyectos/index.html
   Guarda: .projects-section, #left-list, #right-list
   ============================================================ */

// CARRUSEL DE DOS COLUMNAS EN OPOSICIÓN
// Las dos columnas se desplazan en sentidos contrarios impulsadas por el
// scroll del usuario. adjustHeight calcula cuánto scroll adicional necesita
// la sección para que ambas columnas lleguen al final.
// is-scrolling en .projects-grid deshabilita el flip de tarjeta durante scroll.
document.addEventListener('DOMContentLoaded', () => {
    const leftList  = document.getElementById('left-list');
    const rightList = document.getElementById('right-list');
    const projectsSection = document.querySelector('.projects-section');

    if (!leftList || !rightList || !projectsSection) return;

    const adjustHeight = () => {
        const isMobile = window.innerWidth < 768;
        const leftHeight  = leftList.offsetHeight;
        const rightHeight = rightList.offsetHeight;
        const maxContentHeight = Math.max(leftHeight, rightHeight);
        const scrollFactor = isMobile ? 1.8 : 3.5;
        projectsSection.style.height = `${maxContentHeight * scrollFactor}px`;
    };

    const updateCarouselScroll = () => {
        const sectionRect = projectsSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const totalScrollable = projectsSection.offsetHeight - viewportHeight;

        let progress = -sectionRect.top / totalScrollable;
        progress = Math.max(0, Math.min(1, progress));

        const containerHeight = leftList.parentElement.offsetHeight;
        const leftTravel  = leftList.offsetHeight  - containerHeight;
        const rightTravel = rightList.offsetHeight - containerHeight;

        leftList.style.transform  = `translateY(-${progress * leftTravel}px)`;
        rightList.style.transform = `translateY(-${(1 - progress) * rightTravel}px)`;
    };

    // Pequeño delay para que las imágenes carguen y den la altura real
    setTimeout(adjustHeight, 100);
    window.addEventListener('resize', adjustHeight);
    window.addEventListener('scroll', updateCarouselScroll);

    // Bloquea el efecto 3D flip mientras el usuario está scrolleando
    let scrollingTimeout;
    window.addEventListener('scroll', () => {
        const grid = document.querySelector('.projects-grid');
        if (!grid) return;
        grid.classList.add('is-scrolling');
        window.clearTimeout(scrollingTimeout);
        scrollingTimeout = setTimeout(() => grid.classList.remove('is-scrolling'), 150);
    });
});


/* ============================================================
   6. PÁGINA CONTACTO — contacto/index.html
   Guarda: #contacto-form
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('contacto-form')) return;

    // INFOGRAFÍA DE PASOS
    // En móvil: cola global en tiempo real — los elementos se animan en secuencia
    // según van entrando al viewport (paso → línea → paso → línea → paso).
    // En desktop: se dispara toda la secuencia en orden al entrar la sección.
    const isMobileContacto = window.matchMedia('(max-width: 767px)').matches;

    if (isMobileContacto) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -15% 0px',
            threshold: 0.1
        };

        let animationQueueEnd = 0;

        const scrollObserver = new IntersectionObserver((entries, observer) => {
            const intersecting = entries.filter(entry => entry.isIntersecting);
            if (intersecting.length === 0) return;

            // Ordenamos de arriba a abajo por si entran varios a la vez
            intersecting.sort((a, b) =>
                a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top
            );

            const now = Date.now();
            let currentStartTime = Math.max(now, animationQueueEnd);

            intersecting.forEach(entry => {
                const el = entry.target;
                const delay = currentStartTime - now;

                if (delay <= 0) {
                    el.classList.add('visible');
                } else {
                    setTimeout(() => el.classList.add('visible'), delay);
                }

                // La línea tarda 1s (CSS); el texto 0.6s
                currentStartTime += el.classList.contains('line-container') ? 1000 : 600;
                observer.unobserve(el);
            });

            animationQueueEnd = currentStartTime;
        }, observerOptions);

        document.querySelectorAll('.step, .line-container')
            .forEach(el => scrollObserver.observe(el));

    } else {
        // LÓGICA DESKTOP: reproduce la secuencia de una vez al entrar en pantalla
        const infografiaSection = document.querySelector('.contacto-infografia');

        if (infografiaSection) {
            const desktopObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        playDesktopSequence();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            desktopObserver.observe(infografiaSection);

            function playDesktopSequence() {
                const sequence = [
                    document.querySelector('.step-1'),
                    document.querySelector('.line-1-2'),
                    document.querySelector('.step-2'),
                    document.querySelector('.line-2-3'),
                    document.querySelector('.step-3')
                ];

                let delay = 0;
                sequence.forEach(el => {
                    if (!el) return;
                    setTimeout(() => el.classList.add('visible'), delay);
                    delay += el.classList.contains('line-container') ? 1000 : 600;
                });
            }
        }
    }

    // MENSAJES DE VALIDACIÓN PERSONALIZADOS
    // Sustituye los mensajes genéricos del navegador por textos en el tono de Emes.
    const validationMessages = {
        nombre:    { valueMissing: 'Por favor, cuéntanos tu nombre.' },
        apellidos: { valueMissing: 'Por favor, añade tus apellidos.' },
        email:     { valueMissing: 'Necesitamos tu email para contactarte.', typeMismatch: 'Comprueba que el email tiene el formato correcto.' },
        telefono:  { valueMissing: 'Necesitamos un teléfono para ponernos en contacto contigo.' },
        politica:  { valueMissing: 'Debes aceptar el tratamiento de datos para continuar.' }
    };

    Object.entries(validationMessages).forEach(([id, msgs]) => {
        const field = document.getElementById(id);
        if (!field) return;

        field.addEventListener('invalid', () => {
            if (field.validity.valueMissing && msgs.valueMissing) {
                field.setCustomValidity(msgs.valueMissing);
            } else if (field.validity.typeMismatch && msgs.typeMismatch) {
                field.setCustomValidity(msgs.typeMismatch);
            } else {
                field.setCustomValidity('');
            }
        });

        // Limpia el mensaje personalizado al corregir el campo
        field.addEventListener('input', () => field.setCustomValidity(''));
        field.addEventListener('change', () => field.setCustomValidity(''));
    });

    // FORMULARIO DE CONTACTO
    const contactoForm     = document.getElementById('contacto-form');
    const mainSection      = document.querySelector('.contacto-section');
    const thankYouMessage  = document.getElementById('thank-you-message');
    const textarea         = document.getElementById('idea');

    // Textarea autoexpandible
    if (textarea) {
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }

    // Envío por fetch a enviar.php + estado de agradecimiento
    contactoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (contactoForm.checkValidity()) {
            const formData = new FormData(contactoForm);

            fetch('enviar.php', { method: 'POST', body: formData })
                .then(response => response.text())
                .then(data => {
                    if (data.trim() === 'success') {
                        if (mainSection) mainSection.classList.add('is-success');

                        if (thankYouMessage) {
                            thankYouMessage.style.display = 'block';
                            setTimeout(() => thankYouMessage.classList.add('is-visible'), 50);
                        }

                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        alert('Ups, hubo un problema en el servidor al guardar tus datos. Por favor, inténtalo de nuevo.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Hubo un error al enviar el formulario. Revisa tu conexión.');
                });
        }
    });

    // Animación de entrada del formulario e intro al hacer scroll
    const formObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -60% 0px',
        threshold: 0.1
    });

    document.querySelectorAll('.contacto-intro, .contacto-form')
        .forEach(el => formObserver.observe(el));
});


/* ============================================================
   7. PÁGINAS DE PROYECTO INDIVIDUAL — archivo-proyectos/*
   Guarda: .proyectos__slider-wrapper-flores (floristeria, turnesole)
   El mismo slider que en home pero envuelto en DOMContentLoaded.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const floresWrapper = document.querySelector('.proyectos__slider-wrapper-flores');
    if (!floresWrapper) return;

    const floresSlider  = floresWrapper.querySelector('.proyectos__slider');
    const originalFloresItems = Array.from(floresWrapper.querySelectorAll('.proyecto'));
    const floresPrev    = floresWrapper.querySelector('.proyectos__flecha--prev')
                       || document.querySelector('.proyectos__flecha--prev');
    const floresNext    = floresWrapper.querySelector('.proyectos__flecha--next')
                       || document.querySelector('.proyectos__flecha--next');

    if (!floresSlider || originalFloresItems.length === 0) return;

    // Clonar al final
    originalFloresItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        floresSlider.appendChild(clone);
    });
    // Clonar al inicio
    [...originalFloresItems].reverse().forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        floresSlider.insertBefore(clone, floresSlider.firstChild);
    });

    const totalFlores = originalFloresItems.length;
    let isHoveredFlores = false;
    let isTransitioningFlores = false;

    function getFloresItemWidth() {
        return floresSlider.querySelector('.proyecto').offsetWidth + 10;
    }

    // Posición inicial: primer ítem original (saltando clones del inicio)
    let positionFlores = getFloresItemWidth() * totalFlores;
    floresSlider.style.transition = 'none';
    floresSlider.style.transform  = `translateX(-${positionFlores}px)`;

    // Snap silencioso al salir de zona de clones
    floresSlider.addEventListener('transitionend', () => {
        isTransitioningFlores = false;
        const loopWidth = getFloresItemWidth() * totalFlores;
        if (positionFlores >= loopWidth * 2) {
            positionFlores -= loopWidth;
            floresSlider.style.transition = 'none';
            floresSlider.style.transform  = `translateX(-${positionFlores}px)`;
        }
        if (positionFlores < loopWidth) {
            positionFlores += loopWidth;
            floresSlider.style.transition = 'none';
            floresSlider.style.transform  = `translateX(-${positionFlores}px)`;
        }
    });

    function animateFlores() {
        if (!isHoveredFlores && !isTransitioningFlores) {
            positionFlores += 0.5;
            const loopWidth = getFloresItemWidth() * totalFlores;
            if (positionFlores >= loopWidth * 2) positionFlores -= loopWidth;
            floresSlider.style.transition = 'none';
            floresSlider.style.transform  = `translateX(-${positionFlores}px)`;
        }
        requestAnimationFrame(animateFlores);
    }

    if (floresNext) {
        floresNext.addEventListener('click', () => {
            if (isTransitioningFlores) return;
            isTransitioningFlores = true;
            positionFlores += getFloresItemWidth();
            floresSlider.style.transition = 'transform 0.5s ease';
            floresSlider.style.transform  = `translateX(-${positionFlores}px)`;
        });
        floresNext.addEventListener('mouseenter', () => { isHoveredFlores = true; });
        floresNext.addEventListener('mouseleave', () => { isHoveredFlores = false; });
    }

    if (floresPrev) {
        floresPrev.addEventListener('click', () => {
            if (isTransitioningFlores) return;
            isTransitioningFlores = true;
            positionFlores -= getFloresItemWidth();
            floresSlider.style.transition = 'transform 0.5s ease';
            floresSlider.style.transform  = `translateX(-${positionFlores}px)`;
        });
        floresPrev.addEventListener('mouseenter', () => { isHoveredFlores = true; });
        floresPrev.addEventListener('mouseleave', () => { isHoveredFlores = false; });
    }

    floresSlider.addEventListener('mouseenter', () => { isHoveredFlores = true; });
    floresSlider.addEventListener('mouseleave', () => { isHoveredFlores = false; });

    let touchStartXFlores = 0;

    floresSlider.addEventListener('touchstart', (e) => {
        touchStartXFlores = e.touches[0].clientX;
        isHoveredFlores = true;
    }, { passive: true });

    floresSlider.addEventListener('touchend', (e) => {
        const diff = touchStartXFlores - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50 && !isTransitioningFlores) {
            isTransitioningFlores = true;
            positionFlores += diff > 0 ? getFloresItemWidth() : -getFloresItemWidth();
            floresSlider.style.transition = 'transform 0.5s ease';
            floresSlider.style.transform  = `translateX(-${positionFlores}px)`;
        }
        isHoveredFlores = false;
    }, { passive: true });

    // IntersectionObserver para mostrar texto en móvil
    const proyectoInfosFlores = floresWrapper.querySelectorAll('.proyecto__info');
    const infoObserverFlores  = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.6 });

    proyectoInfosFlores.forEach(info => infoObserverFlores.observe(info));

    animateFlores();
});
