const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/doar', async (req, res) => {
    try {
        const { nome, documento, telefone, valor, formaPagamento, numeroCartao, mes, ano, cvv, nomeImpresso } = req.body;

        const response = await axios.post('https://api.pagar.me/core/v5/orders', {
            customer: {
                name: nome,
                document: documento,
                phones: {
                    mobile_phone: {
                        country_code: "55",
                        area_code: telefone.slice(1, 3),
                        number: telefone.replace(/\D/g, '').slice(3)
                    }
                }
            },
            items: [
                {
                    amount: parseInt(valor),
                    description: "Doação para igreja",
                    quantity: 1,
                    code: "doacao-igreja"
                }
            ],
            payments: [
                {
                    payment_method: formaPagamento === 'Cartão de Crédito' ? "credit_card" : "boleto",
                    credit_card: formaPagamento === 'Cartão de Crédito' ? {
                        card: {
                            number: numeroCartao,
                            exp_month: mes,
                            exp_year: ano,
                            cvv: cvv,
                            holder: {
                                name: nomeImpresso
                            }
                        }
                    } : undefined
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(process.env.PAGARME_API_KEY + ':').toString('base64')}`
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});