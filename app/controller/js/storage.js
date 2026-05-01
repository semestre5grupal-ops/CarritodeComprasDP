/**
 * MÓDULO DE PERSISTENCIA INTEGRAL
 * Implementa 4 estrategias: localStorage, sessionStorage, IndexedDB, Cookies
 * 
 * Responsabilidades:
 * - Guardar y recuperar carrito (localStorage)
 * - Timestamp de sesión (sessionStorage)
 * - Cache de catálogo (IndexedDB)
 * - Preferencias de usuario (Cookies)
 */

class StorageManager {
    constructor() {
        this.dbName = 'ShopSportDB';
        this.dbVersion = 1;
        this.storeName = 'productos';
        this.db = null;
        this.init();
    }

    /**
     * Inicializar IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Error al abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB inicializado correctamente');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear object store si no existe
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('categoria', 'categoria', { unique: false });
                    store.createIndex('precio', 'precio', { unique: false });
                    console.log('✅ Object Store "productos" creado');
                }
            };
        });
    }

    // ====================================================================
    // ESTRATEGIA 1: localStorage (Carrito - indefinido)
    // ====================================================================
    guardarCarritoLocalStorage(carrito) {
        try {
            localStorage.setItem('sportstore_shopping_cart', JSON.stringify(carrito));
            console.log('💾 Carrito guardado en localStorage');
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            return false;
        }
    }

    recuperarCarritoLocalStorage() {
        try {
            const datosGuardados = localStorage.getItem('sportstore_shopping_cart');
            if (datosGuardados) {
                console.log('📦 Carrito recuperado de localStorage');
                return JSON.parse(datosGuardados);
            }
            return [];
        } catch (error) {
            console.error('Error al recuperar de localStorage:', error);
            localStorage.removeItem('sportstore_shopping_cart');
            return [];
        }
    }

    limpiarCarritoLocalStorage() {
        localStorage.removeItem('sportstore_shopping_cart');
        console.log('🗑️ Carrito limpiado de localStorage');
    }

    // ====================================================================
    // ESTRATEGIA 2: sessionStorage (Temporal - sesión actual)
    // ====================================================================
    guardarTimestampSesion() {
        try {
            sessionStorage.setItem('lastUpdate', new Date().toISOString());
            sessionStorage.setItem('sessionStarted', new Date().getTime().toString());
            console.log('⏱️ Timestamp de sesión guardado');
        } catch (error) {
            console.error('Error al guardar timestamp:', error);
        }
    }

    recuperarTimestampSesion() {
        const timestamp = sessionStorage.getItem('lastUpdate');
        return timestamp ? new Date(timestamp) : null;
    }

    guardarEstadoTemporalSesion(clave, valor) {
        try {
            sessionStorage.setItem(`temp_${clave}`, JSON.stringify(valor));
        } catch (error) {
            console.error('Error al guardar en sessionStorage:', error);
        }
    }

    recuperarEstadoTemporalSesion(clave) {
        const valor = sessionStorage.getItem(`temp_${clave}`);
        return valor ? JSON.parse(valor) : null;
    }

    limpiarSessionStorage() {
        sessionStorage.clear();
        console.log('🗑️ sessionStorage limpiado');
    }

    // ====================================================================
    // ESTRATEGIA 3: IndexedDB (Cache de catálogo - persistente)
    // ====================================================================
    async guardarProductosIndexedDB(productos) {
        if (!this.db) {
            console.warn('⚠️ IndexedDB no está disponible');
            return false;
        }

        return new Promise((resolve) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Limpiar anteriores
            store.clear();

            // Guardar nuevos
            productos.forEach(producto => {
                store.add(producto);
            });

            transaction.oncomplete = () => {
                console.log(`💾 ${productos.length} productos guardados en IndexedDB`);
                resolve(true);
            };

            transaction.onerror = () => {
                console.error('Error al guardar en IndexedDB:', transaction.error);
                resolve(false);
            };
        });
    }

    async recuperarProductosIndexedDB() {
        if (!this.db) {
            console.warn('⚠️ IndexedDB no está disponible');
            return null;
        }

        return new Promise((resolve) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                if (request.result.length > 0) {
                    console.log(`📦 ${request.result.length} productos recuperados de IndexedDB (cache)`);
                    resolve(request.result);
                } else {
                    console.log('ℹ️ Cache de IndexedDB vacío');
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error('Error al recuperar de IndexedDB:', request.error);
                resolve(null);
            };
        });
    }

    async buscarProductoPorIdIndexedDB(id) {
        if (!this.db) return null;

        return new Promise((resolve) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('Error al buscar producto:', request.error);
                resolve(null);
            };
        });
    }

    async buscarPorCategoriaIndexedDB(categoria) {
        if (!this.db) return [];

        return new Promise((resolve) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('categoria');
            const request = index.getAll(categoria);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error al buscar por categoría:', request.error);
                resolve([]);
            };
        });
    }

    // ====================================================================
    // ESTRATEGIA 4: Cookies (Preferencias - con expiración)
    // ====================================================================
    guardarCookie(nombre, valor, diasExpiracion = 365) {
        try {
            const fecha = new Date();
            fecha.setTime(fecha.getTime() + (diasExpiracion * 24 * 60 * 60 * 1000));
            const expires = 'expires=' + fecha.toUTCString();
            
            document.cookie = `${nombre}=${valor}; ${expires}; path=/`;
            console.log(`🍪 Cookie '${nombre}' guardada (${diasExpiracion} días)`);
            return true;
        } catch (error) {
            console.error('Error al guardar cookie:', error);
            return false;
        }
    }

    obtenerCookie(nombre) {
        try {
            const nombreBuscado = nombre + '=';
            const cookies = document.cookie.split(';');
            
            for (let i = 0; i < cookies.length; i++) {
                let c = cookies[i].trim();
                if (c.indexOf(nombreBuscado) === 0) {
                    return c.substring(nombreBuscado.length, c.length);
                }
            }
            return null;
        } catch (error) {
            console.error('Error al obtener cookie:', error);
            return null;
        }
    }

    eliminarCookie(nombre) {
        try {
            document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            console.log(`🗑️ Cookie '${nombre}' eliminada`);
        } catch (error) {
            console.error('Error al eliminar cookie:', error);
        }
    }

    guardarPreferenciasUsuario(preferencias) {
        try {
            const json = JSON.stringify(preferencias);
            this.guardarCookie('user_prefs', btoa(json), 365); // base64 encoded
            console.log('💾 Preferencias de usuario guardadas');
            return true;
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            return false;
        }
    }

    recuperarPreferenciasUsuario() {
        try {
            const encoded = this.obtenerCookie('user_prefs');
            if (encoded) {
                const decoded = atob(encoded);
                console.log('📦 Preferencias de usuario recuperadas');
                return JSON.parse(decoded);
            }
            return null;
        } catch (error) {
            console.error('Error al recuperar preferencias:', error);
            return null;
        }
    }

    // ====================================================================
    // MÉTODOS UTILITARIOS
    // ====================================================================
    
    /**
     * Obtener estadísticas de almacenamiento
     */
    obtenerEstadisticas() {
        const stats = {
            localStorage: {
                carrito: localStorage.getItem('sportstore_shopping_cart') ? 'Guardado' : 'Vacío',
                tamaño: new Blob([localStorage.getItem('sportstore_shopping_cart') || '']).size + ' bytes'
            },
            sessionStorage: {
                lastUpdate: sessionStorage.getItem('lastUpdate') || 'N/A',
                duracionSesion: sessionStorage.getItem('sessionStarted') ? 
                    Math.round((Date.now() - parseInt(sessionStorage.getItem('sessionStarted'))) / 1000) + 's' : 'N/A'
            },
            cookies: {
                total: document.cookie.split(';').length,
                listado: document.cookie.split(';').map(c => c.trim().split('=')[0])
            },
            indexedDB: {
                estado: this.db ? 'Activo' : 'Inactivo',
                baseDatos: this.dbName,
                version: this.dbVersion
            }
        };
        return stats;
    }

