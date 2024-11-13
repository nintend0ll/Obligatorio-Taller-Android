const baseURL = "https://babytracker.develotion.com";
const baseURLImagenes = "https://babytracker.develotion.com/imgs";
const ruteo = document.querySelector("#ruteo");
const menu = document.querySelector("#menu");
document.addEventListener('DOMContentLoaded', function() {
    getDepartamentos();
    Inicio();
    ajustarMenu();
});
    


function Inicio() {
    OcultarSecciones();
    AgregarEventos();
    if (localStorage.getItem("token") == null || localStorage.getItem("token")== "")
    {
        document.querySelector("#logout").style.display = "none";
        document.querySelector("#home").style.display = "none";
        ruteo.push("/Login");
    }
    else {
        document.querySelector("#logout").style.display = "inline";
        document.querySelector("#login").style.display = "none";
        document.querySelector("#registro").style.display = "none";
    }
    document.querySelector("#home").style.display = "block";
    ajustarMenu();
}

function cerrarMenu() {
    menu.close();
}
function mostrarMensaje(texto) {
    let toast = document.createElement("ion-toast");
    toast.message = texto;
    toast.duration = 2000;
    toast.position = "bottom";
    document.body.appendChild(toast);
    toast.present();
    
}
function OcultarSecciones() {
    let divs = document.querySelectorAll(".ion-page");
    for(let i = 1; i < divs.length; i++){
        divs[i].style.display = "none";
    }
}

function AgregarEventos() {
    ruteo.addEventListener("ionRouteWillChange", MostrarSeccion);
    document.querySelector("#btnLoginForm").addEventListener("click", Login);
    document
        .querySelector("#btnRegistroForm")
        .addEventListener("click", Registro);
    document.querySelector("#btnAgregarEventoForm").addEventListener("click", agregarEvento);
}

function MostrarSeccion(event) {
    OcultarSecciones();
    let rutaDestino = event.detail.to;
    switch (rutaDestino) {
        case "/":
            document.querySelector("#home").style.display = "block";
            break;
        case "/Registro":
            document.querySelector("#registro").style.display = "block";
            break;
        case "/Login":
            document.querySelector("#login").style.display = "block";
            break;
        case "/Logout":
            cerrarSesion();
        break;
        case "/AgregarEvento":
            document.querySelector("#agregarEvento").style.display = "block";
            getCategorias().then(categorias => {
            opcionesCategorias(categorias); 
        });
        break;
        case "/ListadoEventos":
            document.querySelector("#listadoEventos").style.display = "block";
            cargarEventos();
        break;
        case "/InformeEventos":
            document.querySelector("#informeEventos").style.display = "block";
            //cargarEventos();
            getInformeEventos();
        break;
        case "/Mapa":
            setTimeout(() => {
                dibujarMapa();
            }, 1000);
            document.querySelector("#mapa").style.display = "block";
        break;
    }
}

function Login() {
    try {
        let username = document.querySelector("#username").value;
        let password = document.querySelector("#password").value;
        ValidarDatos(username, password);
        let usuario = {
         "usuario": username,
         "password": password
        };
        LoginEnAPI(usuario); 
    } catch (Error) {
        mostrarMensaje(Error.message);
    }
}
function ValidarDatos(username, password) {
    if(username.trim().length == 0 || password.trim().length == 0) {
        throw new Error("Los campos deben ser completados");
    }
}

function LoginEnAPI(usuario) {
    fetch(baseURL + "/login.php",
    {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(usuario)
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data){
        if(data.codigo === 200) {
            OcultarSecciones();
            ruteo.push("/");
            document.querySelector("#logout").style.display = "inline";
            document.querySelector("#home").style.display = "inline";
            document.querySelector("#login").style.display = "none";
            document.querySelector("#registro").style.display = "none";
            document.querySelector("#formLogin").reset();
            localStorage.setItem("token", data.apiKey);
            localStorage.setItem("idUsuario",data.id);
            ajustarMenu();
           // mostrarInfoUsuario();
        }
        else {
            mostrarMensaje(data.mensaje);
        }
    })
    .catch(function(error){
        mostrarMensaje("Error: " + error.message);
    });
}

