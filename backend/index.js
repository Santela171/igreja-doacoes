const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pagarme = require('pagarme');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.PAGARME_API_KEY; // vem do .env

app.post('/doar', async (req, res) => {
  const {
    nome,
    email,
    cpf,
    telefone,
    valor,
    numero_cartao,
    cvv,
    validade,
    metodo_pagamento
  } = req.body;

  const [mes, ano] = validade.split('/');

  try {
    const client = await pagarme.client.connect({ api_key: API_KEY });

    const transaction = await client.transactions.create({
      amount: parseInt(valor) * 100,
      payment_method: metodo_pagamento, // 'credit_card' ou 'debit_card'
      card_number: numero_cartao,
      card_cvv: cvv,
      card_expiration_date: `${mes}${ano}`,
      card_holder_name: nome,
      customer: {
        external_id: cpf,
        name: nome,
        type: 'individual',
        country: 'br',
        email: email,
        documents: [
          {
            type: 'cpf',
            number: cpf
          }
        ],
        phone_numbers: [`+55${telefone}`]
      },
      billing: {
        name: nome,
        address: {
          country: 'br',
          state: 'SP',
          city: 'São Paulo',
          neighborhood: 'Centro',
          street: 'Rua Fictícia',
          street_number: '123',
          zipcode: '01000-000'
        }
      },
      items: [
        {
          id: '1',
          title: 'Doação para igreja',
          unit_price: parseInt(valor) * 100,
          quantity: 1,
          tangible: false
        }
      ]
    });

    if (transaction.status === 'paid') {
      res.json({ sucesso: true, mensagem: 'Obrigado pela doação!' });
    } else {
      res.json({ sucesso: false, mensagem: 'Pagamento não autorizado.', detalhe: transaction.status });
    }
  } catch (erro) {
    let mensagemErro = 'Erro desconhecido';
    if (erro.response && erro.response.errors) {
      mensagemErro = erro.response.errors.map(e => e.message).join('; ');
    } else if (erro.message) {
      mensagemErro = erro.message;
    }

    res.json({ sucesso: false, mensagem: mensagemErro });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
