document.addEventListener('DOMContentLoaded', () => {
    const protocoloForm = document.getElementById('protocoloForm');

    protocoloForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const data = document.getElementById('data').value;
        const localizacao = document.getElementById('localizacao').value;
        const patrimonio = document.getElementById('patrimonio').value;
        const chamado = document.getElementById('chamado').value;

        const protocolo = { nome, data, localizacao, patrimonio, chamado };

        fetch('/protocolos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(protocolo)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert(data.message);
                    protocoloForm.reset();
                    closeModal();
                    loadProtocolos();
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao criar o protocolo');
            });
    });

    function loadProtocolos() {
        fetch('/protocolos')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    const protocolosList = document.getElementById('protocolosList');
                    protocolosList.innerHTML = '';

                    data.forEach(protocolo => {
                        const protocoloItem = document.createElement('tr');
                        protocoloItem.innerHTML = `
                  <td>${protocolo.nome}</td>
                  <td>${protocolo.data}</td>
                  <td>${protocolo.localizacao}</td>
                  <td>${protocolo.patrimonio}</td>
                  <td>${protocolo.chamado}</td>
                  <td><button class="editButton" onclick="openEditModal()" data-chamado="${protocolo.chamado}">Editar</button></td>
                  <td><button class="deleteButton" data-chamado="${protocolo.chamado}">Excluir</button></td>
                `;
                        protocolosList.appendChild(protocoloItem);
                    });

                    const editButtons = document.getElementsByClassName('editButton');
                    Array.from(editButtons).forEach(button => {
                        button.addEventListener('click', editProtocolo);
                    });

                    const deleteButtons = document.getElementsByClassName('deleteButton');
                    Array.from(deleteButtons).forEach(button => {
                        button.addEventListener('click', deleteProtocolo);
                    });
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao carregar os protocolos');
            });
    }

    function editProtocolo() {
        const chamado = this.getAttribute('data-chamado');

        fetch(`/protocolos/${chamado}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    editNome.value = data.nome;
                    editData.value = data.data;
                    editLocalizacao.value = data.localizacao;
                    editPatrimonio.value = data.patrimonio;
                    editChamado.value = data.chamado;

                    editFormContainer.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao carregar os dados do protocolo');
            });
    }

    function deleteProtocolo() {
        const chamado = this.getAttribute('data-chamado');
        if (confirm(`Deseja excluir o protocolo com o número de chamado ${chamado}?`)) {
            fetch(`/protocolos/${chamado}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        alert(data.message);
                        loadProtocolos();
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Erro ao excluir o protocolo');
                });
        }
    }

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = editNome.value;
        const data = editData.value;
        const localizacao = editLocalizacao.value;
        const patrimonio = editPatrimonio.value;
        const chamado = editChamado.value;

        const protocolo = { nome, data, localizacao, patrimonio };

        fetch(`/protocolos/${chamado}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(protocolo)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert(data.message);
                    editFormContainer.style.display = 'none';
                    closeEditModal();
                    loadProtocolos();
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao atualizar o protocolo');
            });
    });

    loadProtocolos();
});

function openModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function openEditModal() {
    const editModal = document.getElementById('edit-modal');
    editModal.style.display = 'block';
}

function closeEditModal() {
    const editModal = document.getElementById('edit-modal');
    editModal.style.display = 'none';
}