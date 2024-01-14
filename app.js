const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;




const serviceAccount = require('./babbo-74f5b-firebase-adminsdk-4unuu-560d4c839c.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
app.use(cors({
  origin: 'http://localhost:8080', // Reemplaza con la URL de tu aplicación React Native
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error interno del servidor');
});

console.log('Conexión a Firestore establecida con éxito.');

app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split('/')[1];
    const fileName = `${req.params.id}.${extension}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

app.get('/books', async (req, res) => {
  try {
    const snapshot = await db.collection('Frutas').get();
    const fruits = [];
    snapshot.forEach((doc) => {
      fruits.push({ id: doc.id, ...doc.data() });
    });
    res.json(fruits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener libros.' });
  }
});


app.get('/books/:id', async (req, res) => {
  const fruitId = req.params.id;
  try {
    const doc = await db.collection('Frutas').doc(fruitId).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'libro no encontrado.' });
    } else {
      res.json({ id: doc.id, ...doc.data() });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el libro.' });
  }
});



app.post('/books', upload.single('image'), async (req, res) => {
  const newFruit = req.body;
  try {
    console.log(req.body)
    const docRef = await db.collection('Frutas').add(newFruit);
    // const ImgUrl = `/uploads/${docRef.id}.jpg`;
    // const updatedFruit = {
    //   img: ImgUrl,
    //   description: newFruit.description, // Use newFruit instead of req.body
    //   name: newFruit.name, // Use newFruit instead of req.body
    // };
    res.json({ id: docRef.id, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el libro.' });
  }
});




app.put('/books/:id', upload.single('image'), async (req, res) => {
  const fruitId = req.params.id;

  try {
    const updatedFruit = {
      ImgUrl: req.body.ImgUrl,
      Descripcion: req.body.Descripcion,
      Name: req.body.Name,
    };
    await db.collection('Frutas').doc(fruitId).update(updatedFruit);
    res.status(200).json({ id: fruitId, ...updatedFruit });
  } catch (error) {
    // Manejar errores durante la actualización
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el libro.' });
  }
});



// ...


app.delete('/books/:id', async (req, res) => {
  const fruitId = req.params.id;
  try {
    await db.collection('Frutas').doc(fruitId).delete();
    res.json({ message: 'Libro eliminado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el libro.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