function limpiarCampos() {
    document.querySelector("#user").value = "";
    document.querySelector("#passwordRegistro").value = "";
}

function Registro() {
    let user = document.querySelector("#user").value;
    let password = document.querySelector("#passwordRegistro").value;
    let idDepartamento = document.querySelector("#slcDepartamento").value;
    let idCiudad = document.querySelector("#slcCiudad").value;

    if (!idDepartamento || !idCiudad) {
        mostrarMensaje("Por favor, selecciona un departamento y una ciudad.");
        return; 
    }

    try {
        ValidarDatosRegistro(user, password);
        let usuario = {
            "usuario": user,
            "password": password,
            "idDepartamento": idDepartamento,
            "idCiudad": idCiudad
        };
        RegistroEnAPI(usuario);
    } catch (Error) {
        mostrarMensaje(Error.message);
    }
}

function ValidarDatosRegistro(user, password) {
    if(user.trim().length == 0) throw new Error("El nombre es obligatorio");
    if(password.trim().length == 0) throw new Error("La password es obligatoria");
}

function RegistroEnAPI(usuario) {
    fetch(baseURL + "/usuarios.php",
    {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(usuario)
    })
    .then(function(response){
        return response.json()
    })  
    .then(function(data){
        if(data.codigo === 200){
            mostrarMensaje("Registro exitoso!");
            limpiarCampos();
            autoLogin(usuario.usuario,usuario.password);
        }
        else{
            mostrarMensaje(data.mensaje);
        }
    }) 
    .catch(function(error){
        mostrarMensaje("Error: " + error);
    })
}

function autoLogin(username, password){
    try{
        if(username.trim().length == 0 || password.trim().length== 0){
            throw new Error("Datos erroneos");
        }
        let usuario = {
            "usuario": username,
            "password": password
           };
           LoginEnAPI(usuario); 
       } catch (Error) {
           mostrarMensaje(Error.message);
    }
    
}

function cerrarSesion() {
    localStorage.clear();
    document.querySelector("#login").style.display = "inline";
    document.querySelector("#registro").style.display = "inline";
    document.querySelector("#logout").style.display = "none";
    document.querySelector("#home").style.display = "none";
    ruteo.push("/Login");
    cerrarMenu();
    ajustarMenu();
}


function getDepartamentos() {
    fetch(baseURL + "/departamentos.php", {
        method: "GET",
        headers: {
            "Content-type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.departamentos) {
            let departamentos = data.departamentos;
            opcionesDepartamentos(departamentos);
        }
    })
    .catch(error => {
        console.error(error);
        mostrarMensaje("Error al cargar los departamentos.");
    });
}

function opcionesDepartamentos(departamentos) {
    let slcDepartamentos = document.querySelector("#slcDepartamento");
    slcDepartamentos.innerHTML = ""; 

    departamentos.forEach(departamento => {
        let option = document.createElement('ion-select-option');
        option.value = departamento.id;
        option.textContent = departamento.nombre;
        slcDepartamentos.appendChild(option);
    });

    
    slcDepartamentos.addEventListener('ionChange', getCiudades);
}

function getCiudades() {
    let idDepartamento = document.querySelector("#slcDepartamento").value;

    fetch(`${baseURL}/ciudades.php?idDepartamento=${idDepartamento}`, {
        method: "GET",
        headers: {
            "Content-type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.ciudades) {
            let ciudades = data.ciudades;
            opcionesCiudades(ciudades);
        }
    })
    .catch(error => {
        console.error(error);
        mostrarMensaje("Error al cargar las ciudades.");
    });
}

function opcionesCiudades(ciudades) {
    let slcCiudades = document.querySelector("#slcCiudad");
    slcCiudades.innerHTML = ""; 

    ciudades.forEach(ciudad => {
        let option = document.createElement('ion-select-option');
        option.value = ciudad.id;
        option.textContent = ciudad.nombre;
        slcCiudades.appendChild(option);
    });
}

