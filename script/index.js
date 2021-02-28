import { gameData } from "./questions.js";


const divDrag = document.querySelector("#contenedorDrag");
const divDrop = document.querySelector("#contenedorDrop");
const templateDrag = document.querySelector("#plantillaDrag");
const templateDrop = document.querySelector("#plantillaDrop");
var nivelDificultadInput = document.querySelectorAll("input[name='nivel']");
const botonNuevaPartida = document.querySelector("#nuevaPartida");
const seg = document.querySelector("#segundos");

var nivelDificultad = 0;
var tiempoPartida = 0;
var intervaloReloj;
var intentos = 0;


function nivelDeDificultad() {
    nivelDificultadInput.forEach(input => {
        if (input.checked == true) {
            nivelDificultad = input.value;
        }
    });
}

function desacActivarNivel() {
    nivelDificultadInput.forEach(input => {
        if (input.disabled == false) {
            input.disabled = true;
        }
        else {
            input.disabled = false;
        }
    });
}

function eliminar(node) {
    var childs = Array.from(node.childNodes);
    childs.forEach(child => child.remove());
}


//--------------------------------------------GRÁFICA TIEMPO----------------------------------
google.charts.load('current', { packages: ['corechart', 'line'] }); 
google.charts.setOnLoadCallback(drawBasic);

var dataTimes;
var dataPaises;
var chartPaises;
var chartTiempos;

const options = {
    title: 'Tiempos por partida',
    hAxis: {
        title: 'Intentos'
    },
    vAxis: {
        title: 'Tiempo'
    }
};

function drawBasic() {

    dataTimes = new google.visualization.DataTable();
    dataTimes.addColumn('number', 'Tiempos por partida');
    dataTimes.addColumn('number', 'Tiempos');

    chartTiempos = new google.visualization.LineChart(document.querySelector("#graficaTiempo"));
    chartTiempos.draw(dataTimes, options);
}
var intento=0;
function dibujarGraficaTiempos() {
    intento++;
    dataTimes.addRow([intento, tiempoPartida]);
    chartTiempos.draw(dataTimes, options);
}
//------------------------------------------------Grafica Paises--------------------------
var dataPaises;
var chartPaises;
var ocurrencias = [
    ['Paises', 'cantidad']
];
function dibujarGraficaPaises() {
    dataPaises = google.visualization.arrayToDataTable(
        ocurrencias
    );

    var options = {
        title: 'Ocurrencia de paises (no funciona)'
    };

    chartPaises.draw(dataPaises, options);

}

google.charts.setOnLoadCallback(drawChart);



function drawChart() {

    dataPaises = google.visualization.arrayToDataTable(
        ocurrencias
    );


    var options = {
        title: 'Ocurrencia de paises (no funciona)'
    };

    chartPaises = new google.visualization.PieChart(document.querySelector("#graficaPaises"));

    chartPaises.draw(dataPaises, options);
}


botonNuevaPartida.addEventListener("click", nuevaPartida);

//----------------------------------------Main------------------------------------------------------------

function nuevaPartida() {
    nivelDeDificultad();
    botonNuevaPartida.disabled = true;
    desacActivarNivel();
    intentos++;
    eliminar(divDrag);
    eliminar(divDrop);

    let paises = seleccionarPaises(gameData.countries);

    crearDragDrop(paises, divDrag, divDrop);

    tiempoPartida = 0;
    seg.innerHTML = tiempoPartida;
}


function seleccionarPaises(paises) {
    paises = paises.slice(0);
    let resultado = [];

    while (resultado.length < nivelDificultad && paises.length > 0) {
        let indice = Math.floor(Math.random() * paises.length);
        let pais = paises[indice];
        let ciudad = pais.cities[Math.floor(Math.random() * pais.cities.length)];

        resultado.push({
            pais,
            ciudad
        });
        paises.splice(indice, 1);
    }

    return resultado;
}


function crearDragDrop(paisesCiudades, divDrag, divDrop) {
    const paises = paisesCiudades.map(pais => pais.pais);
    ordenar(paises);
    

    const ciudades = paisesCiudades.map(pais => pais.ciudad);
    ordenar(ciudades);

    ciudades.forEach(ciudad => {
        const drag = templateDrag.content.cloneNode(true).querySelector(".ciudaDrag"); 

        drag.textContent = ciudad.name;
        drag.dataset.cityName = ciudad.name;

        divDrag.appendChild(drag); 

        $(drag).draggable({
            revert: true,
            start: function () {
                startContador();
            }
        });
    });

    var aciertos = 0;

    paises.forEach((pais) => {
        const drop = templateDrop.content.cloneNode(true); 
        const droppable = drop.querySelector(".paisDrop"); 

        drop.querySelector(".name").textContent = pais.name;

        divDrop.appendChild(drop);

        $(droppable).droppable(
            {
                tolerance: "fit",
                drop: function (event, ui) {
                    const ciudad = pais.cities.find(ciudad => ciudad.name == ui.draggable.attr("data-city-name"));
                    if (ciudad) {
                        $(this).addClass("correcto")
                        ui.draggable.draggable("option", "revert", false);
                        aciertos++;
                        mapa.flyTo(ciudad.location);
                        marker.setLatLng(ciudad.location);
                        marker.bindPopup(ciudad.name);
                        if (aciertos >= nivelDificultad) {
                            stopContador();
                            botonNuevaPartida.disabled = false;
                            desacActivarNivel();
                            dibujarGraficaTiempos();
                        }
                        dibujarGraficaPaises();

                    }
                }
            });
    });
}
function ordenar(array){
    array.sort(() => Math.random() > 0.5 ? 1 : -1);
}
//------------------------------------------------------------Tiempo------------------------------------------------
function startContador() {
    tiempoPartida = 0;
    if (intervaloReloj) {
        return false;
    }
    intervaloReloj = setInterval(() => {
        tiempoPartida++;
        seg.innerHTML = tiempoPartida;
    }, 1000);
}
function stopContador() {
    clearInterval(intervaloReloj);
    intervaloReloj = null;
}
//-------------------------------------------------------Mapa---------------------------------------------------------

const mapa = L.map('mapa').
    setView([28.449847, -16.286705], 13);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 25, 
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mapa);

const marker = L.marker([28.449847, -16.286705]).addTo(mapa);
marker.bindPopup("CIFP César Manrique");