    /**
     * Mostrar estadísticas en consola
     */
    mostrarEstadisticas() {
        const stats = this.obtenerEstadisticas();
        console.table(stats);
    }

    /**
     * Sincronizar entre todas las estrategias
     */
    async sincronizarTodo(carrito, productos) {
        console.log('🔄 Sincronizando todas las estrategias de almacenamiento...');
        
        // 1. localStorage - Carrito
        this.guardarCarritoLocalStorage(carrito);
        
        // 2. sessionStorage - Timestamp
        this.guardarTimestampSesion();
        
        // 3. IndexedDB - Catálogo
        await this.guardarProductosIndexedDB(productos);
        
        // 4. Cookies - Preferencias
        this.guardarCookie('lastSync', new Date().toISOString(), 365);
        
        console.log('✅ Sincronización completada');
    }

    /**
     * Limpiar todo (para testing)
     */
    limpiarTodo() {
        console.warn('🚨 Limpiando TODAS las estrategias de almacenamiento...');
        
        // localStorage
        this.limpiarCarritoLocalStorage();
        
        // sessionStorage
        this.limpiarSessionStorage();
        
        // Cookies
        document.cookie.split(';').forEach(c => {
            const nombre = c.split('=')[0].trim();
            if (nombre) this.eliminarCookie(nombre);
        });
        
        // IndexedDB
        if (this.db) {
            const request = indexedDB.deleteDatabase(this.dbName);
            request.onsuccess = () => console.log('🗑️ IndexedDB eliminado');
            request.onerror = () => console.error('Error al eliminar IndexedDB');
        }
    }
}

// Instancia global
const storage = new StorageManager();

// Exportar para módulos ES6
export { storage, StorageManager };