////Función para ajustar la visibilidad del Menú
function ajustarMenu(){
    const token = localStorage.getItem("token");
    const userLogueado = token !=null && token != "";

    if(userLogueado){
        document.querySelector("#btnLogin").style.display = "none";
        document.querySelector("#btnRegistro").style.display = "none";
        document.querySelector("#btnAgregarEvento").style.display = "inline";
        document.querySelector("#btnLogout").style.display = "inline";
        document.querySelector("#btnListadoEventos").style.display = "inline";
        document.querySelector("#btnInformeEventos").style.display = "inline";
        document.querySelector("#btnMapa").style.display = "inline";
        
    }else{
        document.querySelector("#btnLogin").style.display = "block";
        document.querySelector("#btnRegistro").style.display = "block";
        document.querySelector("#btnAgregarEvento").style.display = "none";
        document.querySelector("#btnLogout").style.display = "none";
        document.querySelector("#btnListadoEventos").style.display = "none";
        document.querySelector("#btnInformeEventos").style.display = "none";
        document.querySelector("#btnMapa").style.display = "none";
    }
}

///Obtener las categorias para agregar un nuevo evento

function getCategorias() {
    if (localStorage.getItem("token") !== null && localStorage.getItem("token") !== "" && localStorage.getItem("idUsuario") !== null) {
        return fetch(baseURL + "/categorias.php", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "apikey": localStorage.getItem("token"),
                "iduser": localStorage.getItem("idUsuario")
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener categorías: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.categorias) {
                return data.categorias; 
            } else {
                mostrarMensaje("No se encontraron categorías.");
                return [];
            }
        })
        .catch(error => {
            console.error("Error fetching categories:", error);
            mostrarMensaje("Error al cargar las categorías.");
            return [];
        });
    } else {
        mostrarMensaje("Debes estar logueado para agregar un evento.");
        ruteo.push("/Login");
        return Promise.resolve([]); 
    }
}

function opcionesCategorias(categorias) {
    let slcCategorias = document.querySelector("#slcCategoria");
    if (!slcCategorias) {
        console.error("Select de categorías no encontrado.");
        return;
    }

    slcCategorias.innerHTML = ""; 

    categorias.forEach(categoria => {
        let option = document.createElement('ion-select-option');
        option.value = categoria.id;
        option.textContent = categoria.tipo; 
        slcCategorias.appendChild(option);
    });
}


///Agregar un nuevo evento
function agregarEvento() {
    let idCategoria = document.querySelector("#slcCategoria").value;
    let fechaHora = document.querySelector("#fechaHoraEvento").value;
    let detalles = document.querySelector("#detallesEvento").value;
    let idUsuario = localStorage.getItem("idUsuario");
    let token = localStorage.getItem("token");

    if (!idCategoria) {
        mostrarMensaje("Por favor, selecciona una categoría.");
        return; 
    }

    if (token !==null && token !== "" && idUsuario !== null) {

        let fechaActual = new Date();
        let fechaEvento = new Date(fechaHora);

        if (fechaEvento > fechaActual) {
            mostrarMensaje("La fecha y hora del evento no pueden ser posteriores a la fecha y hora actuales.");
            return; 
        }

        let evento = {
            idCategoria: idCategoria,
            idUsuario: idUsuario,
            detalle: detalles,
            fecha: fechaHora || "" 
        };

        fetch(baseURL + "/eventos.php", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "apikey": token,
                "iduser": idUsuario
            },
            body: JSON.stringify(evento)
        })
        .then(response => response.json())
        .then(data => {
            if (data.codigo === 200) {
                mostrarMensaje("Evento agregado con éxito!");
                document.querySelector("#formAgregarEvento").reset();
                ruteo.push("/");
            } else {
                mostrarMensaje(data.mensaje);
            }
        })
        .catch(error => {
            mostrarMensaje("Error: " + error.message);
        });
    } else {
        mostrarMensaje("Debes estar logueado para agregar un evento.");
        ruteo.push("/Login"); 
    }
}


///Listar los eventos

