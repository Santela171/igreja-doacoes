document.getElementById('form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    try {
        const response = await fetch('https://igreja-doacoes.onrender.com/doar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const res = await response.json();
        alert("Doação enviada com sucesso!");
        console.log(res);
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao enviar doação.");
    }
});
