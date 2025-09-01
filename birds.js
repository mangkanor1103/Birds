const http = require('http');
const mysql = require('mysql2');
const url = require('url');
const db = mysql.createConnection({
  host: '192.168.1.102',
  user: 'root',
  password: '',
  database: 'Birds' 
});
db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;
  if (path === '/birds' && method === 'GET') {
    if (query.bird_id) {
      db.query('SELECT * FROM birds WHERE bird_id = ?', [query.bird_id], (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result[0] || {}));
      });
    } else {
      db.query('SELECT * FROM birds', (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result));
      });
    }
  }

  else if (path === '/birds' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { bird_name, species, habitat, diet, lifespan } = JSON.parse(body);
      db.query(
        'INSERT INTO birds (bird_name, species, habitat, diet, lifespan) VALUES (?, ?, ?, ?, ?)',
        [bird_name, species, habitat, diet, lifespan],
        (err, result) => {
          if (err) throw err;
          res.end(JSON.stringify({ bird_id: result.insertId, bird_name, species, habitat, diet, lifespan }));
        }
      );
    });
  }
  else if (path === '/birds' && method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { bird_name, species, habitat, diet, lifespan } = JSON.parse(body);
      db.query(
        'UPDATE birds SET bird_name=?, species=?, habitat=?, diet=?, lifespan=? WHERE bird_id=?',
        [bird_name, species, habitat, diet, lifespan, query.bird_id],
        (err, result) => {
          if (err) throw err;
          res.end(JSON.stringify({ bird_id: query.bird_id, bird_name, species, habitat, diet, lifespan }));
        }
      );
    });
  }

  else if (path === '/birds' && method === 'DELETE') {
    db.query('DELETE FROM birds WHERE bird_id=?', [query.bird_id], (err, result) => {
      if (err) throw err;
      res.end(JSON.stringify({ message: 'Bird deleted' }));
    });
  }

  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://192.168.1.102:${port}`);
});
