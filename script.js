document.addEventListener('DOMContentLoaded', () => {
    // Inicializa apenas o formulário de pedido de bolos simples
    initOrderCakesForm();
    // Inicializa todos os selects personalizados
    initCustomSelects();
});

// --- Funções Auxiliares ---

/**
 * Formata um valor numérico para a moeda brasileira (BRL).
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado como string de moeda.
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Exibe uma mensagem de erro para um campo específico do formulário.
 * @param {string} elementId - O ID do elemento de input associado ao erro.
 * @param {string} message - A mensagem de erro a ser exibida.
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(`${elementId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }
}

/**
 * Limpa todas as mensagens de erro visíveis em um formulário.
 * @param {HTMLElement} formElement - O elemento do formulário a ser limpo.
 */
function clearErrors(formElement) {
    const errorElements = formElement.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none'; // Garante que o display seja none
    });
}

// --- Lógica para Selects Personalizados (simulando Shadcn UI Select) ---
/**
 * Inicializa o comportamento de todos os selects personalizados na página.
 * Controla a abertura, fechamento e seleção de itens.
 */
function initCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(selectWrapper => {
        const trigger = selectWrapper.querySelector('.select-trigger');
        const content = selectWrapper.querySelector('.select-content');
        const hiddenInput = selectWrapper.querySelector('input[type="hidden"]');
        const selectValueSpan = selectWrapper.querySelector('.select-value');

        if (!trigger || !content || !hiddenInput || !selectValueSpan) {
            console.warn("Elementos do select personalizado não encontrados para:", selectWrapper);
            return;
        }

        // Abre/fecha o dropdown ao clicar no trigger
        trigger.addEventListener('click', () => {
            // Fecha outros selects abertos antes de abrir este
            document.querySelectorAll('.custom-select.open').forEach(openSelect => {
                if (openSelect !== selectWrapper) {
                    openSelect.classList.remove('open');
                    openSelect.querySelector('.select-trigger').setAttribute('aria-expanded', 'false');
                }
            });

            selectWrapper.classList.toggle('open'); // Adiciona/remove a classe 'open' ao elemento pai .custom-select
            trigger.setAttribute('aria-expanded', selectWrapper.classList.contains('open'));
        });

        // Lida com a seleção de um item no dropdown
        content.querySelectorAll('.select-item').forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                const text = item.textContent;

                hiddenInput.value = value;
                selectValueSpan.textContent = text;
                selectWrapper.classList.remove('open'); // Fecha o dropdown
                trigger.setAttribute('aria-expanded', 'false');

                // Dispara um evento 'change' no input hidden para que o formulário reaja à seleção
                const event = new Event('change', { bubbles: true });
                hiddenInput.dispatchEvent(event);

                // Remove a classe 'selected' de todos os itens e adiciona ao clicado
                content.querySelectorAll('.select-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });

        // Fecha o dropdown quando clica fora dele
        document.addEventListener('click', (e) => {
            if (!selectWrapper.contains(e.target)) {
                selectWrapper.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });

        // Define o valor inicial do select se o input hidden já tiver um valor
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
/**
 * Inicializa o formulário de pedido de bolos simples, incluindo validação,
 * cálculo de preços e envio via WhatsApp.
 */
function initOrderCakesForm() {
    const form = document.getElementById('order-cakes-form');
    if (!form) return;

    // Referências aos elementos do formulário
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

    // Referências aos elementos de exibição de preço
    const valorBoloSpan = document.getElementById('valorBolo');
    const valorAdicionalSpan = document.getElementById('valorAdicional');
    const valorTotalSpan = document.getElementById('valorTotal');

    // Dados de opções de tamanho e adicionais com seus preços
    const tamanhoOptions = [
        { label: "10cm - R$75,00", value: "10cm", price: 75 },
        { label: "12cm - R$100,00", value: "12cm", price: 100 },
        { label: "15cm - R$120,00", value: "15cm", price: 120 },
        { label: "18cm - R$150,00", value: "18cm", price: 150 },
        { label: "20cm - R$175,00", value: "20cm", price: 175 }, // Corrigido para R$175,00
        { label: "25cm - R$210,00", value: "25cm", price: 210 }
    ];

    // Recheios conforme o cardápio da imagem
    const recheioOptions = [
        { label: "Chocolate Meio Amargo", value: "Chocolate Meio Amargo" },
        { label: "Chocolate Ao Leite", value: "Chocolate Ao Leite" },
        { label: "Chocolate Branco", value: "Chocolate Branco" },
        { label: "Beijinho", value: "Beijinho" },
        { label: "Ninho", value: "Ninho" },
        { label: "4 Leites", value: "4 Leites" },
        { label: "Doce Leite", value: "Doce Leite" },
        { label: "Brigadeiro de Paçoca", value: "Brigadeiro de Paçoca" }
    ];

    const adicionalOptions = [
        { label: "Nenhum", value: "nenhum", price: 0 },
        { label: "Morango in Natura", value: "Morango in Natura", price: 10 },
        { label: "Geleia Morango", value: "Geleia Morango", price: 10 },
        { label: "Abacaxi", value: "Abacaxi", price: 10 },
        { label: "Ameixa", value: "Ameixa", price: 10 },
        { label: "Nutella", value: "Nutella", price: 10 }
    ];

    let currentValorBolo = 0;
    let currentValorAdicional = 0;
    let currentValorTotal = 0;

    /**
     * Atualiza os valores de preço do bolo, adicional e total estimado.
     */
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

        currentValorTotal = total < 0 ? 0 : total; // Garante que o total não seja negativo

        valorBoloSpan.textContent = formatCurrency(currentValorBolo);
        valorAdicionalSpan.textContent = formatCurrency(currentValorAdicional);
        valorTotalSpan.textContent = formatCurrency(currentValorTotal);
    }

    // Adiciona event listeners para atualizar os preços sempre que um campo relevante muda
    [tamanhoInput, adicionalInput, entradaInput].forEach(input => {
        input.addEventListener('change', updatePrices);
        input.addEventListener('input', updatePrices); // Para input numérico como 'entrada'
    });

    /**
     * Valida os campos do formulário antes do envio.
     * @returns {boolean} True se o formulário for válido, false caso contrário.
     */
    function validateForm() {
        let isValid = true;
        clearErrors(form); // Limpa erros anteriores

        if (!nomeClienteInput.value.trim()) { // .trim() para remover espaços em branco
            showError('nomeCliente', 'Nome é obrigatório.');
            isValid = false;
        }

        // Validação de telefone: apenas números, mínimo 10 dígitos
        const telefoneValue = telefoneInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (!telefoneValue || telefoneValue.length < 10) {
            showError('telefone', 'Telefone inválido (mínimo 10 dígitos numéricos).');
            isValid = false;
        } else {
            telefoneInput.value = telefoneValue; // Atualiza o campo com apenas números
        }
        
        if (!dataEntregaInput.value) {
            showError('dataEntrega', 'Data de entrega obrigatória.');
            isValid = false;
        } else {
            const selectedDate = new Date(dataEntregaInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
            if (selectedDate < today) {
                showError('dataEntrega', 'A data de entrega não pode ser no passado.');
                isValid = false;
            }
        }

        if (!arteInput.value.trim()) {
            showError('arte', 'Arte/Tema obrigatório.');
            isValid = false;
        }
        if (!tamanhoInput.value) {
            showError('tamanho', 'Tamanho obrigatório.');
            isValid = false;
        }
        if (!recheio1Input.value) {
            showError('recheio1', 'Recheio 1 obrigatório.');
            isValid = false;
        }
        if (!recheio2Input.value) {
            showError('recheio2', 'Recheio 2 obrigatório.');
            isValid = false;
        }

        const entradaNumber = parseFloat(entradaInput.value);
        if (isNaN(entradaNumber) || entradaNumber < 0) {
            showError('entrada', 'Entrada deve ser um número válido e não negativo.');
            isValid = false;
        }

        return isValid;
    }

    // Lida com o envio do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Previne o envio padrão do formulário

        if (!validateForm()) {
            // Se a validação falhar, rola para o primeiro erro visível
            const firstError = form.querySelector('.error-message:not(:empty)');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return; // Interrompe a execução se houver erros
        }

        // Prepara a mensagem para o WhatsApp
        const adicionalLabel = adicionalOptions.find(opt => opt.value === adicionalInput.value)?.label || 'Nenhum';

        const message = `🧁 *PEDIDO DE BOLO - KARLA CAKE*

👤 *Cliente:* ${nomeClienteInput.value.trim()}
📱 *Telefone:* ${telefoneInput.value}
📅 *Data de Entrega:* ${dataEntregaInput.value}

🎨 *Arte/Tema:* ${arteInput.value.trim()}
🎂 *Tamanho:* ${tamanhoInput.value}
🍫 *Recheio 1:* ${recheio1Input.value}
🍫 *Recheio 2:* ${recheio2Input.value}
✨ *Adicional:* ${adicionalLabel}

💵 *Valor do Bolo:* ${formatCurrency(currentValorBolo)}
💵 *Valor Adicional:* ${formatCurrency(currentValorAdicional)}
💵 *Valor Total:* ${formatCurrency(currentValorTotal)}
💰 *Entrada:* ${formatCurrency(parseFloat(entradaInput.value))}

📝 *Observações:* ${observacoesInput.value.trim() || 'Nenhuma'}

Aguardo confirmação.`;

        // Abre o WhatsApp com a mensagem pré-preenchida
        const whatsappUrl = `https://wa.me/5573981292670?text=${encodeURIComponent(message )}`;
        window.open(whatsappUrl, '_blank');
    });

    // Define a data mínima para o campo de data de entrega como o dia atual
    dataEntregaInput.min = new Date().toISOString().split('T')[0];

    // Atualização inicial de preços ao carregar a página para exibir os valores padrão
    updatePrices();
}