function getEventos() {
    return fetch(baseURL + "/eventos.php?idUsuario=" + localStorage.getItem("idUsuario"), {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        "apikey": localStorage.getItem("token"),
        "iduser": localStorage.getItem("idUsuario")
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.codigo === 200 && data.eventos) {
        return data.eventos;
      } else {
        throw new Error("No se pudieron obtener los eventos.");
      }
    });
}
  
function mostrarEventos(eventos, categorias) {
    const eventosHoy = document.getElementById("eventosHoy");
    const eventosAnteriores = document.getElementById("eventosAnteriores");
  
    const hoy = new Date().toISOString().split("T")[0];
  
    eventosHoy.innerHTML = "";
    eventosAnteriores.innerHTML = "";
  
    eventos.forEach(evento => {
      const fechaEvento = evento.fecha.split(" ")[0];
      const categoria = categorias.find(cat => cat.id === evento.idCategoria);
      let imagenURL;
      if (categoria) {
          imagenURL = `${baseURLImagenes}/${categoria.imagen}.png`;
      } else {
          imagenURL = "";
      }
  
      const eventoHTML = `
        <ion-item>
          <ion-thumbnail slot="start">
            <img src="${imagenURL}">
          </ion-thumbnail>
          <ion-label>
            <h2>${categoria.tipo}</h2>
            <p>${evento.fecha}</p>
            <p>${evento.detalle}</p>
          </ion-label>
          <ion-button fill="outline" slot="end" color="danger" onclick="eliminarEvento(${evento.id})">
            Eliminar
          </ion-button>
        </ion-item>
      `;
  
      if (fechaEvento === hoy) {
        eventosHoy.innerHTML += eventoHTML;
      } else {
        eventosAnteriores.innerHTML += eventoHTML;
      }
    });
}
  
  function cargarEventos() {
    const token = localStorage.getItem("token");
    const idUsuario = localStorage.getItem("idUsuario");
  
    if (token !==null && token !== "" && idUsuario !== null) {
      Promise.all([getCategorias(), getEventos()])
        .then(([categorias, eventos]) => {
          mostrarEventos(eventos, categorias);
        })
        .catch(error => {
          console.error("Error:", error);
          mostrarMensaje("Error al cargar los eventos o categorías.");
        });
    } else {
      mostrarMensaje("Debes estar logueado para ver los eventos.");
      ruteo.push("/Login");
    }
  }
  

  ///Funcion para eliminar un evento
