// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Função para inicializar formulários específicos com base na URL
    const path = window.location.pathname;

    if (path.includes('pedido-bolos.html')) {
        initOrderCakesForm();
    } else if (path.includes('pedido-doces.html')) {
        initOrderSweetsForm();
    } else if (path.includes('pedido-bolos-andar.html')) {
        initOrderTieredCakesForm();
    }

    // Inicializa todos os selects personalizados
    initCustomSelects();
});

// --- Funções Auxiliares ---

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(`${elementId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }
}

function clearErrors(formElement) {
    const errorElements = formElement.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

// --- Lógica para Selects Personalizados (simulando Shadcn UI Select) ---
function initCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(selectWrapper => {
        const trigger = selectWrapper.querySelector('.select-trigger');
        const content = selectWrapper.querySelector('.select-content');
        const hiddenInput = selectWrapper.querySelector('input[type="hidden"]');
        const selectValueSpan = selectWrapper.querySelector('.select-value');

        if (!trigger || !content || !hiddenInput || !selectValueSpan) {
            console.warn("Custom select elements not found:", selectWrapper);
            return;
        }

        trigger.addEventListener('click', () => {
            content.classList.toggle('open');
            trigger.setAttribute('aria-expanded', content.classList.contains('open'));
        });

        content.querySelectorAll('.select-item').forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                const text = item.textContent;

                hiddenInput.value = value;
                selectValueSpan.textContent = text;
                content.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');

                // Dispatch a custom event to mimic React's onChange for forms
                const event = new Event('change', { bubbles: true });
                hiddenInput.dispatchEvent(event);

                // Remove 'selected' class from all items and add to the clicked one
                content.querySelectorAll('.select-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!selectWrapper.contains(e.target)) {
                content.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });

        // Set initial value if hidden input has one
        if (hiddenInput.value) {
            const initialItem = content.querySelector(`.select-item[data-value="${hiddenInput.value}"]`);
            if (initialItem) {
                selectValueSpan.textContent = initialItem.textContent;
                initialItem.classList.add('selected');
            }
        }
    });
}

// --- Lógica para o Formulário de Pedido de Bolos Simples (OrderCakes) ---
function initOrderCakesForm() {
    const form = document.getElementById('order-cakes-form');
    if (!form) return;

    const nomeClienteInput = document.getElementById('nomeCliente');
    const telefoneInput = document.getElementById('telefone');
    const entradaInput = document.getElementById('entrada');
    const dataEntregaInput = document.getElementById('dataEntrega');
    const arteInput = document.getElementById('arte');
    const tamanhoInput = document.getElementById('tamanho'); // Hidden input for custom select
    const recheio1Input = document.getElementById('recheio1'); // Hidden input for custom select
    const recheio2Input = document.getElementById('recheio2'); // Hidden input for custom select
    const adicionalInput = document.getElementById('adicional'); // Hidden input for custom select
    const observacoesInput = document.getElementById('observacoes');

    const valorBoloSpan = document.getElementById('valorBolo');
    const valorAdicionalSpan = document.getElementById('valorAdicional');
    const valorTotalSpan = document.getElementById('valorTotal');

    const tamanhoOptions = [
        { label: "10cm - R$75,00", value: "10cm", price: 75 },
        { label: "12cm - R$100,00", value: "12cm", price: 100 },
        { label: "15cm - R$120,00", value: "15cm", price: 120 },
        { label: "18cm - R$150,00", value: "18cm", price: 150 },
        { label: "20cm - R$185,00", value: "20cm", price: 185 },
        { label: "25cm - R$210,00", value: "25cm", price: 210 }
    ];

    const adicionalOptions = [
        { label: "Nenhum", value: "nenhum", price: 0 },
        { label: "Morango in Natura", value: "Morango in Natura", price: 10 },
        { label: "Geleia Morango", value: "Geleia Morango", price: 10 },
        { label: "Abacaxi", value: "Abacaxi", price: 10 },
        { label: "Ameixa", value: "Ameixa", price: 10 },
        { label: "Nutella", value: "Nutella", price: 10 }
    ];

    const recheioOptions = [
        { label: "Brigadeiro", value: "Brigadeiro" },
        { label: "Doce de Leite", value: "Doce de Leite" },
        { label: "Nutella", value: "Nutella" },
        { label: "Morango com Chantilly", value: "Morango com Chantilly" },
        { label: "Beijinho", value: "Beijinho" },
        { label: "Frutas Vermelhas", value: "Frutas Vermelhas" },
        { label: "Outro", value: "Outro" }
    ];

    let currentValorBolo = 0;
    let currentValorAdicional = 0;
    let currentValorTotal = 0;

    function updatePrices() {
        const selectedTamanho = tamanhoOptions.find(opt => opt.value === tamanhoInput.value);
        const selectedAdicional = adicionalOptions.find(opt => opt.value === adicionalInput.value);

        const precoTamanho = selectedTamanho ? selectedTamanho.price : 0;
        const precoAdicional = selectedAdicional ? selectedAdicional.price : 0;

        currentValorBolo = precoTamanho;
        currentValorAdicional = precoAdicional;

        let total = currentValorBolo + currentValorAdicional;
        const entradaNumber = parseFloat(entradaInput.value);

        if (!isNaN(entradaNumber) && entradaNumber >= 0) {
            total -= entradaNumber;
        }

        currentValorTotal = total < 0 ? 0 : total;

        valorBoloSpan.textContent = formatCurrency(currentValorBolo);
        valorAdicionalSpan.textContent = formatCurrency(currentValorAdicional);
        valorTotalSpan.textContent = formatCurrency(currentValorTotal);
    }

    // Event Listeners para atualizar os preços
    [tamanhoInput, adicionalInput, entradaInput].forEach(input => {
        input.addEventListener('change', updatePrices);
        input.addEventListener('input', updatePrices); // For number input like 'entrada'
    });

    function validateForm() {
        let isValid = true;
        clearErrors(form);

        if (!nomeClienteInput.value) { showError('nomeCliente', 'Nome é obrigatório.'); isValid = false; }
        if (!telefoneInput.value || telefoneInput.value.length < 10) { showError('telefone', 'Telefone inválido.'); isValid = false; }
        if (!dataEntregaInput.value) { showError('dataEntrega', 'Data de entrega obrigatória.'); isValid = false; }
        if (!arteInput.value) { showError('arte', 'Arte/Tema obrigatório.'); isValid = false; }
        if (!tamanhoInput.value) { showError('tamanho', 'Tamanho obrigatório.'); isValid = false; }
        if (!recheio1Input.value) { showError('recheio1', 'Recheio 1 obrigatório.'); isValid = false; }
        if (!recheio2Input.value) { showError('recheio2', 'Recheio 2 obrigatório.'); isValid = false; }

        const entradaNumber = parseFloat(entradaInput.value);
        if (isNaN(entradaNumber) || entradaNumber < 0) { showError('entrada', 'Entrada deve ser um número válido.'); isValid = false; }

        return isValid;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const adicionalLabel = adicionalOptions.find(opt => opt.value === adicionalInput.value)?.label || 'Nenhum';

        const message = `🧁 *PEDIDO DE BOLO - KARLA CAKE*

👤 *Cliente:* ${nomeClienteInput.value}
📱 *Telefone:* ${telefoneInput.value}
📅 *Data de Entrega:* ${dataEntregaInput.value}

🎨 *Arte/Tema:* ${arteInput.value}
🎂 *Tamanho:* ${tamanhoInput.value}
🍫 *Recheio 1:* ${recheio1Input.value}
🍫 *Recheio 2:* ${recheio2Input.value}
✨ *Adicional:* ${adicionalLabel}

💵 *Valor do Bolo:* ${formatCurrency(currentValorBolo)}
💵 *Valor Adicional:* ${formatCurrency(currentValorAdicional)}
💵 *Valor Total:* ${formatCurrency(currentValorTotal)}
💰 *Entrada:* ${entradaInput.value}

📝 *Observações:* ${observacoesInput.value || 'Nenhuma'}

Aguardo confirmação.`;

        const whatsappUrl = `https://wa.me/5573981292670?text=${encodeURIComponent(message )}`;
        window.open(whatsappUrl, '_blank');
    });

    // Define data mínima de entrega (hoje)
    dataEntregaInput.min = new Date().toISOString().split('T')[0];

    // Initial price update
    updatePrices();
}

