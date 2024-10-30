const apiURL = "https://mindicador.cl/api";
const selectMonedas = document.getElementById("selectMonedas");
const cotizacion = document.getElementById("cotizacion");
const monto = document.getElementById("monto");
const total = document.getElementById("total");
const divMensaje = document.getElementById("divMensaje");
// const progressBar = document.getElementById("progressBar");

let dataOriginal = [];
let monedas = [];
let ultimosValores = [];
let mostrarGrafico = false;
let etiquetas = [];
let valores = [];
let miGrafico;
let template =
  "<option value='0' selected>--- Seleccione una moneda ---</option>";

async function getMonedas() {
  try {
    const res = await fetch(apiURL);
    const result = await res.json();
    return result;
  } catch (err) {
    mostrarMensaje(err);
  }
}

async function renderMonedas() {
  dataOriginal = await getMonedas();

  // MEJOR CREAMOS UN ARREGLO CON ALGUNAS MONEDAS, Y ASÍ TENDREMOS EL VALOR DE LA COTIZACION DE LA MONEDA.
  let moneda = {
    codigo: dataOriginal.dolar.codigo,
    nombre: dataOriginal.dolar.nombre,
    valor: dataOriginal.dolar.valor,
  };
  monedas.push(moneda);
  moneda = {
    codigo: dataOriginal.dolar_intercambio.codigo,
    nombre: dataOriginal.dolar_intercambio.nombre,
    valor: dataOriginal.dolar_intercambio.valor,
  };
  monedas.push(moneda);
  moneda = {
    codigo: dataOriginal.euro.codigo,
    nombre: dataOriginal.euro.nombre,
    valor: dataOriginal.euro.valor,
  };
  monedas.push(moneda);
  moneda = {
    codigo: dataOriginal.bitcoin.codigo,
    nombre: dataOriginal.bitcoin.nombre,
    valor: dataOriginal.bitcoin.valor,
  };
  monedas.push(moneda);
  moneda = {
    codigo: dataOriginal.uf.codigo,
    nombre: dataOriginal.uf.nombre,
    valor: dataOriginal.uf.valor,
  };
  monedas.push(moneda);
  moneda = {
    codigo: dataOriginal.utm.codigo,
    nombre: dataOriginal.utm.nombre,
    valor: dataOriginal.utm.valor,
  };
  monedas.push(moneda);

  //   CARGAMOS EL DROPDOWN
  monedas.forEach(agregaSelect);
  selectMonedas.innerHTML = template;
}

function agregaSelect(moneda) {
  template += `<option value="${moneda.codigo}">${moneda.nombre}</option>`;
}

selectMonedas.onchange = function () {
  total.innerHTML = "0";
  destruirGrafico();
  mostrarMensaje("");
  const indice = selectMonedas.selectedIndex;
  if (selectMonedas.selectedIndex > 0) {
    crearGrafico();
  }
};

monto.onkeyup = function () {
  mostrarMensaje("");
};

const mostrarMensaje = (texto) => {
  if (texto === "") {
    divMensaje.innerHTML = `<p></p>`;
  } else {
    divMensaje.innerHTML = `<p id="mensaje">${texto}</p>`;
  }
};

async function calcular() {
  const indice = selectMonedas.selectedIndex;
  if (indice > 0) {
    let pasMonto = Number(monto.value);
    if (pasMonto === 0) {
      mostrarMensaje("Ingrese una cantidad para calcular.");
    } else {
      let cambio = monedas[indice - 1].valor;
      let calculo = (pasMonto / cambio).toFixed(2);
      total.innerHTML = `${calculo} ${monedas[indice - 1].codigo}`;
    }
  } else {
    mostrarMensaje("Debe seleccionar una moneda para calcular.");
    mostrarGrafico = false;
  }
}

async function getUltimosValores() {
  let codigo = selectMonedas.value;
  etiquetas = [];
  valores = [];
  try {
    const url = apiURL + "/" + codigo;
    const res = await fetch(url);
    ultimosValores = await res.json();
    // console.log(ultimosValores);
    for (let i = 9; i >= 0; i--) {
      etiquetas.push(ultimosValores.serie[i].fecha.substring(0, 10));
      valores.push(ultimosValores.serie[i].valor);
    }
    return;
  } catch (err) {
    mostrarMensaje(err);
  }
}

async function destruirGrafico() {
  if (miGrafico) {
    await miGrafico.destroy();
  }
}

async function crearGrafico() {
  const ctx = document.getElementById("miGrafico").getContext("2d");
  destruirGrafico();
  await getUltimosValores();
  miGrafico = await new Chart(ctx, {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [
        {
          label:
            "Historial últimas 10 cotizaciones (" + selectMonedas.value + ")",
          data: valores,
          borderWidth: 1,
        },
      ],
    },
    // options: {
    //   animation: {
    //     duration: 2000,
    //     onProgress: function (context) {
    //       if (context.initial) {
    //         progressBar.value = context.currentStep / context.numSteps;
    //       }
    //     },
    //     onComplete: function (context) {
    //       if (context.initial) {
    //         progressBar.value = 0;
    //         progressBar.max = 0;
    //       }
    //     },
    //   },
    // },
  });
}

renderMonedas();
