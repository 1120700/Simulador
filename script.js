document.addEventListener("DOMContentLoaded", () => {
    const sliders = {
        agua: document.getElementById("input-agua"),
        vinagre: document.getElementById("input-vinagre"),
        bicarbonato: document.getElementById("input-bicarbonato"),
        temp: document.getElementById("input-temp")
    };

    const labels = {
        agua: document.getElementById("val-agua"),
        vinagre: document.getElementById("val-vinagre"),
        bicarbonato: document.getElementById("val-bicarbonato"),
        temp: document.getElementById("val-temp")
    };

    const ui = {
        liquid: document.getElementById("liquid"),
        bubbles: document.getElementById("bubbles"),
        phValue: document.getElementById("ph-value"),
        phBadge: document.getElementById("ph-badge"),
        btnCalcular: document.getElementById("btn-calcular")
    };

    const table = {
        agua: document.getElementById("tbl-agua"),
        vinagre: document.getElementById("tbl-vinagre"),
        bicarbonato: document.getElementById("tbl-bicarbonato"),
        temp: document.getElementById("tbl-temp"),
        ph: document.getElementById("tbl-ph")
    };

    // Almacena las variables de la última mezcla configurada
    let estadoActual = { agua: 60, vinagre: 20, bicarbonato: 20, temp: 25 };

    // Función que ajusta dinámicamente el resto de los sliders para mantener la suma = 100%
    function balancearSliders(sliderModificado) {
        let valAgua = parseFloat(sliders.agua.value);
        let valVinagre = parseFloat(sliders.vinagre.value);
        let valBicarbonato = parseFloat(sliders.bicarbonato.value);

        const sumaActual = valAgua + valVinagre + valBicarbonato;
        const diferencia = 100 - sumaActual;

        if (diferencia !== 0) {
            // Distribuir el cambio proporcionalmente entre los dos sliders que NO se movieron
            if (sliderModificado === 'agua') {
                let pool = valVinagre + valBicarbonato;
                if (pool > 0) {
                    sliders.vinagre.value = Math.max(0, valVinagre + (diferencia * (valVinagre / pool))).toFixed(1);
                    sliders.bicarbonato.value = Math.max(0, valBicarbonato + (diferencia * (valBicarbonato / pool))).toFixed(1);
                } else {
                    sliders.vinagre.value = (diferencia / 2).toFixed(1);
                    sliders.bicarbonato.value = (diferencia / 2).toFixed(1);
                }
            } else if (sliderModificado === 'vinagre') {
                let pool = valAgua + valBicarbonato;
                if (pool > 0) {
                    sliders.agua.value = Math.max(0, valAgua + (diferencia * (valAgua / pool))).toFixed(1);
                    sliders.bicarbonato.value = Math.max(0, valBicarbonato + (diferencia * (valBicarbonato / pool))).toFixed(1);
                } else {
                    sliders.agua.value = (diferencia / 2).toFixed(1);
                    sliders.bicarbonato.value = (diferencia / 2).toFixed(1);
                }
            } else if (sliderModificado === 'bicarbonato') {
                let pool = valAgua + valVinagre;
                if (pool > 0) {
                    sliders.agua.value = Math.max(0, valAgua + (diferencia * (valAgua / pool))).toFixed(1);
                    sliders.vinagre.value = Math.max(0, valVinagre + (diferencia * (valVinagre / pool))).toFixed(1);
                } else {
                    sliders.agua.value = (diferencia / 2).toFixed(1);
                    sliders.vinagre.value = (diferencia / 2).toFixed(1);
                }
            }
        }

        // Forzar ajuste final de precisión matemática estricta
        valAgua = parseFloat(sliders.agua.value);
        valVinagre = parseFloat(sliders.vinagre.value);
        valBicarbonato = parseFloat(sliders.bicarbonato.value);
        const ajusteFinal = 100 - (valAgua + valVinagre + valBicarbonato);
        
        if (sliderModificado !== 'agua') sliders.agua.value = (valAgua + ajusteFinal).toFixed(1);
        else sliders.vinagre.value = (valVinagre + ajusteFinal).toFixed(1);

        actualizarTextosInterfaz();
    }

    function actualizarTextosInterfaz() {
        labels.agua.innerText = parseFloat(sliders.agua.value).toFixed(1);
        labels.vinagre.innerText = parseFloat(sliders.vinagre.value).toFixed(1);
        labels.bicarbonato.innerText = parseFloat(sliders.bicarbonato.value).toFixed(1);
        labels.temp.innerText = sliders.temp.value;

        estadoActual.agua = parseFloat(sliders.agua.value);
        estadoActual.vinagre = parseFloat(sliders.vinagre.value);
        estadoActual.bicarbonato = parseFloat(sliders.bicarbonato.value);
        estadoActual.temp = parseFloat(sliders.temp.value);

        // Nivel del líquido en el vaso según el volumen de reactivos líquidos (%)
        // El bicarbonato disuelto aporta levemente al volumen
        const alturaVaso = Math.min(95, Math.max(15, (estadoActual.agua + estadoActual.vinagre) * 0.8 + (estadoActual.bicarbonato * 0.2)));
        ui.liquid.style.height = `${alturaVaso}%`;
    }

    function realizarExperimento() {
        const { agua, vinagre, bicarbonato, temp } = estadoActual;

        // Cálculos estequiométricos de pH en base a proporciones de mezcla
        // El vinagre aporta acidez y el bicarbonato alcalinidad
        const molesAcido = (vinagre / 100) * 0.5;
        const molesBase = (bicarbonato / 100) * 0.4;

        let ph = 7.0;
        const shiftTermico = (temp - 25) * 0.004; // Factor matemático de temperatura

        if (vinagre === 0 && bicarbonato === 0) {
            ph = 7.0 - shiftTermico;
        } else if (molesAcido > molesBase) {
            const excesoAcido = molesAcido - molesBase;
            ph = 2.4 - Math.log10(excesoAcido + 0.01);
        } else if (molesBase > molesAcido) {
            const excesoBase = molesBase - molesAcido;
            ph = 8.3 + Math.log10(excesoBase + 0.01) - shiftTermico;
        } else {
            ph = 7.0 - shiftTermico; // Neutralización estequiométrica completa
        }

        // Límites analíticos reales
        ph = Math.max(1.5, Math.min(12.5, ph));

        // Actualizar Pantalla Digital
        ui.phValue.innerText = ph.toFixed(2);

        // Configuración de las etiquetas de colores solicitadas
        ui.phBadge.className = "ph-badge"; // Limpiar clases previas
        if (ph < 6.5) {
            ui.phBadge.innerText = "Ácido";
            ui.phBadge.classList.add("badge-acido");
            ui.liquid.style.backgroundColor = "rgba(229, 62, 62, 0.6)"; // Vaso rojo
        } else if (ph > 7.5) {
            ui.phBadge.innerText = "Base";
            ui.phBadge.classList.add("badge-base");
            ui.liquid.style.backgroundColor = "rgba(49, 130, 206, 0.6)"; // Vaso azul
        } else {
            ui.phBadge.innerText = "Neutro";
            ui.phBadge.classList.add("badge-neutro");
            ui.liquid.style.backgroundColor = "rgba(72, 187, 120, 0.6)"; // Vaso verde
        }

        // Simular efecto visual de efervescencia transitoria por el CO2 producido
        if (vinagre > 2 && bicarbonato > 2) {
            ui.bubbles.style.opacity = "1";
            ui.bubbles.style.height = ui.liquid.style.height;
            ui.bubbles.classList.add("fizzing");
            setTimeout(() => {
                ui.bubbles.style.opacity = "0";
                ui.bubbles.classList.remove("fizzing");
            }, 3500); // El burbujeo se detiene tras unos segundos
        }

        // Actualizar Tabla de Datos para toma de lecturas rápidas
        table.agua.innerText = agua.toFixed(1) + " %";
        table.vinagre.innerText = vinagre.toFixed(1) + " %";
        table.bicarbonato.innerText = bicarbonato.toFixed(1) + " %";
        table.temp.innerText = temp + " °C";
        table.ph.innerText = ph.toFixed(2);
    }

    // Configuración de Listeners para actualización de controles cruzados
    sliders.agua.addEventListener("input", () => balancearSliders('agua'));
    sliders.vinagre.addEventListener("input", () => balancearSliders('vinagre'));
    sliders.bicarbonato.addEventListener("input", () => balancearSliders('bicarbonato'));
    sliders.temp.addEventListener("input", actualizarTextosInterfaz);

    ui.btnCalcular.addEventListener("click", realizarExperimento);

    // Inicializar estado del laboratorio
    actualizarTextosInterfaz();
});