// --- Lógica para o Formulário de Pedido de Doces (OrderSweets) ---
function initOrderSweetsForm() {
    const form = document.getElementById('order-sweets-form');
    if (!form) return;

    const nomeClienteInput = document.getElementById('nomeCliente');
    const dataEntregaInput = document.getElementById('dataEntrega');
    const quantidadeSaboresInput = document.getElementById('quantidadeSabores'); // Hidden input for custom select
    const saboresContainer = document.getElementById('sabores-selecionados-container');
    const observacoesInput = document.getElementById('observacoes');
    const precoTotalSpan = document.getElementById('precoTotal');

    const quantidadeSaboresOptions = [
        { label: "1 Sabor (100 unidades)", value: "1", divisao: [100] },
        { label: "2 Sabores (50/50)", value: "2", divisao: [50, 50] },
        { label: "3 Sabores (40/30/30)", value: "3", divisao: [40, 30, 30] },
        { label: "4 Sabores (25/25/25/25)", value: "4", divisao: [25, 25, 25, 25] }
    ];

    const saboresDoces = [
        "Brigadeiro Chocolate", "Brigadeiro Branco", "Ninho com Chocolate",
        "Surpresa de Uva", "Coco Queimado", "Prestígio", "Casadinho",
        "Cajuzinho", "Ninho", "Nesquik", "Ferrero", "Beijinho"
    ];

    const precoTotalDoces = 150.00;
    precoTotalSpan.textContent = formatCurrency(precoTotalDoces);

    function renderSaboresSelects() {
        saboresContainer.innerHTML = ''; // Clear previous selects
        const numSabores = parseInt(quantidadeSaboresInput.value);

        if (isNaN(numSabores) || numSabores === 0) return;

        for (let i = 0; i < numSabores; i++) {
            const div = document.createElement('div');
            div.innerHTML = `
                <label class="label">Sabor ${i + 1} *</label>
                <div class="custom-select">
                    <button type="button" class="select-trigger">
                        <span class="select-value">Selecione o sabor ${i + 1}</span>
                    </button>
                    <div class="select-content">
                        ${saboresDoces.map(sabor => `<div class="select-item" data-value="${sabor}">${sabor}</div>`).join('')}
                    </div>
                    <input type="hidden" id="sabor${i}" name="sabor${i}" class="sabor-select-input">
                </div>
                <p id="sabor${i}-error" class="error-message text-red-500 text-sm mt-1"></p>
            `;
            saboresContainer.appendChild(div);
        }
        initCustomSelects(); // Re-initialize custom selects for newly added elements
    }

    quantidadeSaboresInput.addEventListener('change', renderSaboresSelects);

    function validateForm() {
        let isValid = true;
        clearErrors(form);

        if (!nomeClienteInput.value) { showError('nomeCliente', 'Nome é obrigatório.'); isValid = false; }
        if (!dataEntregaInput.value) { showError('dataEntreja', 'Data de entrega obrigatória.'); isValid = false; }
        if (!quantidadeSaboresInput.value) { showError('quantidadeSabores', 'Selecione a quantidade de sabores.'); isValid = false; }

        const numSabores = parseInt(quantidadeSaboresInput.value);
        for (let i = 0; i < numSabores; i++) {
            const saborInput = document.getElementById(`sabor${i}`);
            if (!saborInput || !saborInput.value) {
                showError(`sabor${i}`, `Selecione o sabor ${i + 1}.`);
                isValid = false;
            }
        }
        return isValid;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const selectedQuantidadeOption = quantidadeSaboresOptions.find(opt => opt.value === quantidadeSaboresInput.value);
        const divisao = selectedQuantidadeOption ? selectedQuantidadeOption.divisao : [];

        let resumoSabores = '';
        for (let i = 0; i < parseInt(quantidadeSaboresInput.value); i++) {
            const saborInput = document.getElementById(`sabor${i}`);
            if (saborInput && saborInput.value) {
                resumoSabores += `• ${saborInput.value}: ${divisao[i] || ''} unidades\n`;
            }
        }

        const message = `🍬 *PEDIDO DE DOCES - KARLA CAKE*

👤 *Cliente:* ${nomeClienteInput.value}
📅 *Data de Entrega:* ${dataEntregaInput.value}

🍭 *Sabores Escolhidos:*
${resumoSabores}

💰 *Valor Total:* ${formatCurrency(precoTotalDoces)}

📝 *Observações:* ${observacoesInput.value || 'Nenhuma'}

Aguardo confirmação.`;

        const whatsappUrl = `https://wa.me/5573998118856?text=${encodeURIComponent(message )}`; // Usando o número do contato
        window.open(whatsappUrl, '_blank');
    });

    // Define data mínima de entrega (hoje)
    dataEntregaInput.min = new Date().toISOString().split('T')[0];

    // Render initial selects if a value is pre-selected (e.g., from browser autofill)
    if (quantidadeSaboresInput.value) {
        renderSaboresSelects();
    }
}

