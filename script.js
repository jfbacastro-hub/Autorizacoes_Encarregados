document.addEventListener('DOMContentLoaded', () => {
    // Ler parâmetros configurados pelo professor via URL
    const urlParams = new URLSearchParams(window.location.search);

    function formatDateTime(isoString) {
        if (!isoString) return "-";
        const parts = isoString.split('T');
        if (parts.length < 2) return isoString;
        const d = parts[0].split('-');
        return `${d[2]}/${d[1]}/${d[0]} às ${parts[1]}`;
    }

    function processParam(param, displayId, isDate) {
        const el = document.getElementById(displayId);
        if (!el) return null;
        const parent = el.closest('.detail-item');
        
        if (urlParams.has(param) && urlParams.get(param).trim() !== '') {
            const val = urlParams.get(param).trim();
            el.textContent = isDate ? formatDateTime(val) : val;
            if (parent) parent.style.display = 'flex';
            return val;
        } else {
            if (parent) parent.style.display = 'none';
            return null;
        }
    }

    processParam('atividade', 'display-atividade', false);
    processParam('local', 'display-local', false);
    processParam('inicio', 'display-inicio', true);
    processParam('fim', 'display-fim', true);

    const prof = processParam('professor', 'display-prof', false);
    const consentProf = document.getElementById('consent-prof');
    if (consentProf) {
        consentProf.textContent = prof ? prof : 'responsável';
    }

    if (urlParams.has('notas') && urlParams.get('notas').trim() !== '') {
        document.getElementById('display-notas').textContent = urlParams.get('notas');
        document.getElementById('box-notas').classList.remove('class-hidden');
    } else {
        const boxNotas = document.getElementById('box-notas');
        if (boxNotas) boxNotas.classList.add('class-hidden');
    }

    const form = document.getElementById('authForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const modal = document.getElementById('successModal');
    const validateModalBtn = document.getElementById('closeModal');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Ativar estado de carregamento
        submitBtn.classList.add('loading');
        btnText.textContent = 'A processar e a assinar...';
        spinner.classList.remove('class-hidden');

        // Simula o tempo de envio seguro da autorização para a base de dados
        setTimeout(() => {
            // Restaurar botão
            submitBtn.classList.remove('loading');
            btnText.textContent = 'Assinar Digitalmente e Autorizar';
            spinner.classList.add('class-hidden');

            // Recolher dados da submissão
            const studentName = document.getElementById('studentName').value;
            const studentClass = document.getElementById('studentClass').value;
            const guardianName = document.getElementById('guardianName').value;
            const guardianContact = document.getElementById('guardianContact').value;
            const atividadeNome = document.getElementById('display-atividade').textContent;

            const newSubmission = {
                id: Date.now(),
                date: new Date().toLocaleDateString('pt-PT'),
                student: studentName,
                class: studentClass,
                guardian: guardianName,
                contact: guardianContact,
                atividade: atividadeNome,
                status: 'Autorizado'
            };

            // Guardar localmente (útil se professor e pai usarem o mesmo browser/dispositivo)
            let submissions = JSON.parse(localStorage.getItem('eduAuthSubmissions')) || [];
            submissions.push(newSubmission);
            localStorage.setItem('eduAuthSubmissions', JSON.stringify(submissions));

            // === Gerar link de retorno para o professor ===
            let baseArr = window.location.href.split('?')[0].split('#')[0].split('/');
            baseArr[baseArr.length - 1] = 'professor.html';
            const profUrl = new URL(baseArr.join('/'));
            profUrl.searchParams.set('acao', 'adicionar');
            profUrl.searchParams.set('aluno', studentName);
            profUrl.searchParams.set('turma', studentClass);
            profUrl.searchParams.set('ee', guardianName);
            profUrl.searchParams.set('contacto', guardianContact);
            profUrl.searchParams.set('data', newSubmission.date);
            profUrl.searchParams.set('atividade', atividadeNome);

            const returnLink = profUrl.toString();
            const whatsappMsg = `✅ Autorização assinada!\n\n👤 Aluno: ${studentName} (${studentClass})\n👨‍👩‍👧 EE: ${guardianName}\n📋 Atividade: ${atividadeNome}\n\nClique no link abaixo para registar esta autorização:\n${returnLink}`;

            // Configurar botão WhatsApp no modal
            const sendBtn = document.getElementById('sendToTeacherBtn');
            if (sendBtn) {
                sendBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMsg)}`;
                sendBtn.style.display = 'flex';
            }

            // Mostrar Modal de Sucesso
            modal.classList.remove('hidden');

            // Limpa o formulário após sucesso
            form.reset();
        }, 1800);
    });

    validateModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    const adminBtn = document.getElementById('adminAccessBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const password = prompt("🔒 Área Reservada\n\nPor favor, introduza o código de acesso restrito à gestão de professores:");
            
            if (password === "2026") {
                window.location.href = "professor.html";
            } else if (password !== null) {
                alert("❌ Acesso Bloqueado: O código introduzido está incorreto.");
            }
        });
    }
});