function eliminarEvento(idEvento) {
    fetch(`${baseURL}/eventos.php?idEvento=${idEvento}`, {
        method: "DELETE",
        headers: {
            "Content-type": "application/json",
            "apikey": localStorage.getItem("token"),
            "iduser": localStorage.getItem("idUsuario")
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.codigo === 200) {
            mostrarMensaje("Evento eliminado con éxito.");
            cargarEventos();
        } else {
            mostrarMensaje(data.mensaje || "No se pudo eliminar el evento.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        mostrarMensaje("Error al eliminar el evento.");
    });
}

/// Mapa
let map;
let latitud;
let longitud;
navigator.geolocation.getCurrentPosition(guardarUbicacion, mostrarError);

function guardarUbicacion(position){
    if (!position || !position.coords) {
        mostrarError({ code: 0, message: "Posición no válida" });
        return;
    }
    latitud = position.coords.latitude;
    longitud = position.coords.longitude;
   
}

function dibujarMapa() {
    map = L.map('map').setView([latitud, longitud], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    var marker = L.marker([latitud, longitud]).addTo(map);
    marker.bindPopup("<b>Aquí</b><br>estás<br>").openPopup();
    getPlazas();
}

function mostrarError(error) {
    let mensaje;
    switch(error.code) {
        case error.PERMISSION_DENIED:
            mensaje = "Se ha denegado los permisos";
            break;
        case error.POSITION_UNAVAILABLE:
            mensaje = "No se pudo obtener la ubicación del dispositivo";
            break;
        case error.TIMEOUT:
            mensaje = "Timeout";
            break;
        default:
            mensaje = "Ha ocurrido un error desconocido.";
            break;
    }
}

function getPlazas() {
    fetch(baseURL + "/plazas.php",
        { method: "GET",
            headers: {
                "Content-type": "application/json",
                "apikey": localStorage.getItem("token"),
                "iduser": localStorage.getItem("idUsuario")
            }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.codigo === 200 && Array.isArray(data.plazas)) {
            if (data.plazas.length === 0) {
                mostrarMensaje("No se encontraron plazas");
                return;
            }

            data.plazas.forEach(plaza => {
                if (plaza.latitud && plaza.longitud) {
                    let marker = L.marker([plaza.latitud, plaza.longitud]).addTo(map);
                    let popupContent = `Accesible: ${plaza.accesible ? 'Sí' : 'No'}<br>`;
                    popupContent += `Permite mascotas: ${plaza.aceptaMascotas ? 'Sí' : 'No'}`;
                    marker.bindPopup(popupContent);
                } else {
                    console.error("Datos de plaza incompletos:", plaza);
                }
            });
        } else {
            mostrarMensaje("Error, no se encontraron plazas");
        }
    })
    .catch(error => {
        mostrarMensaje(error);
    });
}

//// Informe de eventos

// Función para obtener el informe de eventos
function getInformeEventos() {
    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");

    if (!idUsuario || !token) {
        mostrarMensaje("Debes estar logueado para ver el informe de eventos.");
        ruteo.push("/Login");
        return;
    }

    fetch(baseURL + "/eventos.php?idUsuario=" + idUsuario, {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "apikey": token,
            "iduser": idUsuario
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.codigo === 200 && data.eventos) {
            const eventos = data.eventos;
            const informe = calcularInforme(eventos);
            mostrarInforme(informe);
        } else {
            throw new Error("No se pudieron obtener los eventos.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        mostrarMensaje("Error al cargar el informe de eventos.");
    });
}

// Función para calcular el informe basado en los eventos
function calcularInforme(eventos) {
    const hoy = new Date().toISOString().split("T")[0];
    const idCategoriaBiberon = 35;
    const idCategoriaPañal = 33;
    
    let totalBiberones = 0;
    let totalPañales = 0;
    let ultimoBiberon = null;
    let ultimoPañal = null;

    eventos.forEach(evento => {
        const fechaEvento = evento.fecha.split(" ")[0];
        
        if (fechaEvento === hoy) {
            if (evento.idCategoria === idCategoriaBiberon) {
                totalBiberones++;
                if (!ultimoBiberon || new Date(evento.fecha) > new Date(ultimoBiberon.fecha)) {
                    ultimoBiberon = evento;
                }
            } else if (evento.idCategoria === idCategoriaPañal) {
                totalPañales++;
                if (!ultimoPañal || new Date(evento.fecha) > new Date(ultimoPañal.fecha)) {
                    ultimoPañal = evento;
                }
            }
        }
    });

    return {
        totalBiberones,
        totalPañales,
        tiempoUltimoBiberon: calcularTiempoTranscurrido(ultimoBiberon),
        tiempoUltimoPañal: calcularTiempoTranscurrido(ultimoPañal)
    };
}

// Función para calcular el tiempo transcurrido desde un evento
function calcularTiempoTranscurrido(evento) {
    if (!evento) return "N/A";

    const ahora = new Date();
    const fechaEvento = new Date(evento.fecha);

    const difMinutos = Math.floor((ahora - fechaEvento) / 60000);

    const horas = Math.floor(difMinutos / 60);
    const minutos = difMinutos % 60;

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

// Función para mostrar el informe en la pantalla
function mostrarInforme(informe) {
    document.querySelector("#totalBiberones").innerHTML = informe.totalBiberones;
    document.querySelector("#tiempoUltimoBiberon").innerHTML = informe.tiempoUltimoBiberon;
    document.querySelector("#totalPanales").innerHTML = informe.totalPañales; 
    document.querySelector("#tiempoUltimoPanal").innerHTML = informe.tiempoUltimoPañal; 
}

