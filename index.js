const http = require('http');
const https = require('https');
require('dotenv').config();

const API_KEY = process.env.API_KEY;

function buscarClima(cidade, callback) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(cidade)}&lang=pt`;

  https.get(url, (resp) => {
    let dados = '';

    resp.on('data', chunk => dados += chunk);
    resp.on('end', () => {
      try {
        const json = JSON.parse(dados);

        if (json.error) {
          callback(json.error.message, null);
        } else {
          callback(null, {
            cidade: json.location.name,
            pais: json.location.country,
            temperatura: `${json.current.temp_c}°C`,
            condicao: json.current.condition.text
          });
        }
      } catch (e) {
        callback('Erro ao processar resposta da API', null);
      }
    });
  }).on('error', () => {
    callback('Erro ao conectar à API', null);
  });
}

const server = http.createServer((req, res) => {
  const urlParams = new URL(req.url, `http://${req.headers.host}`);
  const cidade = urlParams.searchParams.get('cidade') || 'Dublin';

  buscarClima(cidade, (erro, clima) => {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });

    if (erro) {
      res.end(JSON.stringify({ erro }));
    } else {
      res.end(JSON.stringify(clima, null, 2));
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