// --- Lógica para o Formulário de Pedido de Bolo de Andar (OrderTieredCakes) ---
function initOrderTieredCakesForm() {
    const form = document.getElementById('order-tiered-cakes-form');
    if (!form) return;

    const nomeClienteInput = document.getElementById('nomeCliente');
    const telefoneInput = document.getElementById('telefone');
    const dataEntregaInput = document.getElementById('dataEntrega');
    const tipoEventoInput = document.getElementById('tipoEvento'); // Hidden input for custom select
    const numeroConvidadosInput = document.getElementById('numeroConvidados');
    const numeroAndaresInput = document.getElementById('numeroAndares'); // Hidden input for custom select
    const saboresInput = document.getElementById('sabores');
    const recheiosInput = document.getElementById('recheios');
    const coberturasInput = document.getElementById('coberturas');
    const decoracaoInput = document.getElementById('decoracao');
    const coresInput = document.getElementById('cores');
    const observacoesInput = document.getElementById('observacoes');

    const eventoOptions = [
        "Casamento", "Noivado", "Aniversário", "Batizado", "Formatura", "Outro"
    ];

    const andaresOptions = [
        "2 Andares", "3 Andares", "4 Andares", "5 ou mais Andares"
    ];

    function validateForm() {
        let isValid = true;
        clearErrors(form);

        if (!nomeClienteInput.value) { showError('nomeCliente', 'Nome é obrigatório.'); isValid = false; }
        if (!telefoneInput.value || telefoneInput.value.length < 10) { showError('telefone', 'Telefone inválido.'); isValid = false; }
        if (!dataEntregaInput.value) { showError('dataEntrega', 'Data de entrega obrigatória.'); isValid = false; }
        if (!tipoEventoInput.value) { showError('tipoEvento', 'Tipo de evento obrigatório.'); isValid = false; }
        if (!numeroConvidadosInput.value) { showError('numeroConvidados', 'Número de convidados obrigatório.'); isValid = false; }
        if (!numeroAndaresInput.value) { showError('numeroAndares', 'Número de andares obrigatório.'); isValid = false; }
        if (!saboresInput.value) { showError('sabores', 'Sabores obrigatórios.'); isValid = false; }
        if (!recheiosInput.value) { showError('recheios', 'Recheios obrigatórios.'); isValid = false; }
        if (!coberturasInput.value) { showError('coberturas', 'Coberturas obrigatórias.'); isValid = false; }
        if (!decoracaoInput.value) { showError('decoracao', 'Decoração obrigatória.'); isValid = false; }
        if (!coresInput.value) { showError('cores', 'Cores obrigatórias.'); isValid = false; }

        return isValid;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const message = `🎂 *PEDIDO DE BOLO DE ANDAR - KARLA CAKE*

👤 *Cliente:* ${nomeClienteInput.value}
📱 *Telefone:* ${telefoneInput.value}
📅 *Data de Entrega:* ${dataEntregaInput.value}

🎉 *Evento:* ${tipoEventoInput.value}
👥 *Convidados:* ${numeroConvidadosInput.value}
🏛️ *Número de Andares:* ${numeroAndaresInput.value}

🍰 *Sabores por andar:*
${saboresInput.value}

🥄 *Recheios por andar:*
${recheiosInput.value}

🍥 *Coberturas:* ${coberturasInput.value}
🌸 *Decoração:* ${decoracaoInput.value}
🎨 *Cores:* ${coresInput.value}

📝 *Observações:* ${observacoesInput.value || 'Nenhuma'}

Aguardo confirmação para orçamento detalhado.`;

        const whatsappUrl = `https://wa.me/5524998747229?text=${encodeURIComponent(message )}`; // Usando o número do contato
        window.open(whatsappUrl, '_blank');
    });

    // Define data mínima de entrega (1 semana a partir de hoje)
    const hoje = new Date();
    hoje.setDate(hoje.getDate() + 7);
    dataEntregaInput.min = hoje.toISOString().split('T')[0];
}
