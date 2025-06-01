const express = require('express');

const cors = require('cors');

require('dotenv').config();



const app = express();

//Inicializa el puerto

const PORT = process.env.PORT || 3000;





//Midleware para parsear Json

app.use(express.json());

app.use(express.urlencoded({ extended: true }));



//CORS para permisos en el navegador

app.use(cors({

  origin: '*',

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization'],

  credentials: true

}));



//Ruta principal

app.get('/', (req, res) => {

  res.json({

    mensaje: 'Servidor corriendo',

    timestamp: new Date().toISOString()

  });

});



//Ruta de api

app.get('/api', (req, res) => {

  res.json({

    mensaje: 'API funcionando',

    enpoints: ['POST api/login', 'POST api/registro', 'POST api/login/google']

  });

});



//Cargar ruta

const authRoute = require('./routes/auth');

const loginRoute = require('./routes/login');

const passwordRoute = require('./routes/password');

const restauranteRoute = require('./routes/restaurantes');



app.use('/api', authRoute);

app.use('/api', loginRoute);

app.use('/api', passwordRoute);

app.use('/api', restauranteRoute);





app.listen(PORT, () => {

  console.log(`Servidor escuchando ${PORT}`);

  console.log(`Api disponible en ${PORT}/api`)

});